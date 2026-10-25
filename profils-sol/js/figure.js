// La figure, calculée une fois en éléments simples (rectangles, textes, poignées) puis
// dessinée de trois façons : en DOM modifiable (interface.js), sur un canvas (PNG, et les
// mesures de tests.html) et en SVG (PDF par l'impression du navigateur).
// Le zoom agrandit la MISE EN PAGE : toutes les longueurs et polices sont multipliées,
// chaque texte est composé à sa taille finale et reste net.

import * as M from './modele.js?v=20261025203629';

export const FONTE = '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const PAPIER = '#F8F6F1';
const ENCRE = '#1A2A1A', ENCRE_DOUCE = '#888888', REGLE = '#BBBBBB', ALERTE = '#CC3333';
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

  // Les fosses, six au plus par ligne.
  const hOutils = exp ? 0 : m.p(13);
  const esp = m.p(2);
  const hColonne = hOutils + esp + lh(11) + esp + lh(8) + m.p(6) + esp + m.hauteurBarre + esp + m.p(6) + lh(8);
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
      yy += lh(8) + m.p(6) + esp;
      const by = yy;

      // Règle des profondeurs.
      el.push({ type: 'rect', fi, x: gauche + m.axe - m.p(4), y: by, w: m.p(0.8), h: m.hauteurBarre, fill: REGLE });
      for (const p of [...new Set(M.limites(f))].sort((a, b) => a - b)) {
        const ty = by + p * echelle - m.p(5);
        const th = lh(7.5);
        el.push({ type: 'rect', fi, x: gauche + m.axe - m.p(4), y: ty + th / 2 - m.p(0.4), w: m.p(4), h: m.p(0.8), fill: REGLE });
        texte({ fi, x: gauche, y: ty, w: m.axe - m.p(6), h: th, taille: m.t(7.5), couleur: '#999999', valeur: String(p), align: 'right' });
      }

      // La barre d'horizons.
      let hy = by;
      f.horizons.forEach((h, hi) => {
        const hh = h.epaisseur * echelle;
        const choisi = !exp && options.horizonChoisi === h.id;
        const place = m.lignesTenant(hh);
        const visibles = lignesVisibles(h, place, { export: exp, choisi });
        const total = visibles.reduce((t, l) => t + lh(l.taille), 0);
        let ly = hy + (hh - total) / 2;
        const lignes = visibles.map((l) => {
          const o = { clef: l.clef, x: bx + m.p(5), y: ly, w: m.barre - m.p(10), h: lh(l.taille), taille: m.t(l.taille),
            gras: l.gras, couleur: l.douce ? M.encreDouce(h.couleur) : M.encre(h.couleur), valeur: h[l.clef], invite: l.invite,
            champ: { cible: 'horizon', fi, hi, clef: l.clef } };
          ly += o.h;
          return o;
        });
        el.push({ type: 'horizon', fi, hi, id: h.id, x: bx, y: hy, w: m.barre, h: hh, couleur: h.couleur, contour: M.contour(h.couleur),
          trait: m.p(1), choisi, lignes, plus: !exp && hh >= m.p(13), encre: M.encre(h.couleur), p: m.p(1) });
        hy += hh;
      });
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
    const items = M.legende(s).map((t) => {
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
        el.push({ type: 'rect', x, y: y + (hItem - m.p(13)) / 2, w: m.p(13), h: m.p(13), fill: it.t.hex, stroke: M.contour(it.t.hex), sw: m.p(0.8), rx: m.p(2) });
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
    if (t.align === 'left') { ctx.textAlign = 'left'; ctx.fillText(v, t.x, cy); }
    else if (t.align === 'right') { ctx.textAlign = 'right'; ctx.fillText(v, t.x + t.w, cy); }
    else { ctx.textAlign = 'center'; ctx.fillText(v, t.x + t.w / 2, cy); }
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
      ctx.strokeStyle = e.contour; ctx.lineWidth = e.trait;
      ctx.strokeRect(e.x + e.trait / 2, e.y + e.trait / 2, e.w - e.trait, e.h - e.trait);
      for (const l of e.lignes) ecrire(l);
      ctx.restore();
    }
  }
  ctx.restore();
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

const echapper = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (v) => Math.round(v * 100) / 100;

export function versSVG(fig) {
  const out = [];
  let clip = 0;
  const ecrire = (t) => {
    if (!t.valeur) return;
    const v = tronquer(t.valeur, t.w + 0.5, t.taille, t.gras);
    const [x, anchor] = t.align === 'left' ? [t.x, 'start'] : t.align === 'right' ? [t.x + t.w, 'end'] : [t.x + t.w / 2, 'middle'];
    out.push(`<text x="${r2(x)}" y="${r2(t.y + t.h / 2)}" text-anchor="${anchor}" dominant-baseline="central" font-size="${r2(t.taille)}"${t.gras ? ' font-weight="bold"' : ''} fill="${t.couleur}">${echapper(v)}</text>`);
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
      out.push(`<rect x="${r2(e.x + e.trait / 2)}" y="${r2(e.y + e.trait / 2)}" width="${r2(e.w - e.trait)}" height="${r2(Math.max(0, e.h - e.trait))}" fill="none" stroke="${e.contour}" stroke-width="${r2(e.trait)}"/>`);
      for (const l of e.lignes) ecrire(l);
      out.push('</g>');
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(fig.largeur)}" height="${fig.hauteur}" viewBox="0 0 ${r2(fig.largeur)} ${fig.hauteur}" font-family="${echapper(FONTE)}">${out.join('')}</svg>`;
}
