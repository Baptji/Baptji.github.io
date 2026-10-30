// La figure, calculée une fois en éléments simples (rectangles, textes, poignées) puis
// dessinée de trois façons : en DOM modifiable (interface.js), sur un canvas (PNG, et les
// mesures de tests.html) et en SVG (PDF par l'impression du navigateur).
// Le zoom agrandit la MISE EN PAGE : toutes les longueurs et polices sont multipliées,
// chaque texte est composé à sa taille finale et reste net.

import * as M from './modele.js?v=20261030095040';
import * as R from './referentiel.js?v=20261030095040';

export const FONTE = '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const PAPIER = '#F8F6F1';
const ENCRE = '#1A2A1A', ENCRE_DOUCE = '#888888', REGLE = '#BBBBBB', ALERTE = '#CC3333';
export const BLEU = '#2F72B8';
const NON_OBSERVE = '#F4F1EA';

/// La teinte qu'on voit derrière le texte d'un horizon : celle des taches quand elles le couvrent entièrement.
function fondSous(f, cm) {
  for (const t of f.taches ?? []) {
    const [de, a] = M.plage(f, t);
    if (t.abondance >= 99.9 && cm >= de && cm <= a) return M.couleurTache(t, t.gris >= 50 ? 'gris' : 'orange');
  }
  return null;
}
const INTERLIGNE = 1.2;

/// Mesure d'un texte au canvas, dans la police de la figure.
let ctxMesure = null;
export function mesurer(texte, taille, gras = false) {
  if (!ctxMesure) {
    // Pas d'OffscreenCanvas : Safari 16.0–16.3 l'a, mais sans contexte 2D.
    const c = typeof document !== 'undefined' ? document.createElement('canvas') : new OffscreenCanvas(4, 4);
    ctxMesure = c.getContext('2d');
  }
  ctxMesure.font = police(taille, gras);
  return ctxMesure.measureText(texte).width;
}

export const police = (taille, gras) => `${gras ? 'bold ' : ''}${taille}px ${FONTE}`;

/// Trois lignes possibles — repère, nom, commentaire — dont on n'écrit que ce qui tient
/// dans la hauteur. Une ligne vide n'apparaît que sur l'horizon sélectionné (le repère,
/// lui, reste toujours offert à la saisie hors export).
export function lignesVisibles(h, place, { export: exp, choisi }) {
  const lignes = [
    { clef: 'nom', taille: 9, gras: true, invite: 'H', douce: false },
    { clef: 'libelle', taille: 8.5, gras: true, invite: 'nom', douce: false },
    { clef: 'commentaire', taille: 7.5, gras: false, invite: 'commentaire', douce: true },
  ];
  return lignes.filter((l, i) => (h[l.clef] ? true : !exp && (i === 0 || choisi))).slice(0, place);
}

