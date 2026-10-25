// L'interface : barre du haut, figure modifiable, panneau de droite. Tout l'état vit ici ;
// les règles sont dans modele.js, la géométrie dans figure.js.

import * as M from './modele.js?v=20261025203629';
import * as F from './figure.js?v=20261025203629';
import * as Munsell from './munsell.js?v=20261025203629';

const $ = (s) => document.querySelector(s);

function el(tag, attrs = {}, ...enfants) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'value') e.value = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of enfants.flat()) if (c != null && c !== false) e.append(c);
  return e;
}

function svg(chemin, taille = 14, epaisseur = 1.6) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', taille); s.setAttribute('height', taille); s.setAttribute('viewBox', '0 0 16 16');
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', epaisseur);
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = chemin;
  return s;
}
const ICONES = {
  nouveau: '<path d="M9 1.5H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 14.5h4"/><path d="M9 1.5 12.5 5v3"/><path d="M9 1.5V5h3.5"/><path d="M12.5 10.5v4M10.5 12.5h4"/>',
  historique: '<path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9"/><path d="M2 2.5v2.5h2.5"/><path d="M8 5v3l2 1.5"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  loupeMoins: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5M5 7h4"/>',
  loupePlus: '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5M5 7h4M7 5v4"/>',
  exporter: '<path d="M8 10V1.5M5 4.5l3-3 3 3"/><path d="M5.5 7H4a1 1 0 0 0-1 1v5.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1.5"/>',
  dupliquer: '<rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/><path d="M9.5 7.5v4M7.5 9.5h4"/>',
  corbeille: '<path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L12 4"/>',
  gauche: '<path d="M10 3 5 8l5 5"/>',
  droite: '<path d="m6 3 5 5-5 5"/>',
};
const icone = (nom, taille, ep) => svg(ICONES[nom], taille, ep);

// MARK: - État

let stockage = null;
try { stockage = window.localStorage; } catch { stockage = null; }
const biblio = new M.Bibliotheque(stockage);
const vue = { horizonChoisi: null, fosseChoisie: null, zoom: 1, onglet: 0, page: 6 };
let minuterie = null;

const courant = () => biblio.courant;
const iFosse = () => courant().fosses.findIndex((f) => f.id === vue.fosseChoisie);
const iHorizon = () => {
  const f = courant().fosses[iFosse()];
  return f ? f.horizons.findIndex((h) => h.id === vue.horizonChoisi) : -1;
};

/// Tout est enregistré tout seul, une demi-seconde après la dernière modification.
function planifier() {
  clearTimeout(minuterie);
  minuterie = setTimeout(() => biblio.enregistrer(), 500);
}
function enregistrerTout() { clearTimeout(minuterie); biblio.enregistrer(); }

/// Une modification du schéma : on redessine tout, en gardant le champ en cours de saisie.
function modifie() { planifier(); rendre(); }

// MARK: - Rendu, focus conservé

function rendre() {
  const a = document.activeElement;
  const cle = a?.dataset?.cle;
  const sel = cle && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd, a.scrollLeft] : null;
  rendreFeuille();
  rendreInspecteur();
  actualiserBarre();
  if (cle) {
    const b = document.querySelector(`[data-cle="${CSS.escape(cle)}"]`);
    if (b && b !== a) {
      b.focus({ preventScroll: true });
      if (sel) { try { b.setSelectionRange(sel[0], sel[1]); b.scrollLeft = sel[2]; } catch { /* champ sans sélection */ } }
    }
  }
}

function lireChamp(c) {
  const s = courant();
  if (c.cible === 'schema') return s[c.clef];
  if (c.cible === 'fosse') return s.fosses[c.fi][c.clef];
  if (c.cible === 'horizon') return s.fosses[c.fi].horizons[c.hi][c.clef];
  return '';
}

