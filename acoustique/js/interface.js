// Interface : barre du haut (vues, calcul des graves, fichier), réglages d'affichage au-dessus de la vue,
// liste des éléments à gauche (sources, murs, objets), à droite la pièce et l'élément sélectionné.

import { etat, abonner, notifier, demarrer, modifier, reglage, formePlan, finirEditionPlan, retirerMur, ouvrirDansMur,
  ajouterEnceinte, ajouterBloc, supprimer, dupliquer, lancerCalcul, arreterCalcul, aJour, aRecalculer, estimation, ECHELLE_DB, deplacerObjet,
  entrees, gravesAutomatiques, nouveauProjet, ouvrirScene, reprendre, dimensionsRect, typePiece, tournerObjet,
  commencerDessin, annulerDessin, terminerDessin, retirerPointDessin } from './etat.js';
import { MATERIAUX, materiau, GENRES, genre, FILTRES, FORMES, FORMES_AJOUTABLES, borner, estOuvert } from './modele.js';
import { FORMES_PLAN, coinsPlan, murDuPlan, origine, volumePlan, EPAISSEUR, idMur } from './plan.js';
import { Bandes } from './rayons.js';
import { fmaxOndes } from './calcul.js';
import { cssMateriau, turbo, v2, aire } from './base.js';
import { textePixel } from './police.js';
import { chercherEcoute, chercherSalle, arreterRecherche, dureeEcoute, dureeSalle } from './placement.js';
import { Vue3D } from './vue3d.js';
import { Plan2D } from './plan2d.js';
import { Courbe, FMIN, FMAX } from './courbe.js';

const $ = (sel, r = document) => r.querySelector(sel);
const el = (tag, attrs = {}, ...enfants) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, '');
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of enfants.flat()) if (c != null && c !== false) e.append(c instanceof Node ? c : document.createTextNode(c));
  return e;
};

// MARK: Liaisons (les champs suivent la scène sans perdre le focus)

let liaisons = [];
function lier(e, lire) { liaisons.push({ e, lire }); return e; }
function rafraichirLiaisons() {
  for (const { e, lire } of liaisons) {
    if (document.activeElement === e) continue;
    const v = lire();
    if (e.type === 'checkbox') e.checked = !!v;
    else if (e.type === 'number') { const t = String(+(+v).toFixed(e.dataset.dec || 2)); if (e.value !== t) e.value = t; }
    else if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.tagName)) { if (e.value !== String(v)) e.value = v; }
    else if (v !== '' && e.textContent !== String(v)) e.textContent = v;
  }
}

function champNombre(titre, lire, ecrire, o = {}) {
  const { mini = -1e9, maxi = 1e9, pas = 0.05, dec = 2, fin } = o;
  const i = el('input', { type: 'number', step: pas, min: mini, max: maxi, 'data-dec': dec, 'aria-label': titre });
  i.value = String(+(+lire()).toFixed(dec));
  i.addEventListener('change', () => { const v = parseFloat(i.value.replace(',', '.')); if (isFinite(v)) { ecrire(Math.min(Math.max(v, mini), maxi)); if (fin) fin(); } });
  return lier(i, lire);
}
function nombre(titre, lire, ecrire, o = {}) {
  return el('label', { class: 'ligne' }, el('span', { class: 'etiquette' }, titre),
    el('span', { class: 'champ' }, champNombre(titre, lire, ecrire, o), el('span', { class: 'unite' }, o.unite ?? 'm')));
}
/// Curseur + valeur à la façon du site de référence (la valeur reste modifiable au clavier).
function curseur(titre, lire, ecrire, o = {}) {
  const { mini, maxi, pas = 0.05, fin } = o;
  const r = el('input', { type: 'range', min: mini, max: maxi, step: pas, 'aria-label': titre });
  r.value = lire();
  r.addEventListener('input', () => ecrire(+r.value));
  if (fin) r.addEventListener('change', fin);
  return el('div', { class: 'curseur' }, nombre(titre, lire, ecrire, o), lier(r, lire));
}
function choix(titre, options, lire, ecrire) {
  const s = el('select', { 'aria-label': titre });
  for (const [v, t] of options) s.append(el('option', { value: v }, t));
  s.value = lire();
  s.addEventListener('change', () => ecrire(s.value));
  return el('label', { class: 'ligne' }, el('span', { class: 'etiquette' }, titre), lier(s, lire));
}
function case_(titre, lire, ecrire, attrs = {}) {
  const i = el('input', { type: 'checkbox' });
  i.checked = !!lire();
  i.addEventListener('change', () => ecrire(i.checked));
  return el('label', Object.assign({ class: 'case' }, attrs), lier(i, lire), el('span', {}, titre));
}
function segments(options, lire, ecrire, classe = '') {
  const d = el('div', { class: `segmente ${classe}`, role: 'group' });
  for (const [v, t] of options) {
    const b = el('button', { type: 'button', onclick: () => ecrire(v) }, t);
    b.dataset.v = String(v);
    d.append(b);
  }
  const maj = () => { for (const b of d.children) b.classList.toggle('actif', b.dataset.v === String(lire())); };
  maj(); liaisons.push({ e: d, lire: () => { maj(); return ''; } });
  d.value = '';
  return d;
}
/// Menu d'actions (liste déroulante dont le premier choix est le titre).
function menu(titre, options, agir) {
  const s = el('select', { class: 'menu', 'aria-label': titre });
  s.append(el('option', { value: '' }, titre));
  for (const o of options) {
    if (o.groupe) { const g = el('optgroup', { label: o.groupe }); for (const [v, t] of o.options) g.append(el('option', { value: v }, t)); s.append(g); }
    else s.append(el('option', { value: o[0] }, o[1]));
  }
  s.addEventListener('change', () => { const v = s.value; s.value = ''; if (v) agir(v); });
  return s;
}
/// Élément montré seulement quand visible() est vrai.
function si(e, visible) { liaisons.push({ e, lire: () => { e.hidden = !visible(); return ''; } }); e.hidden = !visible(); return e; }
const MATS = () => MATERIAUX.filter((m) => m.id !== 'ouvert').map((m) => [m.id, m.nom]);

