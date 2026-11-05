/* Camion et aspirateur (A.7 « Ajout 16/10 », repris de Sources/Interface/OutilsMain.swift) :
 * dessins en pixels, animation sous le curseur, empreinte et coupe du pinceau, et la touche
 * peinte en direct sur la grille (Remodelage.toucher de l'app Mac, règle de noyau.js). */

export const FORMES = [["rond", "Rond"], ["carre", "Carré"], ["rectangle", "Rectangle"], ["hexagone", "Hexagone"]];
export const MESURES = { rond: "Diamètre", carre: "Côté", rectangle: "Longueur", hexagone: "Largeur" };

// ---------------------------------------------------------------------------
// Dessins en pixels : une lettre par pixel, « . » pour le vide
// ---------------------------------------------------------------------------
const COULEURS = {
  k: "#2A2622",                 // contour
  y: "#F2B705", Y: "#C98A00",   // cabine
  g: "#9ED9F2", G: "#E6F7FF",   // vitre
  w: "#3B3B3B", h: "#B8B8B8",   // pneu, jante et métal
  o: "#E8862A", O: "#A85A12",   // benne
  m: "#8B5A2B", M: "#5E3A1A", s: "#B98245",   // terre
  r: "#D9452B", R: "#9C2A17", W: "#F4F1EA",   // aspirateur
  l: "#6E6E6E", L: "#4A4A4A",   // tuyau
  d: "#141414",                 // bouche du bec
};
const TERRES = ["m", "M", "s", "m"];

function sprite(lignes) {
  const parCouleur = {};
  lignes.forEach((ligne, l) => [...ligne].forEach((ch, c) => { if (ch !== ".") (parCouleur[ch] ||= []).push(c, l); }));
  return { largeur: Math.max(...lignes.map(x => x.length)), hauteur: lignes.length, parCouleur };
}

function dessiner(ctx, sp, x, y, s) {
  // Un rien de recouvrement : pas de fines lignes claires entre pixels voisins.
  for (const ch in sp.parCouleur) {
    ctx.fillStyle = COULEURS[ch];
    const p = sp.parCouleur[ch];
    for (let k = 0; k < p.length; k += 2) ctx.fillRect(x + p[k] * s, y + p[k + 1] * s, s + 0.25, s + 0.25);
  }
}

/** Hasard reproductible (même particule, même cycle → même tirage), entre 0 et 1. */
function hasard(a, b, k = 0) {
  let x = Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(k, 83492791);
  x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return ((x >>> 0) % 10000) / 10000;
}

function grain(ctx, x, y, s, taille, ch, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COULEURS[ch];
  ctx.fillRect(Math.round(x / s) * s, Math.round(y / s) * s, taille, taille);
  ctx.globalAlpha = 1;
}

// Camion vu de profil, cabine à gauche ; la benne bascule autour de son coin arrière bas.
const CHASSIS = sprite([
  "...kkkkkk...............",
  "..kGgggyyk..............",
  "..kggggyyk..............",
  ".kyyyyyyyk..............",
  "kyyyyyyyyk..............",
  "kyyyyyyyyk..............",
  "kyyyyyyyykkkkkkkkkkkkkkk",
  "kYYYYYYYYYYYYYYYYYYYYYrk",
  "kkkkkkkkkkkkkkkkkkkkkkkk",
]);
const ROUE = sprite([".kkk.", "kwwwk", "kwhwk", "kwwwk", ".kkk."]);
const BENNE = sprite([
  "kk.............",
  "kokkkkkkkkkkkkk",
  "kooooooooooooOk",
  "kooooooooooooOk",
  "kOOOOOOOOOOOOOk",
  "kkkkkkkkkkkkkkk",
]);
const CHARGEMENT = sprite([
  "......sss......",
  "...ssmmmmss....",
  ".smmmMmmmmMms..",
]);
const ASPIRATEUR = sprite([
  ".....kkkkkk.....",
  "....k......k....",
  "..kkkkkkkkkkkk..",
  ".krrrrrrrrrrrrk.",
  "krrWWrrrrrrrrRrk",
  "krrWWrrrrrrrrRrk",
  "krrrrrrrrrrrrRrk",
  ".kRRRRRRRRRRRRk.",
  "..kkkkkkkkkkkk..",
  "...khk....khk...",
]);
// Les becs de l'aspirateur, bouche vue de trois quarts.
const BECS = {
  rond: sprite(["...kkk...", ".kkdddkk.", "kdddddddk", ".kkdddkk.", "...kkk..."]),
  carre: sprite(["kkkkkkk", "kdddddk", "kdddddk", "kdddddk", "kkkkkkk"]),
  rectangle: sprite(["kkkkkkkkkkk", "kdddddddddk", "kdddddddddk", "kkkkkkkkkkk"]),
  hexagone: sprite(["..kkkkk..", ".kdddddk.", "kdddddddk", ".kdddddk.", "..kkkkk.."]),
};

