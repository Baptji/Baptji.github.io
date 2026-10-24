// Interface (présentation de Fiches sondages) : barre d'outils, liste des éléments à gauche,
// cartes à droite (pièce, sélection, graves, affichage), légende, bandeaux.

import { etat, abonner, notifier, demarrer, modifier, reglage, appliquerModele, formePlan, dessinerPlan, retirerPlan, finirEditionPlan,
  insererCoin, retirerMur, ouvrirDansMur, ajouterEnceinte, ajouterBloc, supprimer, dupliquer, materiauEnLot, lancerCalcul, arreterCalcul,
  aJour, aRecalculer, estimation, hautEchelle, entrees, gravesAutomatiques } from './etat.js';
import { MATERIAUX, materiau, GENRES, genre, FILTRES, FORMES, FORMES_AJOUTABLES, NOMS_COTES, borner, estOuvert } from './modele.js';
import { FORMES_PLAN, coinsPlan, murDuPlan, origine, volumePlan, EPAISSEUR, idMur } from './plan.js';
import { PREREGLAGES } from './modeles.js';
import { QUALITES } from './ondes.js';
import { Bandes } from './rayons.js';
import { fmaxOndes } from './calcul.js';
import { cssMateriau, turbo, v2, aire } from './base.js';
import { textePixel } from './police.js';
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

function nombre(titre, lire, ecrire, o = {}) {
  const { unite = 'm', mini = -1e9, maxi = 1e9, pas = 0.05, dec = 2 } = o;
  const i = el('input', { type: 'number', step: pas, min: mini, max: maxi, 'data-dec': dec, 'aria-label': titre });
  i.value = (+lire()).toFixed(dec).replace(/\.?0+$/, '') || '0';
  i.addEventListener('change', () => { const v = parseFloat(i.value.replace(',', '.')); if (isFinite(v)) ecrire(Math.min(Math.max(v, mini), maxi)); });
  return el('label', { class: 'ligne' }, el('span', { class: 'etiquette' }, titre), el('span', { class: 'champ' }, lier(i, lire), el('span', { class: 'unite' }, unite)));
}
function choix(titre, options, lire, ecrire) {
  const s = el('select', { 'aria-label': titre });
  for (const [v, t] of options) s.append(el('option', { value: v }, t));
  s.value = lire();
  s.addEventListener('change', () => ecrire(s.value));
  return el('label', { class: 'ligne' }, el('span', { class: 'etiquette' }, titre), lier(s, lire));
}
function case_(titre, lire, ecrire) {
  const i = el('input', { type: 'checkbox' });
  i.checked = !!lire();
  i.addEventListener('change', () => ecrire(i.checked));
  return el('label', { class: 'case' }, lier(i, lire), el('span', {}, titre));
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
const MATS = () => MATERIAUX.filter((m) => m.id !== 'ouvert').map((m) => [m.id, m.nom]);
const MATS_TOUS = () => MATERIAUX.map((m) => [m.id, m.nom]);

function aide(titre, texte) {
  const b = el('button', { type: 'button', class: 'aide', 'aria-label': `Aide : ${titre}` }, '?');
  const bulle = el('div', { class: 'bulle', role: 'tooltip' }, el('strong', {}, titre), el('p', {}, texte));
  return el('span', { class: 'aide-boite' }, b, bulle);
}
function carte(titre, aideTexte, ...contenu) {
  return el('section', { class: 'carte' }, el('div', { class: 'carte-titre' }, textePixel(titre.toUpperCase(), 1.5), aideTexte ? aide(titre, aideTexte) : null), ...contenu);
}

// MARK: Barre d'outils

function statut() {
  if (etat.webgpu === false) return ['Aigus seulement (navigateur sans WebGPU)', 'orange'];
  if (etat.enCours) return [`Graves : calcul ${Math.round(etat.progression * 100)} %`, 'orange'];
  const n = aRecalculer().length;
  if (n) return [gravesAutomatiques() ? 'Graves : calcul dans un instant' : 'Graves à calculer', 'orange'];
  return [`Graves à jour · ondes ≤ ${Math.round(estimation().fmax)} Hz`, 'vert'];
}

function construireBarre() {
  const b = $('#barre');
  b.innerHTML = '';
  b.append(
    el('div', { class: 'identite' }, el('img', { src: 'icone.png', alt: '', width: 30, height: 30 }),
      el('div', {}, lier(el('div', { class: 'titre' }), () => etat.scene.nom),
        el('div', { class: 'statut' }, el('span', { class: 'voyant' }), lier(el('span', { class: 'texte-statut' }), () => statut()[0])))),
    el('div', { class: 'separateur' }),
    segments([['troisD', '3D'], ['plan', 'Plan'], ['coupe', 'Coupe']], () => etat.affichage, (v) => { reglage('affichage', v); montrerVue(); }),
    segments([['frequence', 'Son pur'], ['bande', "Tiers d'octave"], ['global', 'Bruit rose global']], () => etat.mode, (v) => reglage('mode', v), 'modes'),
    el('div', { class: 'espace' }),
    el('button', { type: 'button', class: 'principal', onclick: exporterImage, title: 'Enregistrer la vue en image PNG' }, 'Exporter l’image'),
  );
  for (const n of b.querySelectorAll('.titre, .texte-statut')) n.textContent = '';
}

// MARK: Sous-barre (fréquence, hauteur d'écoute)

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
  b.append(el('span', { class: 'doux' }, 'Fréquence'), freq, lier(el('output', { class: 'valeur' }), texteFrequence),
    lier(el('output', { class: 'regime' }), regime), el('span', { class: 'separateur' }),
    el('span', { class: 'doux' }, 'Écoute à'), ecoute, lier(el('output', { class: 'valeur' }), () => `${etat.scene.ecoute.toFixed(2)} m`));
  for (const o of b.querySelectorAll('output')) o.value = '';
}

