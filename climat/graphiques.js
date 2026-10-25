// graphiques.js — les figures de l'appli, dessinées en SVG à la main.
//
// Pas de bibliothèque : on veut la maîtrise exacte des marques (colonnes fines à bout
// arrondi, séparateur de 2 px dans la couleur du fond, grille en filets, survol avec
// réticule) et un rendu identique en thème clair et sombre.
//
// Les couleurs viennent des variables CSS (--serie-pluie, etc.) : elles basculent toutes
// seules avec le thème du système, et le SVG les lit par `var()` comme n'importe quel
// élément HTML.

(function (global) {
"use strict";

const NS = "http://www.w3.org/2000/svg";

// Les identifiants de découpe doivent être uniques dans TOUTE la page : deux figures
// coexistent, et un `url(#…)` en double ferait piocher le mauvais découpage.
let compteurJetons = 0;
const jetonUnique = () => `j${++compteurJetons}`;
const MOIS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const nf = (v, d = 0) => v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

function el(nom, attrs = {}, parent = null) {
  const e = document.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

/** Colonne à bout arrondi côté valeur, d'aplomb sur la ligne de base. */
function colonne(parent, x, y, w, h, fill, r = 4) {
  const rr = Math.max(0, Math.min(r, h, w / 2));
  const d = `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y}` +
            ` L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
  return el("path", { d, fill }, parent);
}

/**
 * Colonne tendue entre le zéro et sa valeur : vers le haut si elle est positive, vers le
 * BAS si elle est négative. Indispensable dès qu'une série peut changer de signe (le
 * bilan P − ETP) : partir du bas du cadre ferait lire une valeur négative comme une
 * grande valeur positive.
 */
function colonneDepuisZero(parent, x, yValeur, yZero, w, fill, r = 4) {
  const h = Math.abs(yValeur - yZero);
  if (yValeur <= yZero) return colonne(parent, x, yValeur, w, h, fill, r);
  const rr = Math.max(0, Math.min(r, h, w / 2));
  const d = `M${x},${yZero} L${x},${yValeur - rr} Q${x},${yValeur} ${x + rr},${yValeur}` +
            ` L${x + w - rr},${yValeur} Q${x + w},${yValeur} ${x + w},${yValeur - rr}` +
            ` L${x + w},${yZero} Z`;
  return el("path", { d, fill }, parent);
}

/** Étiquette directe : recalée dans le cadre plutôt que rognée par son bord. */
function etiquette(parent, x, y, texte, bornes) {
  const [gauche, droite] = bornes;
  let ancre = "middle";
  if (x < gauche + 18) { x = gauche; ancre = "start"; }
  else if (x > droite - 18) { x = droite; ancre = "end"; }
  const t = el("text", { x, y: Math.max(11, y), "text-anchor": ancre, class: "g-valeur" }, parent);
  t.textContent = texte;
  return t;
}

/**
 * Graduations rondes : 0, 20, 40… en visant six lignes.
 *
 * La dernière graduation est toujours AU-DESSUS du maximum. C'est le point important :
 * en s'arrêtant à la dernière valeur ronde inférieure, le sommet d'une colonne ou d'une
 * courbe se retrouvait dessiné hors du cadre, et disparaissait purement et simplement.
 */
function joliPas(brut) {
  const ordre = Math.pow(10, Math.floor(Math.log10(Math.max(brut, 1e-9))));
  return [1, 2, 2.5, 5, 10].map((m) => m * ordre).find((p) => p >= brut) || 10 * ordre;
}

function graduations(max, cible = 5) {
  const brut = Math.max(max, 1e-9) / cible;
  const pas = joliPas(brut);
  const ticks = [];
  const n = Math.ceil(max / pas - 1e-9);
  for (let i = 0; i <= n; i++) ticks.push(+(i * pas).toFixed(6));
  return ticks.length > 1 ? ticks : [0, pas];
}

/** Décimales à afficher pour un pas de graduation donné (0,05 → 2, 5 → 0). */
function decimalesPas(pas) {
  return pas >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(pas)));
}

/** Graduations couvrant [min, max], le zéro compris quand il y a du négatif. */
function echelle(min, max) {
  const ticks = graduations(Math.max(max, 0));
  const pas = ticks[1] - ticks[0];
  if (min < 0) {
    for (let v = -pas; v >= min - pas * 0.001; v -= pas) ticks.unshift(+v.toFixed(6));
  }
  return ticks;
}

// --------------------------------------------------------------------- infobulle

let bulle = null;
function bulleAffiche(hote, x, y, html) {
  if (!bulle) {
    bulle = document.createElement("div");
    bulle.className = "infobulle";
    document.body.appendChild(bulle);
  }
  bulle.innerHTML = html;
  bulle.hidden = false;
  const r = hote.getBoundingClientRect();
  const b = bulle.getBoundingClientRect();
  let gx = r.left + x + 14;
  if (gx + b.width > window.innerWidth - 8) gx = r.left + x - b.width - 14;
  bulle.style.left = `${Math.max(8, gx)}px`;
  bulle.style.top = `${Math.max(8, r.top + y - b.height / 2)}px`;
}
function bulleCache() {
  if (bulle) bulle.hidden = true;
}

// ------------------------------------------------------- figure 1 : ombrothermique

/**
 * Précipitations et évapotranspiration potentielle, mois par mois.
 *
 * Les deux grandeurs sont des HAUTEURS D'EAU en millimètres : elles partagent donc un
 * seul et même axe, sans facteur de conversion à choisir. Là où la courbe d'ETP passe
 * au-dessus des colonnes de pluie, le mois est en déficit (l'atmosphère peut évaporer
 * plus d'eau qu'il n'en tombe) — ces mois-là sont grisés.
 */
function precipitationsMensuelles(hote, d, dispo, avecEtp = true) {
  hote.textContent = "";
  bulleCache();
  const M = { g: 46, d: 16, h: 44, b: 24 };
  const HP = 250;
  const H = M.h + HP + M.b;
  // Le pas des colonnes est plafonné ; la figure fait donc exactement la largeur qu'il
  // lui faut, et c'est le panneau qui s'y ajuste — pas l'inverse.
  const bande = Math.min((Math.max(360, dispo) - M.g - M.d) / 12, 46);
  const pw = bande * 12;
  const W = M.g + pw + M.d;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": "Précipitations et évapotranspiration potentielle par mois" }, hote);

  const totaux = d.pluie.map((p, i) => p + d.neige[i]);
  const etpMax = avecEtp ? Math.max(...d.etp) : 0;

  const ticks = graduations(Math.max(...totaux, etpMax, 10));
  const haut = ticks[ticks.length - 1];

  const y = (mm) => M.h + HP - (mm / haut) * HP;
  const x0 = M.g;
  const xBande = (i) => x0 + bande * i;
  const larg = Math.min(24, bande - 10);

  // mois en déficit : la colonne est plus basse que la courbe d'ETP
  const secs = avecEtp ? totaux.map((p, i) => p < d.etp[i]) : Array(12).fill(false);
  for (let i = 0; i < 12; i++) {
    if (!secs[i]) continue;
    el("rect", { x: xBande(i), y: M.h - 6, width: bande, height: HP + 6,
                 fill: "var(--secheresse)" }, svg);
  }

  for (const v of ticks) {
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg).textContent = nf(v);
  }

  el("text", { x: M.g, y: M.h - 26, class: "g-titre-axe" }, svg)
    .textContent = "Hauteur d'eau (mm)";

  // colonnes empilées : pluie en bas, neige au-dessus, séparées par 2 px de fond
  for (let i = 0; i < 12; i++) {
    const x = xBande(i) + (bande - larg) / 2;
    const hp = y(0) - y(d.pluie[i]);
    const hn = y(0) - y(d.neige[i]);
    const gap = hn > 1 ? 2 : 0;
    if (hn > 0.5) colonne(svg, x, y(totaux[i]), larg, hn, "var(--serie-neige)");
    if (hp > 0.5) colonne(svg, x, y(d.pluie[i]) + gap, larg, Math.max(0, hp - gap),
                          "var(--serie-pluie)", hn > 0.5 ? 0 : 4);
  }

  // courbe de l'évapotranspiration potentielle, sur le même axe que les colonnes
  if (avecEtp) {
  const pts = d.etp.map((v, i) => [xBande(i) + bande / 2, y(v)]);
  el("polyline", { points: pts.map(([px, py]) => `${px},${py}`).join(" "), fill: "none",
                   stroke: "var(--serie-etp)", "stroke-width": 2,
                   "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
  for (const [px, py] of pts) {
    el("circle", { cx: px, cy: py, r: 4, fill: "var(--serie-etp)",
                   stroke: "var(--fond-figure)", "stroke-width": 2 }, svg);
  }

  }

  // étiquettes directes, parcimonieuses : le mois le plus arrosé, l'ETP la plus forte
  const iPluie = totaux.indexOf(Math.max(...totaux));
  const bornes = [M.g, W - M.d];
  etiquette(svg, xBande(iPluie) + bande / 2, y(totaux[iPluie]) - 7, `${nf(totaux[iPluie])} mm`, bornes);
  if (avecEtp) etiquette(svg, xBande(d.etp.indexOf(etpMax)) + bande / 2, y(etpMax) - 11,
                         `${nf(etpMax)} mm`, bornes);

  // mois sous l'axe
  for (let i = 0; i < 12; i++) {
    el("text", { x: xBande(i) + bande / 2, y: M.h + HP + 16, "text-anchor": "middle",
                 class: "g-tick" }, svg).textContent = MOIS[i];
  }

  // survol : réticule + infobulle du mois
  const curseur = el("line", { y1: M.h - 6, y2: M.h + HP, stroke: "var(--reticule)",
                               "stroke-width": 1, "pointer-events": "none",
                               visibility: "hidden" }, svg);
  const zone = el("rect", { x: x0, y: M.h - 6, width: bande * 12, height: HP + 6,
                            fill: "transparent" }, svg);
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(11, Math.floor((px - x0) / bande)));
    const cx = xBande(i) + bande / 2;
    curseur.setAttribute("x1", cx);
    curseur.setAttribute("x2", cx);
    curseur.setAttribute("visibility", "visible");
    const bilan = avecEtp ? totaux[i] - d.etp[i] : 0;
    bulleAffiche(svg, cx, avecEtp ? y(d.etp[i]) : y(totaux[i]),
      `<strong>${MOIS[i]}</strong>` +
      ligne("Pluie", `${nf(d.pluie[i], 1)} mm`, "var(--serie-pluie)") +
      (d.neige[i] >= 0.05 ? ligne("Neige", `${nf(d.neige[i], 1)} mm`, "var(--serie-neige)") : "") +
      (avecEtp
        ? ligne("ETP", `${nf(d.etp[i], 1)} mm`, "var(--serie-etp)") +
          `<div class="bulle-note">bilan P − ETP : ${bilan >= 0 ? "+" : "−"}${nf(Math.abs(bilan))} mm` +
          `${secs[i] ? " (déficit)" : ""}</div>`
        : ligne("Total", `${nf(totaux[i], 1)} mm`, "var(--encre-3)")));
  });
  zone.addEventListener("mouseleave", () => { curseur.setAttribute("visibility", "hidden"); bulleCache(); });

  return { secs, largeur: W };
}

function ligne(nom, valeur, couleur) {
  return `<div class="bulle-ligne"><span class="puce" style="background:${couleur}"></span>` +
         `<span class="bulle-nom">${nom}</span><span class="bulle-val">${valeur}</span></div>`;
}

// ------------------------------------------- figure générique : profil mensuel

/**
 * Le profil d'une grandeur sur les douze mois, pour les onglets autres que « Pluie ».
 *
 * `cfg` : { valeurs[12], titreAxe, unite, decimales, forme: "colonnes" | "ligne",
 *           couleur, nom, bande: { min[12], max[12], nom } }
 * Les grandeurs qui s'accumulent (neige, ETP) sont en colonnes ; celles qui décrivent
 * un état à un instant (température, humidex, manteau neigeux) sont en courbe.
 */
function profilMensuel(hote, cfg, dispo) {
  hote.textContent = "";
  bulleCache();
  const c = { decimales: 1, forme: "colonnes", couleur: "var(--serie-pluie)", ...cfg };
  const M = { g: 46, d: 16, h: 44, b: 24 };
  const HP = 230;
  const H = M.h + HP + M.b;
  const bande = Math.min((Math.max(360, dispo) - M.g - M.d) / 12, 46);
  const pw = bande * 12;
  const W = M.g + pw + M.d;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": `${c.nom} par mois` }, hote);

  const bas12 = c.bande ? c.bande.min : c.valeurs;
  const haut12 = c.bande ? c.bande.max : c.valeurs;
  const ticks = echelle(Math.min(0, ...bas12), Math.max(...haut12, 1e-6));
  const bas = ticks[0], haut = ticks[ticks.length - 1];

  const y = (v) => M.h + HP - ((v - bas) / (haut - bas)) * HP;
  const xBande = (i) => M.g + bande * i;
  const larg = Math.min(24, bande - 10);

  for (const v of ticks) {
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg)
      .textContent = nf(v, decimalesPas(ticks[1] - ticks[0]));
  }
  el("text", { x: M.g, y: M.h - 26, class: "g-titre-axe" }, svg).textContent = c.titreAxe;

  // bande min–max : un lavis de la couleur de la série, jamais un aplat saturé
  if (c.bande) {
    const hautPts = c.bande.max.map((v, i) => `${xBande(i) + bande / 2},${y(v)}`);
    const basPts = c.bande.min.map((v, i) => `${xBande(i) + bande / 2},${y(v)}`).reverse();
    el("polygon", { points: [...hautPts, ...basPts].join(" "), fill: c.couleur,
                    "fill-opacity": 0.12 }, svg);
  }

  if (c.forme === "colonnes") {
    for (let i = 0; i < 12; i++) {
      const h = y(Math.min(c.valeurs[i], 0)) - y(Math.max(c.valeurs[i], 0));
      if (h > 0.5) colonne(svg, xBande(i) + (bande - larg) / 2,
                           y(Math.max(c.valeurs[i], 0)), larg, h, c.couleur);
    }
  } else {
    const pts = c.valeurs.map((v, i) => [xBande(i) + bande / 2, y(v)]);
    el("polyline", { points: pts.map(([px, py]) => `${px},${py}`).join(" "), fill: "none",
                     stroke: c.couleur, "stroke-width": 2,
                     "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    for (const [px, py] of pts) {
      el("circle", { cx: px, cy: py, r: 4, fill: c.couleur,
                     stroke: "var(--fond-figure)", "stroke-width": 2 }, svg);
    }
  }

  // étiquettes directes : les deux extrêmes de l'année, rien de plus
  const vMax = Math.max(...c.valeurs), vMin = Math.min(...c.valeurs);
  const bornes = [M.g, W - M.d];
  for (const v of new Set([vMax, vMin])) {
    const i = c.valeurs.indexOf(v);
    etiquette(svg, xBande(i) + bande / 2, y(v) - (c.forme === "ligne" ? 11 : 7),
              `${nf(v, c.decimales)} ${c.unite}`, bornes);
  }

  for (let i = 0; i < 12; i++) {
    el("text", { x: xBande(i) + bande / 2, y: M.h + HP + 16, "text-anchor": "middle",
                 class: "g-tick" }, svg).textContent = MOIS[i];
  }

  const curseur = el("line", { y1: M.h - 6, y2: M.h + HP, stroke: "var(--reticule)",
                               "stroke-width": 1, "pointer-events": "none",
                               visibility: "hidden" }, svg);
  const zone = el("rect", { x: M.g, y: M.h - 6, width: pw, height: HP + 6,
                            fill: "transparent" }, svg);
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(11, Math.floor((px - M.g) / bande)));
    const cx = xBande(i) + bande / 2;
    curseur.setAttribute("x1", cx);
    curseur.setAttribute("x2", cx);
    curseur.setAttribute("visibility", "visible");
    bulleAffiche(svg, cx, y(c.valeurs[i]),
      `<strong>${MOIS[i]}</strong>` +
      // du plus chaud au plus froid : lu de haut en bas, c'est l'ordre attendu
      (c.bande ? ligne("Maximale", `${nf(c.bande.max[i], c.decimales)} ${c.unite}`, "var(--encre-3)") : "") +
      ligne(c.nom, `${nf(c.valeurs[i], c.decimales)} ${c.unite}`, c.couleur) +
      (c.bande ? ligne("Minimale", `${nf(c.bande.min[i], c.decimales)} ${c.unite}`, "var(--encre-3)") : ""));
  });
  zone.addEventListener("mouseleave", () => { curseur.setAttribute("visibility", "hidden"); bulleCache(); });

  return { largeur: W };
}

// ------------------------------------------ figure : une année, jour par jour

const DEBUT_MOIS = (bissextile) => {
  const l = [31, bissextile ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const d = [0];
  for (const n of l) d.push(d[d.length - 1] + n);
  return d;   // 13 valeurs : le rang du 1er de chaque mois, puis la fin de l'année
};

/**
 * Le détail d'une année : chaque jour, et — pour ce qui s'accumule — le cumul depuis
 * le 1er janvier dans un second cadre sous le premier, sur le même axe des jours.
 *
 * `cfg` : { jours[], titreAxe, unite, decimales, couleur, nom, cumul, annee, bissextile }
 * `jours[i]` vaut `null` quand la journée manque (année en cours, données non encore
 * publiées) : la courbe s'y interrompt au lieu de plonger à zéro.
 */
function anneeJourParJour(hote, cfg, dispo) {
  hote.textContent = "";
  bulleCache();
  const c = { decimales: 1, couleur: "var(--serie-pluie)", couleurCumul: "var(--serie-etp)",
              cumul: false, sens: 1, ...cfg };
  // `sens` : +1 quand « au-dessus de la normale » se dit en rouge (température, ETP),
  // −1 quand c'est le manque qui se dit en rouge (pluie, neige, manteau neigeux).
  const chaud = c.sens > 0 ? "var(--div-chaud-2)" : "var(--div-froid-2)";
  const froid = c.sens > 0 ? "var(--div-froid-2)" : "var(--div-chaud-2)";
  // avec plusieurs courbes, `jours` est nul et les séries décochées sont vides :
  // le nombre de jours de l'année doit donc être donné explicitement
  const n = c.nbJours || c.jours.length;
  // Deux morceaux réglables sur les variables cumulées : les barres du jour et la
  // courbe de cumul. Quand un seul est demandé, il passe sur l'axe de GAUCHE et l'axe
  // de droite disparaît — une échelle jumelée sans rien en face n'aurait pas de sens.
  const montreJour = !c.cumul || c.jourVisible !== false;
  const montreCumul = !!c.cumul && c.cumulVisible !== false && !c.anomalies;
  const doubleAxe = montreJour && montreCumul;
  const M = { g: 42, d: doubleAxe ? 46 : 14, h: 40, b: 22 };
  const HP = 230;
  const H = M.h + HP + M.b;

  const pas = Math.min((Math.max(340, dispo) - M.g - M.d) / n, 4);
  const pw = pas * n;
  const W = M.g + pw + M.d;
  const x = (i) => M.g + pas * i;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": `${c.nom} jour par jour en ${c.annee}` }, hote);

  // soit une seule série (`jours`), soit plusieurs courbes dont on ne dessine que les
  // cochées — l'échelle ne tient compte que de ce qui est réellement affiché
  const courbes = c.courbes ? c.courbes.filter((k) => k.visible) : null;

  // le cumul depuis le 1er janvier, calculé avant les échelles : il peut porter l'axe
  let cumuls = null;
  if (c.cumul) {
    cumuls = [];
    let total = 0;
    for (const v of c.jours) {
      if (v === null) { cumuls.push(null); continue; }
      total += v;
      cumuls.push(total);
    }
  }

  const connus = c.anomalies
    ? c.anomalies.filter((v) => v !== null)
    : courbes
      ? courbes.flatMap((k) => k.valeurs).filter((v) => v !== null)
      : montreJour
        ? c.jours.filter((v) => v !== null)
        : cumuls.filter((v) => v !== null);
  if (connus.length === 0 || (c.cumul && !montreJour && !montreCumul)) {
    hote.innerHTML = (courbes && c.courbes.length) || (c.cumul && !montreJour && !montreCumul)
      ? `<p class="muted">Activez au moins une courbe.</p>`
      : `<p class="muted">Aucune donnée pour cette année.</p>`;
    return { largeur: 0 };
  }

  // axe de gauche : la valeur du jour, ou le cumul quand il est seul à l'écran
  const normalesConnues = c.normale && !c.cumul && !c.anomalies
    ? c.normale.jours.filter((v) => v !== null) : [];
  const cumulsNormale = c.normale && c.normale.cumul
    ? c.normale.cumul.filter((v) => v !== null) : [];
  const bornesGauche = montreJour
    ? [Math.min(0, ...connus, ...normalesConnues), Math.max(...connus, ...normalesConnues, 1e-6)]
    : [0, Math.max(...connus, ...cumulsNormale, 1e-6)];
  const ticks = echelle(bornesGauche[0], bornesGauche[1]);
  const bas = ticks[0], haut = ticks[ticks.length - 1];
  const y = (v) => M.h + HP - ((v - bas) / (haut - bas)) * HP;
  const dec = decimalesPas(ticks[1] - ticks[0]);

  // axe de droite : le cumul, quand les deux morceaux sont à l'écran. Son pas est choisi
  // pour tomber sur EXACTEMENT les mêmes lignes que l'axe de gauche — sans quoi une
  // échelle jumelée pose deux grilles qui se croisent et ne se lisent plus.
  let yC = null, pasC = 0;
  if (doubleAxe) {
    const divisions = ticks.length - 1;
    pasC = joliPas(Math.max(...cumuls.filter((v) => v !== null), ...cumulsNormale, 1e-6) / divisions);
    const hautC = pasC * divisions;
    yC = (v) => M.h + HP - (v / hautC) * HP;
  } else if (montreCumul) {
    yC = y;   // le cumul porte lui-même l'axe de gauche
  }

  for (let i = 0; i < ticks.length; i++) {
    const v = ticks[i];
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg)
      .textContent = nf(v, dec);
    if (doubleAxe) {
      el("text", { x: W - M.d + 8, y: y(v) + 4, class: "g-tick" }, svg)
        .textContent = nf(i * pasC, decimalesPas(pasC));
    }
  }

  el("text", { x: M.g, y: M.h - 22, class: "g-titre-axe" }, svg).textContent =
    montreJour ? c.titreAxe : `Cumul depuis le 1ᵉʳ janvier (${c.unite})`;
  if (doubleAxe) {
    el("text", { x: W - M.d, y: M.h - 22, "text-anchor": "end", class: "g-titre-axe" }, svg)
      .textContent = `Cumul (${c.unite})`;
  }

  // Repère : la moyenne de chaque jour de l'année, calculée sur toute la période (ou
  // sur la référence). Tracée en encre et AVANT les données de l'année, pour rester
  // derrière elles — c'est un fond de comparaison, pas une série de plus.
  const tracerSerie = (valeurs, couleur, epaisseur, echelleY) => {
    let segment = [];
    const fin = () => {
      if (segment.length > 1) {
        el("polyline", { points: segment.join(" "), fill: "none", stroke: couleur,
                         "stroke-width": epaisseur, "stroke-linejoin": "round",
                         "pointer-events": "none" }, svg);
      }
      segment = [];
    };
    for (let i = 0; i < n; i++) {
      if (valeurs[i] === null || valeurs[i] === undefined) fin();
      else segment.push(`${x(i) + pas / 2},${echelleY(valeurs[i])}`);
    }
    fin();
  };

  // Sur une variable cumulée, seule la COURBE DE CUMUL de la normale est tracée : la
  // moyenne d'un jour de pluie vaut deux ou trois millimètres, elle s'écrase au ras de
  // l'axe et n'apprend rien.
  // En mode anomalies la normale EST le zéro de l'axe : la tracer en plus n'aurait pas
  // de sens et écraserait l'échelle des écarts.
  // Sur une variable en courbe, la normale est un FOND : elle passe dessous. Sur une
  // variable en barres, elle doit au contraire passer DEVANT, sinon les barres du jour
  // la hachent. Le tracé du cumul est donc repoussé après les barres.
  if (c.normale && !c.anomalies && !c.cumul) tracerSerie(c.normale.jours, "var(--encre-3)", 1.2, y);

  // Écart à la normale : la surface entre la courbe du jour et la moyenne du jour est
  // remplie en ROUGE là où la journée est au-dessus, en BLEU là où elle est en dessous.
  // Un seul et même ruban, dessiné deux fois et découpé par la courbe de la normale :
  // c'est ce qui garantit que la bascule de couleur tombe pile au croisement.
  const colorierEcart = (valeurs, normale, echelleY) => {
    const hautCadre = M.h - 4, basCadre = M.h + HP + 4;
    const runs = [];
    let courant = [];
    for (let i = 0; i < n; i++) {
      const ok = valeurs[i] !== null && valeurs[i] !== undefined &&
                 normale[i] !== null && normale[i] !== undefined;
      if (ok) courant.push(i);
      else { if (courant.length > 1) runs.push(courant); courant = []; }
    }
    if (courant.length > 1) runs.push(courant);

    let numero = 0;
    for (const run of runs) {
      const px = (i) => x(i) + pas / 2;
      const surNormale = run.map((i) => `${px(i)},${echelleY(normale[i])}`);
      const surValeur = run.map((i) => `${px(i)},${echelleY(valeurs[i])}`);
      const ruban = [...surValeur, ...surNormale.slice().reverse()].join(" ");
      const gauche = px(run[0]), droite = px(run[run.length - 1]);

      for (const cote of ["chaud", "froid"]) {
        const id = `decoupe-${cote}-${numero}-${jetonUnique()}`;
        const clip = el("clipPath", { id }, svg);
        // le demi-plan situé au-dessus (ou en dessous) de la courbe de la normale
        el("polygon", {
          points: cote === "chaud"
            ? [`${gauche},${hautCadre}`, ...surNormale, `${droite},${hautCadre}`].join(" ")
            : [`${gauche},${basCadre}`, ...surNormale, `${droite},${basCadre}`].join(" "),
        }, clip);
        el("polygon", { points: ruban, "clip-path": `url(#${id})`,
                        fill: cote === "chaud" ? chaud : froid,
                        "fill-opacity": 0.35, "pointer-events": "none" }, svg);
      }
      numero++;
    }
  };

  if (c.ecartNormale) colorierEcart(c.ecartNormale.valeurs, c.ecartNormale.normale, y);
  if (c.anomalies) {
    // Écart de chaque jour à sa normale : une barre depuis le zéro, rouge au-dessus,
    // bleue en dessous. C'est le seul endroit où le zéro de l'axe porte un sens fort,
    // d'où le filet appuyé.
    for (let i = 0; i < n; i++) {
      const v = c.anomalies[i];
      if (v === null || v === undefined) continue;
      const haut = Math.min(y(v), y(0));
      const hauteur = Math.abs(y(v) - y(0));
      if (hauteur < 0.3) continue;
      el("rect", { x: x(i), y: haut, width: Math.max(1, pas - 0.4), height: hauteur,
                   fill: v >= 0 ? chaud : froid }, svg);
    }
    el("line", { x1: M.g, x2: W - M.d, y1: y(0), y2: y(0), stroke: "var(--encre-2)",
                 "stroke-width": 1, "pointer-events": "none" }, svg);
  } else if (c.cumul) {
    if (montreJour) {
      // barres journalières : à 2 px de large, pas d'arrondi ni d'écart, ce serait du bruit
      for (let i = 0; i < n; i++) {
        const v = c.jours[i];
        if (v === null || v <= 0) continue;
        el("rect", { x: x(i), y: y(v), width: Math.max(1, pas - 0.5),
                     height: y(0) - y(v), fill: c.couleur }, svg);
      }
    }
    if (montreCumul) {
      // l'écart entre le cumul de l'année et celui de la normale, colorié comme sur les
      // courbes : le retard d'un côté, l'avance de l'autre
      if (c.normale && c.normale.cumul) {
        colorierEcart(cumuls, c.normale.cumul, yC);
        tracerSerie(c.normale.cumul, "var(--encre-2)", 1.8, yC);
      }
      const pts = [];
      for (let i = 0; i < n; i++) if (cumuls[i] !== null) pts.push(`${x(i) + pas / 2},${yC(cumuls[i])}`);
      el("polyline", { points: pts.join(" "), fill: "none", stroke: c.couleurCumul,
                       "stroke-width": 2, "stroke-linejoin": "round" }, svg);
      const connusCumul = cumuls.filter((v) => v !== null);
      const dernier = connusCumul[connusCumul.length - 1];
      etiquette(svg, x(connusCumul.length), yC(dernier) - 8,
                `${nf(dernier, 0)} ${c.unite}`, [M.g, W - M.d]);
    }
  } else {
    // courbes interrompues sur les jours manquants
    const tracer = (valeurs, couleur, epaisseur) => {
      let segment = [];
      const fin = () => {
        if (segment.length > 1) {
          el("polyline", { points: segment.join(" "), fill: "none", stroke: couleur,
                           "stroke-width": epaisseur, "stroke-linejoin": "round" }, svg);
        }
        segment = [];
      };
      for (let i = 0; i < n; i++) {
        if (valeurs[i] === null) fin();
        else segment.push(`${x(i) + pas / 2},${y(valeurs[i])}`);
      }
      fin();
    };
    if (courbes) {
      for (const k of courbes) tracer(k.valeurs, k.couleur, k.cle === "moy" ? 1.6 : 1.2);
    } else {
      tracer(c.jours, c.couleur, 1.5);
    }
  }

  // repères des mois
  const rangs = DEBUT_MOIS(n > 365);
  for (let m = 0; m < 12; m++) {
    if (m > 0) {
      el("line", { x1: x(rangs[m]), x2: x(rangs[m]), y1: M.h, y2: M.h + HP,
                   stroke: "var(--grille)", "stroke-width": 1 }, svg);
    }
    el("text", { x: x((rangs[m] + rangs[m + 1]) / 2), y: M.h + HP + 15,
                 "text-anchor": "middle", class: "g-tick" }, svg)
      .textContent = pas < 2.2 ? MOIS[m][0] : MOIS[m];
  }

  // survol : réticule + infobulle du jour
  const curseur = el("line", { y1: M.h, y2: M.h + HP, stroke: "var(--reticule)",
                               "stroke-width": 1, "pointer-events": "none",
                               visibility: "hidden" }, svg);
  const zone = el("rect", { x: M.g, y: M.h, width: pw, height: HP, fill: "transparent" }, svg);
  const dateDuRang = (i) => new Date(Date.UTC(c.annee, 0, 1 + i))
    .toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(n - 1, Math.floor((px - M.g) / pas)));
    const cx = x(i) + pas / 2;
    curseur.setAttribute("x1", cx);
    curseur.setAttribute("x2", cx);
    curseur.setAttribute("visibility", "visible");
    let corps = "";
    if (c.anomalies) {
      const v = c.anomalies[i];
      corps += v === null || v === undefined
        ? `<div class="bulle-note">pas encore de données</div>`
        : ligne("Écart", `${v >= 0 ? "+" : "−"}${nf(Math.abs(v), c.decimales)} ${c.unite}`,
                v >= 0 ? chaud : froid) +
          (c.valeursBrutes && c.valeursBrutes[i] !== null
            ? ligne("Relevé", `${nf(c.valeursBrutes[i], c.decimales)} ${c.unite}`, c.couleur)
            : "") +
          (c.normale && c.normale.jours[i] !== null
            ? ligne(c.normale.nom, `${nf(c.normale.jours[i], c.decimales)} ${c.unite}`,
                    "var(--encre-3)")
            : "");
    } else if (courbes) {
      const lues = courbes.filter((k) => k.valeurs[i] !== null);
      corps += lues.length
        ? lues.map((k) => ligne(k.nom, `${nf(k.valeurs[i], c.decimales)} ${c.unite}`, k.couleur)).join("")
        : `<div class="bulle-note">pas encore de données</div>`;
    } else if (c.jours[i] === null) {
      corps += `<div class="bulle-note">pas encore de données</div>`;
    } else {
      corps += ligne(c.nom, `${nf(c.jours[i], c.decimales)} ${c.unite}`, c.couleur) +
              (cumuls ? ligne("Cumul", `${nf(cumuls[i], 0)} ${c.unite}`, c.couleurCumul) : "");
    }
    if (c.normale && !c.anomalies) {
      if (!c.cumul && c.normale.jours[i] !== null && c.normale.jours[i] !== undefined) {
        corps += ligne(c.normale.nom, `${nf(c.normale.jours[i], c.decimales)} ${c.unite}`,
                       "var(--encre-3)");
      }
      if (c.cumul && c.normale.cumul && c.normale.cumul[i] !== null) {
        corps += ligne(`${c.normale.nom} (cumul)`, `${nf(c.normale.cumul[i], 0)} ${c.unite}`,
                       "var(--encre-2)");
      }
    }
    bulleAffiche(svg, cx, M.h + HP / 2, `<strong>${dateDuRang(i)} ${c.annee}</strong>` + corps);
  });
  zone.addEventListener("mouseleave", () => { curseur.setAttribute("visibility", "hidden"); bulleCache(); });

  return { largeur: W };
}