/** Bec seul, centré sur (x, y) : boutons de forme de l'aspirateur. */
export function bec(ctx, forme, x, y, s) {
  const b = BECS[forme];
  dessiner(ctx, b, x - b.largeur * s / 2, y - b.hauteur * s / 2, s);
}

/** Camion au-dessus du point où tombe la terre (`p`). `bascule` de 0 (benne posée) à 1 (levée). */
export function camion(ctx, p, s, bascule, t, verse) {
  const tremble = verse ? (Math.sin(t * 70) > 0 ? 0.6 : 0) : 0;
  const e = s / 2;   // les écarts sont donnés pour des pixels de 2 points
  const pivot = { x: Math.round(p.x - 4 * s), y: Math.round(p.y - 13 * s + tremble) };
  const o = { x: pivot.x - 24 * s, y: pivot.y - 6 * s };
  dessiner(ctx, CHASSIS, o.x, o.y, s);
  dessiner(ctx, ROUE, o.x + 2 * s, o.y + 7 * s, s);
  dessiner(ctx, ROUE, o.x + 16 * s, o.y + 7 * s, s);
  // Benne tournée autour de son coin arrière bas : l'avant se lève.
  const angle = 0.75 * bascule;
  ctx.save();
  ctx.translate(pivot.x, pivot.y);
  ctx.rotate(angle);
  if (bascule < 0.45) dessiner(ctx, CHARGEMENT, -15 * s + bascule * 10 * s, -8 * s, s);
  dessiner(ctx, BENNE, -15 * s, -6 * s, s);
  ctx.restore();
  if (bascule <= 0.35) return;
  // La terre glisse par l'arrière de la benne et tombe en pluie sur le sol.
  const levre = { x: pivot.x + 5 * s * Math.sin(angle), y: pivot.y - 5 * s * Math.cos(angle) };
  const n = 30, periode = 0.65;
  const intensite = verse ? 1 : Math.max(0, (bascule - 0.35) / 0.65);
  for (let k = 0; k < Math.floor(n * intensite); k++) {
    const ph = t / periode + k / n, cycle = Math.floor(ph), phi = ph - cycle;
    const rx = hasard(k, cycle) * 2 - 1, ry = hasard(k, cycle, 1);
    const fx = p.x + rx * 11 * e, fy = p.y + ry * 3 * e - 1;
    const x = levre.x + 3 * e + (fx - levre.x - 3 * e) * phi;
    const y = levre.y + (fy - levre.y) * phi * phi;
    grain(ctx, x, y, s, hasard(k, cycle, 2) > 0.7 ? 1.5 * s : s, TERRES[Math.floor(hasard(k, cycle, 3) * 4) % 4], phi > 0.92 ? 0.5 : 1);
  }
  // Petit nuage de poussière là où la terre arrive.
  if (verse) {
    for (let k = 0; k < 6; k++) {
      const a = hasard(k, Math.floor(t * 6), 4) * 2 * Math.PI;
      const d = (8 + hasard(k, Math.floor(t * 6), 5) * 8) * (s / 2);
      grain(ctx, p.x + Math.cos(a) * d, p.y - 2 + Math.sin(a) * d * 0.35, s, s, "s", 0.45);
    }
  }
}