function aide(titre, texte) {
  const b = el('button', { type: 'button', class: 'aide', 'aria-label': `Aide : ${titre}` }, '?');
  const bulle = el('div', { class: 'bulle', role: 'tooltip' }, el('strong', {}, titre), el('p', {}, texte));
  return el('span', { class: 'aide-boite' }, b, bulle);
}
function carte(titre, aideTexte, ...contenu) {
  return el('section', { class: 'carte' }, el('div', { class: 'carte-titre' }, el('span', {}, textePixel(titre.toUpperCase(), 1.5)), aideTexte ? aide(titre, aideTexte) : null), ...contenu);
}

// MARK: Barre du haut

function statut() {
  if (etat.webgpu === false) return ['Aigus seulement (navigateur sans WebGPU)', 'orange'];
  if (etat.enCours) return [`Graves : calcul ${Math.round(etat.progression * 100)} %`, 'orange'];
  if (aRecalculer().length) return [gravesAutomatiques() ? 'Graves : calcul dans un instant' : 'Graves à calculer', 'orange'];
  return [`Graves à jour · ondes ≤ ${Math.round(estimation().fmax)} Hz`, 'vert'];
}

const duree = (s) => (s < 60 ? `${Math.max(1, Math.round(s))} s` : `${Math.round(s / 60)} min`);
function remplirCalcul(z) {
  const n = aRecalculer().length;
  const cle = etat.webgpu === false ? 'x' : etat.enCours ? `c${Math.round(etat.progression * 100)}` : `${n}|${etat.webgpu}|${Math.round(estimation().secondes)}`;
  if (z.dataset.e === cle) return;
  z.dataset.e = cle;
  z.innerHTML = '';
  if (etat.webgpu === false) z.append(el('button', { type: 'button', disabled: true, title: "Ce navigateur n'a pas WebGPU : essayez Chrome, Edge ou Safari récents." }, 'Graves indisponibles'));
  else if (etat.enCours) z.append(el('button', { type: 'button', class: 'calcul-en-cours', onclick: arreterCalcul, title: 'Arrêter le calcul' }, `Arrêter · ${Math.round(etat.progression * 100)} %`));
  else if (n && etat.webgpu) z.append(el('button', { type: 'button', class: 'principal', onclick: () => lancerCalcul(false), title: `Ondes jusqu'à ${Math.round(estimation().fmax)} Hz` }, `Calculer les graves (≈ ${duree(estimation().secondes * n)})`));
  else z.append(el('button', { type: 'button', disabled: true }, etat.webgpu == null ? 'Graves…' : 'Graves à jour'));
}

function construireBarre() {
  const b = $('#barre');
  b.innerHTML = '';
  const fichier = el('input', { type: 'file', accept: '.json,application/json', hidden: true });
  fichier.addEventListener('change', async () => {
    const f = fichier.files[0]; if (!f) return;
    try { const sc = JSON.parse(await f.text()); if (!sc.enceintes) throw new Error(); ouvrirScene(sc); }
    catch { etat.message = 'Fichier illisible : il faut une scène enregistrée par Acoustique.'; notifier(); }
    fichier.value = '';
  });
  const calcul = el('div', { class: 'zone-calcul' });
  liaisons.push({ e: calcul, lire: () => { remplirCalcul(calcul); return ''; } });
  calcul.value = '';
  remplirCalcul(calcul);
  b.append(
    el('div', { class: 'identite' }, el('img', { src: 'icone.png', alt: '', width: 28, height: 28 }),
      el('div', {}, lier(el('div', { class: 'titre' }), () => etat.scene.nom),
        el('div', { class: 'statut' }, el('span', { class: 'voyant' }), lier(el('span', { class: 'texte-statut' }), () => statut()[0])))),
    segments([['troisD', '3D'], ['plan', 'Plan'], ['coupe', 'Coupe'], ['deux', 'Plan + coupe']], () => etat.affichage, (v) => { reglage('affichage', v); montrerVue(); }),
    si(segments([['nappe', 'Nappe'], ['tranches', 'Tranches'], ['volume', 'Volume']], () => (etat.volume3D ? (etat.tranches3D ? 'tranches' : 'volume') : 'nappe'),
      (v) => { etat.tranches3D = v === 'tranches'; reglage('volume3D', v !== 'nappe'); notifier(); }), () => etat.affichage === 'troisD'),
    segments([['frequence', 'Son pur'], ['bande', "1/3 d'octave"], ['global', 'Bruit rose']], () => etat.mode, (v) => reglage('mode', v), 'modes'),
    el('div', { class: 'espace' }),
    calcul,
    case_('Auto', () => etat.gravesAuto, (v) => reglage('gravesAuto', v), { title: 'Recalculer les graves seul après chaque retouche (si le calcul dure moins de 40 s)' }),
    el('div', { class: 'separateur' }),
    Object.assign(menu('Fichier', [['ouvrir', 'Ouvrir une scène (.json)…'], ['enregistrer', 'Enregistrer la scène (.json)']],
      (v) => (v === 'ouvrir' ? fichier.click() : enregistrerScene())), { title: 'Ouvrir ou enregistrer une scène' }),
    el('button', { type: 'button', onclick: demanderNouveau, title: 'Repartir d’une pièce vide' }, 'Nouveau projet'),
    el('button', { type: 'button', onclick: exporterImage, title: 'Enregistrer la vue en image PNG' }, 'Exporter l’image'),
    fichier,
  );
  for (const n of b.querySelectorAll('.titre, .texte-statut')) n.textContent = '';
}

function demanderNouveau() {
  if (window.confirm('Créer un nouveau projet ? La scène actuelle sera remplacée (pensez à l’enregistrer avant si besoin).')) nouveauProjet();
}