/// Calcule la figure. `options` : { z, export, horizonChoisi (id), mesure }.
export function composer(s, options = {}) {
  const z = options.z ?? 1;
  const exp = !!options.export;
  const mes = options.mesure ?? mesurer;
  const m = M.miseEnPage(z);
  const n = s.fosses.length;
  const L = M.largeur(n) * z;
  const W = L - 2 * m.marge;               // largeur utile, entre les marges
  const echelle = m.hauteurBarre / Math.max(1, s.profondeur);
  const el = [];
  const lh = (taille) => m.t(taille) * INTERLIGNE;
  const texte = (o) => el.push({ type: 'texte', align: 'center', ...o });

  let y = m.marge;

  // En-tête : titre et sous-titre.
  const largeurEntete = Math.min(m.p(620), W);
  texte({ x: m.marge + (W - largeurEntete) / 2, y, w: largeurEntete, h: lh(15), taille: m.t(15), gras: true,
    couleur: '#2A3A2A', valeur: s.titre, invite: 'Titre du schéma', champ: { cible: 'schema', clef: 'titre' } });
  y += lh(15) + m.p(5);
  texte({ x: m.marge + (W - largeurEntete) / 2, y, w: largeurEntete, h: lh(10), taille: m.t(10),
    couleur: '#666666', valeur: s.sousTitre, invite: 'sous-titre', champ: { cible: 'schema', clef: 'sousTitre' } });
  y += lh(10) + m.p(18);

  // Les fosses, six au plus par ligne. Des cailloux en surface réservent leur place au-dessus des barres
  // (la même pour toutes, pour que les barres restent alignées).
  const hOutils = exp ? 0 : m.p(13);
  const esp = m.p(2);
  const surfaces = s.fosses.filter((f) => f.surface?.abondance > 0);
  const rSurface = surfaces.length ? Math.max(...surfaces.map((f) => M.tailleEG(f.surface.taille).rayon)) : 0;
  const hSurface = rSurface ? lh(7) + m.p(rSurface * 0.95 + 2) : 0;
  const hColonne = hOutils + esp + lh(11) + esp + lh(8) + m.p(6) + esp + hSurface + m.hauteurBarre + esp + m.p(6) + lh(8);
  for (const [debut, fin] of M.lignes(n, M.mise.colonnesParLigne)) {
    const x0 = m.marge + (W - (fin - debut) * m.colonne) / 2;
    for (let fi = debut; fi < fin; fi++) {
      const f = s.fosses[fi];
      const cx = x0 + (fi - debut) * m.colonne;
      el.push({ type: 'colonne', fi, x: cx, y, w: m.colonne, h: hColonne });
      // Tout ce qui coiffe la colonne est centré sur la BARRE, pas sur la colonne : la règle
      // des profondeurs occupe la gauche, sans quoi le titre paraît décalé.
      const gauche = cx + (m.colonne - m.axe - m.barre) / 2;
      const bx = gauche + m.axe;
      let yy = y;
      if (!exp) el.push({ type: 'outils', fi, x: cx, y: yy, w: m.colonne, h: hOutils, taille: m.t(10) });
      yy += hOutils + esp;
      texte({ fi, x: bx, y: yy, w: m.barre, h: lh(11), taille: m.t(11), gras: true, couleur: ENCRE,
        valeur: f.nom, invite: 'Fosse', champ: { cible: 'fosse', fi, clef: 'nom' } });
      yy += lh(11) + esp;
      texte({ fi, x: bx, y: yy, w: m.barre, h: lh(8), taille: m.t(8), couleur: ENCRE_DOUCE,
        valeur: f.sousTitre, invite: 'sous-titre', champ: { cible: 'fosse', fi, clef: 'sousTitre' } });
      yy += lh(8) + m.p(6) + esp + hSurface;
      const by = yy;

      // Règle des profondeurs, et la profondeur d'apparition de la nappe en bleu.
      el.push({ type: 'rect', fi, x: gauche + m.axe - m.p(4), y: by, w: m.p(0.8), h: m.hauteurBarre, fill: REGLE });
      const reperes = [...new Set(M.limites(f))].sort((a, b) => a - b);
      const th = lh(7.5);
      for (const p of reperes) {
        const ty = by + p * echelle - m.p(5);
        el.push({ type: 'rect', fi, x: gauche + m.axe - m.p(4), y: ty + th / 2 - m.p(0.4), w: m.p(4), h: m.p(0.8), fill: REGLE });
        texte({ fi, x: gauche, y: ty, w: m.axe - m.p(6), h: th, taille: m.t(7.5), couleur: '#999999', valeur: String(p), align: 'right' });
      }
      if (Number.isFinite(f.nappe) && f.nappe <= M.epaisseurTotale(f)) {
        const yn = by + f.nappe * echelle;
        // Un repère déjà écrit trop près : le chiffre de la nappe se décale d'une ligne.
        const pris = (y) => reperes.some((p) => Math.abs(by + p * echelle - y) < th * 0.95);
        let ty = yn;
        if (pris(ty)) ty = pris(yn + th) || yn + th > by + m.hauteurBarre + th / 2 ? yn - th : yn + th;
        el.push({ type: 'rect', fi, x: gauche + m.axe - m.p(4), y: yn - m.p(0.5), w: m.p(4), h: m.p(1), fill: BLEU });
        texte({ fi, x: gauche, y: ty - m.p(5), w: m.axe - m.p(6), h: th, taille: m.t(7.5), gras: true, couleur: BLEU, valeur: String(f.nappe), align: 'right' });
      }

      // La barre d'horizons, et ce qu'on y dessine : taches, eau, éléments grossiers, nappe.
      const formes = formesFosse(f, { x: bx, y: by, w: m.barre, echelle, z });
      const lim = M.limites(f);
      let hy = by;
      f.horizons.forEach((h, hi) => {
        const hh = h.epaisseur * echelle;
        const teinte = h.nonObserve ? NON_OBSERVE : h.couleur;
        const fond = h.nonObserve ? NON_OBSERVE : fondSous(f, (lim[hi] + lim[hi + 1]) / 2) ?? h.couleur;
        const choisi = !exp && options.horizonChoisi === h.id;
        const place = m.lignesTenant(hh);
        const visibles = lignesVisibles(h, place, { export: exp, choisi });
        const total = visibles.reduce((t, l) => t + lh(l.taille), 0);
        // Une forme qui a sa plage (taches) ne passe pas dans l'horizon voisin ; les cailloux, eux, peuvent déborder.
        const motifs = formes.filter((o) => o.y1 > hy && o.y0 < hy + hh && (o.p0 == null || (o.p1 > hy + 0.5 && o.p0 < hy + hh - 0.5)));
        let ly = hy + (hh - total) / 2;
        const lignes = visibles.map((l) => {
          const o = { clef: l.clef, x: bx + m.p(5), y: ly, w: m.barre - m.p(10), h: lh(l.taille), taille: m.t(l.taille),
            gras: l.gras, couleur: l.douce ? M.encreDouce(fond) : M.encre(fond), valeur: h[l.clef], invite: l.invite,
            champ: { cible: 'horizon', fi, hi, clef: l.clef }, halo: motifs.length ? fond : null };
          ly += o.h;
          return o;
        });
        el.push({ type: 'horizon', fi, hi, id: h.id, x: bx, y: hy, w: m.barre, h: hh, couleur: teinte, contour: M.contour(teinte),
          trait: m.p(1), choisi, lignes, plus: !exp && hh >= m.p(13), encre: M.encre(fond), p: m.p(1), motifs });
        hy += hh;
      });
      // Cailloux de surface, à demi enterrés, avec leur taille et leur abondance au-dessus.
      if (f.surface?.abondance > 0) {
        const t = M.tailleEG(f.surface.taille);
        texte({ fi, x: bx, y: by - hSurface, w: m.barre, h: lh(7), taille: m.t(7), couleur: ENCRE_DOUCE,
          valeur: `${t.nom}${f.surface.calcaire ? ' calcaires' : ''} ${f.surface.abondance} %` });
        const haut = by - hSurface + lh(7);
        el.push({ type: 'motif', fi, x: bx - m.p(1), y: haut, w: m.barre + m.p(2), h: by - haut + m.p(rSurface * 1.2),
          formes: formesSurface(f, { x: bx, y: by, w: m.barre }, z) });
      }
      if (!exp) {
        const lim = M.limites(f);
        for (let i = 0; i < f.horizons.length - 1; i++) {
          // Elle s'arrête avant le bord droit : le petit « + » de l'horizon niche là.
          el.push({ type: 'poignee', fi, index: i, x: bx, y: by + lim[i + 1] * echelle - m.p(4.5), w: m.barre - m.placeDuPlus, h: m.p(9) });
        }
      }
      yy = by + m.hauteurBarre + esp + m.p(6);
      texte({ fi, x: bx, y: yy, w: m.barre, h: lh(8), taille: m.t(8), gras: true, couleur: f.note ? ALERTE : ENCRE_DOUCE,
        valeur: f.note, invite: 'note', champ: { cible: 'fosse', fi, clef: 'note' } });
    }
    y += hColonne + m.p(18);
  }

  // La légende : déduite des teintes employées, chaque libellé se réécrit sur la figure.
  // Un flux qui revient à la ligne tout seul, et centre chaque ligne.
  if (s.legende) {
    y += m.p(4);
    const items = [...M.legende(s), ...M.symboles(s).map((t) => ({ ...t, symbole: true }))].map((t) => {
      const valeur = M.libelleLegende(s, t);
      const w = Math.ceil(mes(valeur || (exp ? '' : 'libellé'), m.t(9.5), false)) + (exp ? 0 : m.p(6));
      return { t, valeur, w: m.p(13) + m.p(6) + w, wt: w };
    });
    const hItem = Math.max(m.p(13), lh(9.5));
    const rangees = [];
    let r = null;
    for (const it of items) {
      if (r && r.w + m.p(18) + it.w <= W) { r.items.push(it); r.w += m.p(18) + it.w; }
      else { r = { items: [it], w: it.w }; rangees.push(r); }
    }
    rangees.forEach((rg, k) => {
      let x = m.marge + (W - rg.w) / 2;
      for (const it of rg.items) {
        const yc = y + (hItem - m.p(13)) / 2;
        if (it.t.symbole) el.push({ type: 'motif', x, y: yc, w: m.p(13), h: m.p(13), formes: formesSymbole(it.t, { x, y: yc, w: m.p(13), h: m.p(13) }, z) });
        else el.push({ type: 'rect', x, y: yc, w: m.p(13), h: m.p(13), fill: it.t.hex, stroke: M.contour(it.t.hex), sw: m.p(0.8), rx: m.p(2) });
        texte({ x: x + m.p(19), y: y + (hItem - lh(9.5)) / 2, w: it.wt, h: lh(9.5), taille: m.t(9.5), couleur: '#333333',
          valeur: it.valeur, invite: 'libellé', align: 'left', champ: { cible: 'legende', hex: it.t.hex, suggere: it.t.nom } });
        x += it.w + m.p(18);
      }
      y += hItem + (k < rangees.length - 1 ? m.p(8) : 0);
    });
    y += m.p(18);
  }

  const largeurBas = Math.min(m.p(640), W);
  texte({ x: m.marge + (W - largeurBas) / 2, y, w: largeurBas, h: lh(8), taille: m.t(8), couleur: '#AAAAAA',
    valeur: s.basDePage, invite: 'note de bas de page', champ: { cible: 'schema', clef: 'basDePage' } });
  y += lh(8) + m.marge;

  return { largeur: L, hauteur: Math.ceil(y), echelle, z, elements: el };
}

// MARK: - Texte qui ne tient pas : coupé net avec des points de suspension, comme SwiftUI

export function tronquer(texte, largeurMax, taille, gras, mes = mesurer) {
  if (!texte || mes(texte, taille, gras) <= largeurMax) return texte;
  let a = 0, b = texte.length;
  while (a < b) {
    const k = Math.ceil((a + b) / 2);
    if (mes(texte.slice(0, k) + '…', taille, gras) <= largeurMax) a = k; else b = k - 1;
  }
  return a ? texte.slice(0, a) + '…' : '';
}

// MARK: - Canvas (PNG, mesures)