// ------------------------------------------------- figure 2 : cumuls annuels

/**
 * Une colonne par année, plus le repère de la moyenne de la période.
 * `opts` : { titreAxe, unite, decimales, couleur, libelle(annee), nomValeur }.
 */
function cumulsAnnuels(hote, series, dispo, opts = {}) {
  const o = {
    titreAxe: "Précipitations (mm)", unite: "mm", decimales: 0,
    couleur: "var(--serie-pluie)", nomValeur: "Cumul",
    libelle: (a) => `${a - 1}–${a}`,
    ...opts,
  };
  hote.textContent = "";
  bulleCache();
  if (series.length === 0) {
    hote.innerHTML = `<p class="muted">Période trop courte : il faut au moins une année complète.</p>`;
    return;
  }
  const M = { g: 44, d: 14, h: 44, b: 24 };
  const HP = 190;
  const H = M.h + HP + M.b;

  const vals = series.map((s) => s.total);
  const moyenne = vals.reduce((a, b) => a + b, 0) / vals.length;
  const repereEventuel = o.reference ? [o.reference.valeur] : [];
  const ticks = echelle(Math.min(...vals, ...repereEventuel, 0),
                        Math.max(...vals, ...repereEventuel));
  const bas = ticks[0];
  const max = ticks[ticks.length - 1];
  // même règle que pour l'ombrothermique : un pas plafonné, et la figure large de ce
  // qu'il faut pour ses colonnes, ni plus ni moins
  const bande = Math.min((Math.max(360, dispo) - M.g - M.d) / series.length, 34);
  const pw = bande * series.length;
  const W = M.g + pw + M.d;
  const larg = Math.min(24, Math.max(2, bande - (bande > 8 ? 2 : 1)));
  const y = (v) => M.h + HP - ((v - bas) / (max - bas)) * HP;
  const x0 = M.g;
  const x = (i) => x0 + bande * i;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": `${o.titreAxe} par année` }, hote);

  const decTick = decimalesPas(ticks[1] - ticks[0]);
  for (const v of ticks) {
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg)
      .textContent = nf(v, decTick);
  }
  const titreAxe = el("text", { x: M.g, y: M.h - 28, class: "g-titre-axe" }, svg);
  titreAxe.textContent = o.titreAxe;

  // Couleur des colonnes : soit la teinte de la série, soit — quand `o.divergent` est
  // donné — l'écart à la moyenne sur une échelle bleu ↔ rouge. `sens` dit de quel côté
  // se trouve le rouge : +1 pour ce dont « beaucoup » est chaud (température, ETP),
  // −1 pour ce dont « beaucoup » est humide (pluie, neige, manteau).
  const centre = o.reference ? o.reference.valeur : moyenne;
  const ecartMax = Math.max(...vals.map((v) => Math.abs(v - centre)), 1e-9);
  const teinte = (v) => {
    if (!o.divergent) return o.couleur;
    const t = ((v - centre) / ecartMax) * o.divergent;
    const n = Math.abs(t) < 0.2 ? 0 : Math.abs(t) < 0.5 ? 1 : Math.abs(t) < 0.8 ? 2 : 3;
    if (n === 0) return "var(--div-neutre)";
    return `var(--div-${t > 0 ? "chaud" : "froid"}-${n})`;
  };

  const zero = y(Math.max(0, bas));
  for (let i = 0; i < series.length; i++) {
    colonneDepuisZero(svg, x(i) + (bande - larg) / 2, y(series[i].total), zero, larg,
                      teinte(series[i].total));
  }

  // Le repère horizontal : la référence 1960-1990 si on l'a, sinon la moyenne de la
  // période affichée. C'est aussi lui qui sert de zéro à l'échelle de couleurs.
  const repere = o.reference ? o.reference.valeur : moyenne;
  const libelleRepere = o.reference
    ? `${o.reference.libelle} ${nf(repere, o.decimales)} ${o.unite}`
    : `moyenne ${nf(moyenne, o.decimales)} ${o.unite}`;
  el("line", { x1: M.g, x2: W - M.d, y1: y(repere), y2: y(repere),
               stroke: "var(--encre-2)", "stroke-width": 1 }, svg);
  // L'étiquette du repère se pose en tête, à la suite du libellé d'axe, et non sur le
  // filet lui-même : posée sur le filet elle chevauchait les colonnes et les paquets.
  let apres = M.g + 110;
  try {
    const b = titreAxe.getBBox();
    if (b.width > 0) apres = b.x + b.width + 14;
  } catch (e) { /* figure pas encore rendue : on garde le repli */ }
  const etiq = el("text", { x: apres, y: M.h - 28, class: "g-repere" }, svg);
  etiq.textContent = libelleRepere;
  el("line", { x1: apres - 11, x2: apres - 3, y1: M.h - 32, y2: M.h - 32,
               stroke: "var(--encre-2)", "stroke-width": 1 }, svg);

  // Paquets d'années : un trait horizontal à la moyenne du paquet, sur toute sa largeur,
  // avec sa valeur au-dessus. On lit d'un coup si la tranche est au-dessus ou en dessous
  // du repère — ce qu'une moyenne glissante, qui serpente, montre beaucoup moins bien.
  for (const p of o.paquets || []) {
    for (const bloc of p.blocs) {
      const x1 = x(bloc.premier);
      const x2 = x(bloc.dernier) + bande;
      el("line", { x1, x2, y1: y(bloc.moyenne), y2: y(bloc.moyenne), stroke: p.couleur,
                   "stroke-width": p.epaisseur, "stroke-linecap": "round",
                   "pointer-events": "none" }, svg);
      if (x2 - x1 > 26) {
        el("text", { x: (x1 + x2) / 2, y: y(bloc.moyenne) - p.epaisseur - 4,
                     "text-anchor": "middle", class: "g-valeur", "pointer-events": "none" }, svg)
          .textContent = nf(bloc.moyenne, o.decimales);
      }
    }
  }

  // étiquettes directes : l'année la plus sèche et la plus arrosée
  const iMax = vals.indexOf(Math.max(...vals));
  const iMin = vals.indexOf(Math.min(...vals));
  for (const i of new Set([iMax, iMin])) {
    // sous le bout de la colonne quand elle descend, au-dessus quand elle monte
    const dessous = y(vals[i]) > zero;
    etiquette(svg, x(i) + bande / 2, y(vals[i]) + (dessous ? 14 : -6),
              nf(vals[i], o.decimales), [M.g, W - M.d]);
  }

  // années sous l'axe, une sur n pour que ça respire
  // une graduation tous les 5 ans, sur les années rondes (2000, 2005, …) ; si la période
  // est trop courte pour qu'il en tombe deux, on retombe sur la première et la dernière
  let reperes = series.map((s, i) => i).filter((i) => series[i].annee % 5 === 0);
  if (reperes.length < 2) reperes = [0, series.length - 1];
  for (const i of reperes) {
    el("text", { x: x(i) + bande / 2, y: M.h + HP + 16, "text-anchor": "middle",
                 class: "g-tick" }, svg).textContent = series[i].annee;
  }

  // survol : la cible fait toute la hauteur du cadre, pas seulement la colonne
  const surbrillance = el("rect", { y: M.h, height: HP, fill: "var(--survol)",
                                    "pointer-events": "none", visibility: "hidden" }, svg);
  const zone = el("rect", { x: x0, y: M.h, width: bande * series.length, height: HP,
                            fill: "transparent" }, svg);
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(series.length - 1, Math.floor((px - x0) / bande)));
    surbrillance.setAttribute("x", x(i));
    surbrillance.setAttribute("width", bande);
    surbrillance.setAttribute("visibility", "visible");
    const ecart = series[i].total - centre;
    bulleAffiche(svg, x(i) + bande / 2, y(series[i].total),
      `<strong>${o.libelle(series[i].annee)}</strong>` +
      ligne(o.nomValeur, `${nf(series[i].total, o.decimales)} ${o.unite}`, teinte(series[i].total)) +
      (o.paquets || []).map((p) => {
        const bloc = p.blocs.find((b) => i >= b.premier && i <= b.dernier);
        return bloc ? ligne(p.nom, `${nf(bloc.moyenne, o.decimales)} ${o.unite}`, p.couleur) : "";
      }).join("") +
      `<div class="bulle-note">${ecart >= 0 ? "+" : "−"}${nf(Math.abs(ecart), o.decimales)} ${o.unite} ` +
      `par rapport ${o.reference ? "à la référence" : "à la moyenne"}</div>`);
  });
  zone.addEventListener("mouseleave", () => { surbrillance.setAttribute("visibility", "hidden"); bulleCache(); });

  return { moyenne, largeur: W };
}