// MARK: Sous-barre (fréquence, hauteur d'écoute, affichage)

const versLog = (f) => Math.log(f / FMIN) / Math.log(FMAX / FMIN);
const depuisLog = (t) => { const f = FMIN * Math.pow(FMAX / FMIN, t); return f < 100 ? Math.round(f * 10) / 10 : Math.round(f); };
function texteFrequence() {
  if (etat.mode === 'bande') { const c = Bandes.tiers[Bandes.tiersContenant(etat.frequence)]; return c >= 1000 ? `${+(c / 1000).toPrecision(3)} kHz` : `${c} Hz`; }
  const f = etat.frequence;
  return f >= 1000 ? `${(f / 1000).toFixed(2)} kHz` : `${f < 100 ? f.toFixed(1) : Math.round(f)} Hz`;
}
function regime() {
  const fo = fmaxOndes(entrees());
  if (etat.mode === 'global') return fo > 0 ? `ondes ≤ ${Math.round(fo)} Hz + rayons` : 'rayons seuls';
  const f = etat.mode === 'bande' ? Bandes.bornes(Bandes.tiers[Bandes.tiersContenant(etat.frequence)])[1] : etat.frequence;
  return f <= fo ? 'ondes : interférences' : 'rayons : énergie';
}
function construireSousBarre() {
  const b = $('#sous-barre');
  b.innerHTML = '';
  const freq = el('input', { type: 'range', min: 0, max: 1, step: 0.001, 'aria-label': 'Fréquence' });
  freq.value = versLog(etat.frequence);
  freq.addEventListener('input', () => reglage('frequence', depuisLog(+freq.value)));
  const ecoute = el('input', { type: 'range', min: 0.05, max: 3, step: 0.01, 'aria-label': "Hauteur d'écoute" });
  ecoute.addEventListener('input', () => modifier((s) => { s.ecoute = +ecoute.value; borner(s); }));
  liaisons.push({ e: freq, lire: () => { freq.disabled = etat.mode === 'global'; return versLog(etat.frequence); } });
  liaisons.push({ e: ecoute, lire: () => { ecoute.max = Math.max(etat.scene.hauteur - 0.05, 0.1); return etat.scene.ecoute; } });
  const densite = el('input', { type: 'range', min: -1.5, max: 1.5, step: 0.05, 'aria-label': 'Densité du volume', title: 'Rendre le volume plus transparent ou plus opaque' });
  densite.addEventListener('input', () => reglage('densite', Math.pow(3, +densite.value)));
  lier(densite, () => Math.log(etat.densite) / Math.log(3));
  b.append(
    el('span', { class: 'groupe-sb' }, el('span', { class: 'doux' }, 'Fréquence'), freq, lier(el('output', { class: 'valeur' }), texteFrequence), lier(el('output', { class: 'regime' }), regime)),
    el('span', { class: 'separateur' }),
    el('span', { class: 'groupe-sb ecoute' }, el('span', { class: 'doux' }, 'Écoute à'), ecoute, lier(el('output', { class: 'valeur' }), () => `${etat.scene.ecoute.toFixed(2)} m`)),
    el('span', { class: 'separateur' }),
    el('span', { class: 'groupe-sb' },
      case_('Animer', () => etat.animer, (v) => reglage('animer', v), { title: "Montrer la pression qui oscille (son pur, graves calculés)" }),
      si(case_('Pondération A', () => etat.ponderationA, (v) => reglage('ponderationA', v)), () => etat.mode === 'global')),
    si(el('span', { class: 'groupe-sb' }, el('span', { class: 'doux' }, 'Densité'), densite), () => etat.affichage === 'troisD' && etat.volume3D && !etat.tranches3D),
  );
  for (const o of b.querySelectorAll('output')) o.value = '';
}

// MARK: Liste des éléments (à gauche)

function construireListe() {
  const L = $('#liste'), s = etat.scene;
  const murs = s.plan ? s.plan.murs : [], objets = s.blocs.filter((b) => b.duPlan == null);
  L.innerHTML = '';
  const ajouter = menu('+', [{ groupe: 'Source', options: GENRES.map((g) => [`e:${g.id}`, g.nom]) }, { groupe: 'Objet', options: FORMES_AJOUTABLES.map((f) => [`b:${f}`, FORMES[f].nom]) }],
    (v) => (v.startsWith('e:') ? ajouterEnceinte(v.slice(2)) : ajouterBloc(v.slice(2))));
  ajouter.classList.add('plus'); ajouter.title = 'Ajouter une source ou un objet';
  const choisir = (id, sel) => { etat.selection = sel ? null : id; notifier(); };
  const ligne = (sel, couleur, titre, detail, action) => el('div', { class: `element${sel ? ' choisi' : ''}`, tabindex: 0, onclick: action, onkeydown: (ev) => { if (ev.key === 'Enter') action(); } },
    el('span', { class: 'pastille', style: `background:${cssMateriau(couleur)}` }), el('div', {}, el('div', { class: 'nom' }, titre), el('div', { class: 'detail' }, detail)));
  const corps = el('div', { class: 'elements' });
  corps.append(el('div', { class: 'groupe' }, textePixel('SOURCES', 1.5)));
  for (const e of s.enceintes) {
    const sel = etat.selection === e.id;
    const coche = el('input', { type: 'checkbox', 'aria-label': `${e.nom} joue`, title: 'Joue', onclick: (ev) => ev.stopPropagation() });
    coche.checked = e.active;
    coche.addEventListener('change', () => modifier((sc) => { sc.enceintes.find((x) => x.id === e.id).active = coche.checked; }));
    const filtre = e.filtre === 'aucun' ? '' : ` · ${e.filtre === 'passeBas' ? '≤' : '≥'}${Math.round(e.coupure)} Hz`;
    corps.append(el('div', { class: `element enceinte${sel ? ' choisi' : ''}`, tabindex: 0, onclick: () => choisir(e.id, sel) },
      coche, el('div', {}, el('div', { class: 'nom' }, e.nom), el('div', { class: 'detail' }, `${genre(e.genre).court} · ${Math.round(e.niveau)} dB${filtre}`)),
      e.active ? el('span', { class: `voyant ${aJour(e) ? 'vert' : 'orange'}`, title: aJour(e) ? 'Graves à jour' : 'Graves à calculer' }) : null,
      el('button', { type: 'button', class: `seule${etat.solo === e.id ? ' actif' : ''}`, title: "N'écouter que cette source",
        onclick: (ev) => { ev.stopPropagation(); reglage('solo', etat.solo === e.id ? null : e.id); construireListe(); } }, 'seule')));
  }
  if (murs.length) {
    corps.append(el('div', { class: 'groupe' }, textePixel('MURS', 1.5)));
    const q = coinsPlan(s), ms = murDuPlan(s, etat.selection);
    murs.forEach((m, i) => {
      const l = q.length > 2 ? v2.dist(q[i], q[(i + 1) % q.length]) : 0;
      corps.append(ligne(ms === i, m.materiau, `Mur ${i + 1} · ${l.toFixed(2)} m`,
        m.rampant ? `rampant · ${Math.round(m.pente)}°` : materiau(m.materiau).nom,
        () => { etat.selection = ms === i ? null : idMur(i); notifier(); }));
    });
  }
  if (objets.length) {
    corps.append(el('div', { class: 'groupe' }, textePixel('OBJETS', 1.5)));
    for (const b of objets) {
      corps.append(ligne(etat.selection === b.id, b.forme === 'ouverture' ? 'ouvert' : b.materiau, b.nom, b.forme === 'ouverture' ? 'Ouverture' : materiau(b.materiau).nom,
        () => choisir(b.id, etat.selection === b.id)));
    }
  }
  L.append(el('div', { class: 'liste-titre' }, textePixel('ÉLÉMENTS', 2), el('span', { class: 'compte' }, String(s.enceintes.length + murs.length + objets.length)), ajouter), corps);
}