// MARK: Liste des éléments (à gauche)

let recherche = '';
function construireListe() {
  const L = $('#liste'), s = etat.scene;
  const garde = (nom) => !recherche || nom.toLowerCase().includes(recherche.toLowerCase());
  const murs = s.plan ? s.plan.murs : [], volumes = s.blocs.filter((b) => b.duPlan == null);
  L.innerHTML = '';
  const ajouter = menu('+', [{ groupe: 'Enceinte', options: GENRES.map((g) => [`e:${g.id}`, g.nom]) }, { groupe: 'Volume', options: FORMES_AJOUTABLES.map((f) => [`b:${f}`, FORMES[f].nom]) }],
    (v) => (v.startsWith('e:') ? ajouterEnceinte(v.slice(2)) : ajouterBloc(v.slice(2))));
  ajouter.classList.add('plus'); ajouter.title = 'Ajouter une enceinte ou un volume';
  const champ = el('input', { type: 'search', placeholder: 'Rechercher', value: recherche, 'aria-label': 'Rechercher un élément' });
  champ.addEventListener('input', () => { recherche = champ.value; construireListe(); $('#liste input[type=search]').focus(); });
  const ligne = (sel, couleur, titre, detail, action) => el('div', { class: `element${sel ? ' choisi' : ''}`, tabindex: 0, onclick: action, onkeydown: (ev) => { if (ev.key === 'Enter') action(); } },
    el('span', { class: 'pastille', style: `background:${cssMateriau(couleur)}` }), el('div', {}, el('div', { class: 'nom' }, titre), el('div', { class: 'detail' }, detail)));
  const corps = el('div', { class: 'elements' });
  corps.append(el('div', { class: 'groupe' }, textePixel('ENCEINTES', 1.5)));
  for (const e of s.enceintes.filter((x) => garde(x.nom))) {
    const sel = etat.selection === e.id;
    const coche = el('input', { type: 'checkbox', 'aria-label': `${e.nom} joue`, onclick: (ev) => ev.stopPropagation() });
    coche.checked = e.active;
    coche.addEventListener('change', () => modifier((sc) => { sc.enceintes.find((x) => x.id === e.id).active = coche.checked; }));
    const filtre = e.filtre === 'aucun' ? '' : ` · ${e.filtre === 'passeBas' ? '≤' : '≥'}${Math.round(e.coupure)} Hz`;
    corps.append(el('div', { class: `element enceinte${sel ? ' choisi' : ''}`, tabindex: 0, onclick: () => { etat.selection = sel ? null : e.id; notifier(); } },
      coche, el('div', {}, el('div', { class: 'nom' }, e.nom), el('div', { class: 'detail' }, `${genre(e.genre).court} · ${Math.round(e.niveau)} dB${filtre}`)),
      e.active ? el('span', { class: `voyant ${aJour(e) ? 'vert' : 'orange'}`, title: aJour(e) ? 'Graves à jour' : 'Graves à calculer' }) : null,
      el('button', { type: 'button', class: `seule${etat.solo === e.id ? ' actif' : ''}`, title: "N'afficher que cette enceinte",
        onclick: (ev) => { ev.stopPropagation(); reglage('solo', etat.solo === e.id ? null : e.id); construireListe(); } }, 'seule')));
  }
  if (murs.length) {
    corps.append(el('div', { class: 'groupe' }, textePixel('MURS', 1.5)));
    const q = coinsPlan(s), ms = murDuPlan(s, etat.selection);
    murs.forEach((m, i) => {
      if (!garde(`Mur ${i + 1}`)) return;
      const l = q.length > 2 ? v2.dist(q[i], q[(i + 1) % q.length]) : 0;
      corps.append(ligne(ms === i, m.materiau, `Mur ${i + 1} · ${l.toFixed(2)} m`,
        m.rampant ? `rampant · mur nain ${m.pied.toFixed(2)} m · ${Math.round(m.pente)}°` : materiau(m.materiau).nom,
        () => { etat.selection = ms === i ? null : idMur(i); notifier(); }));
    });
  }
  if (volumes.length) {
    corps.append(el('div', { class: 'groupe' }, textePixel('VOLUMES', 1.5)));
    for (const b of volumes.filter((x) => garde(x.nom))) {
      corps.append(ligne(etat.selection === b.id, b.forme === 'ouverture' ? 'ouvert' : b.materiau, b.nom, `${FORMES[b.forme].court} · ${materiau(b.materiau).nom}`,
        () => { etat.selection = etat.selection === b.id ? null : b.id; notifier(); }));
    }
  }
  L.append(el('div', { class: 'liste-titre' }, textePixel('ÉLÉMENTS', 2), el('span', { class: 'compte' }, String(s.enceintes.length + murs.length + volumes.length)), ajouter),
    champ, corps, el('p', { class: 'pied' }, 'Cocher : enceinte qui joue. Cliquer : la régler à droite.'));
}