// ------------------------------------------ figure : comptes annuels de jours extrêmes

/**
 * Le nombre de jours qui franchissent le seuil réglé, année par année, en colonnes.
 *
 * L'échelle se recale sur le seuil choisi : d'un seuil courant à un seuil rare les
 * comptes vont de cent jours à zéro, et une échelle commune écraserait le second au
 * ras de l'axe.
 *
 * `d` : { annees[], jours[], serie: { nom, valeurs[], solide, melange } }
 */
function comptesAnnuels(hote, d, dispo, opts = {}) {
  const o = { titreAxe: "Nombre de jours", unite: "j", ...opts };
  hote.textContent = "";
  bulleCache();
  if (!d.annees.length) {
    hote.innerHTML = `<p class="muted">Période trop courte : il faut au moins une année.</p>`;
    return { largeur: 0 };
  }
  const serie = d.serie;
  const vals = serie.valeurs;
  const n = d.annees.length;
  const M = { g: 44, d: 14, h: 44, b: 24 };
  const HP = 190;
  const H = M.h + HP + M.b;

  // des jours entiers : une graduation « 0,5 jour » n'existe pas
  const maxVal = Math.max(...vals, 0);
  let ticks = maxVal <= 1 ? [0, 1] : echelle(0, maxVal).filter(Number.isInteger);
  if (ticks.length < 2) ticks = [0, Math.ceil(maxVal)];
  const bas = ticks[0];
  const max = ticks[ticks.length - 1];
  // même pas que la figure annuelle voisine : les deux cartes s'alignent alors sur la
  // même largeur d'année, et l'œil passe de l'une à l'autre sans se recaler
  const bande = Math.min((Math.max(360, dispo) - M.g - M.d) / n, 34);
  const W = M.g + bande * n + M.d;
  const larg = Math.min(24, Math.max(2, bande - (bande > 8 ? 2 : 1)));
  const y = (v) => M.h + HP - ((v - bas) / (max - bas)) * HP;
  const x0 = M.g;
  const x = (i) => x0 + bande * i;

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": `${serie.nom} : nombre de jours par an` }, hote);

  const decTick = decimalesPas(ticks[1] - ticks[0]);
  for (const v of ticks) {
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg)
      .textContent = nf(v, decTick);
  }
  const titreAxe = el("text", { x: M.g, y: M.h - 28, class: "g-titre-axe" }, svg);
  titreAxe.textContent = `${serie.nom} — ${o.titreAxe.toLowerCase()}`;

  const zero = y(0);
  for (let i = 0; i < n; i++) {
    // une année à zéro ne dessine rien : un trait d'un pixel au ras de l'axe se lirait
    // comme « un jour », alors que c'est justement l'absence qui compte ici
    if (vals[i] === 0) continue;
    const barre = colonne(svg, x(i) + (bande - larg) / 2, y(vals[i]), larg,
                          zero - y(vals[i]), serie.solide);
    // la teinte exacte est un `color-mix` ; posée en style elle est simplement ignorée
    // si le moteur ne la connaît pas, et la couleur pleine de l'attribut reste
    if (serie.melange) barre.style.fill = serie.melange;
  }

  // la moyenne de la période, en repère : elle dit tout de suite si l'année regardée
  // est au-dessus ou en dessous de l'ordinaire
  const moyenne = vals.reduce((a, b) => a + b, 0) / n;
  el("line", { x1: M.g, x2: W - M.d, y1: y(moyenne), y2: y(moyenne),
               stroke: "var(--encre-2)", "stroke-width": 1 }, svg);
  let apres = M.g + 110;
  try {
    const b = titreAxe.getBBox();
    if (b.width > 0) apres = b.x + b.width + 14;
  } catch (e) { /* figure pas encore rendue : on garde le repli */ }
  el("text", { x: apres, y: M.h - 28, class: "g-repere" }, svg)
    .textContent = `moyenne ${nf(moyenne, 1)} ${o.unite}/an`;
  el("line", { x1: apres - 11, x2: apres - 3, y1: M.h - 32, y2: M.h - 32,
               stroke: "var(--encre-2)", "stroke-width": 1 }, svg);

  // l'année record, étiquetée : c'est celle qu'on cherche des yeux. Quand le seuil
  // n'est jamais franchi, le cadre vide ne dirait rien tout seul : on l'écrit.
  const iMax = vals.indexOf(maxVal);
  if (maxVal > 0) {
    etiquette(svg, x(iMax) + bande / 2, y(maxVal) - 6, nf(maxVal), [M.g, W - M.d]);
  } else {
    el("text", { x: M.g + (W - M.g - M.d) / 2, y: M.h + HP / 2, "text-anchor": "middle",
                 class: "g-repere" }, svg)
      .textContent = "aucun jour ne franchit ce seuil sur toute la série";
  }

  let reperes = d.annees.map((a, i) => i).filter((i) => d.annees[i] % 5 === 0);
  if (reperes.length < 2) reperes = [0, n - 1];
  for (const i of reperes) {
    el("text", { x: x(i) + bande / 2, y: M.h + HP + 16, "text-anchor": "middle", class: "g-tick" }, svg)
      .textContent = o.libelle ? o.libelle(d.annees[i]) : d.annees[i];
  }

  // l'année détaillée dans la figure du dessous, quand il y en a une : un fond fixe
  // derrière sa colonne, qui reste quand la souris s'en va
  if (o.selection !== undefined && o.selection >= 0) {
    const fond = el("rect", { x: x(o.selection), y: M.h, height: HP, width: bande,
                              fill: "var(--survol)", stroke: "var(--encre-3)",
                              "stroke-width": 1, "pointer-events": "none" }, svg);
    svg.insertBefore(fond, svg.firstChild);
  }

  const surbrillance = el("rect", { y: M.h, height: HP, width: bande, fill: "var(--survol)",
                                    "pointer-events": "none", visibility: "hidden" }, svg);
  const zone = el("rect", { x: x0, y: M.h, width: bande * n, height: HP, fill: "transparent" }, svg);
  const rangSouris = (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    return Math.max(0, Math.min(n - 1, Math.floor((px - x0) / bande)));
  };
  if (o.auClic) {
    zone.style.cursor = "pointer";
    zone.addEventListener("click", (ev) => o.auClic(rangSouris(ev)));
  }
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(n - 1, Math.floor((px - x0) / bande)));
    surbrillance.setAttribute("x", x(i));
    surbrillance.setAttribute("visibility", "visible");
    // une année tronquée (celle en cours, ou le tout début de la série) est comptée
    // comme les autres, mais l'infobulle dit sur combien de jours porte le compte
    // (`attendus` : la longueur propre à chaque colonne, quand elle varie d'une année à
    // l'autre — une période qui contient un 29 février, par exemple)
    const partielle = d.jours && (d.attendus ? d.jours[i] < d.attendus[i]
                                             : o.anneeComplete && d.jours[i] < o.anneeComplete);
    const ecart = vals[i] - moyenne;
    bulleAffiche(svg, x(i) + bande / 2, y(vals[i]),
      `<strong>${o.libelleLong ? o.libelleLong(d.annees[i]) : d.annees[i]}</strong>` +
      ligne(serie.nom, `${nf(vals[i])} ${o.unite}`, serie.solide) +
      `<div class="bulle-note">${ecart >= 0 ? "+" : "−"}${nf(Math.abs(ecart), 1)} ${o.unite} ` +
      `par rapport à la moyenne</div>` +
      (partielle ? `<div class="bulle-note">${o.texteIncomplet || "année incomplète"} : ` +
                   `${nf(d.jours[i])} jours mesurés</div>` : "") +
      (o.auClic ? `<div class="bulle-note">cliquer pour voir le détail</div>` : ""));
  });
  zone.addEventListener("mouseleave", () => {
    surbrillance.setAttribute("visibility", "hidden");
    bulleCache();
  });

  return { largeur: W };
}