/** Aspirateur traîneau en haut à gauche, bec posé sur le point aspiré (`p`). */
export function aspirateur(ctx, p, s, forme, t, aspire) {
  const vibre = aspire ? Math.sin(t * 95) * 0.7 : 0;
  const e = s / 2;   // les écarts sont donnés pour des pixels de 2 points
  const o = { x: Math.round(p.x - 62 * e) + vibre, y: Math.round(p.y - 50 * e) };
  dessiner(ctx, ASPIRATEUR, o.x, o.y, s);
  // Tuyau annelé, du flanc droit jusqu'au haut du manche, puis le manche jusqu'au bec.
  const ra = { x: o.x + 16 * s, y: o.y + 5 * s }, ma = { x: p.x + 12 * e, y: p.y - 36 * e };
  const c1 = { x: ra.x + 14 * e, y: ra.y + 18 * e }, c2 = { x: ma.x - 14 * e, y: ma.y + 4 * e };
  const pas = 28;
  for (let i = 0; i <= pas; i++) {
    const u = i / pas, v = 1 - u;
    const x = v * v * v * ra.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * ma.x;
    const y = v * v * v * ra.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * ma.y;
    ctx.fillStyle = COULEURS[i % 3 === 0 ? "L" : "l"];
    ctx.fillRect(Math.round(x / s) * s - s, Math.round(y / s) * s - s, 2 * s, 2 * s);
  }
  const b = BECS[forme] || BECS.rond;
  const haut = { x: p.x, y: p.y - b.hauteur * s / 2 };
  ctx.fillStyle = COULEURS.h;
  for (let i = 0; i <= 16; i++) {
    const u = i / 16, x = ma.x + (haut.x - ma.x) * u, y = ma.y + (haut.y - ma.y) * u;
    ctx.fillRect(Math.round(x / s) * s - s, Math.round(y / s) * s, 2 * s, s);
  }
  dessiner(ctx, b, Math.round(p.x - b.largeur * s / 2), Math.round(p.y - b.hauteur * s / 2), s);
  if (!aspire) return;
  // La terre arrachée tourbillonne vers la bouche.
  const n = 24, periode = 0.55;
  for (let k = 0; k < n; k++) {
    const ph = t / periode + k / n, cycle = Math.floor(ph), phi = ph - cycle;
    const a0 = hasard(k, cycle) * 2 * Math.PI, rho = (18 + hasard(k, cycle, 1) * 20) * (s / 2);
    const a = a0 + phi * 1.4, d = rho * (1 - phi * phi);
    grain(ctx, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.45, s, phi < 0.5 && hasard(k, cycle, 2) > 0.6 ? 1.5 * s : s,
          TERRES[Math.floor(hasard(k, cycle, 3) * 4) % 4], 0.35 + 0.65 * phi);
  }
}

/** Empreinte vue de dessus, par la règle du noyau sur une petite grille : chaque case prend la teinte de son poids. */
export function empreinte(ctx, centre, n, s, forme, repartition, ajout) {
  const a = n / 2 - 0.5, b = forme === "rectangle" ? a * 0.55 : a;
  const ox = centre.x - n * s / 2, oy = centre.y - n * s / 2;
  ctx.fillStyle = ajout ? "#E8862A" : "#3A9EFF";
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      const r = Noyau.rayonPinceau(forme, c - (n - 1) / 2, (n - 1) / 2 - l, a, b);
      if (r > 1) continue;
      ctx.globalAlpha = 0.18 + 0.82 * Noyau.poidsPinceau(r, repartition);
      ctx.fillRect(ox + c * s, oy + l * s, s + 0.25, s + 0.25);
    }
  }
  ctx.globalAlpha = 1;
}