// MARK: Inspecteur (à droite)

const relatif = (lire, o) => () => lire() - o();
function construireInspecteur() {
  liaisons = liaisons.filter((l) => l.e.isConnected && !$('#inspecteur').contains(l.e));
  const I = $('#inspecteur'), s = etat.scene;
  I.innerHTML = '';
  I.append(cartePiece(), carteSelection(),
    carte('Graves (ondes)', "Sous la limite : équation des ondes en 3D sur la carte graphique (WebGPU) : modes de la pièce, interférences, court-circuit acoustique. Au-dessus : rayons (réflexions, absorption, directivité). En automatique, le calcul repart seul après chaque retouche s'il dure moins de 40 s.", ...carteCalcul()),
    carte('Affichage', "Étendue : nombre de décibels entre le haut et le bas de l'échelle des couleurs. Échelle figée : garde le même haut pour comparer des fréquences ou des réglages.",
      nombre('Étendue', () => etat.plage, (v) => reglage('plage', v), { unite: 'dB', mini: 10, maxi: 80, pas: 5, dec: 0 }),
      case_('Échelle figée', () => etat.echelleFixe, (v) => reglage('echelleFixe', v)),
      case_("Animer l'onde", () => etat.animer, (v) => reglage('animer', v)),
      etat.affichage === 'troisD' ? case_('Coupe verticale en 3D', () => etat.coupe3D, (v) => reglage('coupe3D', v)) : null,
      etat.mode === 'global' ? case_('Pondération A', () => etat.ponderationA, (v) => reglage('ponderationA', v)) : null));
  void s;
}