// MARK: Panneau de droite : la pièce, puis l'élément choisi

function construireInspecteur() {
  liaisons = liaisons.filter((l) => l.e.isConnected && !$('#inspecteur').contains(l.e));
  const I = $('#inspecteur');
  I.innerHTML = '';
  I.append(cartePiece(), carteSelection());
  const cp = cartePlacement();
  if (cp) I.append(cp);
}

const NOMS_FORMES = { rectangle: 'Rectangle', enL: 'En L', enT: 'En T', trapeze: 'Trapèze', mansarde: 'Mansarde', combles: 'Combles' };
const encombrement = () => {
  const q = etat.scene.plan ? etat.scene.plan.coins : [[0, 0], [etat.scene.longueur, etat.scene.largeur]];
  return [Math.max(...q.map((c) => c[0])) - Math.min(...q.map((c) => c[0])), Math.max(...q.map((c) => c[1])) - Math.min(...q.map((c) => c[1]))];
};

function cartePiece() {
  const s = etat.scene, rect = s.typePiece !== 'perso';
  const hauteur = curseur('Hauteur sous plafond', () => etat.scene.hauteur, (x) => modifier((sc) => { sc.hauteur = x; borner(sc); }), { mini: 1.8, maxi: 8, pas: 0.05 });
  const contenu = [segments([['rect', 'Rectangulaire'], ['perso', 'Personnalisée']], () => etat.scene.typePiece || 'rect', typePiece, 'large')];
  if (rect) {
    contenu.push(
      curseur('Longueur', () => encombrement()[0], (x) => dimensionsRect(x, encombrement()[1]), { mini: 1.5, maxi: 25, pas: 0.05, fin: finirEditionPlan }),
      curseur('Largeur', () => encombrement()[1], (x) => dimensionsRect(encombrement()[0], x), { mini: 1.5, maxi: 25, pas: 0.05, fin: finirEditionPlan }),
      hauteur);
  } else {
    contenu.push(
      el('div', { class: 'formes' }, FORMES_PLAN.map((f) => el('button', { type: 'button', onclick: () => formePlan(f.id) }, NOMS_FORMES[f.id] || f.nom))),
      etat.dessin ? el('div', { class: 'boutons' },
        el('button', { type: 'button', class: 'principal', disabled: etat.dessin.points.length < 3, onclick: terminerDessin }, 'Fermer la pièce'),
        el('button', { type: 'button', disabled: !etat.dessin.points.length, onclick: retirerPointDessin }, 'Retirer le dernier point'),
        el('button', { type: 'button', onclick: annulerDessin }, 'Annuler'))
        : el('button', { type: 'button', class: 'large', onclick: commencerDessin, title: 'Cliquer les coins de la pièce un par un sur le plan' }, '✎ Dessiner à la main'),
      el('div', { class: 'ligne' }, el('span', { class: 'etiquette' }, 'Grille'),
        segments([[0.1, '10 cm'], [0.25, '25 cm'], [0.5, '50 cm'], [1, '1 m']], () => etat.scene.plan && etat.scene.plan.pas, (x) => modifier((sc) => { sc.plan.pas = x; }), 'petit')),
      hauteur);
  }
  contenu.push(lier(el('p', { class: 'note' }), () => {
    const sc = etat.scene, ai = sc.plan ? Math.abs(aire(sc.plan.coins)) : sc.longueur * sc.largeur, v = sc.plan ? volumePlan(sc) : null;
    return `${ai.toFixed(1)} m² au sol · ${(v ?? ai * sc.hauteur).toFixed(1)} m³`;
  }));
  return carte('Pièce', rect ? 'Glissez un mur dans la vue pour le pousser.'
    : 'Choisissez une forme, ou « Dessiner à la main » : cliquez les coins un par un sur le plan (⇧ pour un mur droit, ⌥ sans grille), puis le point vert pour fermer. Ensuite « Modifier la forme » : glisser un coin, cliquer un « + » pour en ajouter, double-clic pour en ôter. Cliquez un mur pour lui donner un rampant.', ...contenu);
}

