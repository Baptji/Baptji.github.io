// ============ ESSAI (09/10/2026) : une seule unité MgCO₃ dans la 3D de la magnésite ============
// Sa remarque : « de formule MgCO₃, la structure 3D montre des dizaines de chaînes ». Essai sur cette seule fiche, à valider :
// onglet « 1 unité » à gauche de « 1 maille » (par défaut ; 2ᵉ demande du 09/10 : plus de boutons au-dessus de la vue). Il n'y a pas de molécule de magnésite
// (cristal ionique) : l'unité est le triangle CO₃ d'origine de la structure publiée + le magnésium le plus proche d'un de ses
// oxygènes, aux positions mesurées (Effenberger et al. 1981), sans rien recalculer. Chargé après structures/index.js.
(function () {
  "use strict";
  if (!window.Structure3D || !Structure3D.completer) return;

  // fractions → Å (a selon x, b dans le plan xy, c complète le trièdre)
  function base(m) {
    const [a, b, c, al, be, ga] = m, r = Math.PI / 180;
    const cx = c * Math.cos(be * r), cy = c * (Math.cos(al * r) - Math.cos(be * r) * Math.cos(ga * r)) / Math.sin(ga * r);
    return [[a, 0, 0], [b * Math.cos(ga * r), b * Math.sin(ga * r), 0], [cx, cy, Math.sqrt(c * c - cx * cx - cy * cy)]];
  }
  const cart = (B, f) => [0, 1, 2].map((k) => f[0] * B[0][k] + f[1] * B[1][k] + f[2] * B[2][k]);
  const dist = (B, f, g) => Math.hypot(...cart(B, [f[0] - g[0], f[1] - g[1], f[2] - g[2]]));
  // copie de g la plus proche de f (translations entières de la maille)
  function proche(B, f, g) {
    let best = null;
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
      const h = [g[0] + i, g[1] + j, g[2] + k], d = dist(B, f, h);
      if (!best || d < best.d) best = { h, d };
    }
    return best;
  }

  function unite(s) {
    const B = base(s.maille), A = s.atomes;
    const C = A.find((a) => a[0] === "C"), fc = C.slice(1, 4);
    const O = A.filter((a) => a[0] === "O").map((a) => ({ a, p: proche(B, fc, a.slice(1, 4)) })).filter((o) => o.p.d < 1.4);
    let mg = null;
    for (const a of A.filter((x) => x[0] === "Mg")) for (const o of O) {
      const p = proche(B, o.p.h, a.slice(1, 4));
      if (!mg || p.d < mg.p.d) mg = { a, p };
    }
    const pts = [fc, ...O.map((o) => o.p.h), mg.p.h];
    // tout ramené au centre de la boîte (la « maille » n'est plus qu'une boîte invisible)
    const moy = [0, 1, 2].map((k) => pts.reduce((x, p) => x + p[k], 0) / pts.length);
    const cen = (f) => f.map((x, k) => x - moy[k] + 0.5);
    const atomes = [
      ["C", ...cen(fc), "C"],
      ...O.map((o) => ["O", ...cen(o.p.h), "O"]),
      ["Mg", ...cen(mg.p.h), "Mg"],   // (le 1 % de fer de l'échantillon n'a pas de sens pour une seule unité)
    ];
    const dCO = O.reduce((x, o) => x + o.p.d, 0) / O.length;
    return Object.assign({}, s, {
      atomes, particule: "unite", repetition: [1, 1, 1],
      info: `Une unité MgCO₃ : 1 magnésium, 1 carbone, 3 oxygènes · C–O ${dCO.toFixed(2).replace(".", ",")} Å · Mg–O ${mg.p.d.toFixed(2).replace(".", ",")} Å`,
    });
  }
  const NOTE_UNITE = "Il n'existe pas de molécule de magnésite : le cristal est un empilement d'ions Mg²⁺ et de groupes carbonate CO₃²⁻. "
        + "Le groupe CO₃ est un vrai petit ensemble soudé (le carbone au centre d'un triangle de trois oxygènes) ; le magnésium, lui, "
        + "n'appartient à aucun groupe : dans le cristal, il touche six oxygènes de six carbonates différents, et chaque oxygène touche "
        + "deux magnésiums. C'est ce réseau qui donne les « chaînes » des vues « 1 maille » et « 2 × 2 × 2 ». Positions de la structure publiée.";

  Structure3D.completer("magnesite", {
    unite: { nom: "1 unité", construire: (s) => unite(s), note: NOTE_UNITE },
  });
})();