function cartePiece() {
  const s = etat.scene, pl = s.plan;
  const fichier = el('input', { type: 'file', accept: '.json,application/json', hidden: true });
  fichier.addEventListener('change', async () => {
    const f = fichier.files[0]; if (!f) return;
    try { const sc = JSON.parse(await f.text()); if (!sc.enceintes) throw new Error(); etat.scene = sc; etat.selection = null; etat.cadrage++; modifier(() => {}, { recadrer: !!sc.plan }); }
    catch { etat.message = 'Fichier illisible : il faut une scène enregistrée par Acoustique.'; notifier(); }
  });
  const haut = el('div', { class: 'boutons' },
    menu('Modèle', PREREGLAGES.map((p) => [p.id, p.nom]), appliquerModele),
    menu(pl ? 'Forme' : 'Dessiner', (pl || s.contour ? [] : [['boite', 'Partir de cette boîte']]).concat(FORMES_PLAN.map((f) => [f.id, f.nom]), pl ? [['retirer', 'Revenir à une boîte']] : []),
      (v) => (v === 'boite' ? dessinerPlan() : v === 'retirer' ? retirerPlan() : formePlan(v))),
    el('button', { type: 'button', onclick: () => fichier.click(), title: 'Ouvrir une scène enregistrée (.json)' }, 'Ouvrir'),
    el('button', { type: 'button', onclick: enregistrerScene, title: 'Enregistrer la scène (.json)' }, 'Enregistrer'), fichier);
  const nom = el('input', { type: 'text', class: 'nom-scene', 'aria-label': 'Nom de la scène' });
  nom.value = s.nom;
  nom.addEventListener('change', () => modifier((sc) => { sc.nom = nom.value; }));
  const contenu = [haut, lier(nom, () => etat.scene.nom)];
  if (pl) {
    const ai = Math.abs(aire(pl.coins)), v = volumePlan(s);
    contenu.push(
      el('div', { class: 'ligne colonne' }, el('span', { class: 'etiquette' }, 'Grille'),
        segments([[0.05, '5 cm'], [0.1, '10 cm'], [0.25, '25 cm'], [0.5, '50 cm'], [1, '1 m']], () => etat.scene.plan && etat.scene.plan.pas, (x) => modifier((sc) => { sc.plan.pas = x; }), 'petit')),
      nombre('Hauteur sous plafond', () => etat.scene.hauteur, (x) => modifier((sc) => { sc.hauteur = x; borner(sc); }), { mini: 1, maxi: 40, pas: 0.05 }),
      choix('Sol', MATS(), () => etat.scene.faces[4], (x) => modifier((sc) => { sc.faces[4] = x; })),
      choix('Plafond', MATS_TOUS(), () => etat.scene.faces[5], (x) => modifier((sc) => { sc.faces[5] = x; })),
      menu('Tous les murs en…', MATS(), (x) => materiauEnLot(x, true)),
      el('p', { class: 'note' }, `${pl.coins.length} coins · ${ai.toFixed(1)} m² au sol · ${(v ?? ai * s.hauteur).toFixed(1)} m³ d'air`));
  } else {
    contenu.push(
      nombre('Longueur (x)', () => etat.scene.longueur, (x) => modifier((sc) => { sc.longueur = x; borner(sc); }), { mini: 1, maxi: 120, pas: 0.1 }),
      nombre('Largeur (y)', () => etat.scene.largeur, (x) => modifier((sc) => { sc.largeur = x; borner(sc); }), { mini: 1, maxi: 120, pas: 0.1 }),
      nombre('Hauteur (z)', () => etat.scene.hauteur, (x) => modifier((sc) => { sc.hauteur = x; borner(sc); }), { mini: 1, maxi: 40, pas: 0.1 }),
      ...NOMS_COTES.map((n, c) => choix(n, MATS_TOUS(), () => etat.scene.faces[c], (x) => modifier((sc) => { sc.faces[c] = x; }))));
  }
  return carte('Pièce', "Partez d'un modèle, ou dessinez la forme : contour au sol sur la grille, hauteur sous plafond, et un rampant au choix sur chaque mur. « Modifier la forme » (en haut de la vue) fait apparaître les coins et les « + ». Enregistrer garde la scène dans un fichier ; elle est aussi gardée dans ce navigateur.", ...contenu);
}