function carteSelection() {
  const s = etat.scene, id = etat.selection, m = murDuPlan(s, id);
  if (m != null) return carteMur(m);
  const b = s.blocs.find((x) => x.id === id && x.duPlan == null);
  if (b) return carteBloc(b);
  const e = s.enceintes.find((x) => x.id === id);
  if (e) return carteEnceinte(e);
  return el('p', { class: 'note invite' }, 'Cliquez une source, un mur ou un objet pour le régler.');
}

function carteMur(i) {
  const s = etat.scene, n = coinsPlan(s).length, m = s.plan.murs[i], H = s.hauteur, perso = s.typePiece === 'perso';
  const ecrireMur = (cle) => (v) => modifier((sc) => { sc.plan.murs[i][cle] = v; });
  return carte(`Mur ${i + 1}`, 'Un rampant est un pan de toit qui part du haut du mur nain. Deux murs opposés à rampant font une mansarde.',
    perso ? nombre('Longueur', () => { const qq = coinsPlan(etat.scene); return qq.length > 2 ? v2.dist(qq[i], qq[(i + 1) % qq.length]) : 0; }, (v) => {
      modifier((sc) => {
        const p = sc.plan, a = p.coins[i], b = p.coins[(i + 1) % n], l = v2.dist(a, b);
        if (l > 1e-6) p.coins[(i + 1) % n] = [a[0] + (b[0] - a[0]) / l * v, a[1] + (b[1] - a[1]) / l * v].map((x) => Math.round(x * 1000) / 1000);
      });
      finirEditionPlan();
    }, { mini: 0.1, maxi: 120, pas: s.plan.pas }) : null,
    choix('Matériau', MATS(), () => (etat.scene.plan.murs[i] || {}).materiau, ecrireMur('materiau')),
    case_('Rampant', () => (etat.scene.plan.murs[i] || {}).rampant, ecrireMur('rampant')),
    m.rampant ? nombre('Mur nain', () => (etat.scene.plan.murs[i] || {}).pied, ecrireMur('pied'), { mini: 0, maxi: Math.max(H - 0.1, 0.1), pas: 0.05 }) : null,
    m.rampant ? nombre('Pente', () => (etat.scene.plan.murs[i] || {}).pente, ecrireMur('pente'), { unite: '°', mini: 5, maxi: 85, pas: 1, dec: 0 }) : null,
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => ouvrirDansMur(i, false) }, '+ Fenêtre'), el('button', { type: 'button', onclick: () => ouvrirDansMur(i, true) }, '+ Porte'),
      perso ? el('button', { type: 'button', class: 'danger', disabled: n <= 3, onclick: () => retirerMur(i) }, 'Retirer') : null));
}

function carteBloc(b) {
  const id = b.id, get = () => etat.scene.blocs.find((x) => x.id === id) || b;
  const ecrire = (cle) => (v) => modifier((sc) => { const x = sc.blocs.find((y) => y.id === id); if (x) x[cle] = v; });
  const f = b.forme, ouv = f === 'ouverture', paroi = !!b.dansParoi;
  const tourner = (d) => tournerObjet(id, ((get().azimut + d + 540) % 360) - 180);
  return carte(b.nom, paroi ? null : (f === 'boite' ? 'Glissez-le pour le déplacer. Les flèches vertes l’étirent : celles des côtés pour la largeur ou la longueur, celle du centre (en 3D) pour la hauteur.' : 'Glissez-le pour le déplacer.'),
    !ouv ? choix('Matériau', MATS(), () => get().materiau, ecrire('materiau')) : null,
    nombre(f === 'cylindre' ? 'Diamètre' : 'Largeur', () => get().longueur, ecrire('longueur'), { mini: 0.05, maxi: 50 }),
    f !== 'cylindre' && !paroi ? nombre(f === 'pan' ? 'Avancée' : 'Profondeur', () => get().profondeur, ecrire('profondeur'), { mini: 0.05, maxi: 50 }) : null,
    nombre('Hauteur', () => get().hauteur, (v) => modifier((sc) => {
      const x = sc.blocs.find((y) => y.id === id); if (!x) return;
      if (!paroi && f !== 'pan') x.z = x.z - x.hauteur / 2 + v / 2;
      x.hauteur = v;
    }), { mini: 0.05, maxi: 20 }),
    paroi ? case_('Ouverte (le son passe)', () => get().forme === 'ouverture', (v) => modifier((sc) => {
      const x = sc.blocs.find((y) => y.id === id); x.forme = v ? 'ouverture' : 'boite'; x.materiau = v ? 'ouvert' : (x.nom.startsWith('Fenêtre') ? 'vitre' : 'bois');
    })) : null,
    el('div', { class: 'boutons' },
      !paroi && f !== 'cylindre' ? el('button', { type: 'button', onclick: () => tourner(90), title: 'Tourner d’un quart de tour' }, '↻ 90°') : null,
      el('button', { type: 'button', onclick: () => dupliquer(id) }, 'Dupliquer'), el('button', { type: 'button', class: 'danger', onclick: () => supprimer(id) }, 'Supprimer')));
}

const AIDES_GENRE = {
  enceinte: 'Glissez-la dans la vue (⌥ pour l’orienter). Niveau, délai, polarité et filtre se changent sans recalcul.',
  caisson: 'Caisson filtré en passe-bas. Deux caissons décalés d’un quart d’onde (délai + polarité) font un réseau cardioïde.',
  nu: 'Haut-parleur sans caisse : l’avant et l’arrière s’annulent dans les graves (court-circuit acoustique). Un écran plus grand repousse la coupure vers le bas.',
  omni: 'Source idéale qui rayonne également dans toutes les directions.',
};

