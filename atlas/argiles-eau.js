// ============ Rétention d'eau des argiles : où va l'eau, et combien (G.4, 30/09/2026) ============
// Demande : voir l'eau adsorbée en surface et les cations entourés d'eau dans la vue « Structure », et un compteur en haut
// à droite de la visionneuse 3D qui donne la rétention approximative (« 0 g d'eau par g d'argile… »).
//
// Trois réservoirs, comptés séparément :
//   • entre les feuillets : CALCULÉ sur le modèle de l'atlas (molécules d'eau d'un espace interfoliaire ÷ masse du feuillet et
//     de ses cations, espacement-basal.js) ; halloysite et fibres : d'après la formule (H₂O par formule) ;
//   • en surface (faces et bords des cristaux) : surface externe × nombre de couches de molécules × 0,28 mg/m² (une couche
//     de molécules d'eau ≈ 2,8 Å d'épaisseur à la densité de l'eau : 1 m² × 2,8 × 10⁻¹⁰ m × 10⁶ g/m³) ;
//   • couche diffuse (« Dans l'eau » seulement) : l'eau qui accompagne le nuage de cations, jusqu'à une longueur de Debye de
//     la surface (Gouy-Chapman) : eau douce à 10 mmol/L, 3,0 nm pour Na⁺, 1,8 nm pour Ca²⁺ ou Mg²⁺.
// L'eau des pores ENTRE les particules (capillarité) n'est pas comptée : elle dépend du tassement, pas du minéral.
(function () {
  "use strict";
  const EB = window.EspacementBasal;
  if (!EB || !window.Structure3D) return;
  const D = Structure3D.donnees;

  // masses atomiques (g/mol)
  const MASSE = { H: 1.008, Li: 6.94, Be: 9.01, B: 10.81, C: 12.01, N: 14.01, O: 16.0, F: 19.0, Na: 22.99, Mg: 24.31, Al: 26.98,
    Si: 28.09, P: 30.97, S: 32.06, Cl: 35.45, K: 39.1, Ca: 40.08, Ti: 47.87, V: 50.94, Cr: 52.0, Mn: 54.94, Fe: 55.85, Co: 58.93,
    Ni: 58.69, Cu: 63.55, Zn: 65.38, Cs: 132.9, Ow: 18.015 };
  const H2O = 18.015;
  const masseAtome = (a) => (a.occ ? Object.entries(a.occ).reduce((s, [el, x]) => s + (MASSE[el] || 0) * x, 0) : MASSE[a.el] || 0);

  // une couche de molécules d'eau : 0,28 mg par m² ; couches sur les faces selon l'état (sèche, 1, 2, dans l'eau)
  const COUCHE_G_M2 = 2.8e-4;
  const COUCHES_ETAT = [0, 1, 2, 2];
  // longueur de Debye (Å) dans une eau douce à 10 mmol/L : 0,304 / √I nm (Israelachvili) ; I = c pour NaCl, 3c pour CaCl₂
  const DEBYE = { Na: 30.4, Ca: 17.6, Mg: 17.6 };

  // ── familles : surface externe (m²/g), faces mouillées ou non, couche diffuse (cation, aire par charge sur une face) ──
  // aire par charge d'une face = 46,6 Å² ÷ x (demi-maille a·b/2 ≈ 23,3 Å² par formule O₁₀(OH)₂, x charges par formule, moitié
  // de chaque côté du feuillet)
  const aire = (x) => 46.6 / x;
  const FAMILLES = {
    smectite: { sExt: 60, sSrc: "surface externe ≈ 60 m²/g (azote, montmorillonite : Macht et al. 2011)", cation: "Na", aire: aire(0.33) },
    vermiculite: { sExt: 8, sSrc: "surface externe ≈ 8 m²/g (plaquette de 0,1 µm d'épaisseur : 2 ÷ (densité × épaisseur))", cation: "Mg", aire: aire(0.7) },
    illite: { sExt: 100, sSrc: "surface ≈ 100 m²/g, toute externe (fiche illite : 80 à 120 m²/g)", cation: "Ca", aire: aire(0.65), fraction: 0.1 },
    glauconite: { sExt: 80, sSrc: "surface ≈ 80 m²/g, toute externe (fiche glauconite : 60 à 100 m²/g)", cation: "Ca", aire: aire(0.8), fraction: 0.1 },
    inter: { sExt: 100, sSrc: "surface externe ≈ 100 m²/g, comme une illite (ordre de grandeur)", cation: "Ca", aire: aire(0.65) },
    kaolin: { sExt: 20, sSrc: "surface ≈ 20 m²/g, toute externe (fiche kaolinite : 10 à 30 m²/g)", cation: "Ca", aire: 900, faible: true },
    serp: { sExt: 25, sSrc: "surface ≈ 25 m²/g, toute externe (fiche serpentines : 10 à 40 m²/g)", cation: "Ca", aire: 900, faible: true },
    talc: { sExt: 10, sSrc: "surface ≈ 10 m²/g (fiche talc : 3 à 20 m²/g), dont seuls les bords se mouillent (≈ 1/6 pour des plaquettes dix fois plus larges qu'épaisses)", bords: 1 / 6 },
    mica: { sExt: 7, sSrc: "surface ≈ 7 m²/g (paillette de 0,1 µm d'épaisseur : 2 ÷ (densité × épaisseur))", cation: "Ca", aire: aire(1) },
    chlorite: { sExt: 50, sSrc: "surface ≈ 50 m²/g, toute externe (fiche chlorite : 20 à 80 m²/g)", cation: "Ca", aire: 900, faible: true },
    halloysite: { sExt: 45, sSrc: "surface ≈ 45 m²/g (tube de 50 nm de diamètre et canal de 15 nm : 2 ÷ (densité × épaisseur de paroi))" },
    chrysotile: { sExt: 90, sSrc: "surface ≈ 90 m²/g (fibrille de 25 nm, canal de 7,5 nm : 2 ÷ (densité × épaisseur de paroi))" },
    fibre: { sExt: 235, sSrc: "surface ≈ 235 m²/g (fiche sépiolite : 150 à 320 m²/g)" },
  };
  // eau des canaux des fibres (eau zéolitique, formules idéales) : sépiolite 8 H₂O pour Mg₈Si₁₂O₃₀(OH)₄(OH₂)₄, palygorskite
  // 4 H₂O pour Mg₅Si₈O₂₀(OH)₂(OH₂)₄ ; partie à la chauffe (vers 100 °C), revenue à l'air
  const CANAUX = { sepiolite: 8 * H2O / 1151.6, palygorskite: 4 * H2O / 772.3 };

  const SMECTITES = { montmorillonite: 1, hectorite: 1, nontronite: 1 };
  function famille(cle) {
    const x = EB.ARGILES3D[cle];
    if (!x) return null;
    const f = x[0], s = cle.replace(/^fiche:/, "").replace(/_(e|m)$/, "");
    if (s === "halloysite" || s === "endellite") return "halloysite";
    if (s === "chrysotile") return "chrysotile";
    if (EB.INTERSTRAT[cle]) return "inter";
    if (SMECTITES[f]) return "smectite";
    if (f === "vermiculite" || f === "illite" || f === "glauconite") return f;
    const fam = EB.FAMILLE[f];
    if (fam === "11") return ["lizardite", "amesite", "cronstedtite", "nepouite", "antigorite"].includes(f) ? "serp"
      : f === "hisingerite" ? null : "kaolin";
    if (fam === "neutre") return "talc";
    if (fam === "mica") return "mica";
    if (fam === "chlorite") return "chlorite";
    if (fam === "fibre") return "fibre";
    return null;   // allophane, imogolite, hisingérite : pas de compteur (voir la note)
  }

  // ── eau entre les feuillets, calculée sur le modèle ──
  const MEMO = {};
  const prep = (f) => EB.preparer(D[f], EB.COUCHES[f]);
  const masseFeuillet = (P) => EB.NA * EB.NB * P.feuil.reduce((s, a) => s + masseAtome(a), 0);
  // g d'eau par g d'argile pour un feuillet P suivi d'un espace dans l'état `etat` (autres = contenu publié d'un espace fixe)
  function parFeuillet(P, etat) {
    const E = EB.espace(P, etat);
    const mCat = E.cats.reduce((s, c) => s + (MASSE[c.el] || 0), 0);
    return { eau: E.eaux.length * H2O, masse: masseFeuillet(P) + mCat };
  }
  function entre(cle, i) {
    const k = cle + "|" + i;
    if (k in MEMO) return MEMO[k];
    const fam = famille(cle), f = EB.ARGILES3D[cle][0], E = EB.ETATS;
    // structures pas encore chargées (elles arrivent à la demande) : pas de chiffre, et rien de mis en mémoire
    const X0 = EB.INTERSTRAT[cle];
    if (["smectite", "vermiculite", "illite", "glauconite"].includes(fam) && !D[f]) return null;
    if (fam === "inter" && !(D[X0.A] && D[X0.B])) return null;
    let w = 0;
    if (fam === "halloysite") w = E.halloysite[i].eau ? 2 * H2O / 258.16 : 0;   // Al₂Si₂O₅(OH)₄·2H₂O (halloysite à 10 Å)
    else if (fam === "fibre") w = i > 0 ? CANAUX[f] || 0 : 0;
    else if (fam === "smectite" || fam === "vermiculite") {
      const r = parFeuillet(prep(f), (fam === "smectite" ? E.smectite : E.vermiculite)[i]);
      w = r.eau / r.masse;
    } else if (fam === "illite" || fam === "glauconite") {
      const r = parFeuillet(prep(f), E.faible[i]);
      w = FAMILLES[fam].fraction * r.eau / r.masse;   // un espace sur dix a perdu son potassium
    } else if (fam === "inter") {
      const X = EB.INTERSTRAT[cle], PA = prep(X.A), PB = prep(X.B);
      const r = parFeuillet(PB, (X.vermiculite ? E.vermiculite : E.is)[i]);
      const mA = masseFeuillet(PA) + (PA.interfol || []).reduce((s, a) => s + masseAtome(a), 0) * EB.NA * EB.NB;
      w = r.eau / (r.masse + mA);   // un feuillet de chaque sorte
    }
    return (MEMO[k] = w);
  }

  // ── bilan affiché par le compteur ──
  function bilan(cle, i) {
    const fam = famille(cle);
    if (!fam) return null;
    const F = FAMILLES[fam];
    const nF = COUCHES_ETAT[i];
    const e = entre(cle, i);
    if (e === null) return null;
    const s = F.sExt * nF * COUCHE_G_M2 * (F.bords || 1);
    // couche diffuse : au-delà des deux couches adsorbées (≈ 5,6 Å), jusqu'à une longueur de Debye
    const dif = i === 3 && F.cation ? F.sExt * Math.max(0, DEBYE[F.cation] - 5.6) * 1e-4 : 0;
    return { fam, entre: e, surface: s, diffuse: dif, total: e + s + dif, cation: F.cation, src: F.sSrc,
      debye: F.cation ? DEBYE[F.cation] : null };
  }

  // deux chiffres significatifs : 0,20 · 0,034 · 1,4
  // sous 0,01 : un seul chiffre (0,001 et non 0,00093)
  const fr = (x) => (x < 5e-5 ? "0" : x < 0.01 ? x.toLocaleString("fr-FR", { maximumSignificantDigits: 1 })
    : x.toLocaleString("fr-FR", { minimumSignificantDigits: 2, maximumSignificantDigits: 2 }));
  // compteur : HTML (chiffre principal, détail par réservoir) ; `b` peut être un mélange (animation)
  function compteurHTML(b) {
    if (!b) return "";
    const lignes = [];
    if (b.fam !== "talc" && b.fam !== "mica" && b.fam !== "kaolin" && b.fam !== "serp" && b.fam !== "chlorite" && b.fam !== "chrysotile")
      lignes.push(["entre les feuillets" + (b.fam === "fibre" ? " (canaux)" : ""), b.entre]);
    lignes.push([b.fam === "talc" ? "sur les bords" : "en surface", b.surface]);
    if (b.diffuse > 0) lignes.push(["couche diffuse", b.diffuse]);
    return `<b>${b.total < 5e-5 ? "" : "≈ "}${fr(b.total)} g</b> d'eau par g d'argile
      <span>${lignes.map(([n, x]) => `${n} ${fr(x)}`).join(" · ")}</span>`;
  }
  const melange = (a, b, u) => a && b ? Object.assign({}, b, { entre: a.entre + (b.entre - a.entre) * u,
    surface: a.surface + (b.surface - a.surface) * u, diffuse: a.diffuse + (b.diffuse - a.diffuse) * u,
    total: a.total + (b.total - a.total) * u, cation: a.cation || b.cation }) : b;

  // note sous la vue : d'où viennent les chiffres
  function noteCompteur(cle, i) {
    const b = bilan(cle, i);
    if (!b) return "";
    const F = FAMILLES[b.fam];
    const r = [];
    r.push("Compteur : eau retenue par l'argile elle-même, pas celle des pores entre les grains (c'est pourquoi il reste bien en dessous de la rétention d'eau d'un matériau argileux donnée plus bas).");
    if (b.fam === "smectite" || b.fam === "vermiculite") r.push("Entre les feuillets : molécules du modèle ÷ masse du feuillet et de ses cations.");
    if (b.fam === "illite" || b.fam === "glauconite") r.push("Entre les feuillets : si un espace sur dix a perdu son potassium et prend l'eau comme une smectite.");
    if (b.fam === "inter") r.push("Entre les feuillets : un espace gonflant pour deux feuillets, molécules du modèle.");
    if (b.fam === "halloysite") r.push("Entre les feuillets : deux H₂O par Al₂Si₂O₅(OH)₄ dans l'halloysite à 10 Å (Joussein et al. 2005).");
    if (b.fam === "fibre") r.push("Dans les canaux : eau zéolitique de la formule idéale (sépiolite 8 H₂O, palygorskite 4 H₂O), partie quand on la chauffe vers 100 °C.");
    r.push(`En surface : ${F.sSrc} × nombre de couches de molécules × 0,28 mg/m² (une couche de molécules ≈ 2,8 Å d'épaisseur).`);
    if (F.cation) r.push(`Couche diffuse (« Dans l'eau ») : l'eau à moins d'une longueur de Debye de la surface, ${(DEBYE[F.cation] / 10).toFixed(1).replace(".", ",")} nm pour ${F.cation === "Na" ? "Na⁺" : F.cation === "Mg" ? "Mg²⁺" : "Ca²⁺"} dans une eau douce à 10 mmol/L.`);
    if (b.fam === "smectite") r.push("Une montmorillonite sodique en pâte retient bien plus quand ses feuillets se séparent tout à fait : sa limite de liquidité atteint ≈ 700 %, soit 7 g d'eau par g (Mitchell et Soga 2005).");
    return r.join(" ");
  }

  window.ArgilesEau = { famille, bilan, entre, compteurHTML, melange, noteCompteur, FAMILLES, DEBYE, COUCHES_ETAT,
    a: (cle) => !!famille(cle) };
})();