function ecrireChamp(c, v) {
  const s = courant();
  if (c.cible === 'schema') s[c.clef] = v;
  else if (c.cible === 'fosse') s.fosses[c.fi][c.clef] = v;
  else if (c.cible === 'horizon') s.fosses[c.fi].horizons[c.hi][c.clef] = v;
  else if (c.cible === 'legende') M.fixerLibelleLegende(s, { hex: c.hex, nom: c.suggere }, v);
}

const cleDe = (c) => (c.cible === 'legende' ? `legende:${c.hex}` : `${c.cible}:${c.fi ?? ''}:${c.hi ?? ''}:${c.clef}`);

/// Un champ de saisie : on redessine à chaque frappe, sauf pendant une composition (accents).
function brancher(input, ecrire) {
  input.addEventListener('input', (e) => { ecrire(input.value); if (!e.isComposing) modifie(); else planifier(); });
  input.addEventListener('compositionend', () => { ecrire(input.value); modifie(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
  return input;
}

// MARK: - La figure

function px(v) { return `${Math.round(v * 100) / 100}px`; }
function poser(e, x, y, w, h) { Object.assign(e.style, { left: px(x), top: px(y), width: px(w), height: px(h) }); return e; }

function champFigure(t, dx, dy) {
  const input = el('input', { type: 'text', class: 'champ-figure', value: t.valeur ?? '', placeholder: t.invite,
    spellcheck: 'false', autocomplete: 'off', 'data-cle': `fig:${cleDe(t.champ)}`, 'aria-label': t.invite });
  poser(input, t.x - dx - 2, t.y - dy, t.w + 4, t.h);
  Object.assign(input.style, { fontSize: px(t.taille), fontWeight: t.gras ? '700' : '400', color: t.couleur,
    textAlign: t.align === 'left' ? 'left' : 'center' });
  return brancher(input, (v) => ecrireChamp(t.champ, v));
}

function rendreFeuille() {
  const fig = F.composer(courant(), { z: vue.zoom, horizonChoisi: vue.horizonChoisi });
  const feuille = $('#feuille');
  feuille.style.width = px(fig.largeur);
  feuille.style.height = px(fig.hauteur);
  const groupes = new Map();
  const enfants = [];
  for (const e of fig.elements) {
    if (e.type === 'colonne') {
      const g = poser(el('div', { class: 'colonne' }), e.x, e.y, e.w, e.h);
      groupes.set(e.fi, { div: g, x: e.x, y: e.y });
      enfants.push(g);
    }
  }
  for (const e of fig.elements) {
    if (e.type === 'colonne') continue;
    const g = e.fi != null ? groupes.get(e.fi) : null;
    const dx = g ? g.x : 0, dy = g ? g.y : 0;
    let n = null;
    if (e.type === 'rect') {
      n = poser(el('div', { class: 'f-rect' }), e.x - dx, e.y - dy, e.w, e.h);
      Object.assign(n.style, { background: e.fill, borderRadius: e.rx ? px(e.rx) : '',
        boxShadow: e.stroke ? `inset 0 0 0 ${px(e.sw)} ${e.stroke}` : '' });
    } else if (e.type === 'texte') {
      if (e.champ) n = champFigure(e, dx, dy);
      else {
        n = poser(el('div', { class: 'f-texte' }, e.valeur), e.x - dx, e.y - dy, e.w, e.h);
        Object.assign(n.style, { fontSize: px(e.taille), color: e.couleur, fontFamily: F.FONTE });
      }
    } else if (e.type === 'horizon') {
      n = caseHorizon(e, dx, dy, fig);
    } else if (e.type === 'poignee') {
      n = poser(el('div', { class: 'poignee', 'aria-hidden': 'true' }), e.x - dx, e.y - dy, e.w, e.h);
      n.addEventListener('pointerdown', (ev) => tirer(ev, e.fi, e.index, fig.echelle));
    } else if (e.type === 'outils') {
      n = poser(el('div', { class: 'outils' },
        el('button', { type: 'button', title: 'Dupliquer cette fosse', 'aria-label': 'Dupliquer cette fosse',
          onclick: () => { M.dupliquerFosse(courant(), e.fi); modifie(); } }, icone('dupliquer', e.taille * 1.25, 1.3)),
        el('button', { type: 'button', title: 'Supprimer cette fosse', 'aria-label': 'Supprimer cette fosse',
          onclick: () => { M.supprimerFosse(courant(), e.fi); modifie(); } }, icone('corbeille', e.taille * 1.25, 1.3))),
      e.x - dx, e.y - dy, e.w, e.h);
    }
    if (n && g) g.div.append(n);
    else if (n) enfants.push(n);
  }
  feuille.replaceChildren(...enfants);
}

/// Une bande de couleur : son texte, sa sélection, et le petit « + » qui ajoute un horizon
/// juste en dessous.
function caseHorizon(e, dx, dy) {
  const c = poser(el('div', { class: 'case', 'data-horizon': e.id }), e.x - dx, e.y - dy, e.w, e.h);
  c.style.background = e.couleur;
  c.append(el('div', { class: 'contour', style: { boxShadow: `inset 0 0 0 ${px(e.trait)} ${e.contour}` } }));
  for (const l of e.lignes) c.append(champFigure(l, e.x, e.y));
  if (e.choisi) c.append(el('div', { class: 'selection', style: { inset: px(e.p), boxShadow: `inset 0 0 0 ${px(2 * e.p)} var(--accent)` } }));
  if (e.plus) {
    const d = 11 * e.p;
    const b = el('button', { type: 'button', class: 'plus', title: 'Ajouter un horizon en dessous', 'aria-label': 'Ajouter un horizon en dessous',
      style: { right: px(1.5 * e.p), bottom: px(1.5 * e.p), width: px(d), height: px(d), background: e.encre, color: e.couleur },
      onclick: (ev) => {
        ev.stopPropagation();
        const f = courant().fosses[e.fi];
        M.ajouterHorizon(f, e.hi);
        vue.fosseChoisie = f.id;
        if (f.horizons[e.hi + 1]) vue.horizonChoisi = f.horizons[e.hi + 1].id;
        modifie();
      } }, icone('plus', d * 0.62, 3.2));
    c.append(b);
  }
  c.addEventListener('click', (ev) => {
    if (ev.target.closest('.plus')) return;
    const f = courant().fosses[e.fi];
    if (vue.horizonChoisi === e.id && vue.fosseChoisie === f.id) return;
    vue.horizonChoisi = e.id;
    vue.fosseChoisie = f.id;
    rendre();
  });
  return c;
}

/// La limite entre deux horizons : on l'attrape et on la monte ou la descend, cm par cm.
function tirer(ev, fi, index, echelle) {
  ev.preventDefault();
  const f = courant().fosses[fi];
  const depart = f.horizons.map((h) => h.epaisseur);
  const y0 = ev.clientY;
  document.body.classList.add('tire');
  const bouger = (e) => {
    const delta = Math.round((e.clientY - y0) / echelle);
    M.deplacerLimite(f, index, delta, depart);
    rendreFeuille();
    rendreInspecteur();
  };
  const finir = () => {
    document.body.classList.remove('tire');
    window.removeEventListener('pointermove', bouger);
    window.removeEventListener('pointerup', finir);
    window.removeEventListener('pointercancel', finir);
    planifier();
  };
  window.addEventListener('pointermove', bouger);
  window.addEventListener('pointerup', finir);
  window.addEventListener('pointercancel', finir);
}

// MARK: - Barre du haut

const barre = {};

function menu(etiquette, nomIcone, remplir) {
  const liste = el('div', { class: 'menu-liste', role: 'menu' });
  const d = el('details', { class: 'menu' }, el('summary', { class: 'icone-texte' }, icone(nomIcone), etiquette), liste);
  d.addEventListener('toggle', () => {
    if (!d.open) return;
    for (const autre of document.querySelectorAll('details.menu[open]')) if (autre !== d) autre.open = false;
    remplir(liste, () => { d.open = false; });
    const r = d.querySelector('summary').getBoundingClientRect();
    liste.style.top = `${r.bottom + 4}px`;
    const gauche = Math.min(r.left, window.innerWidth - liste.offsetWidth - 8);
    liste.style.left = `${Math.max(8, gauche)}px`;
  });
  document.addEventListener('pointerdown', (e) => { if (d.open && !d.contains(e.target)) d.open = false; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') d.open = false; });
  return d;
}

const choix = (texte, action, fermer) => el('button', { type: 'button', class: 'menu-choix', role: 'menuitem',
  onclick: () => { fermer(); action(); } }, texte);

function construireBarre() {
  // Pas de filtre « accept » : Safari grise alors les .json. Le champ est dans une étiquette :
  // le clic de l'utilisateur l'ouvre lui-même (Safari refuse un click() lancé par programme).
  const fichier = el('input', { type: 'file', class: 'champ-fichier', tabindex: '-1' });
  fichier.addEventListener('change', () => { lireFichier(fichier.files[0]); fichier.value = ''; });

  const historique = menu('Historique', 'historique', (liste, fermer) => {
    liste.replaceChildren(
      ...biblio.schemas.map((s) => choix(s.id === courant().id ? `✓  ${M.nomAffiche(s)}` : M.nomAffiche(s), () => {
        if (s.id === courant().id) return;
        biblio.ouvrir(s.id); vue.horizonChoisi = null; vue.fosseChoisie = null; rendre();
      }, fermer)),
      el('div', { class: 'menu-trait' }),
      choix('Dupliquer le schéma', dupliquerSchema, fermer),
      choix('Supprimer ce schéma', () => { biblio.supprimer(courant().id); vue.horizonChoisi = null; vue.fosseChoisie = null; rendre(); }, fermer),
      el('div', { class: 'menu-trait' }),
      el('label', { class: 'menu-choix', role: 'menuitem', onclick: () => setTimeout(fermer, 0) }, 'Ouvrir un fichier…', fichier),
      choix('Enregistrer dans un fichier…', enregistrerFichier, fermer));
  });

  barre.profondeur = el('span', { class: 'valeur' });
  barre.zoom = el('input', { type: 'range', min: M.zoomMin, max: M.zoomMax, step: 0.01, 'aria-label': 'Zoom' });
  barre.zoom.addEventListener('input', () => { vue.zoom = M.bornerZoom(Number(barre.zoom.value)); rendreFeuille(); actualiserBarre(); });
  barre.pourcent = el('button', { type: 'button', class: 'pourcent', title: 'Revenir à 100 %', onclick: () => zoomer(null) });

  const exporter = menu('Exporter', 'exporter', (liste, fermer) => {
    liste.replaceChildren(choix('Image PNG…', exporterPNG, fermer), choix('Document PDF…', exporterPDF, fermer));
  });

  $('#barre').replaceChildren(
    el('button', { type: 'button', class: 'icone-texte', onclick: () => { biblio.nouveau(); vue.horizonChoisi = null; rendre(); } }, icone('nouveau'), 'Nouveau'),
    historique,
    el('div', { class: 'separateur' }),
    el('button', { type: 'button', class: 'icone-texte', title: 'Ajouter une fosse', onclick: () => { M.ajouterFosse(courant()); modifie(); } }, icone('plus'), 'Fosse'),
    el('div', { class: 'pas' }, el('span', { class: 'etiquette' }, 'Profondeur'),
      el('button', { type: 'button', 'aria-label': 'Moins profond', onclick: () => changerProfondeur(-5) }, '−'),
      barre.profondeur,
      el('button', { type: 'button', 'aria-label': 'Plus profond', onclick: () => changerProfondeur(5) }, '+')),
    el('div', { class: 'espace' }),
    el('div', { class: 'zoom' }, icone('loupeMoins', 12), barre.zoom, icone('loupePlus', 12), barre.pourcent),
    exporter);
}

function actualiserBarre() {
  barre.profondeur.textContent = `${courant().profondeur} cm`;
  if (document.activeElement !== barre.zoom) barre.zoom.value = vue.zoom;
  barre.pourcent.textContent = `${Math.round(vue.zoom * 100)} %`;
  document.title = `${M.nomAffiche(courant())} — Profils de sol`;
}

function changerProfondeur(d) {
  const s = courant();
  const v = Math.max(M.profondeurMin, Math.min(M.profondeurMax, s.profondeur + d));
  if (v === s.profondeur) return;
  s.profondeur = v;
  M.recaler(s);
  modifie();
}

/// null : retour à 100 % ; sinon facteur multiplicatif.
function zoomer(facteur) {
  vue.zoom = facteur == null ? 1 : M.bornerZoom(vue.zoom * facteur);
  rendreFeuille();
  actualiserBarre();
}

function dupliquerSchema() { biblio.dupliquer(); vue.horizonChoisi = null; vue.fosseChoisie = null; rendre(); }

// MARK: - Panneau de droite

function carte(titre, ...enfants) {
  return el('section', { class: 'carte' }, el('div', { class: 'carte-titre' }, titre), ...enfants);
}

function champ(etiquette, c, invite) {
  const input = el('input', { type: 'text', value: lireChamp(c) ?? '', placeholder: invite, 'data-cle': `insp:${cleDe(c)}` });
  brancher(input, (v) => ecrireChamp(c, v));
  return el('label', { class: 'champ' }, el('span', {}, etiquette), input);
}

function pas(etiquette, valeur, changer, ariaMoins, ariaPlus) {
  return el('div', { class: 'pas' }, el('span', { class: 'etiquette' }, etiquette),
    el('button', { type: 'button', 'aria-label': ariaMoins, onclick: () => changer(-1) }, '−'),
    el('span', { class: 'valeur' }, valeur),
    el('button', { type: 'button', 'aria-label': ariaPlus, onclick: () => changer(1) }, '+'));
}

function rendreInspecteur() {
  const s = courant();
  const f = iFosse(), h = iHorizon();
  const legende = el('input', { type: 'checkbox' });
  legende.checked = s.legende;
  legende.addEventListener('change', () => { s.legende = legende.checked; modifie(); });
  const parties = [carte('Schéma',
    champ('Titre', { cible: 'schema', clef: 'titre' }, 'Sans titre'),
    champ('Sous-titre', { cible: 'schema', clef: 'sousTitre' }, 'sous-titre'),
    champ('Bas de page', { cible: 'schema', clef: 'basDePage' }, 'légende libre'),
    el('label', { class: 'case-a-cocher' }, legende, 'Afficher la légende'),
    el('div', { class: 'doux' }, `${s.fosses.length} fosse(s) · ${s.profondeur} cm`))];

  if (f >= 0) {
    parties.push(carte('Fosse',
      champ('Nom', { cible: 'fosse', fi: f, clef: 'nom' }, 'Fosse'),
      champ('Sous-titre', { cible: 'fosse', fi: f, clef: 'sousTitre' }, 'Parking bitumé…'),
      champ('Note en dessous', { cible: 'fosse', fi: f, clef: 'note' }, '⚠ Ne pas prioriser'),
      el('div', { class: 'rangee' }, el('button', { type: 'button', onclick: () => {
        const fosse = s.fosses[f];
        M.ajouterHorizon(fosse, h >= 0 ? h : fosse.horizons.length - 1);
        modifie();
      } }, 'Ajouter un horizon'))));
  }

  if (f >= 0 && h >= 0) {
    const fosse = s.fosses[f], hz = fosse.horizons[h];
    const couleur = el('div', { class: 'rangee', style: { gap: '4px' } }, el('span', { class: 'etiquette' }, 'Couleur'),
      hz.munsell ? el('span', { class: 'notation' }, hz.munsell) : null);
    const onglets = el('div', { class: 'segmente', role: 'group', 'aria-label': 'Couleur' },
      ...['Nuancier', 'Munsell'].map((t, i) => el('button', { type: 'button', class: vue.onglet === i ? 'actif' : null,
        onclick: () => { vue.onglet = i; rendreInspecteur(); } }, t)));
    parties.push(carte('Horizon',
      champ('Repère', { cible: 'horizon', fi: f, hi: h, clef: 'nom' }, 'H1'),
      champ("Nom de l'horizon", { cible: 'horizon', fi: f, hi: h, clef: 'libelle' }, 'Btg'),
      champ('Commentaire', { cible: 'horizon', fi: f, hi: h, clef: 'commentaire' }, 'écarté, croissance…'),
      pas('Épaisseur', `${hz.epaisseur} cm`, (d) => { M.fixerEpaisseur(fosse, h, hz.epaisseur + d); modifie(); }, 'Plus mince', 'Plus épais'),
      couleur, onglets,
      vue.onglet === 0 ? nuancier(hz) : livret(hz),
      el('div', { class: 'rangee' },
        el('button', { type: 'button', onclick: () => { M.ajouterHorizon(fosse, h); modifie(); } }, 'Ajouter en dessous'),
        el('button', { type: 'button', disabled: fosse.horizons.length < 2,
          onclick: () => { M.supprimerHorizon(fosse, h); vue.horizonChoisi = null; modifie(); } }, 'Supprimer'))));
  } else {
    parties.push(el('p', { class: 'aide' }, 'Cliquez sur un horizon pour le modifier.\nTirez la limite entre deux horizons pour changer les épaisseurs, centimètre par centimètre.'));
  }
  $('#inspecteur').replaceChildren(...parties);
}

function choisirCouleur(hz, hex, munsell) {
  hz.couleur = hex.toUpperCase();
  if (munsell) hz.munsell = munsell; else delete hz.munsell;
  modifie();
}

function nuancier(hz) {
  const actuelle = hz.couleur.toUpperCase();
  const autre = el('input', { type: 'color', value: actuelle.toLowerCase(), 'aria-label': 'Autre couleur' });
  autre.addEventListener('input', () => { hz.couleur = autre.value.toUpperCase(); delete hz.munsell; planifier(); rendreFeuille(); });
  autre.addEventListener('change', () => choisirCouleur(hz, autre.value));
  return el('div', { class: 'livret' },
    el('div', { class: 'nuancier' }, ...M.teintes.map((t) => el('button', { type: 'button', title: t.nom, 'aria-label': t.nom,
      class: `teinte${t.hex.toUpperCase() === actuelle ? ' choisie' : ''}`, style: { background: t.hex },
      onclick: () => choisirCouleur(hz, t.hex) }))),
    el('label', { class: 'autre-couleur' }, autre, 'Autre couleur…'));
}

/// Le livret Munsell : on le feuillette planche par planche, dans l'ordre du livre.
function livret(hz) {
  const pages = Munsell.pages;
  const page = pages[vue.page];
  const gley = page.hue === 'Gley 1';
  const colonnes = gley ? Munsell.colonnesGley : Munsell.chromas.map((c) => `/${c}`);
  const actuelle = hz.couleur.toUpperCase();
  const tourner = (d) => { vue.page = Math.max(0, Math.min(pages.length - 1, vue.page + d)); rendreInspecteur(); };
  const grille = el('div', { class: 'grille' }, el('span'), ...colonnes.map((c) => el('span', { class: 'tete' }, c)));
  for (const [valeur, puces] of page.lignes) {
    grille.append(el('span', { class: 'valeur' }, valeur));
    for (const p of puces) {
      grille.append(p
        ? el('button', { type: 'button', title: p[0], 'aria-label': p[0], class: `puce${p[1].toUpperCase() === actuelle ? ' choisie' : ''}`,
          style: { background: p[1] }, onclick: () => choisirCouleur(hz, p[1], p[0]) })
        : el('span'));
    }
  }
  return el('div', { class: 'livret' },
    el('div', { class: 'livret-entete' },
      el('button', { type: 'button', 'aria-label': 'Planche précédente', disabled: vue.page === 0, onclick: () => tourner(-1) }, icone('gauche', 12)),
      el('div', { class: 'livret-titre' }, el('strong', {}, page.hue), el('span', {}, `planche ${vue.page + 1} / ${pages.length}`)),
      el('button', { type: 'button', 'aria-label': 'Planche suivante', disabled: vue.page === pages.length - 1, onclick: () => tourner(1) }, icone('droite', 12))),
    grille,
    el('p', { class: 'livret-pied' }, "Couleurs approchées — l'écran ne remplace pas le livret."));
}

// MARK: - Fichiers et exports

function telecharger(blob, nom) {
  const a = el('a', { href: URL.createObjectURL(blob), download: nom });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const nomFichier = () => M.nomDeFichier(M.nomAffiche(courant()));

function exporterPNG() {
  const c = F.versCanvas(F.composer(courant(), { export: true }), 2);
  c.toBlob((b) => { if (b) telecharger(b, `${nomFichier()}.png`); }, 'image/png');
}

/// PDF vectoriel : la figure en SVG, seule sur la page, par l'impression du navigateur.
function exporterPDF() {
  const fig = F.composer(courant(), { export: true });
  const zone = $('#impression');
  zone.innerHTML = F.versSVG(fig);
  let page = document.getElementById('page-impression');
  if (!page) { page = el('style', { id: 'page-impression' }); document.head.append(page); }
  page.textContent = `@page { size: ${Math.ceil(fig.largeur)}px ${fig.hauteur}px; margin: 0; }`;
  const titre = document.title;
  document.title = nomFichier();
  const nettoyer = () => { document.title = titre; zone.innerHTML = ''; page.textContent = ''; window.removeEventListener('afterprint', nettoyer); };
  window.addEventListener('afterprint', nettoyer);
  window.print();
}

function enregistrerFichier() {
  enregistrerTout();
  telecharger(new Blob([JSON.stringify(courant(), null, 2)], { type: 'application/json' }), `${nomFichier()}.json`);
}

async function lireFichier(f) {
  if (!f) return;
  let liste = [];
  try { liste = M.relireFichier(await f.text()); } catch { liste = []; }
  if (!biblio.importer(liste)) { window.alert('Fichier illisible : il faut un schéma enregistré par Profils de sol.'); return; }
  vue.horizonChoisi = null; vue.fosseChoisie = null;
  rendre();
}

// MARK: - Lancement

export function lancer() {
  construireBarre();
  rendre();

  const planche = $('#planche');
  // Un clic hors d'un horizon le désélectionne.
  planche.addEventListener('click', (e) => {
    if (e.target.closest('.case, input, button, .poignee')) return;
    if (vue.horizonChoisi) { vue.horizonChoisi = null; rendre(); }
  });
  // Zoom : pincement du trackpad (Ctrl + molette pour Chrome, gestes pour Safari) et ⌘ + molette.
  planche.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomer(Math.exp(-d * (e.ctrlKey ? 0.01 : 0.004)));
  }, { passive: false });
  let echelleGeste = 1;
  planche.addEventListener('gesturestart', (e) => { e.preventDefault(); echelleGeste = 1; });
  planche.addEventListener('gesturechange', (e) => { e.preventDefault(); zoomer(e.scale / echelleGeste); echelleGeste = e.scale; });

  document.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === '+' || k === '=') { e.preventDefault(); zoomer(1.15); }
    else if (k === '-') { e.preventDefault(); zoomer(1 / 1.15); }
    else if (k === '0') { e.preventDefault(); zoomer(null); }
    else if (k === 'e') { e.preventDefault(); if (e.shiftKey) exporterPDF(); else exporterPNG(); }
    else if (k === 'd' && !e.shiftKey) { e.preventDefault(); dupliquerSchema(); }
  });

  // Un schéma .json lâché sur la page s'ouvre.
  document.addEventListener('dragover', (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); });
  document.addEventListener('drop', (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    e.preventDefault();
    lireFichier(f);
  });

  window.addEventListener('pagehide', enregistrerTout);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') enregistrerTout(); });
}