function carteEnceinte(e) {
  const id = e.id, get = () => etat.scene.enceintes.find((x) => x.id === id) || e;
  const ecrire = (cle) => (v) => modifier((sc) => { const x = sc.enceintes.find((y) => y.id === id); if (x) { x[cle] = v; borner(sc); } });
  const g = e.genre;
  return carte(e.nom, AIDES_GENRE[g],
    choix('Type', GENRES.map((x) => [x.id, x.court]), () => get().genre, ecrire('genre')),
    nombre('Niveau à 1 m', () => get().niveau, ecrire('niveau'), { unite: 'dB', mini: 40, maxi: 140, pas: 1, dec: 1 }),
    nombre('Délai', () => get().delai, ecrire('delai'), { unite: 'ms', mini: 0, maxi: 500, pas: 0.5, dec: 2 }),
    case_('Polarité inversée', () => get().inverse, ecrire('inverse')),
    choix('Filtre', FILTRES.map((x) => [x.id, x.nom]), () => get().filtre, ecrire('filtre')),
    e.filtre !== 'aucun' ? nombre('Coupure', () => get().coupure, ecrire('coupure'), { unite: 'Hz', mini: 20, maxi: 5000, pas: 5, dec: 0 }) : null,
    nombre('Hauteur', () => get().z, ecrire('z'), { mini: 0, maxi: 100 }),
    g !== 'omni' ? nombre('Orientation', () => get().azimut, (v) => tournerObjet(id, v), { unite: '°', mini: -180, maxi: 180, pas: 5, dec: 0 }) : null,
    g === 'nu' ? nombre("Côté de l'écran", () => get().baffle, ecrire('baffle'), { mini: 0, maxi: 3, pas: 0.05 }) : null,
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => dupliquer(id) }, 'Dupliquer'), el('button', { type: 'button', class: 'danger', onclick: () => supprimer(id) }, 'Supprimer')),
    el('div', { class: 'ligne' }, el('span', { class: 'etiquette' }, 'Meilleure place'), aide('Meilleure place', "Essaie la source à de nombreux endroits de la pièce et garde ceux où la réponse dans les graves (25–200 Hz) est la plus régulière, c'est-à-dire la plus fiable. « Point d'écoute » : au micro (un seul calcul, par réciprocité). « Toute la pièce » : en moyenne sur une grille de points d'écoute (un calcul par emplacement).")),
    etat.webgpu === false ? el('p', { class: 'note alerte' }, 'Demande WebGPU (Chrome, Edge ou Safari récents).') : el('div', { class: 'boutons' },
      el('button', { type: 'button', disabled: !!(etat.enCours || etat.recherche), onclick: () => chercherEcoute(id) }, `Point d'écoute · ≈ ${duree(dureeEcoute())}`),
      el('button', { type: 'button', disabled: !!(etat.enCours || etat.recherche), onclick: () => chercherSalle(id) }, `Toute la pièce · ≈ ${duree(dureeSalle())}`)));
}

/// Résultats de « Meilleure place » : trois emplacements, et la place actuelle pour comparer.
function cartePlacement() {
  const P = etat.placement;
  if (!P) return null;
  const o = origine(etat.scene), salle = P.mode === 'salle';
  const note = (r) => (salle ? `pièce ±${r.salle.toFixed(1)} dB${r.ecoute != null ? ` · écoute ±${r.ecoute.toFixed(1)}` : ''}` : `±${r.ecoute.toFixed(1)} dB`);
  return carte(`Meilleure place · ${P.nom}`, "± = écart type de la réponse dans les graves autour de sa moyenne : plus il est petit, plus la réponse est régulière. Les cercles verts numérotés marquent les places dans les vues.",
    el('p', { class: 'note' }, salle ? 'Pour toute la pièce (moyenne sur une grille de points d’écoute).' : 'Pour le point d’écoute (micro).'),
    el('div', { class: 'places' }, P.resultats.map((r, k) => el('div', { class: 'place' },
      el('span', { class: `rang${k ? ' autre' : ''}` }, String(k + 1)),
      el('div', {}, el('div', { class: 'chiffres' }, `x ${(r.x - o[0]).toFixed(2)} · y ${(r.y - o[1]).toFixed(2)} m`), el('div', { class: 'note' }, note(r))),
      el('button', { type: 'button', onclick: () => deplacerObjet(P.id, r.x, r.y, null, false) }, 'Placer')))),
    P.actuelle && (P.actuelle.ecoute != null || P.actuelle.salle != null) ? el('p', { class: 'note' }, `Place de départ : ${note(Object.assign({ ecoute: P.actuelle.ecoute ?? 0, salle: P.actuelle.salle ?? 0 }, P.actuelle))}`) : null,
    el('button', { type: 'button', onclick: () => { etat.placement = null; notifier(); } }, 'Effacer les propositions'));
}

// MARK: Légende et bandeaux