function carteSelection() {
  const s = etat.scene, id = etat.selection, m = murDuPlan(s, id);
  if (m != null) return carteMur(m);
  const b = s.blocs.find((x) => x.id === id && x.duPlan == null);
  if (b) return carteBloc(b);
  const e = s.enceintes.find((x) => x.id === id);
  if (e) return carteEnceinte(e);
  return carte('Sélection', null, el('p', { class: 'note' }, 'Cliquer un mur, un meuble ou une enceinte, ici à gauche ou dans la vue, pour le régler.'));
}

function carteMur(i) {
  const s = etat.scene, q = coinsPlan(s), n = q.length, m = s.plan.murs[i], H = s.hauteur;
  const avancee = (H - m.pied) / Math.tan(Math.min(Math.max(m.pente, 5), 85) * Math.PI / 180);
  const ecrireMur = (cle) => (v) => modifier((sc) => { sc.plan.murs[i][cle] = v; });
  return carte(`Mur ${i + 1}`, "Un mur à rampant porte un pan de toit qui part du haut de son mur nain ; deux murs opposés font une mansarde, quatre des combles. Glisser le mur dans la vue le pousse ; glisser son rampant en 3D monte ou descend le mur nain.",
    nombre('Longueur', () => { const qq = coinsPlan(etat.scene); return qq.length > 2 ? v2.dist(qq[i], qq[(i + 1) % qq.length]) : 0; }, (v) => {
      modifier((sc) => {
        const p = sc.plan, a = p.coins[i], b = p.coins[(i + 1) % n], l = v2.dist(a, b);
        if (l > 1e-6) p.coins[(i + 1) % n] = [a[0] + (b[0] - a[0]) / l * v, a[1] + (b[1] - a[1]) / l * v].map((x) => Math.round(x * 1000) / 1000);
      });
      finirEditionPlan();
    }, { mini: 0.1, maxi: 120, pas: s.plan.pas }),
    choix('Matériau', MATS(), () => (etat.scene.plan.murs[i] || {}).materiau, ecrireMur('materiau')),
    case_('Rampant au-dessus de ce mur', () => (etat.scene.plan.murs[i] || {}).rampant, ecrireMur('rampant')),
    m.rampant ? nombre('Mur nain', () => (etat.scene.plan.murs[i] || {}).pied, ecrireMur('pied'), { mini: 0, maxi: Math.max(H - 0.1, 0.1), pas: 0.05 }) : null,
    m.rampant ? nombre('Pente', () => (etat.scene.plan.murs[i] || {}).pente, ecrireMur('pente'), { unite: '°', mini: 5, maxi: 85, pas: 1, dec: 0 }) : null,
    m.rampant ? el('p', { class: 'note' }, `Le rampant rejoint le plafond plat (${H.toFixed(2)} m) à ${avancee.toFixed(2)} m du mur.`) : null,
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => ouvrirDansMur(i, false) }, 'Fenêtre dans ce mur'), el('button', { type: 'button', onclick: () => ouvrirDansMur(i, true) }, 'Porte')),
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => insererCoin(i, v2.mul(v2.add(q[i], q[(i + 1) % n]), 0.5)) }, 'Couper en deux'),
      el('button', { type: 'button', class: 'danger', disabled: n <= 3, onclick: () => retirerMur(i) }, 'Retirer ce mur')));
}