export function dessinerCanvas(ctx, fig) {
  ctx.save();
  ctx.fillStyle = PAPIER;
  ctx.fillRect(0, 0, fig.largeur, fig.hauteur);
  const ecrire = (t) => {
    if (!t.valeur) return;
    ctx.font = police(t.taille, t.gras);
    ctx.fillStyle = t.couleur;
    ctx.textBaseline = 'middle';
    const v = tronquer(t.valeur, t.w + 0.5, t.taille, t.gras);
    const cy = t.y + t.h / 2;
    const [x, a] = t.align === 'left' ? [t.x, 'left'] : t.align === 'right' ? [t.x + t.w, 'right'] : [t.x + t.w / 2, 'center'];
    ctx.textAlign = a;
    if (t.halo) {
      // Sur des cailloux ou des taches, un liseré de la teinte de l'horizon garde le texte lisible.
      ctx.strokeStyle = t.halo; ctx.lineWidth = t.taille * 0.3; ctx.lineJoin = 'round';
      ctx.strokeText(v, x, cy);
    }
    ctx.fillText(v, x, cy);
  };
  for (const e of fig.elements) {
    if (e.type === 'rect') {
      ctx.fillStyle = e.fill;
      chemin(ctx, e.x, e.y, e.w, e.h, e.rx || 0);
      ctx.fill();
      if (e.stroke) {
        ctx.strokeStyle = e.stroke; ctx.lineWidth = e.sw;
        chemin(ctx, e.x + e.sw / 2, e.y + e.sw / 2, e.w - e.sw, e.h - e.sw, Math.max(0, (e.rx || 0) - e.sw / 2));
        ctx.stroke();
      }
    } else if (e.type === 'texte') {
      ecrire(e);
    } else if (e.type === 'horizon') {
      ctx.save();
      ctx.beginPath(); ctx.rect(e.x, e.y, e.w, e.h); ctx.clip();
      ctx.fillStyle = e.couleur; ctx.fillRect(e.x, e.y, e.w, e.h);
      dessinerFormes(ctx, e.motifs);
      ctx.strokeStyle = e.contour; ctx.lineWidth = e.trait;
      ctx.strokeRect(e.x + e.trait / 2, e.y + e.trait / 2, e.w - e.trait, e.h - e.trait);
      for (const l of e.lignes) ecrire(l);
      ctx.restore();
    } else if (e.type === 'motif') {
      ctx.save();
      ctx.beginPath(); ctx.rect(e.x, e.y, e.w, e.h); ctx.clip();
      dessinerFormes(ctx, e.formes);
      ctx.restore();
    }
  }
  ctx.restore();
}

function dessinerFormes(ctx, formes) {
  for (const f of formes ?? []) {
    const p = new Path2D(f.d);
    ctx.globalAlpha = f.op ?? 1;
    if (f.fill) { ctx.fillStyle = f.fill; ctx.fill(p); }
    if (f.stroke) {
      ctx.strokeStyle = f.stroke; ctx.lineWidth = f.sw ?? 1; ctx.lineJoin = 'round'; ctx.lineCap = f.cap ?? 'butt';
      ctx.stroke(p);
    }
    ctx.globalAlpha = 1;
  }
}