/** Coupe à travers le pinceau : épaisseur reçue (camion, vers le haut) ou retirée (aspirateur, vers le bas). */
export function coupe(ctx, largeur, hauteur, p, ajout) {
  const n = 25, s = Math.min(largeur / (n + 2), 6), x0 = (largeur - n * s) / 2;
  const sol = ajout ? hauteur - 4 : 4;
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = COULEURS.M;
  ctx.fillRect(x0 - s, ajout ? sol : sol - 2, (n + 2) * s, 2);
  ctx.globalAlpha = 1;
  const hmax = Math.floor((hauteur - 8) / s);
  for (let c = 0; c < n; c++) {
    const u = (c - (n - 1) / 2) / ((n - 1) / 2);
    const r = Noyau.rayonPinceau(p.forme === "rectangle" ? "carre" : p.forme, u, 0, 1, 1);
    if (r > 1) continue;
    const h = Math.round(Noyau.poidsPinceau(r, p.repartition) * hmax);
    for (let k = 0; k < h; k++) {
      ctx.fillStyle = COULEURS[k === h - 1 ? (ajout ? "s" : "l") : (ajout ? "m" : "d")];
      ctx.fillRect(x0 + c * s, ajout ? sol - (k + 1) * s : sol + k * s, s + 0.25, s + 0.25);
    }
  }
}

/** Pastille du volume versé ou aspiré pendant le passage, à côté du curseur. */
export function pastille(ctx, p, texte, ajout) {
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  const w = ctx.measureText(texte).width + 12, h = 19, x = p.x + 16, y = p.y + 10, r = h / 2;
  ctx.fillStyle = ajout ? "#A85A12" : "#1F5FA8";
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h); ctx.arc(x + r, y + r, r, Math.PI / 2, 3 * Math.PI / 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(texte, x + w / 2, y + h / 2 + 0.5);
}

// ---------------------------------------------------------------------------
// Une touche du pinceau, peinte en direct sur la grille (même règle que Noyau.remodeler)
// ---------------------------------------------------------------------------
/** Centre (x, y) en Lambert-93, épaisseur dz à plein poids (m). Renvoie la fenêtre touchée et le volume (m³). */
export function toucher(g, x, y, dz, p) {
  const C = g.colonnes, L = g.lignes, pas = g.pas, x0 = g.x0 || 0, y0 = g.y0 || 0, z = g.z;
  const a = p.longueur / 2, b = (p.forme === "rectangle" ? p.largeur : p.longueur) / 2;
  if (!(a > 0 && b > 0)) return null;
  const m = (p.forme === "carre" ? a * Math.SQRT2 : p.forme === "rectangle" ? Math.hypot(a, b) : a) + pas;
  const c0 = Math.max(0, Math.floor((x - m - x0) / pas)), c1 = Math.min(C - 1, Math.ceil((x + m - x0) / pas));
  const l0 = Math.max(0, Math.floor((y0 - y - m) / pas)), l1 = Math.min(L - 1, Math.ceil((y0 - y + m) / pas));
  if (l0 > l1 || c0 > c1) return null;
  const ang = p.angle * (Math.PI / 180), ct = Math.cos(ang), st = Math.sin(ang);
  let v = 0;
  for (let l = l0; l <= l1; l++) {
    for (let c = c0; c <= c1; c++) {
      const i = l * C + c, avant = z[i];
      if (Number.isNaN(avant)) continue;
      const dx = x0 + (c + 0.5) * pas - x, dy = y0 - (l + 0.5) * pas - y;
      const r = Noyau.rayonPinceau(p.forme, dx * ct + dy * st, dy * ct - dx * st, a, b);
      if (r <= 1) {
        z[i] = avant + dz * Noyau.poidsPinceau(r, p.repartition);
        v += z[i] - avant;
      }
    }
  }
  return { l0, l1, c0, c1, volume: v * pas * pas };
}