function carteBloc(b) {
  const id = b.id, o = () => origine(etat.scene), get = () => etat.scene.blocs.find((x) => x.id === id) || b;
  const ecrire = (cle) => (v) => modifier((sc) => { const x = sc.blocs.find((y) => y.id === id); if (x) x[cle] = v; });
  const f = b.forme;
  return carte(b.nom, "Glisser dans la vue pour le déplacer (il se colle aux murs à moins de 6 cm), ⌘ pour la hauteur, ⌥ pour l'orienter. Les cotes orange donnent sa distance à chaque mur.",
    texte('Nom', () => get().nom, ecrire('nom')),
    choix('Forme', Object.entries(FORMES).filter(([k]) => k !== 'toit').map(([k, v]) => [k, v.nom]), () => get().forme, ecrire('forme')),
    f !== 'ouverture' ? choix('Matériau', MATS(), () => get().materiau, ecrire('materiau')) : null,
    nombre('Centre x', relatif(() => get().x, () => o()[0]), (v) => ecrire('x')(v + o()[0]), { mini: -5, maxi: 200 }),
    nombre('Centre y', relatif(() => get().y, () => o()[1]), (v) => ecrire('y')(v + o()[1]), { mini: -5, maxi: 200 }),
    nombre('Centre z', () => get().z, ecrire('z'), { mini: -5, maxi: 100 }),
    nombre(f === 'cylindre' ? 'Diamètre' : 'Largeur (de face)', () => get().longueur, ecrire('longueur'), { mini: 0.02, maxi: 200 }),
    f !== 'cylindre' ? nombre(f === 'pan' ? 'Avancée du rampant' : 'Profondeur', () => get().profondeur, ecrire('profondeur'), { mini: 0.02, maxi: 200 }) : null,
    nombre(f === 'pan' ? 'Hauteur du rampant' : 'Hauteur', () => get().hauteur, ecrire('hauteur'), { mini: 0.02, maxi: 100 }),
    f !== 'cylindre' ? nombre('Orientation', () => get().azimut, ecrire('azimut'), { unite: '°', mini: -180, maxi: 180, pas: 5, dec: 0 }) : null,
    b.dansParoi && (f === 'boite' || f === 'ouverture') ? case_('Ouverte (le son passe)', () => get().forme === 'ouverture', (v) => modifier((sc) => {
      const x = sc.blocs.find((y) => y.id === id); x.forme = v ? 'ouverture' : 'boite'; x.materiau = v ? 'ouvert' : (x.nom.startsWith('Fenêtre') ? 'vitre' : 'bois');
    })) : null,
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => dupliquer(id) }, 'Dupliquer'), el('button', { type: 'button', class: 'danger', onclick: () => supprimer(id) }, 'Supprimer')));
}

function texte(titre, lire, ecrire) {
  const i = el('input', { type: 'text', 'aria-label': titre });
  i.value = lire();
  i.addEventListener('change', () => ecrire(i.value));
  return el('label', { class: 'ligne' }, el('span', { class: 'etiquette' }, titre), lier(i, lire));
}

const AIDES_GENRE = {
  enceinte: 'Position = centre de la face avant ; la caisse s’étend derrière. Le niveau, le délai, la polarité et le filtre se règlent sans recalcul.',
  caisson: 'Caisson : filtré en passe-bas. Deux caissons décalés d’un quart d’onde (délai + polarité) font un réseau cardioïde.',
  nu: 'Haut-parleur sans caisse : l’avant et l’arrière rayonnent en opposition de phase et s’annulent dans les graves (court-circuit acoustique). Agrandir l’écran repousse la coupure vers le bas.',
  omni: 'Source idéale qui rayonne également dans toutes les directions.',
};

function carteEnceinte(e) {
  const id = e.id, o = () => origine(etat.scene), get = () => etat.scene.enceintes.find((x) => x.id === id) || e;
  const ecrire = (cle) => (v) => modifier((sc) => { const x = sc.enceintes.find((y) => y.id === id); if (x) { x[cle] = v; borner(sc); } });
  const g = e.genre;
  return carte(e.nom, AIDES_GENRE[g],
    texte('Nom', () => get().nom, ecrire('nom')),
    choix('Type', GENRES.map((x) => [x.id, x.nom]), () => get().genre, ecrire('genre')),
    nombre('Position x', relatif(() => get().x, () => o()[0]), (v) => ecrire('x')(v + o()[0]), { mini: -5, maxi: 200 }),
    nombre('Position y', relatif(() => get().y, () => o()[1]), (v) => ecrire('y')(v + o()[1]), { mini: -5, maxi: 200 }),
    nombre('Hauteur z', () => get().z, ecrire('z'), { mini: 0, maxi: 100 }),
    g !== 'omni' ? nombre('Orientation', () => get().azimut, ecrire('azimut'), { unite: '°', mini: -180, maxi: 180, pas: 5, dec: 0 }) : null,
    nombre('Niveau à 1 m', () => get().niveau, ecrire('niveau'), { unite: 'dB', mini: 40, maxi: 140, pas: 1, dec: 1 }),
    nombre('Délai', () => get().delai, ecrire('delai'), { unite: 'ms', mini: 0, maxi: 500, pas: 0.5, dec: 2 }),
    case_('Polarité inversée', () => get().inverse, ecrire('inverse')),
    choix('Filtre', FILTRES.map((x) => [x.id, x.nom]), () => get().filtre, ecrire('filtre')),
    e.filtre !== 'aucun' ? nombre('Coupure', () => get().coupure, ecrire('coupure'), { unite: 'Hz', mini: 20, maxi: 5000, pas: 5, dec: 0 }) : null,
    g === 'enceinte' || g === 'caisson' ? [
      nombre('Largeur caisse', () => get().largeur, ecrire('largeur'), { mini: 0.05, maxi: 2, pas: 0.01 }),
      nombre('Hauteur caisse', () => get().hauteur, ecrire('hauteur'), { mini: 0.05, maxi: 2, pas: 0.01 }),
      nombre('Profondeur caisse', () => get().profondeur, ecrire('profondeur'), { mini: 0.05, maxi: 2, pas: 0.01 })] : null,
    g === 'nu' ? nombre("Côté de l'écran", () => get().baffle, ecrire('baffle'), { mini: 0, maxi: 3, pas: 0.05 }) : null,
    el('div', { class: 'boutons' }, el('button', { type: 'button', onclick: () => dupliquer(id) }, 'Dupliquer'), el('button', { type: 'button', class: 'danger', onclick: () => supprimer(id) }, 'Supprimer')));
}