function chemin(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (!r) { ctx.rect(x, y, w, h); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/// La figure en PNG, à `facteur` fois la définition (2 : comme l'app Mac).
export function versCanvas(fig, facteur = 2) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(fig.largeur * facteur);
  c.height = Math.ceil(fig.hauteur * facteur);
  const ctx = c.getContext('2d');
  ctx.scale(facteur, facteur);
  dessinerCanvas(ctx, fig);
  return c;
}

// MARK: - SVG (PDF vectoriel par l'impression)

/// Une forme (chemin SVG, remplissage, trait) : la même chaîne sert au SVG, au canvas (Path2D) et à la page.
export function formeSVG(f) {
  const trait = f.stroke ? ` stroke="${f.stroke}" stroke-width="${r2(f.sw ?? 1)}" stroke-linejoin="round"${f.cap ? ` stroke-linecap="${f.cap}"` : ''}` : '';
  return `<path d="${f.d}" fill="${f.fill ?? 'none'}"${trait}${f.op != null && f.op !== 1 ? ` opacity="${f.op}"` : ''}/>`;
}

const echapper = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (v) => Math.round(v * 100) / 100;

export function versSVG(fig) {
  const out = [];
  let clip = 0;
  const ecrire = (t) => {
    if (!t.valeur) return;
    const v = tronquer(t.valeur, t.w + 0.5, t.taille, t.gras);
    const [x, anchor] = t.align === 'left' ? [t.x, 'start'] : t.align === 'right' ? [t.x + t.w, 'end'] : [t.x + t.w / 2, 'middle'];
    const halo = t.halo ? ` stroke="${t.halo}" stroke-width="${r2(t.taille * 0.3)}" stroke-linejoin="round" paint-order="stroke"` : '';
    out.push(`<text x="${r2(x)}" y="${r2(t.y + t.h / 2)}" text-anchor="${anchor}" dominant-baseline="central" font-size="${r2(t.taille)}"${t.gras ? ' font-weight="bold"' : ''} fill="${t.couleur}"${halo}>${echapper(v)}</text>`);
  };
  out.push(`<rect width="${r2(fig.largeur)}" height="${fig.hauteur}" fill="${PAPIER}"/>`);
  for (const e of fig.elements) {
    if (e.type === 'rect') {
      out.push(`<rect x="${r2(e.x)}" y="${r2(e.y)}" width="${r2(e.w)}" height="${r2(e.h)}"${e.rx ? ` rx="${r2(e.rx)}"` : ''} fill="${e.fill}"/>`);
      if (e.stroke) out.push(`<rect x="${r2(e.x + e.sw / 2)}" y="${r2(e.y + e.sw / 2)}" width="${r2(e.w - e.sw)}" height="${r2(e.h - e.sw)}"${e.rx ? ` rx="${r2(Math.max(0, e.rx - e.sw / 2))}"` : ''} fill="none" stroke="${e.stroke}" stroke-width="${r2(e.sw)}"/>`);
    } else if (e.type === 'texte') {
      ecrire(e);
    } else if (e.type === 'horizon') {
      const id = `c${clip++}`;
      out.push(`<clipPath id="${id}"><rect x="${r2(e.x)}" y="${r2(e.y)}" width="${r2(e.w)}" height="${r2(e.h)}"/></clipPath><g clip-path="url(#${id})">`);
      out.push(`<rect x="${r2(e.x)}" y="${r2(e.y)}" width="${r2(e.w)}" height="${r2(e.h)}" fill="${e.couleur}"/>`);
      out.push(...(e.motifs ?? []).map(formeSVG));
      out.push(`<rect x="${r2(e.x + e.trait / 2)}" y="${r2(e.y + e.trait / 2)}" width="${r2(e.w - e.trait)}" height="${r2(Math.max(0, e.h - e.trait))}" fill="none" stroke="${e.contour}" stroke-width="${r2(e.trait)}"/>`);
      for (const l of e.lignes) ecrire(l);
      out.push('</g>');
    } else if (e.type === 'motif') {
      const id = `c${clip++}`;
      out.push(`<clipPath id="${id}"><rect x="${r2(e.x)}" y="${r2(e.y)}" width="${r2(e.w)}" height="${r2(e.h)}"/></clipPath><g clip-path="url(#${id})">`);
      out.push(...e.formes.map(formeSVG), '</g>');
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(fig.largeur)}" height="${fig.hauteur}" viewBox="0 0 ${r2(fig.largeur)} ${fig.hauteur}" font-family="${echapper(FONTE)}">${out.join('')}</svg>`;
}

// MARK: - Motifs : cailloux, taches, eau
// Tirés au hasard, mais toujours du même hasard pour un même élément (graine = son identifiant) :
// la figure, redessinée à chaque frappe, ne bouge pas.

export function hasard(texte) {
  let a = 2166136261;
  for (let i = 0; i < texte.length; i++) { a ^= texte.charCodeAt(i); a = Math.imul(a, 16777619); }
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f2 = (v) => Math.round(v * 100) / 100;
const rectD = (R) => `M${f2(R.x)} ${f2(R.y)}H${f2(R.x + R.w)}V${f2(R.y + R.h)}H${f2(R.x)}Z`;

/// Un semis régulier sans l'être : une graine par cellule d'une grille à peu près carrée, décalée au hasard.
function semis(R, n, rnd) {
  if (n <= 0 || R.w <= 0 || R.h <= 0) return [];
  const cote = Math.sqrt((R.w * R.h) / n);
  const nx = Math.max(1, Math.round(R.w / cote)), ny = Math.max(1, Math.ceil(n / nx));
  const cw = R.w / nx, ch = R.h / ny;
  const cellules = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) cellules.push([i, j]);
  for (let i = cellules.length - 1; i > 0; i--) { const k = Math.floor(rnd() * (i + 1)); [cellules[i], cellules[k]] = [cellules[k], cellules[i]]; }
  return cellules.slice(0, n).map(([i, j]) => [R.x + (i + rnd()) * cw, R.y + (j + rnd()) * ch]);
}

/// Contour fermé lissé : la courbe passe par les milieux des côtés, les sommets la tirent.
function courbeFermee(pts) {
  const k = pts.length;
  const mil = (p, q) => `${f2((p[0] + q[0]) / 2)} ${f2((p[1] + q[1]) / 2)}`;
  let d = `M${mil(pts[k - 1], pts[0])}`;
  for (let i = 0; i < k; i++) d += `Q${f2(pts[i][0])} ${f2(pts[i][1])} ${mil(pts[i], pts[(i + 1) % k])}`;
  return d + 'Z';
}
const polygone = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f2(x)} ${f2(y)}`).join('') + 'Z';
const aireDe = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;

/// Plus un élément grossier est gros, plus sa forme s'écarte du rond : plus de faces, inégales, plus allongé,
/// plus cabossé (creux compris). Les graviers restent des grains émoussés ; dès les cailloux, les faces sont droites.
const FORMES_EG = [
  { sommets: [7, 9], allonge: [0.7, 1], bosses: 0.06, aleas: 0.1, lisse: true, tourne: Math.PI },
  { sommets: [5, 9], allonge: [0.55, 0.95], bosses: 0.14, aleas: 0.17, lisse: false, tourne: 1.2 },
  { sommets: [6, 11], allonge: [0.5, 0.92], bosses: 0.18, aleas: 0.2, lisse: false, tourne: 1.8 },
  { sommets: [8, 13], allonge: [0.5, 0.9], bosses: 0.2, aleas: 0.22, lisse: false, tourne: 2.4 },
];

/// Un élément grossier (`niveau` : 0 graviers, 1 cailloux, 2 pierres, 3 blocs) → ses sommets et son contour.
export function caillou(cx, cy, r, rnd, niveau = 1) {
  const F = FORMES_EG[niveau] ?? FORMES_EG[1];
  const n = F.sommets[0] + Math.floor(rnd() * (F.sommets[1] - F.sommets[0] + 1));
  const allonge = F.allonge[0] + rnd() * (F.allonge[1] - F.allonge[0]);
  const rot = (rnd() - 0.5) * F.tourne, cr = Math.cos(rot), sr = Math.sin(rot);
  // Écarts d'angle inégaux : des faces longues et des faces courtes, jamais un polygone régulier.
  const ecarts = Array.from({ length: n }, () => 0.35 + rnd() * 1.3);
  const somme = ecarts.reduce((u, v) => u + v, 0);
  const ph1 = rnd() * 6.3, ph2 = rnd() * 6.3;
  const pts = [];
  let a = rnd() * 6.3;
  for (let i = 0; i < n; i++) {
    // Jamais moins de 0,6 r : des creux et des bosses, pas des éclats en aiguille.
    const f = 0.9 * Math.max(0.66, 1 + F.bosses * Math.sin(2 * a + ph1) + F.bosses * 0.7 * Math.sin(3 * a + ph2) + (rnd() - 0.5) * 2 * F.aleas);
    const x = Math.cos(a) * r * f, y = Math.sin(a) * r * f * allonge;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    a += (ecarts[i] / somme) * Math.PI * 2;
  }
  return { pts, d: F.lisse ? courbeFermee(pts) : polygone(pts) };
}

/// Une tache aux bords adoucis, tirée autour d'une ellipse.
function tacheForme(cx, cy, rx, ry, angle, irregulier, rnd, k = 8) {
  const c = Math.cos(angle), s = Math.sin(angle), pts = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2 + (rnd() - 0.5) * (Math.PI / k), f = 1 - irregulier / 2 + rnd() * irregulier;
    const x = Math.cos(a) * rx * f, y = Math.sin(a) * ry * f;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return courbeFermee(pts);
}

/// Une teinte un peu plus claire (d > 0) ou plus sombre (d < 0), pour que les cailloux ne soient pas tous pareils.
function nuancer(hex, d) {
  return M.versHex(M.composantes(hex).map((x) => (d > 0 ? x + (1 - x) * d : x * (1 + d))));
}

function formesEG(e, R, z, rnd) {
  const niveau = Math.max(0, M.taillesEG.findIndex((t) => t.cle === e.taille));
  const r = M.tailleEG(e.taille).rayon * z;
  // Abondance = part de la surface couverte : on pose des cailloux (aux places d'un semis) jusqu'à l'atteindre.
  const cible = (e.abondance / 100) * R.w * R.h;
  const fond = e.calcaire ? M.teintesEG.calcaire : M.teintesEG.autre;
  // Les centres restent dans la plage : un caillou peut en déborder un peu, comme dans le sol.
  const marge = Math.min(r * 0.6, R.h / 2);
  const places = semis({ x: R.x, y: R.y + marge, w: R.w, h: R.h - 2 * marge }, Math.min(4000, Math.ceil(1.6 * cible / (Math.PI * r * r * 0.5))), rnd);
  const out = [];
  let aire = 0;
  for (const [x, y] of places) {
    if (aire >= cible) break;
    const rr = r * (0.75 + rnd() * 0.5), teinte = nuancer(fond, (rnd() - 0.5) * 0.14);
    const { pts, d } = caillou(x, y, rr, rnd, niveau);
    aire += aireDe(pts);
    out.push({ d, fill: teinte, stroke: M.contour(teinte), sw: (niveau >= 2 ? 0.7 : 0.6) * z, y0: y - rr, y1: y + rr });
    if (niveau >= 2) out.push(...reliefCaillou(pts, teinte, z, rnd, y - rr, y + rr));
  }
  return out;
}

/// Pierres et blocs : une face plus claire et une arête, pour qu'on les lise comme des volumes et non comme des pastilles.
function reliefCaillou(pts, teinte, z, rnd, y0, y1) {
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p[0], 0) / n, cy = pts.reduce((s, p) => s + p[1], 0) / n;
  const face = pts.map(([x, y]) => [cx + (x - cx) * 0.55 - (y1 - y0) * 0.06, cy + (y - cy) * 0.5 - (y1 - y0) * 0.08]);
  const i = Math.floor(rnd() * n), j = (i + Math.floor(n / 2) + (rnd() < 0.5 ? 0 : 1)) % n;
  const t = 0.45 + rnd() * 0.25;
  const arete = `M${f2(pts[i][0])} ${f2(pts[i][1])}L${f2(pts[i][0] + (pts[j][0] - pts[i][0]) * t + (rnd() - 0.5) * 2 * z)} ${f2(pts[i][1] + (pts[j][1] - pts[i][1]) * t)}`;
  return [
    { d: polygone(face), fill: nuancer(teinte, 0.16), op: 0.55, y0, y1 },
    { d: arete, stroke: M.contour(teinte), sw: 0.5 * z, op: 0.6, cap: 'round', y0, y1 },
  ];
}

// MARK: - Taches d'hydromorphie
// D'après le Référentiel pédologique 2008 (annexe 2, p. 359), Baize et Ducommun (2014, figure 4) et
// Vepraskas (NC State, TB-301, figures 1, 4, 5, 6B, 9) — voir references/taches-hydromorphie.md :
// • horizon rédoxique : le gris (fer parti) suit les fissures, les faces des agrégats et les anciennes racines ;
//   le fer se reprécipite juste à côté, dans les agrégats : le gris est donc toujours bordé d'orange, qui
//   s'estompe vers la matrice (motif concentrique) ;
// • horizon presque tout gris (réductique Go) : la rouille ne reste qu'en liserés autour des pores et des racines ;
// • horizon presque tout orange : des traînées grises le traversent, bordées d'un orange plus soutenu.

/// Un ruban le long d'une ligne, de demi-largeur variable, bouts arrondis : une fissure, une racine morte.
function ruban(pts, demi) {
  const n = pts.length;
  if (n < 2) return '';
  const tangente = (i) => {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)];
    const l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [(q[0] - p[0]) / l, (q[1] - p[1]) / l];
  };
  const gauche = [], droite = [];
  for (let i = 0; i < n; i++) {
    const [tx, ty] = tangente(i), w = demi[i];
    gauche.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
    droite.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const [ax, ay] = tangente(0), [bx, by] = tangente(n - 1);
  const debut = [pts[0][0] - ax * demi[0], pts[0][1] - ay * demi[0]];
  const fin = [pts[n - 1][0] + bx * demi[n - 1], pts[n - 1][1] + by * demi[n - 1]];
  return courbeFermee([debut, ...gauche, fin, ...droite.reverse()]);
}

/// Profil de largeur le long d'une ligne : fin aux bouts, renflé et irrégulier au milieu.
function profil(n, largeur, rnd, bout = 0.35) {
  const ph = rnd() * 6.3, fq = 1.5 + rnd() * 2;
  return Array.from({ length: n }, (_, i) => {
    const u = n > 1 ? i / (n - 1) : 0.5;
    return largeur * (bout + (1 - bout) * Math.pow(Math.sin(Math.PI * u), 0.5)) * (0.82 + 0.3 * Math.sin(fq * Math.PI * u + ph));
  });
}

const longueurDe = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

/// Le réseau des fissures entre agrégats (structure prismatique : cellules plus hautes que larges, en quinconce),
/// sur lequel courent les traînées. On en garde des tronçons, les verticaux de préférence, jusqu'à couvrir
/// `aireCible` (aire des rubans de demi-largeur `largeur`) ; quelques fissures secondaires partent dans les agrégats.
function reseau(R, aireCible, largeur, z, rnd, { verticales = 0.75, cellule = 1 } = {}) {
  const cw = (12 + rnd() * 5) * z * cellule, ch = (24 + rnd() * 10) * z * cellule;
  const nx = Math.ceil(R.w / cw) + 2, ny = Math.ceil(R.h / ch) + 2;
  const x0 = R.x - cw, y0 = R.y - ch;
  const S = [];
  for (let j = 0; j <= ny; j++) {
    S.push([]);
    for (let i = 0; i <= nx; i++) S[j].push([x0 + (i + (j % 2) * 0.5 + (rnd() - 0.5) * 0.7) * cw, y0 + (j + (rnd() - 0.5) * 0.55) * ch]);
  }
  const aretes = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i <= nx; i++) aretes.push({ a: S[j][i], b: S[j + 1][i], poids: 1 });
  for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) aretes.push({ a: S[j][i], b: S[j][i + 1], poids: 1 - verticales });
  // Tirage pondéré sans remise (clé u^(1/poids)) : les fissures verticales passent devant.
  for (const e of aretes) e.cle = e.poids > 0 ? Math.pow(rnd(), 1 / e.poids) : -1;
  aretes.sort((u, v) => v.cle - u.cle);
  const dans = ([x, y]) => y >= R.y && y <= R.y + R.h && x >= R.x - largeur && x <= R.x + R.w + largeur;
  const lignes = [];
  let aire = 0;
  for (const e of aretes) {
    if (aire >= aireCible || e.cle < 0) break;
    const pts = onduler(e.a, e.b, z, rnd).filter(dans);
    if (pts.length < 2 || longueurDe(pts) < 2 * z) continue;
    const w = largeur * (0.75 + rnd() * 0.5);
    lignes.push({ pts, demi: profil(pts.length, w, rnd, 0.8) });
    aire += longueurDe(pts) * 2 * w * 0.95;
    if (rnd() < 0.3) {
      // Fissure secondaire, en biais, qui meurt dans l'agrégat.
      const k = Math.floor(rnd() * pts.length), m = pts[k];
      const ang = Math.atan2(e.b[1] - e.a[1], e.b[0] - e.a[0]) + (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.6);
      const l = (0.25 + rnd() * 0.3) * ch;
      const br = onduler(m, [m[0] + Math.cos(ang) * l, m[1] + Math.sin(ang) * l], z, rnd).filter(dans);
      if (br.length >= 2) { const wb = w * 0.6; lignes.push({ pts: br, demi: profil(br.length, wb, rnd, 0.3) }); aire += longueurDe(br) * 2 * wb * 0.7; }
    }
  }
  return lignes;
}

/// Un tronçon de fissure : la droite de a à b, ondulée (deux ondes au hasard) et un peu bousculée.
function onduler(a, b, z, rnd) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const n = Math.max(3, Math.round(l / (3 * z)));
  const nx = -dy / l, ny = dx / l, amp = l * (0.06 + rnd() * 0.08);
  const p1 = rnd() * 6.3, p2 = rnd() * 6.3;
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n, o = Math.sin(Math.PI * u) * (amp * Math.sin(2 * Math.PI * u + p1) + amp * 0.5 * Math.sin(5 * Math.PI * u + p2)) + (rnd() - 0.5) * 0.8 * z;
    return [a[0] + dx * u + nx * o, a[1] + dy * u + ny * o];
  });
}

const borner = (pts) => { const ys = pts.map((p) => p[1]); return [Math.min(...ys), Math.max(...ys)]; };

/// Taches d'hydromorphie. Abondance = part de la plage occupée par les taches (gris + orange) ; `gris` = part
/// grise des taches. Marbrures : traînées le long des fissures entre agrégats et des racines ; tacheté : taches
/// concentriques. Chaque forme garde sa plage (p0, p1) : elle ne déborde jamais sur l'horizon voisin.
function formesTaches(t, R, z, rnd) {
  const c = Math.min(1, t.abondance / 100), g = t.gris / 100;
  if (c <= 0 || R.h <= 0) return [];
  const orange = M.couleurTache(t, 'orange'), gris = M.couleurTache(t, 'gris');
  const marbrure = t.forme !== 'tachete';
  const A = R.w * R.h;
  const plage = { p0: R.y, p1: R.y + R.h };
  const halo = [], liseres = [], coeurs = [], fond = [];
  const pousser = (liste, pts, d, fill, op) => { const [y0, y1] = borner(pts); liste.push({ d, fill, op, y0: y0 - 3 * z, y1: y1 + 3 * z, ...plage }); };
  // L'orange s'estompe vers la matrice : deux voiles de plus en plus larges et pâles autour du liseré.
  const estomper = (l, w) => {
    pousser(halo, l.pts, ruban(l.pts, l.demi.map((x) => x * w * 2)), orange, 0.16);
    pousser(halo, l.pts, ruban(l.pts, l.demi.map((x) => x * w * 1.45)), orange, 0.34);
  };

  if (c >= 0.999 && g >= 0.5) {
    // Horizon gris (réductique temporairement réoxydé) : la rouille ne reste qu'en liserés autour des
    // racines et des pores, dont on voit le canal plus sombre au milieu.
    fond.push({ d: rectD(R), fill: gris, y0: R.y, y1: R.y + R.h, ...plage });
    const aireOrange = (1 - g) * A, canal = nuancer(gris, -0.3);
    if (marbrure) {
      for (const l of reseau(R, aireOrange / 1.45, 1.4 * z, z, rnd, { verticales: 1, cellule: 0.9 })) {
        estomper(l, 1);
        pousser(liseres, l.pts, ruban(l.pts, l.demi), orange, 0.92);
        pousser(coeurs, l.pts, ruban(l.pts, l.demi.map((w) => w * 0.28)), canal, 0.8);
      }
    } else {
      const rp = 2.2 * z;
      for (const [x, y] of semis(R, Math.max(1, Math.round(aireOrange / (Math.PI * rp * rp * 0.75 * 1.9))), rnd)) {
        const r = rp * (0.6 + rnd() * 0.8), a = rnd() * 3, pts = [[x - r, y - r], [x + r, y + r]];
        pousser(halo, pts, tacheForme(x, y, r * 1.9, r * 1.7, a, 0.4, rnd, 8), orange, 0.16);
        pousser(halo, pts, tacheForme(x, y, r * 1.4, r * 1.25, a, 0.4, rnd, 8), orange, 0.34);
        pousser(liseres, pts, tacheForme(x, y, r, r * 0.9, a, 0.35, rnd, 8), orange, 0.92);
        pousser(coeurs, pts, tacheForme(x, y, r * 0.42, r * 0.38, a, 0.3, rnd, 6), canal, 0.8);
      }
    }
    return [...fond, ...halo, ...liseres, ...coeurs];
  }

  if (c >= 0.999) {
    // Horizon presque tout orange : des traînées grises le traversent, bordées d'une rouille plus soutenue.
    fond.push({ d: rectD(R), fill: orange, y0: R.y, y1: R.y + R.h, ...plage });
    const rouille = nuancer(orange, -0.2), aireGris = g * A;
    if (marbrure) {
      for (const l of reseau(R, aireGris, 2.6 * z, z, rnd, { verticales: 0.85 })) {
        pousser(halo, l.pts, ruban(l.pts, l.demi.map((w) => w + 2.4 * z)), rouille, 0.25);
        pousser(liseres, l.pts, ruban(l.pts, l.demi.map((w) => w + 1.1 * z)), rouille, 0.75);
        pousser(coeurs, l.pts, ruban(l.pts, l.demi), gris, 0.96);
      }
    } else {
      const rp = 2.6 * z;
      for (const [x, y] of semis(R, Math.max(1, Math.round(aireGris / (Math.PI * rp * rp * 0.8))), rnd)) {
        const r = rp * (0.55 + rnd() * 0.9), a = rnd() * 3, pts = [[x - r, y - r], [x + r, y + r]];
        pousser(halo, pts, tacheForme(x, y, r + 2.4 * z, (r + 2.4 * z) * 0.9, a, 0.35, rnd, 8), rouille, 0.25);
        pousser(liseres, pts, tacheForme(x, y, r + 1.1 * z, (r + 1.1 * z) * 0.9, a, 0.35, rnd, 8), rouille, 0.75);
        pousser(coeurs, pts, tacheForme(x, y, r, r * 0.9, a, 0.4, rnd, 8), gris, 0.96);
      }
    }
    return [...fond, ...halo, ...liseres, ...coeurs];
  }

  // Horizon rédoxique (moins de 100 %) : chaque plage grise est bordée d'orange, qui s'estompe vers la matrice.
  // Demi-largeurs : cœur gris h, liseré orange l ; h / (h + l) = part grise (même rapport en surface).
  // Liseré d'au moins lMin : quand le gris domine, les traînées s'élargissent (langues grises) plutôt que de
  // perdre leur bordure.
  const T0 = (marbrure ? 3.4 : 3.2) * z, lMin = 1.1 * z, hMin = 0.6 * z;
  const T = g >= 1 || g <= 0 ? T0 : Math.min(14 * z, Math.max(T0, lMin / (1 - g), hMin / g));
  const aireTaches = c * A;
  if (marbrure) {
    for (const l of reseau(R, aireTaches / 1.12, T, z, rnd)) {
      if (g < 1) {
        estomper(l, 1);
        pousser(liseres, l.pts, ruban(l.pts, l.demi), orange, 0.92);
      }
      if (g > 0) pousser(coeurs, l.pts, ruban(l.pts, l.demi.map((w) => w * g)), gris, 0.96);
    }
  } else {
    // Tacheté : taches concentriques (cœur gris, couronne orange estompée), et quelques points rouille tout près.
    // Couronne d'au moins lMin : plus le gris domine, plus les taches sont larges (dans la limite de 8 pt).
    const rp = g > 0 && g < 1 ? Math.min(8 * z, Math.max(T0, lMin / (1 - Math.sqrt(g)))) : T0;
    const unite = Math.PI * rp * rp * 0.8 * 1.8;
    const zone = { x: R.x, y: R.y + Math.min(rp, R.h / 2), w: R.w, h: Math.max(0, R.h - 2 * Math.min(rp, R.h / 2)) };
    for (const [x, y] of semis(zone, Math.max(1, Math.round(aireTaches / unite)), rnd)) {
      const r = rp * (0.55 + rnd() * 0.9), a = rnd() * 3, e = 0.65 + rnd() * 0.4, pts = [[x - r, y - r], [x + r, y + r]];
      if (g < 1) {
        pousser(halo, pts, tacheForme(x, y, r * 1.8, r * 1.8 * e, a, 0.45, rnd, 8), orange, 0.16);
        pousser(halo, pts, tacheForme(x, y, r * 1.35, r * 1.35 * e, a, 0.4, rnd, 8), orange, 0.34);
        pousser(liseres, pts, tacheForme(x, y, r, r * e, a, 0.4, rnd, 8), orange, 0.92);
        if (rnd() < 0.3) {
          const b = rnd() * 6.3, dd = r * (1.7 + rnd() * 0.6), rs = r * (0.2 + rnd() * 0.15);
          pousser(liseres, pts, tacheForme(x + Math.cos(b) * dd, y + Math.sin(b) * dd, rs, rs, 0, 0.4, rnd, 6), orange, 0.88);
        }
      }
      if (g > 0) {
        const rg = g >= 1 ? r : Math.max(hMin, Math.min(r * Math.sqrt(g), r - lMin)), dx = (rnd() - 0.5) * (r - rg) * 0.6, dy = (rnd() - 0.5) * (r - rg) * 0.6;
        pousser(coeurs, pts, tacheForme(x + dx, y + dy, rg, rg * e, a, 0.4, rnd, 7), gris, 0.96);
      }
    }
  }
  return [...halo, ...liseres, ...coeurs];
}

/// Horizon quasi noyé : petits traits d'eau verticaux, en quinconce.
function formesNoye(R, z, rnd) {
  const pasX = 6 * z, pasY = 11 * z, long = 6.5 * z;
  let d = '';
  for (let j = 0, y = R.y + 2.5 * z; y < R.y + R.h; j++, y += pasY) {
    for (let x = R.x + 3 * z + (j % 2) * pasX / 2; x < R.x + R.w - z; x += pasX) {
      const yy = y + (rnd() - 0.5) * 3 * z;
      d += `M${f2(x)} ${f2(yy)}V${f2(yy + long * (0.7 + rnd() * 0.5))}`;
    }
  }
  return d ? [{ d, stroke: BLEU, sw: 0.9 * z, op: 0.75, cap: 'round', y0: R.y, y1: R.y + R.h }] : [];
}

/// La nappe : son niveau (trait et triangle ▽, le repère des hydrogéologues), puis des bulles irrégulières dessous.
function formesNappe(R, z, rnd, haut) {
  const out = [];
  const n = Math.round(R.w * R.h / (150 * z * z));
  for (const [x, y] of semis({ x: R.x, y: R.y + 4 * z, w: R.w, h: R.h - 4 * z }, n, rnd)) {
    const r = (1.2 + rnd() * 2.2) * z;
    out.push({ d: tacheForme(x, y, r, r * (0.75 + rnd() * 0.45), rnd() * Math.PI, 0.55, rnd, 6), fill: 'rgba(90, 160, 230, 0.30)',
      stroke: BLEU, sw: 0.7 * z, op: 0.9, y0: y - r, y1: y + r });
  }
  const y = R.y, x = R.x + R.w - 10 * z;
  // Le triangle se pose sur le trait, au-dessus ; s'il n'y a pas la place (nappe en surface), dessous.
  const dessus = y - 7 * z >= haut;
  const ty = dessus ? y - 6.5 * z : y + 1.2 * z;
  out.push({ d: `M${f2(R.x)} ${f2(y)}H${f2(R.x + R.w)}`, stroke: BLEU, sw: 1.1 * z, y0: y - z, y1: y + z });
  out.push({ d: `M${f2(x - 3.5 * z)} ${f2(ty)}H${f2(x + 3.5 * z)}L${f2(x)} ${f2(ty + 5.5 * z)}Z`, fill: BLEU, y0: ty, y1: ty + 5.5 * z });
  if (dessus) out.push({ d: `M${f2(x - 3 * z)} ${f2(y + 2.2 * z)}H${f2(x + 3 * z)}M${f2(x - 1.6 * z)} ${f2(y + 4.2 * z)}H${f2(x + 1.6 * z)}`,
    stroke: BLEU, sw: 0.9 * z, y0: y, y1: y + 5 * z });
  return out;
}

/// Non observé : hachures obliques.
function formesHachures(R, z) {
  let d = '';
  for (let k = -R.h; k < R.w; k += 5 * z) d += `M${f2(R.x + k)} ${f2(R.y + R.h)}L${f2(R.x + k + R.h)} ${f2(R.y)}`;
  return [{ d, stroke: '#B5AFA2', sw: 0.6 * z, y0: R.y, y1: R.y + R.h }];
}

/// Tout ce qui se dessine sur la barre d'une fosse, en coordonnées de la figure. Chaque forme garde son
/// étendue verticale (y0, y1) : chaque horizon reprend celles qui le touchent et les découpe à ses bords.
export function formesFosse(f, B) {
  const { z } = B;
  const out = [];
  const l = M.limites(f);
  const bande = (de, a) => ({ x: B.x, y: B.y + de * B.echelle, w: B.w, h: (a - de) * B.echelle });
  f.horizons.forEach((h, i) => { if (h.nonObserve) out.push(...formesHachures(bande(l[i], l[i + 1]), z)); });
  for (const t of f.taches ?? []) {
    const [de, a] = M.plage(f, t);
    if (a > de && t.abondance > 0) out.push(...formesTaches(t, bande(de, a), z, hasard(t.id)));
  }
  f.horizons.forEach((h, i) => { if (h.noye) out.push(...formesNoye(bande(l[i], l[i + 1]), z, hasard(`${h.id}:eau`))); });
  for (const e of f.elementsGrossiers ?? []) {
    const [de, a] = M.plage(f, e);
    if (a > de && e.abondance > 0) out.push(...formesEG(e, bande(de, a), z, hasard(e.id)));
  }
  const total = M.epaisseurTotale(f);
  if (Number.isFinite(f.nappe) && f.nappe < total) out.push(...formesNappe(bande(f.nappe, total), z, hasard(`${f.id}:nappe`), B.y));
  return out;
}

/// Cailloux de surface : posés sur la ligne du sol, enfoncés un peu plus qu'à moitié.
export function formesSurface(f, B, z) {
  const e = f.surface;
  const r = M.tailleEG(e.taille).rayon * z;
  const niveau = Math.max(0, M.taillesEG.findIndex((x) => x.cle === e.taille));
  const rnd = hasard(`${f.id}:surface`);
  // Abondance = part de la longueur de sol couverte.
  const n = Math.max(1, Math.round((e.abondance / 100) * B.w / (1.7 * r)));
  const x0 = B.x + Math.min(r, B.w / 2), largeur = Math.max(0, B.w - 2 * Math.min(r, B.w / 2)), pas = largeur / n;
  const fond = e.calcaire ? M.teintesEG.calcaire : M.teintesEG.autre;
  const out = [];
  for (let i = 0; i < n; i++) {
    const rr = r * (0.8 + rnd() * 0.35), cx = x0 + (i + 0.5) * pas + (rnd() - 0.5) * pas * 0.5;
    const teinte = nuancer(fond, (rnd() - 0.5) * 0.14);
    const { pts, d } = caillou(cx, B.y + rr * 0.12, rr, rnd, niveau);
    out.push({ d, fill: teinte, stroke: M.contour(teinte), sw: 0.7 * z });
    if (niveau >= 2) out.push(...reliefCaillou(pts, teinte, z, rnd, B.y - rr, B.y + rr));
  }
  return out;
}

/// La pastille d'un symbole dans la légende.
export function formesSymbole(t, R, z) {
  const rnd = hasard(t.hex);
  const cadre = (fond) => ({ d: rectD(R), fill: fond });
  const bord = { d: rectD({ x: R.x + 0.4 * z, y: R.y + 0.4 * z, w: R.w - 0.8 * z, h: R.h - 0.8 * z }), stroke: '#8C8578', sw: 0.8 * z };
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
  if (t.hex === 'EG' || t.hex === 'EG-CALCAIRE') {
    const fond = t.hex === 'EG' ? M.teintesEG.autre : M.teintesEG.calcaire;
    const c = (x, y, r) => { const teinte = nuancer(fond, (rnd() - 0.5) * 0.1); return { d: caillou(R.x + x * z, R.y + y * z, r * z, rnd, 1).d, fill: teinte, stroke: M.contour(teinte), sw: 0.6 * z }; };
    return [cadre('#C9B48F'), c(4, 4, 2.9), c(9.3, 6.2, 3.3), c(4.6, 10, 2.4), c(10.2, 11.2, 1.6), bord];
  }
  if (t.hex === 'TACHES-ORANGE') {
    return [cadre('#B59A74'), { d: tacheForme(cx, cy, 4.2 * z, 5.8 * z, 0.35, 0.5, rnd, 9), fill: t.couleur, op: 0.92 }, bord];
  }
  if (t.hex === 'TACHES-GRISES') {
    // Le gris n'est jamais seul : une couronne orange le borde.
    return [cadre('#B59A74'), { d: tacheForme(cx, cy, 4.6 * z, 6 * z, 0.35, 0.4, rnd, 9), fill: t.orange ?? M.teintesTaches.orange, op: 0.92 },
      { d: tacheForme(cx, cy, 2.7 * z, 4 * z, 0.35, 0.4, rnd, 8), fill: t.couleur, op: 0.96 }, bord];
  }
  if (t.hex === 'NOYE') return [cadre('#D8CDB6'), ...formesNoye({ x: R.x, y: R.y, w: R.w, h: R.h }, z * 0.9, rnd), bord];
  if (t.hex === 'NAPPE') {
    const y = R.y + 6.5 * z, bulle = (x, yb, r) => ({ d: tacheForme(R.x + x * z, yb, r * z, r * 0.85 * z, rnd() * 3, 0.5, rnd, 6),
      fill: 'rgba(90, 160, 230, 0.30)', stroke: BLEU, sw: 0.6 * z });
    return [cadre('#D8CDB6'),
      { d: `M${f2(R.x)} ${f2(y)}H${f2(R.x + R.w)}`, stroke: BLEU, sw: 1 * z },
      { d: `M${f2(cx - 3 * z)} ${f2(y - 5.2 * z)}H${f2(cx + 3 * z)}L${f2(cx)} ${f2(y - 0.6 * z)}Z`, fill: BLEU },
      bulle(3.6, y + 3.4 * z, 1.7), bulle(9.4, y + 4.4 * z, 1.4), bord];
  }
  if (t.hex === 'NON-OBSERVE') return [cadre('#F4F1EA'), ...formesHachures(R, z * 0.8), bord];
  return [cadre(t.couleur ?? '#CCCCCC'), bord];
}

// MARK: - Texte coupé en lignes (fiche légende)

export function couper(texte, largeurMax, taille, gras = false, mes = mesurer) {
  const lignes = [];
  let ligne = '';
  for (const mot of String(texte ?? '').split(/\s+/).filter(Boolean)) {
    const essai = ligne ? `${ligne} ${mot}` : mot;
    if (!ligne || mes(essai, taille, gras) <= largeurMax) ligne = essai;
    else { lignes.push(ligne); ligne = mot; }
  }
  if (ligne) lignes.push(ligne);
  return lignes;
}

// MARK: - La fiche légende (une page à part du schéma)

/// Les désignations employées dans le schéma (le nom de l'horizon, sinon un repère saisi à la main),
/// chacune avec ses teintes et son décodage d'après le Référentiel pédologique 2008.
export function designations(s) {
  const groupes = new Map();
  for (const f of s.fosses) for (const h of f.horizons) {
    if (h.nonObserve) continue;
    const d = String(h.libelle ?? '').trim() || (M.estNomAutomatique(h.nom) ? '' : String(h.nom ?? '').trim());
    if (!d) continue;
    if (!groupes.has(d)) groupes.set(d, { designation: d, couleurs: [] });
    const g = groupes.get(d), hex = String(h.couleur).toUpperCase();
    if (!g.couleurs.includes(hex)) g.couleurs.push(hex);
  }
  return [...groupes.values()].map((g) => ({ ...g, ...R.decoder(g.designation) }));
}

const plageTexte = (de, a) => `de ${de} à ${a} cm`;

/// Ce qui est dessiné dans chaque fosse, en toutes lettres.
export function resumeFosse(f) {
  const out = [];
  if (f.surface?.abondance > 0) {
    const t = M.tailleEG(f.surface.taille);
    out.push(`En surface : ${t.nom.toLowerCase()}${f.surface.calcaire ? ' calcaires' : ''}, ${f.surface.abondance} %.`);
  }
  for (const e of f.elementsGrossiers ?? []) {
    const [de, a] = M.plage(f, e), t = M.tailleEG(e.taille);
    if (a > de && e.abondance > 0) out.push(`Éléments grossiers ${plageTexte(de, a)} : ${t.nom.toLowerCase()}${e.calcaire ? ' calcaires' : ''}, ${e.abondance} %.`);
  }
  for (const t of f.taches ?? []) {
    const [de, a] = M.plage(f, t);
    if (!(a > de && t.abondance > 0)) continue;
    const couleurs = [t.munsellOrange && `orange ${t.munsellOrange}`, t.munsellGris && `gris ${t.munsellGris}`].filter(Boolean).join(', ');
    out.push(`Taches ${plageTexte(de, a)} : ${t.forme === 'tachete' ? 'tacheté' : 'marbrures'}, ${t.abondance} % (gris ${t.gris} / orange ${100 - t.gris})${couleurs ? ` ; ${couleurs}` : ''}.`);
  }
  const noyes = f.horizons.filter((h) => h.noye).map((h) => String(h.libelle || h.nom).trim());
  if (noyes.length) out.push(`${noyes.length > 1 ? 'Horizons quasi noyés' : 'Horizon quasi noyé'} : ${noyes.join(', ')}.`);
  if (Number.isFinite(f.nappe)) out.push(`Nappe apparue à ${f.nappe} cm.`);
  const l = M.limites(f);
  f.horizons.forEach((h, i) => { if (h.nonObserve) out.push(`Non observé ${plageTexte(l[i], l[i + 1])}.`); });
  return out;
}

/// La fiche : même grammaire d'éléments que le schéma (textes, rectangles, motifs), mêmes sorties.
export function composerFiche(s, options = {}) {
  const z = options.z ?? 1;
  const mes = options.mesure ?? mesurer;
  const p = (v) => v * z, lh = (t) => p(t) * INTERLIGNE;
  const L = p(640), marge = p(36), W = L - 2 * marge, retrait = p(30);
  const el = [];
  const ecrire = (o) => el.push({ type: 'texte', align: 'left', ...o });
  let y = marge;
  const paragraphe = (texte, x, largeur, taille, couleur, gras = false) => {
    for (const ligne of couper(texte, largeur, p(taille), gras, mes)) {
      ecrire({ x, y, w: largeur, h: lh(taille), taille: p(taille), gras, couleur, valeur: ligne });
      y += lh(taille);
    }
  };
  const section = (titre) => {
    y += p(6);
    ecrire({ x: marge, y, w: W, h: lh(8.5), taille: p(8.5), gras: true, couleur: '#8A877F', valeur: titre.toUpperCase() });
    y += lh(8.5) + p(3);
    el.push({ type: 'rect', x: marge, y, w: W, h: p(0.7), fill: '#DAD5CA' });
    y += p(10);
  };

  ecrire({ x: marge, y, w: W, h: lh(15), taille: p(15), gras: true, couleur: '#2A3A2A', valeur: 'Légende des horizons', align: 'center' });
  y += lh(15) + p(5);
  ecrire({ x: marge, y, w: W, h: lh(10), taille: p(10), couleur: '#666666', valeur: M.nomAffiche(s), align: 'center' });
  y += lh(10) + p(14);

  const groupes = designations(s);
  section('Horizons du schéma');
  if (!groupes.length) paragraphe('Aucun horizon nommé : écrivez la désignation (Ap, Sci, Btg, Ztc…) dans le nom de l’horizon pour la voir expliquée ici.', marge, W, 9, '#777777');
  for (const g of groupes) {
    g.couleurs.slice(0, 3).forEach((hex, k) => el.push({ type: 'rect', x: marge + k * p(4), y: y + p(1), w: p(14), h: p(14),
      fill: hex, stroke: M.contour(hex), sw: p(0.8), rx: p(2) }));
    ecrire({ x: marge + retrait, y, w: W - retrait, h: lh(12), taille: p(12), gras: true, couleur: ENCRE, valeur: g.designation });
    y += lh(12) + p(3);
    for (const partie of g.parties) {
      if (partie.type === 'note') { paragraphe(partie.texte, marge + retrait, W - retrait, 8.5, '#7A7A7A'); y += p(3); continue; }
      ecrire({ x: marge + retrait, y, w: W - retrait, h: lh(9.5), taille: p(9.5), gras: true, couleur: '#333333',
        valeur: `${partie.code}   ${partie.nom}` });
      y += lh(9.5) + p(1);
      paragraphe(`${partie.texte}${partie.page ? ` (Référentiel, p. ${partie.page}.)` : ''}`, marge + retrait, W - retrait, 8.5, '#4A4A4A');
      y += p(5);
    }
    y += p(7);
  }

  const symboles = M.symboles(s);
  if (symboles.length) {
    section('Symboles du schéma');
    for (const t of symboles) {
      el.push({ type: 'motif', x: marge, y: y + p(1), w: p(14), h: p(14), formes: formesSymbole(t, { x: marge, y: y + p(1), w: p(14), h: p(14) }, z) });
      ecrire({ x: marge + retrait, y, w: W - retrait, h: lh(9.5), taille: p(9.5), gras: true, couleur: '#333333', valeur: M.libelleLegende(s, t) });
      y += lh(9.5) + p(1);
      paragraphe(R.symboles[t.hex] ?? '', marge + retrait, W - retrait, 8.5, '#4A4A4A');
      y += p(8);
    }
  }

  const fosses = s.fosses.map((f) => ({ f, lignes: resumeFosse(f) })).filter((x) => x.lignes.length);
  if (fosses.length) {
    section('Par fosse');
    for (const { f, lignes } of fosses) {
      ecrire({ x: marge, y, w: W, h: lh(9.5), taille: p(9.5), gras: true, couleur: '#333333',
        valeur: [f.nom, f.sousTitre].map((v) => String(v ?? '').trim()).filter(Boolean).join(' · ') });
      y += lh(9.5) + p(1);
      for (const l of lignes) paragraphe(l, marge + p(10), W - p(10), 8.5, '#4A4A4A');
      y += p(8);
    }
  }

  y += p(10);
  el.push({ type: 'rect', x: marge, y, w: W, h: p(0.7), fill: '#DAD5CA' });
  y += p(8);
  paragraphe(R.source, marge, W, 7.5, '#8A8A8A');
  y += marge;
  return { largeur: L, hauteur: Math.ceil(y), z, elements: el };
}