function dessinerLegende() {
  const L = $('#legende'), cv = $('#legende canvas'), dpr = window.devicePixelRatio || 1;
  const r = L.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, r.width, r.height);
  const doux = getComputedStyle(document.documentElement).getPropertyValue('--texte-doux').trim();
  ctx.font = '10px -apple-system, system-ui, sans-serif'; ctx.fillStyle = doux;
  const y0 = 34, h = r.height - 70;
  const phaseurs = etat.volume3D && etat.affichage === 'troisD' ? etat.volume && etat.volume.phaseurs : etat.raster && etat.raster.phaseurs;
  ctx.textBaseline = 'alphabetic';
  if (etat.animer && phaseurs) {
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
    g.addColorStop(0, 'rgb(204,51,38)'); g.addColorStop(0.5, 'rgb(247,245,240)'); g.addColorStop(1, 'rgb(41,84,184)');
    ctx.fillStyle = g; ctx.fillRect(8, y0, 14, h);
    ctx.fillStyle = doux; ctx.fillText('+', 10, y0 - 8); ctx.fillText('−', 10, y0 + h + 12);
    return;
  }
  // Échelle relative : 0 dB = niveau moyen de la pièce à cette fréquence.
  ctx.fillText('dB', 8, y0 - 22); ctx.fillText('/ moy.', 4, y0 - 11);
  const hb = h - 26;
  for (let k = 0; k < 64; k++) { const c = turbo(1 - k / 63); ctx.fillStyle = `rgb(${c})`; ctx.fillRect(8, y0 + hb * k / 64, 14, hb / 64 + 1); }
  ctx.fillStyle = doux; ctx.textBaseline = 'middle';
  for (let v = ECHELLE_DB; v >= -ECHELLE_DB; v -= 6) ctx.fillText(v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0', 26, y0 + hb * (ECHELLE_DB - v) / (2 * ECHELLE_DB));
  // Hachures : annulation (plus de 12 dB sous la moyenne).
  const yh = y0 + hb + 8;
  ctx.fillStyle = 'rgb(0,0,80)'; ctx.fillRect(8, yh, 14, 14);
  ctx.save(); ctx.beginPath(); ctx.rect(8, yh, 14, 14); ctx.clip(); ctx.strokeStyle = 'rgb(15,15,25)'; ctx.lineWidth = 2;
  for (let d = -14; d < 28; d += 5) { ctx.beginPath(); ctx.moveTo(8 + d, yh + 14); ctx.lineTo(8 + d + 14, yh); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = doux; ctx.fillText('<−12', 24, yh + 7);
}

function bandeau() {
  const b = $('#bandeau');
  b.innerHTML = '';
  if (etat.reprise) {
    b.append(el('div', { class: 'reprise' }, el('span', {}, `Reprendre « ${etat.reprise} » ?`),
      el('button', { type: 'button', class: 'principal', onclick: reprendre }, 'Reprendre'),
      el('button', { type: 'button', 'aria-label': 'Fermer', onclick: () => { etat.reprise = null; notifier(); } }, '×')));
  }
  if (etat.message) b.append(el('div', { class: 'message', onclick: () => { etat.message = null; notifier(); } }, etat.message));
  if (etat.recherche) {
    b.append(el('div', { class: 'calcul' }, el('strong', {}, `${etat.recherche.etape}… ${Math.round(etat.recherche.progression * 100)} %`),
      el('progress', { max: 1, value: etat.recherche.progression }), el('button', { type: 'button', onclick: arreterRecherche }, 'Arrêter')));
  } else if (etat.enCours) {
    b.append(el('div', { class: 'calcul' }, el('strong', {}, `Calcul des graves en cours… ${Math.round(etat.progression * 100)} %`),
      el('span', {}, "On voit l'impulsion partir de la source et rebondir sur les murs ; la carte revient à la fin."),
      el('progress', { max: 1, value: etat.progression })));
  } else if (etat.affichage === 'troisD' && etat.volume3D && !etat.volume) {
    b.append(el('div', { class: 'calcul' }, el('span', {}, 'Remplissage du volume…')));
  }
}

// MARK: Vues

let vue3d = null, vue2d = null, vuePlan = null, vueCoupe = null, courbe = null;
function montrerVue() {
  const a = etat.affichage;
  $('#vue3d').hidden = a !== 'troisD'; $('#vue2d').hidden = a !== 'plan' && a !== 'coupe'; $('#vue2x').hidden = a !== 'deux';
  if (a === 'troisD' && vue3d) vue3d.redimensionner();
  else if (a === 'deux') { vuePlan.redimensionner(); vueCoupe.redimensionner(); }
  else if (vue2d) vue2d.redimensionner();
  majOutilsVue();
}
let cleOutils = '';
function majOutilsVue() {
  const o = $('#outils-vue'), perso = etat.scene.plan && etat.scene.typePiece === 'perso';
  const meuble = etat.scene.blocs.some((b) => b.id === etat.selection && b.forme === 'boite' && b.duPlan == null && !b.dansParoi);
  const k = `${perso}|${etat.affichage}|${etat.editionPlan}|${meuble}|${!!etat.dessin}|${etat.coupeOrientation}`;
  if (k === cleOutils) return;
  cleOutils = k;
  o.innerHTML = '';
  if (etat.dessin) {
    o.append(el('button', { type: 'button', class: 'actif', onclick: terminerDessin }, 'Fermer la pièce'), el('button', { type: 'button', onclick: annulerDessin }, 'Annuler le dessin'));
  } else if (perso && (etat.affichage === 'plan' || etat.affichage === 'deux')) {
    o.append(el('button', { type: 'button', onclick: commencerDessin }, '✎ Dessiner'));
    o.append(el('button', { type: 'button', class: etat.editionPlan ? 'actif' : '', 'aria-pressed': etat.editionPlan ? 'true' : 'false',
      onclick: () => { etat.editionPlan = !etat.editionPlan; notifier(); } }, etat.editionPlan ? 'Terminer la forme' : 'Modifier la forme'));
  }
  if (etat.affichage === 'troisD') o.append(el('button', { type: 'button', onclick: () => vue3d && vue3d.recadrer() }, 'Recadrer'));
  if (etat.affichage === 'coupe' || etat.affichage === 'deux') {
    const tourner = (d) => reglage('coupeOrientation', (etat.coupeOrientation + d + 4) % 4);
    o.append(el('span', { class: 'groupe-boutons' },
      el('button', { type: 'button', title: 'Tourner la coupe d’un quart de tour', onclick: () => tourner(-1) }, '↺'),
      el('span', { class: 'etiquette-coupe' }, `Coupe vue depuis ${['le sud', 'l’est', 'le nord', 'l’ouest'][etat.coupeOrientation]}`),
      el('button', { type: 'button', title: 'Tourner la coupe d’un quart de tour', onclick: () => tourner(1) }, '↻')));
  }
  const edition = etat.editionPlan && perso;
  const a = etat.affichage;
  $('#aide-vue').textContent = etat.dessin ? 'Dessin : clic = coin · ⇧ = mur droit · ⌥ = sans grille · ⌫ = retirer le dernier · Entrée ou point vert = fermer · Échap = annuler'
    : a === 'troisD' ? 'Vue seulement · glisser : tourner · clic droit ou ⇧ : décaler · molette : zoom · clic : sélectionner (les réglages se font en Plan et en Coupe)'
    : edition && a !== 'coupe' ? 'Plan : glisser un coin · clic sur un + : nouveau coin · double-clic sur un coin : l’ôter · glisser un mur : le pousser · ⌥ : sans grille'
      : meuble ? 'Flèches vertes : étirer (en coupe, celle du dessus règle la hauteur) · glisser le meuble : le déplacer · ⌥ (plan) : l’orienter'
        : a === 'coupe' ? 'Coupe : flèches = plafond, murs, haut du mur nain · glisser une source, un objet ou le micro le déplace · ↺ ↻ : tourner la coupe'
          : 'Glisser une source ou un objet : le déplacer (⌥ : l’orienter) · cliquer ailleurs : placer le micro';
}

function exporterImage() {
  let src;
  if (etat.affichage === 'troisD' && vue3d) {
    vue3d.dessiner();
    src = document.createElement('canvas');
    src.width = vue3d.canvas.width; src.height = vue3d.canvas.height;
    const c = src.getContext('2d'); c.drawImage(vue3d.canvas, 0, 0); c.drawImage(vue3d.calque, 0, 0);
  } else if (etat.affichage === 'deux') {
    src = document.createElement('canvas');
    src.width = vuePlan.canvas.width + vueCoupe.canvas.width; src.height = Math.max(vuePlan.canvas.height, vueCoupe.canvas.height);
    const c = src.getContext('2d'); c.drawImage(vuePlan.canvas, 0, 0); c.drawImage(vueCoupe.canvas, vuePlan.canvas.width, 0);
  } else src = vue2d.canvas;
  src.toBlob((b) => { const a = el('a', { href: URL.createObjectURL(b), download: `${etat.scene.nom}.png` }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
}
function enregistrerScene() {
  const b = new Blob([JSON.stringify(etat.scene, null, 1)], { type: 'application/json' });
  const a = el('a', { href: URL.createObjectURL(b), download: `${etat.scene.nom}.json` }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// MARK: Démarrage

let cleStructure = '';
function structure() {
  const s = etat.scene, b = s.blocs.find((x) => x.id === etat.selection), e = s.enceintes.find((x) => x.id === etat.selection), m = murDuPlan(s, etat.selection);
  return [etat.selection, s.typePiece, s.plan ? s.plan.coins.length : 0, b ? `${b.forme}${b.dansParoi}${b.nom}` : '', e ? `${e.genre}${e.filtre}${e.nom}` : '',
    m != null ? s.plan.murs[m].rampant : '', etat.webgpu, etat.dessin ? `d${Math.min(etat.dessin.points.length, 3)}` : '', !!(etat.dessin && etat.dessin.points.length), etat.placement ? etat.placement.version : 0, !!etat.recherche, etat.enCours].join('|');
}
let cleListe = '';
function cleDeListe() {
  const s = etat.scene;
  return JSON.stringify([etat.selection, etat.solo, s.enceintes.map((e) => [e.nom, e.active, e.genre, e.niveau, e.filtre, e.coupure, aJour(e)]),
    s.plan ? s.plan.murs.map((m) => [m.materiau, m.rampant, m.pied, m.pente]) : 0, s.plan ? s.plan.coins : 0, s.blocs.filter((b) => b.duPlan == null).map((b) => [b.nom, b.forme, b.materiau])]);
}

export function lancer() {
  demarrer();
  construireBarre();
  construireSousBarre();
  vue3d = new Vue3D($('#vue3d'));
  vue2d = new Plan2D($('#vue2d'));
  vuePlan = new Plan2D($('#vue2x-plan'), 'plan');
  vueCoupe = new Plan2D($('#vue2x-coupe'), 'coupe');
  courbe = new Courbe($('#courbe'));
  for (const b of document.querySelectorAll('#choix-courbe button')) b.addEventListener('click', () => { reglage('courbeGraves', b.dataset.v === 'graves'); });
  new ResizeObserver(dessinerLegende).observe($('#legende'));
  montrerVue();
  let affichageMontre = etat.affichage;
  abonner(() => {
    if (etat.affichage !== affichageMontre) { affichageMontre = etat.affichage; montrerVue(); }
    const k = structure();
    if (k !== cleStructure) { cleStructure = k; construireInspecteur(); majOutilsVue(); }
    const kl = cleDeListe();
    if (kl !== cleListe) { cleListe = kl; construireListe(); }
    rafraichirLiaisons();
    $('.voyant', $('#barre')).className = `voyant ${statut()[1]}`;
    for (const b of document.querySelectorAll('#choix-courbe button')) b.classList.toggle('actif', (b.dataset.v === 'graves') === etat.courbeGraves);
    $('#micro-coord').textContent = (() => { const o = origine(etat.scene); return `x ${(etat.scene.micro[0] - o[0]).toFixed(2)} · y ${(etat.scene.micro[1] - o[1]).toFixed(2)} · h ${etat.scene.ecoute.toFixed(2)} m`; })();
    dessinerLegende();
    bandeau();
    majOutilsVue();
  });
  notifier();
  window.addEventListener('keydown', (ev) => {
    if (ev.target.closest('input, select, textarea')) return;
    if (etat.dessin) {
      if (ev.key === 'Enter') terminerDessin();
      else if (ev.key === 'Escape') annulerDessin();
      else if (ev.key === 'Backspace' || ev.key === 'Delete') retirerPointDessin();
      else return;
      ev.preventDefault(); return;
    }
    if ((ev.key === 'Backspace' || ev.key === 'Delete') && etat.selection) { supprimer(etat.selection); ev.preventDefault(); }
    if (ev.key === 'Escape') { etat.selection = null; notifier(); }
  });
}

export { estOuvert, EPAISSEUR };