function carteCalcul() {
  const r = [segments(Object.entries(QUALITES).map(([k, v]) => [k, v.nom]), () => etat.qualite, (v) => reglage('qualite', v))];
  if (etat.webgpu === false) {
    r.push(el('p', { class: 'note alerte' }, "Ce navigateur n'a pas WebGPU : les graves (modes, interférences) ne peuvent pas être calculés ici. Les aigus le sont. Essayez Chrome, Edge ou Safari récents."));
    return r;
  }
  r.push(case_('Recalcul automatique', () => etat.gravesAuto, (v) => reglage('gravesAuto', v)));
  const zone = el('div', { class: 'zone-calcul' });
  liaisons.push({ e: zone, lire: () => { remplirZoneCalcul(zone); return ''; } });
  zone.value = '';
  remplirZoneCalcul(zone);
  r.push(zone);
  return r;
}
function remplirZoneCalcul(z) {
  const etatZone = etat.enCours ? `c${Math.round(etat.progression * 100)}` : `${aRecalculer().length}|${etat.qualite}`;
  if (z.dataset.e === etatZone) return;
  z.dataset.e = etatZone;
  z.innerHTML = '';
  if (etat.enCours) {
    z.append(el('progress', { max: 1, value: etat.progression }), el('p', { class: 'note' }, etat.etape),
      el('button', { type: 'button', onclick: arreterCalcul }, 'Arrêter'));
  } else {
    const n = aRecalculer().length, est = estimation();
    const duree = (s) => (s < 60 ? `${Math.max(1, Math.round(s))} s` : `${Math.round(s / 60)} min`);
    if (n) z.append(el('button', { type: 'button', class: 'principal large', onclick: () => lancerCalcul(false) }, `Calculer jusqu'à ${Math.round(est.fmax)} Hz (≈ ${duree(est.secondes * n)})`));
    else z.append(el('p', { class: 'note' }, `À jour jusqu'à ${Math.round(est.fmax)} Hz`));
  }
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
  if (etat.animer && etat.raster && etat.raster.phaseurs) {
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
    g.addColorStop(0, 'rgb(204,51,38)'); g.addColorStop(0.5, 'rgb(247,245,240)'); g.addColorStop(1, 'rgb(41,84,184)');
    ctx.fillStyle = g; ctx.fillRect(8, y0, 14, h);
    ctx.fillStyle = doux; ctx.fillText('+', 10, y0 - 8); ctx.fillText('−', 10, y0 + h + 12);
    return;
  }
  ctx.fillText('dB SPL', 6, y0 - 12);
  for (let k = 0; k < 64; k++) { const c = turbo(1 - k / 63); ctx.fillStyle = `rgb(${c})`; ctx.fillRect(8, y0 + h * k / 64, 14, h / 64 + 1); }
  const haut = hautEchelle(), plage = etat.plage, pas = plage > 40 ? 10 : plage > 16 ? 5 : 2;
  ctx.fillStyle = doux; ctx.textBaseline = 'middle';
  for (let v = Math.floor(haut / pas) * pas; v >= haut - plage; v -= pas) ctx.fillText(String(v), 26, y0 + h * (haut - v) / plage);
}