// ------------------------------------------- jours d'une période, une année choisie

/**
 * Les jours d'une période (du 1ᵉʳ juin au 1ᵉʳ septembre, par exemple) pour UNE année :
 * une colonne par jour, pleine quand le jour franchit le seuil, pâle sinon, et le seuil
 * en filet horizontal. C'est le détail de la colonne choisie dans la figure du dessus.
 *
 * `cfg` : { jours[] (null = manquant), debut (Date UTC du 1ᵉʳ jour), seuil, compte(v),
 *           unite, nom, couleur, libelleSeuil }
 */
function joursPeriode(hote, cfg, dispo) {
  hote.textContent = "";
  bulleCache();
  const c = { unite: "mm", couleur: "var(--serie-pluie)", ...cfg };
  const n = c.jours.length;
  const connus = c.jours.filter((v) => v !== null);
  if (!connus.length) {
    hote.innerHTML = `<p class="muted">Aucune donnée sur cette période.</p>`;
    return { largeur: 0 };
  }
  const M = { g: 42, d: 14, h: 30, b: 24 };
  const HP = 200;
  const H = M.h + HP + M.b;
  // jusqu'à 14 px par jour sur une période courte, ramené à la place disponible sinon
  const pas = Math.min((Math.max(340, dispo) - M.g - M.d) / n, 14);
  const W = M.g + pas * n + M.d;
  const x = (i) => M.g + pas * i;
  const larg = pas > 4 ? pas - (pas > 8 ? 2 : 1) : pas;

  const ticks = echelle(0, Math.max(...connus, c.seuil * 1.15, 1e-6));
  const haut = ticks[ticks.length - 1];
  const y = (v) => M.h + HP - (v / haut) * HP;
  const dec = decimalesPas(ticks[1] - ticks[0]);

  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img",
                          "aria-label": `${c.nom} jour par jour sur la période` }, hote);
  for (const v of ticks) {
    el("line", { x1: M.g, x2: W - M.d, y1: y(v), y2: y(v),
                 stroke: v === 0 ? "var(--axe)" : "var(--grille)", "stroke-width": 1 }, svg);
    el("text", { x: M.g - 8, y: y(v) + 4, "text-anchor": "end", class: "g-tick" }, svg)
      .textContent = nf(v, dec);
  }
  el("text", { x: M.g, y: M.h - 14, class: "g-titre-axe" }, svg)
    .textContent = `${c.nom} (${c.unite}/jour)`;

  // les jours comptés en couleur pleine, les autres en pâle : on voit d'un coup d'œil
  // lesquels ont fait le compte
  const date = (i) => new Date(c.debut.getTime() + i * 86400000);
  for (let i = 0; i < n; i++) {
    const v = c.jours[i];
    if (v === null || v <= 0) continue;
    const compte = c.compte(v);
    const b = colonne(svg, x(i) + (pas - larg) / 2, y(v), larg, y(0) - y(v), c.couleur,
                      Math.min(3, larg / 2));
    if (!compte) b.setAttribute("fill-opacity", "0.28");
  }

  // le seuil, par-dessus les colonnes
  el("line", { x1: M.g, x2: W - M.d, y1: y(c.seuil), y2: y(c.seuil),
               stroke: "var(--encre-2)", "stroke-width": 1, "stroke-dasharray": "4 3",
               "pointer-events": "none" }, svg);
  el("text", { x: W - M.d, y: y(c.seuil) - 5, "text-anchor": "end", class: "g-repere" }, svg)
    .textContent = c.libelleSeuil;

  // repères de dates : le 1ᵉʳ de chaque mois (et le 15 quand la période est courte)
  const court = n <= 120;
  let dernierX = -Infinity;
  for (let i = 0; i < n; i++) {
    const d = date(i);
    const jour = d.getUTCDate();
    if (!(jour === 1 || (court && jour === 15) || i === 0)) continue;
    if (jour === 1 && i > 0) {
      el("line", { x1: x(i), x2: x(i), y1: M.h, y2: M.h + HP,
                   stroke: "var(--grille)", "stroke-width": 1 }, svg);
    }
    const tx = x(i) + (jour === 1 || i === 0 ? 0 : pas / 2);
    const texte = jour === 1 || i === 0
      ? `${jour === 1 ? "1ᵉʳ" : jour} ${MOIS[d.getUTCMonth()].toLowerCase()}`
      : `${jour}`;
    // pas de chevauchement : un repère trop proche du précédent est sauté
    // ni trop près du précédent, ni rogné par le bord droit
    if (tx - dernierX < (court ? 34 : 46) || tx > W - M.d - 30) continue;
    dernierX = tx;
    el("text", { x: tx, y: M.h + HP + 16, "text-anchor": "start", class: "g-tick" }, svg)
      .textContent = pas * 30 < 46 && jour === 1 ? MOIS[d.getUTCMonth()][0] : texte;
  }

  const surbrillance = el("rect", { y: M.h, height: HP, width: pas, fill: "var(--survol)",
                                    "pointer-events": "none", visibility: "hidden" }, svg);
  const zone = el("rect", { x: M.g, y: M.h, width: pas * n, height: HP, fill: "transparent" }, svg);
  zone.addEventListener("mousemove", (ev) => {
    const px = ev.clientX - svg.getBoundingClientRect().left;
    const i = Math.max(0, Math.min(n - 1, Math.floor((px - M.g) / pas)));
    surbrillance.setAttribute("x", x(i));
    surbrillance.setAttribute("visibility", "visible");
    const v = c.jours[i];
    const titre = date(i).toLocaleDateString("fr-FR",
      { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    bulleAffiche(svg, x(i) + pas / 2, y(v || 0),
      `<strong>${titre}</strong>` +
      (v === null
        ? `<div class="bulle-note">pas de données</div>`
        : ligne(c.nom, `${nf(v, 1)} ${c.unite}`, c.couleur) +
          `<div class="bulle-note">${c.compte(v) ? "compté" : "pas compté"} (${c.libelleSeuil})</div>`));
  });
  zone.addEventListener("mouseleave", () => {
    surbrillance.setAttribute("visibility", "hidden");
    bulleCache();
  });

  return { largeur: W };
}

// --------------------------------------------- frise des années (présentation)

/**
 * Une bande par grandeur, une rayure par année, coloriée selon l'écart de l'année à la
 * référence — la même échelle divergente à sept marches que les colonnes des figures
 * annuelles, avec le même seuil entre les marches, pour qu'une année ait la même
 * couleur ici et dans son onglet.
 *
 * `rangs` : [{ nom, serie: [{ annee, total }], centre, divergent, unite, decimales,
 *              libelle(annee), groupe }]
 * Toutes les bandes partagent le même axe des années, de la plus ancienne à la plus
 * récente : une année se lit donc de haut en bas, d'une grandeur à l'autre.
 * `auClic(rang, annee)` est appelé quand on clique une rayure.
 */
function frise(hote, rangs, dispo, auClic) {
  hote.textContent = "";
  bulleCache();
  const annees = rangs.flatMap((r) => r.serie.map((s) => s.annee));
  if (annees.length === 0) {
    hote.innerHTML = `<p class="muted">Période trop courte : il faut au moins une année complète.</p>`;
    return { largeur: dispo };
  }
  const a0 = Math.min(...annees);
  const a1 = Math.max(...annees);
  const n = a1 - a0 + 1;

  const M = { g: 138, d: 8, h: 4, b: 22 };
  const HR = 22;          // hauteur d'une bande
  const ECART = 4;        // entre deux bandes
  const ECART_GROUPE = 12; // entre deux familles (chaleur, eau)
  const W = Math.max(M.g + M.d + n * 4, dispo);
  const pas = (W - M.g - M.d) / n;

  // ordonnée de chaque bande, avec un blanc plus large quand on change de famille
  const ys = [];
  let yc = M.h;
  rangs.forEach((r, i) => {
    if (i > 0) yc += rangs[i - 1].groupe !== r.groupe ? ECART_GROUPE : ECART;
    ys.push(yc);
    yc += HR;
  });
  const HP = yc - M.h;
  const H = yc + M.b;

  const svg = el("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`,
                          role: "img", "aria-label": "Frise des années, une bande par grandeur" }, hote);
  const x = (annee) => M.g + (annee - a0) * pas;

  const teintes = rangs.map((r) => {
    const vals = r.serie.map((s) => s.total);
    const ecartMax = Math.max(...vals.map((v) => Math.abs(v - r.centre)), 1e-9);
    return (v) => {
      const t = ((v - r.centre) / ecartMax) * r.divergent;
      const k = Math.abs(t) < 0.2 ? 0 : Math.abs(t) < 0.5 ? 1 : Math.abs(t) < 0.8 ? 2 : 3;
      if (k === 0) return "var(--div-neutre)";
      return `var(--div-${t > 0 ? "chaud" : "froid"}-${k})`;
    };
  });

  rangs.forEach((r, i) => {
    el("text", { x: 0, y: ys[i] + HR / 2 + 4, class: "frise-nom" }, svg).textContent = r.nom;
    // le fond dit « pas de donnée » pour les années qui manquent à cette grandeur
    // (couleur du fond de page, distincte du gris « rien de particulier »)
    el("rect", { x: M.g + 0.5, y: ys[i] + 0.5, width: W - M.g - M.d - 1, height: HR - 1, rx: 2,
                 fill: "var(--plan)", stroke: "var(--filet)" }, svg);
    for (const s of r.serie) {
      // un chevauchement d'un demi-pixel : sans lui l'anticrénelage laisse des fils clairs
      el("rect", { x: x(s.annee), y: ys[i], width: pas + 0.5, height: HR,
                   fill: teintes[i](s.total) }, svg);
    }
  });

  // une graduation par décennie
  for (let a = Math.ceil(a0 / 10) * 10; a <= a1; a += 10) {
    el("line", { x1: x(a), x2: x(a), y1: M.h + HP, y2: M.h + HP + 4,
                 stroke: "var(--axe)", "stroke-width": 1 }, svg);
    el("text", { x: x(a), y: M.h + HP + 16, "text-anchor": "middle", class: "g-tick" }, svg)
      .textContent = a;
  }

  // survol : l'année visée est cerclée sur sa bande, les autres bandes gardent leur lisibilité
  const cadre = el("rect", { height: HR, fill: "none", stroke: "var(--encre)", "stroke-width": 1.5,
                             "pointer-events": "none", visibility: "hidden" }, svg);
  const zone = el("rect", { x: M.g, y: M.h, width: n * pas, height: HP,
                            fill: "transparent", cursor: "pointer" }, svg);
  const viser = (ev) => {
    const b = svg.getBoundingClientRect();
    const px = ev.clientX - b.left;
    const py = ev.clientY - b.top;
    const i = ys.findIndex((y) => py >= y && py < y + HR);
    const annee = a0 + Math.max(0, Math.min(n - 1, Math.floor((px - M.g) / pas)));
    if (i < 0) return null;
    return { i, annee, s: rangs[i].serie.find((s) => s.annee === annee) };
  };
  zone.addEventListener("mousemove", (ev) => {
    const v = viser(ev);
    if (!v) { cadre.setAttribute("visibility", "hidden"); bulleCache(); return; }
    const r = rangs[v.i];
    cadre.setAttribute("x", x(v.annee));
    cadre.setAttribute("y", ys[v.i]);
    cadre.setAttribute("width", pas);
    cadre.setAttribute("visibility", "visible");
    if (!v.s) {
      bulleAffiche(svg, x(v.annee) + pas / 2, ys[v.i] + HR / 2,
        `<strong>${r.libelle(v.annee)}</strong><div class="bulle-note">${r.nom} : année incomplète</div>`);
      return;
    }
    const ecart = v.s.total - r.centre;
    const unite = r.unite ? ` ${r.unite}` : "";
    bulleAffiche(svg, x(v.annee) + pas / 2, ys[v.i] + HR / 2,
      `<strong>${r.libelle(v.annee)}</strong>` +
      ligne(r.nom, `${nf(v.s.total, r.decimales)}${unite}`, teintes[v.i](v.s.total)) +
      `<div class="bulle-note">${ecart >= 0 ? "+" : "−"}${nf(Math.abs(ecart), r.decimales)}${unite} ` +
      `par rapport ${r.surReference ? "à la référence" : "à la moyenne"} · clic : ouvrir</div>`);
  });
  zone.addEventListener("mouseleave", () => { cadre.setAttribute("visibility", "hidden"); bulleCache(); });
  zone.addEventListener("click", (ev) => {
    const v = viser(ev);
    if (v && auClic) { bulleCache(); auClic(rangs[v.i], v.annee); }
  });

  return { largeur: W };
}

global.Graphiques = { precipitationsMensuelles, profilMensuel, anneeJourParJour,
                      cumulsAnnuels, comptesAnnuels, joursPeriode, frise, MOIS, nf };
})(window);