function bandeau() {
  const b = $('#bandeau');
  b.innerHTML = '';
  if (etat.message) b.append(el('div', { class: 'message', onclick: () => { etat.message = null; notifier(); } }, etat.message));
  if (etat.enCours) {
    b.append(el('div', { class: 'calcul' }, el('strong', {}, `Calcul des graves en cours… ${Math.round(etat.progression * 100)} %`),
      el('span', {}, "On voit l'impulsion partir de l'enceinte et rebondir sur les murs ; la carte revient à la fin."),
      el('progress', { max: 1, value: etat.progression })));
  }
}

// MARK: Vues

let vue3d = null, vue2d = null, courbe = null;
function montrerVue() {
  const trois = etat.affichage === 'troisD';
  $('#vue3d').hidden = !trois; $('#vue2d').hidden = trois;
  if (trois && vue3d) vue3d.redimensionner();
  if (!trois && vue2d) vue2d.redimensionner();
  majOutilsVue();
}
let cleOutils = '';
function majOutilsVue() {
  const o = $('#outils-vue');
  const k = `${!!etat.scene.plan}|${etat.affichage}|${etat.editionPlan}`;
  if (k === cleOutils) return;
  cleOutils = k;
  o.innerHTML = '';
  if (etat.scene.plan && etat.affichage !== 'coupe') {
    o.append(el('button', { type: 'button', class: etat.editionPlan ? 'actif' : '', 'aria-pressed': etat.editionPlan ? 'true' : 'false',
      onclick: () => { etat.editionPlan = !etat.editionPlan; notifier(); } }, 'Modifier la forme'));
  }
  if (etat.affichage === 'troisD') o.append(el('button', { type: 'button', onclick: () => vue3d && vue3d.recadrer() }, 'Recadrer'));
  $('#aide-vue').textContent = etat.affichage === 'troisD'
    ? (etat.editionPlan && etat.scene.plan ? 'Forme : glisser un poteau = déplacer le coin · clic sur un + = nouveau coin · double-clic sur un poteau = l’ôter · ⌥ = sans grille'
      : 'Glisser : tourner · clic droit ou ⇧ : décaler · molette : zoom · glisser un objet : le déplacer (⌘ hauteur, ⌥ orienter) · clic sur la carte : micro')
    : (etat.editionPlan && etat.scene.plan && etat.affichage === 'plan' ? 'Glisser un coin · clic sur un + : nouveau coin · double-clic sur un coin : l’ôter · glisser un mur : le pousser · ⌥ : sans grille'
      : 'Glisser une enceinte ou un meuble : le déplacer (⌥ : l’orienter) · cliquer ailleurs : placer le micro');
}

function exporterImage() {
  let src;
  if (etat.affichage === 'troisD' && vue3d) {
    vue3d.dessiner();
    src = document.createElement('canvas');
    src.width = vue3d.canvas.width; src.height = vue3d.canvas.height;
    const c = src.getContext('2d'); c.drawImage(vue3d.canvas, 0, 0); c.drawImage(vue3d.calque, 0, 0);
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
  return [etat.selection, !!s.plan, s.plan ? s.plan.coins.length : 0, b ? `${b.forme}${b.dansParoi}` : '', e ? `${e.genre}${e.filtre}` : '',
    m != null ? s.plan.murs[m].rampant : '', etat.affichage, etat.mode, etat.webgpu, etat.scene.contour ? 1 : 0].join('|');
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
  courbe = new Courbe($('#courbe'));
  for (const b of document.querySelectorAll('#choix-courbe button')) b.addEventListener('click', () => { reglage('courbeGraves', b.dataset.v === 'graves'); });
  new ResizeObserver(dessinerLegende).observe($('#legende'));
  montrerVue();
  abonner(() => {
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
    if ((ev.key === 'Backspace' || ev.key === 'Delete') && etat.selection) { supprimer(etat.selection); ev.preventDefault(); }
    if (ev.key === 'Escape') { etat.selection = null; notifier(); }
  });
}

export { estOuvert, EPAISSEUR };
