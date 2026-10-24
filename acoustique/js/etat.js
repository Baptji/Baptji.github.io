// État de l'application : la scène, les réglages d'affichage, les calculs en cours.
// Traduction d'Etat.swift. Les vues s'abonnent et se redessinent à chaque changement.

import { copie, nouvelleEnceinte, nouveauBloc, nouvelleScene, borner, cleEspace, cleGeometrie, genre, FORMES, FORMES_AJOUTABLES, materiau } from './modele.js?v=20261024222224';
import { appliquerPlan, dessinerPlan as dessinerPlanScene, retirerPlan as retirerPlanScene, FORMES_PLAN, murDuPlan, normalePlan, coinsPlan,
  aimanter, EPAISSEUR, toit, idMur, aimanterObjet, emprise, dansLaPiece, rectangle, nouveauPlan } from './plan.js?v=20261024222224';
import { PREREGLAGES } from './modeles.js?v=20261024222224';
import { grillePour, calculer, estimation as estimationOndes, moteurOndes } from './ondes.js?v=20261024222224';
import { raster, rasterVolume, courbe, courbesSources, rayonsPour, rayonsDeja, sources, fmaxOndes } from './calcul.js?v=20261024222224';
import { v2 } from './base.js?v=20261024222224';

const CLE_STOCKAGE = 'acoustique-scene', CLE_PRECEDENT = 'acoustique-precedent';

export const etat = {
  scene: null,
  // Graves toujours en finesse « normal » ; calcul seulement sur demande (sauf « Auto » coché).
  qualite: 'normal', mode: 'frequence', frequence: 63, affichage: 'troisD', volume3D: false, ponderationA: false,
  solo: null, animer: false, selection: null, editionPlan: false,
  gravesAuto: false, courbeGraves: true, coinActif: null, reprise: null, seuilVolume: 6, dessin: null, coupeOrientation: 0, hauteursSalle: [1.5, 1.9],
  champs: new Map(), raster: null, rasterCoupe: null, volume: null, placement: null, recherche: null, courbe: [], courbesSources: [], version: 0,
  enCours: false, progression: 0, etape: '', apercu: null, message: null, webgpu: null,
  cadrage: 0, recadrage: { n: 0, dx: 0, dy: 0 },
};

// MARK: Abonnements

const ecouteurs = new Set();
export const abonner = (f) => { ecouteurs.add(f); return () => ecouteurs.delete(f); };
let prevu = false;
export function notifier() {
  if (prevu) return;
  prevu = true;
  requestAnimationFrame(() => { prevu = false; for (const f of ecouteurs) f(etat); });
}

// MARK: Scène

/// Projet vierge : pièce rectangulaire de 5 × 4 m, une source et le micro.
export function projetVierge() {
  const e = nouvelleEnceinte('enceinte', 1.0, 2.0, 1.0, 'Source 1');
  e.niveau = 90;
  const s = nouvelleScene({ nom: 'Nouveau projet', longueur: 5, largeur: 4, hauteur: 2.5, enceintes: [e], ecoute: 1.2, micro: [3.5, 2.0] });
  s.plan = rectangle(5, 4);
  s.plan.pas = 0.1;
  s.typePiece = 'rect';
  appliquerPlan(s);
  return s;
}

/// Une pièce est toujours dessinée (boîte des anciens fichiers → rectangle).
function preparer(s) {
  if (!s.plan && !s.contour) dessinerPlanScene(s);
  if (s.plan) appliquerPlan(s, false);
  if (!s.typePiece) s.typePiece = s.plan && s.plan.coins.length === 4 && !s.plan.murs.some((m) => m.rampant)
    && s.plan.coins.every((c, i, q) => { const d = q[(i + 1) % 4]; return Math.abs(c[0] - d[0]) < 1e-6 || Math.abs(c[1] - d[1]) < 1e-6; }) ? 'rect' : 'perso';
  return s;
}

export function demarrer() {
  // On part toujours d'un projet vierge ; le précédent reste proposé dans un bandeau.
  try {
    const t = localStorage.getItem(CLE_STOCKAGE);
    if (t) { const p = JSON.parse(t); if (p && p.enceintes) { localStorage.setItem(CLE_PRECEDENT, t); etat.reprise = p.nom || 'Projet précédent'; } }
  } catch { /* stockage interdit */ }
  etat.scene = projetVierge();
  moteurOndes().then((m) => { etat.webgpu = !!m; notifier(); planifierGraves(); });
  recalculerCarte();
  notifier();
}

let minuterieEnregistrer = null;
function enregistrerPlusTard() {
  clearTimeout(minuterieEnregistrer);
  minuterieEnregistrer = setTimeout(() => { try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat.scene)); } catch { /* plein ou interdit */ } }, 600);
}

export function nouveauProjet() {
  arreterCalcul();
  etat.scene = projetVierge();
  etat.champs.clear();
  etat.selection = null; etat.solo = null; etat.editionPlan = false; etat.message = null; etat.placement = null; etat.cadrage++;
  enregistrerPlusTard(); recalculerCarte(); notifier();
}

export function ouvrirScene(sc) {
  arreterCalcul();
  etat.scene = preparer(sc);
  etat.selection = null; etat.solo = null; etat.editionPlan = false; etat.reprise = null; etat.placement = null; etat.cadrage++;
  enregistrerPlusTard(); recalculerCarte(); planifierGraves(); notifier();
}

export function reprendre() {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(CLE_PRECEDENT)); } catch { p = null; }
  etat.reprise = null;
  if (p && p.enceintes) ouvrirScene(p); else notifier();
}

/// Modifie la scène : la pièce dessinée suit (murs, rampants, ouvertures), puis carte et graves.
export function modifier(mutation, options = {}) {
  mutation(etat.scene);
  if (etat.scene.plan) appliquerPlan(etat.scene, options.recadrer === true);
  enregistrerPlusTard();
  recalculerCarte();
  planifierGraves();
  notifier();
}

export function reglage(cle, valeur) {
  if (etat[cle] === valeur) return;
  etat[cle] = valeur;
  if (cle === 'frequence') recalculerCarte({ rapide: true });
  else if (['qualite', 'mode', 'affichage', 'volume3D', 'ponderationA', 'solo', 'coupeOrientation'].includes(cle)) recalculerCarte();
  if (cle === 'qualite' || cle === 'gravesAuto') planifierGraves();
  notifier();
}

// MARK: Échelle relative : 0 dB = niveau moyen de la pièce à cette fréquence

/// ±12 dB : au-dessus, couplage trop fort (mode qui gonfle) ; en dessous de −12 dB, annulation.
export const ECHELLE_DB = 12;
/// 0 dB comme le calculateur de modes de Vesa Laasanen (gain « Auto ») : moyenne arithmétique des dB
/// de toutes les cases de la carte (cases d'air seulement).
export function reference(db) {
  let n = 0, m = 0;
  for (const x of db) if (isFinite(x)) { m += x; n++; }
  return n ? m / n : 0;
}
export const zeroDB = (r) => (r && isFinite(r.ref) ? r.ref : 0);
/// Niveau → 0…1 sur l'échelle −12…+12 dB autour du niveau moyen.
export const versEchelle = (v, r) => (v - zeroDB(r) + ECHELLE_DB) / (2 * ECHELLE_DB);
/// Annulation : plus de 12 dB sous le niveau moyen (court-circuit acoustique, interférence destructive).
export const annulation = (v, r) => !isFinite(v) || v - zeroDB(r) < -ECHELLE_DB;

// MARK: Calcul ondulatoire

export const cle = (e) => `${etat.qualite}|${cleEspace(etat.scene, grillePour(etat.scene, etat.qualite).fmax)}|${cleGeometrie(e)}`;
export const aJour = (e) => { const c = etat.champs.get(e.id); return !!c && c.cle === cle(e); };
export const aRecalculer = () => etat.scene.enceintes.filter((e) => e.active && !aJour(e));
export const estimation = () => estimationOndes(etat.scene, etat.qualite);
/// Les graves partiront-ils seuls (calcul automatique assez court) ?
export const gravesAutomatiques = () => etat.gravesAuto && etat.webgpu && estimation().secondes * aRecalculer().length <= 40;

function champsAJour() {
  const r = new Map();
  for (const e of etat.scene.enceintes) { const c = etat.champs.get(e.id); if (c && c.cle === cle(e)) r.set(e.id, c); }
  return r;
}

let annuler = false, clesEnCours = new Set(), calculAuto = false, minuterieGraves = null;

export function planifierGraves() {
  if (!etat.gravesAuto || !etat.webgpu) return;
  clearTimeout(minuterieGraves);
  if (etat.enCours && !aRecalculer().every((e) => clesEnCours.has(cle(e)))) { calculAuto = true; annuler = true; }
  minuterieGraves = setTimeout(async function essai() {
    if (etat.enCours || etat.recherche) { minuterieGraves = setTimeout(essai, 200); return; }
    if (!aRecalculer().length) return;
    if (estimation().secondes * aRecalculer().length > 40) return;
    lancerCalcul(true);
  }, 1200);
}

export async function lancerCalcul(auto = false) {
  if (etat.enCours || etat.recherche) return;
  const liste = aRecalculer();
  if (!liste.length) { if (!auto) { etat.message = 'Tout est déjà à jour.'; notifier(); } return; }
  if (!etat.webgpu) { etat.message = "Ce navigateur n'a pas WebGPU : seuls les aigus (rayons) sont calculés."; notifier(); return; }
  calculAuto = auto; annuler = false;
  etat.enCours = true; etat.progression = 0;
  const s = copie(etat.scene), q = etat.qualite, cles = liste.map(cle);
  clesEnCours = new Set(cles);
  notifier();
  try {
    for (let n = 0; n < liste.length; n++) {
      const e = liste[n];
      etat.etape = `${e.nom} (${n + 1}/${liste.length})`;
      const c = await calculer(s, e, q, cles[n], {
        hauteurApercu: s.ecoute,
        annule: () => annuler,
        progres: (p, a) => { etat.progression = (n + p) / liste.length; if (a) etat.apercu = a; notifier(); },
      });
      if (!c) break;
      etat.champs.set(e.id, c);
    }
  } catch (err) {
    etat.message = err.message || String(err);
  }
  etat.enCours = false; etat.apercu = null; clesEnCours = new Set();
  if (annuler && !calculAuto) etat.message = 'Calcul interrompu.';
  recalculerCarte();
  notifier();
}

export function arreterCalcul() { calculAuto = false; clearTimeout(minuterieGraves); annuler = true; }

// MARK: Carte et courbe

export function entrees(vue) {
  return { scene: etat.scene, champs: champsAJour(), mode: etat.mode, frequence: etat.frequence,
    vue: vue || (etat.affichage === 'coupe' ? 'coupe' : 'plan'), ponderationA: etat.ponderationA, solo: etat.solo, orientation: etat.coupeOrientation };
}

let jeton = 0, minuterieCarte = null;
/// rapide : changement de fréquence seul (curseur) — tout de suite, sans refaire la courbe au micro,
/// qui ne dépend pas de la fréquence choisie.
export function recalculerCarte(options = {}) {
  clearTimeout(minuterieCarte);
  const mon = ++jeton, rapide = !!options.rapide;
  minuterieCarte = setTimeout(async () => {
    const E = entrees();
    const src = sources(E);
    // Rayons d'abord (en parallèle, dans les travailleurs) si une partie de l'affichage en a besoin.
    const champsR = new Map();
    const besoin = !(E.mode === 'frequence' && E.frequence <= fmaxOndes(E)) || true;
    if (besoin) {
      const res = await Promise.all(src.map((e) => rayonsPour(E.scene, e).catch(() => null)));
      if (mon !== jeton) return;
      src.forEach((e, i) => { if (res[i]) champsR.set(e.id, res[i]); });
    }
    const r = raster(E, champsR);
    r.bornes = bornesRaster(r);
    r.ref = reference(r.db);
    const p = pointMicro();
    etat.raster = r;
    // Plan + coupe côte à côte : la coupe aussi, sur le même 0 dB.
    if (etat.affichage === 'deux') { const rc = raster(entrees('coupe'), champsR); rc.ref = r.ref; etat.rasterCoupe = rc; } else etat.rasterCoupe = null;
    if (!rapide || !etat.courbe.length) {
      etat.courbe = courbe(E, p, champsR);
      etat.courbesSources = courbesSources(E, p);
    }
    etat.version++;
    notifier();
    // Volume entier (vue 3D « Volume ») : couche par couche, sans figer la page.
    if (etat.affichage === 'troisD' && etat.volume3D) {
      const v = await rasterVolume(E, champsR, () => mon !== jeton);
      if (!v || mon !== jeton) return;
      v.ref = reference(v.db);
      etat.volume = v;
      etat.version++;
      notifier();
    } else etat.volume = null;
  }, rapide ? 0 : 120);
}

function bornesRaster(r) {
  const v = Array.from(r.db).filter((x) => isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return [Infinity, -Infinity];
  return [v[0], v[Math.min(v.length - 1, Math.floor(v.length * 0.98))]];
}

export const pointMicro = () => [etat.scene.micro[0], etat.scene.micro[1], etat.scene.ecoute];
export { rayonsDeja };

// MARK: Édition

export function appliquerModele(id) {
  const p = PREREGLAGES.find((x) => x.id === id);
  etat.scene = preparer(p.scene());
  etat.selection = null; etat.solo = null; etat.editionPlan = false; etat.cadrage++;
  enregistrerPlusTard(); recalculerCarte(); planifierGraves(); notifier();
}

export function formePlan(id) {
  const f = FORMES_PLAN.find((x) => x.id === id);
  const [p, h] = f.plan();
  modifier((s) => {
    s.blocs = s.blocs.filter((b) => b.duPlan == null);
    for (const b of s.blocs) b.ancrage = null;
    p.decalage = s.plan ? s.plan.decalage.slice() : [0, 0];
    p.pas = s.plan ? s.plan.pas : p.pas;
    s.plan = p; s.hauteur = h;
    appliquerPlan(s, true);
    recaser(s);
    s.typePiece = 'perso';
  }, { recadrer: true });
  etat.selection = null; etat.message = null; etat.editionPlan = true; etat.cadrage++;
  notifier();
}

/// Après un changement de forme : sources et micro ramenés dans la pièce, meubles restés dehors retirés.
function recaser(s) {
  const q = coinsPlan(s);
  const c = [q.reduce((a, x) => a + x[0], 0) / q.length, q.reduce((a, x) => a + x[1], 0) / q.length];
  const dedans = (x, y) => s.contour && (function () { let d = false; const k = s.contour; for (let i = 0, j = k.length - 1; i < k.length; j = i++) { if ((k[i][1] > y) !== (k[j][1] > y) && x < (k[j][0] - k[i][0]) * (y - k[i][1]) / (k[j][1] - k[i][1]) + k[i][0]) d = !d; } return d; })();
  // Point intérieur sûr : le centre s'il est dedans (pas pour un L), sinon le milieu d'un triangle de coins.
  let m = c;
  if (!dedans(m[0], m[1])) for (let i = 0; i < q.length && !dedans(m[0], m[1]); i++) { const a = q[i], b = q[(i + 1) % q.length], d = q[(i + 2) % q.length]; m = [(a[0] + b[0] + d[0]) / 3, (a[1] + b[1] + d[1]) / 3]; }
  if (s.enceintes.length && (!s.enceintes.every((e) => dedans(e.x, e.y)) || !dedans(s.micro[0], s.micro[1]))) {
    s.enceintes.forEach((e, i) => { if (!dedans(e.x, e.y)) { e.x = m[0] - 0.5; e.y = m[1] + 0.4 * i; e.azimut = 0; } });
    if (!dedans(s.micro[0], s.micro[1])) s.micro = [m[0] + 0.5, m[1]];
  }
  s.blocs = s.blocs.filter((b) => b.forme === 'ouverture' || dedans(b.x, b.y));
}

// MARK: Pièce dessinée à la main (clic par clic sur le plan)

/// Polygone sans murs qui se croisent.
function simple(q) {
  const o = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const n = q.length;
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    const a = q[i], b = q[(i + 1) % n], c = q[j], d = q[(j + 1) % n];
    if (o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0) return false;
  }
  return true;
}

export function commencerDessin() {
  etat.dessin = { points: [] };
  etat.selection = null; etat.editionPlan = false; etat.message = null;
  if (etat.affichage !== 'plan' && etat.affichage !== 'deux') reglage('affichage', 'plan');
  notifier();
}
export function annulerDessin() { etat.dessin = null; notifier(); }
/// Ajoute un coin (repère du plan) ; renvoie vrai si la forme vient d'être fermée.
export function pointDessin(q) {
  const d = etat.dessin;
  if (!d) return false;
  const pts = d.points, dernier = pts[pts.length - 1];
  if (dernier && Math.abs(dernier[0] - q[0]) < 1e-6 && Math.abs(dernier[1] - q[1]) < 1e-6) return false;
  if (pts.length >= 3 && Math.abs(pts[0][0] - q[0]) < 1e-6 && Math.abs(pts[0][1] - q[1]) < 1e-6) { terminerDessin(); return true; }
  pts.push(q);
  notifier();
  return false;
}
export function retirerPointDessin() { if (etat.dessin) { etat.dessin.points.pop(); notifier(); } }
/// Ferme la forme : elle devient la pièce (murs en plâtre, hauteur gardée).
export function terminerDessin() {
  const d = etat.dessin;
  if (!d) return;
  if (d.points.length < 3) { etat.message = 'Il faut au moins trois points pour fermer la pièce.'; notifier(); return; }
  const pts = d.points.map((c) => c.slice());
  if (!simple(pts)) { etat.message = 'Les murs se croisent : retirez le dernier point (⌫) ou recommencez.'; notifier(); return; }
  etat.dessin = null;
  modifier((s) => {
    const mat = s.plan && s.plan.murs[0] ? s.plan.murs[0].materiau : 'platre';
    const p = nouveauPlan(pts);
    for (const m of p.murs) m.materiau = mat;
    p.decalage = s.plan ? s.plan.decalage.slice() : [0, 0];
    p.pas = s.plan ? s.plan.pas : 0.1;
    s.blocs = s.blocs.filter((b) => b.duPlan == null);
    for (const b of s.blocs) b.ancrage = null;
    s.plan = p;
    appliquerPlan(s, true);
    recaser(s);
    s.typePiece = 'perso';
  }, { recadrer: true });
  etat.selection = null; etat.editionPlan = true; etat.cadrage++;
  notifier();
}

export function dessinerPlan() { modifier((s) => dessinerPlanScene(s), { recadrer: true }); etat.editionPlan = true; etat.cadrage++; notifier(); }
export function retirerPlan() { modifier((s) => retirerPlanScene(s)); etat.editionPlan = false; etat.selection = null; etat.cadrage++; notifier(); }

/// Point de la scène → repère du plan, aimanté à la grille (sauf `libre`).
export function versPlan(p, libre = false) {
  const pl = etat.scene.plan;
  if (!pl) return null;
  const q = [p[0] - pl.decalage[0], p[1] - pl.decalage[1]];
  return libre ? q.map((v) => Math.round(v * 100) / 100) : q.map((v) => aimanter(pl, v));
}

export function deplacerCoin(i, p, libre = false) {
  const q = versPlan(p, libre), pl = etat.scene.plan;
  if (!q || !pl || !pl.coins[i] || (pl.coins[i][0] === q[0] && pl.coins[i][1] === q[1])) return;
  modifier((s) => {
    // Seul ce point bouge : la pièce devient « personnalisée ».
    s.plan.coins[i] = q;
    s.typePiece = 'perso';
  });
}

// MARK: Coupe dessinée (profil libre par axe)

/// Coupe : déplace un seul point du profil a. Monté au-dessus du plafond, il le relève.
export function deplacerPointProfil(a, i, p, libre = false) {
  const pl = etat.scene.plan, pr = pl && pl.profils && pl.profils[a];
  if (!pr || !pr.points[i]) return;
  const [lo, hi] = pr.cadre;
  let u = p[0] - pl.decalage[a], z = p[1];
  u = libre ? Math.round(u * 100) / 100 : aimanter(pl, u);
  z = libre ? Math.round(z * 100) / 100 : Math.round(z * 20) / 20;
  u = Math.min(Math.max(u, lo), hi); z = Math.min(Math.max(z, 0), 8);
  if (pr.points[i][0] === u && pr.points[i][1] === z) return;
  modifier((s) => {
    const q = s.plan.profils[a];
    if (z > s.hauteur) { q.cadre[2] = z; s.hauteur = z; borner(s); }
    q.points[i] = [u, z];
  });
}
export function insererPointProfil(a, i, p) {
  const pl = etat.scene.plan, pr = pl && pl.profils && pl.profils[a];
  if (!pr) return null;
  const q = [Math.round((p[0] - pl.decalage[a]) * 100) / 100, Math.round(p[1] * 100) / 100];
  modifier((s) => { s.plan.profils[a].points.splice(i + 1, 0, q); });
  return i + 1;
}
export function supprimerPointProfil(a, i) {
  const pl = etat.scene.plan, pr = pl && pl.profils && pl.profils[a];
  if (!pr || pr.points.length <= 3) return;
  modifier((s) => { s.plan.profils[a].points.splice(i, 1); });
}

export function insererCoin(i, p) {
  const q = versPlan(p, true);
  if (!q) return null;
  modifier((s) => { s.plan.coins.splice(i + 1, 0, q); s.plan.murs.splice(i + 1, 0, Object.assign({}, s.plan.murs[i])); for (const b of s.blocs) b.ancrage = null; s.typePiece = 'perso'; });
  return i + 1;
}

export function supprimerCoin(i) {
  if (!etat.scene.plan || etat.scene.plan.coins.length <= 3) return;
  modifier((s) => { s.plan.coins.splice(i, 1); s.plan.murs.splice(i, 1); for (const b of s.blocs) b.ancrage = null; s.typePiece = 'perso'; });
  etat.selection = null;
}

export function retirerMur(i) {
  const pl = etat.scene.plan;
  if (!pl || pl.coins.length <= 3) return;
  modifier((s) => {
    const p = s.plan, j = (i + 1) % p.coins.length;
    p.coins[i] = [aimanter(p, (p.coins[i][0] + p.coins[j][0]) / 2), aimanter(p, (p.coins[i][1] + p.coins[j][1]) / 2)];
    p.coins.splice(j, 1); p.murs.splice(i, 1);
    if (j === 0) p.coins.unshift(p.coins.pop());
    for (const b of s.blocs) b.ancrage = null;
  });
  etat.selection = null;
  finirEditionPlan();
}

/// Pousse le mur i de d m vers l'extérieur, depuis les coins de départ.
export function pousserMur(i, depart, d, libre = false) {
  const pl = etat.scene.plan, nIn = normalePlan(etat.scene, i);
  if (!pl || pl.coins.length !== depart.length || !nIn) return;
  const pas = libre ? 0.01 : pl.pas, dd = pas > 0 ? Math.round(d / pas) * pas : d;
  const j = (i + 1) % depart.length;
  const coins = pl.coins.map((c) => c.slice());
  for (const k of [i, j]) {
    let c = [depart[k][0] - nIn[0] * dd, depart[k][1] - nIn[1] * dd];
    if (!libre && (Math.abs(nIn[0]) < 1e-6 || Math.abs(nIn[1]) < 1e-6)) c = [aimanter(pl, c[0]), aimanter(pl, c[1])];
    coins[k] = c.map((v) => Math.round(v * 1000) / 1000);
  }
  if (JSON.stringify(coins) === JSON.stringify(pl.coins)) return;
  modifier((s) => { s.plan.coins = coins; });
}

/// Fin d'un geste : la boîte de calcul se recale sur le contour, la caméra suit.
export function finirEditionPlan() {
  const pl = etat.scene.plan;
  if (!pl) return;
  const avant = pl.decalage.slice();
  appliquerPlan(etat.scene, true);
  const apres = etat.scene.plan.decalage;
  if (apres[0] !== avant[0] || apres[1] !== avant[1]) etat.recadrage = { n: etat.recadrage.n + 1, dx: apres[0] - avant[0], dy: apres[1] - avant[1] };
  enregistrerPlusTard(); recalculerCarte(); planifierGraves(); notifier();
}

export function ouvrirDansMur(i, porte) {
  const q = coinsPlan(etat.scene), nIn = normalePlan(etat.scene, i);
  if (q.length < 3 || !nIn) return;
  const m = v2.mul(v2.add(q[i], q[(i + 1) % q.length]), 0.5), c = v2.sub(m, v2.mul(nIn, EPAISSEUR / 2));
  const n = etat.scene.blocs.filter((b) => b.nom.startsWith(porte ? 'Porte' : 'Fenêtre')).length + 1;
  const b = nouveauBloc({ nom: `${porte ? 'Porte' : 'Fenêtre'} ${n}`, forme: 'ouverture', x: c[0], y: c[1], z: porte ? 1.02 : Math.min(1.5, etat.scene.hauteur - 0.7),
    longueur: porte ? 0.83 : 1.0, profondeur: EPAISSEUR + 0.03, hauteur: porte ? 2.04 : 1.2, azimut: Math.atan2(nIn[1], nIn[0]) * 180 / Math.PI, materiau: 'ouvert', dansParoi: true });
  modifier((s) => s.blocs.push(b));
  etat.selection = b.id; notifier();
}

export function ajouterEnceinte(g) {
  const s = etat.scene;
  const e = nouvelleEnceinte(g, s.longueur * 0.25, s.largeur * 0.5, g === 'caisson' ? 0.3 : Math.min(1.2, s.hauteur / 2));
  e.nom = `${genre(g).court} ${s.enceintes.length + 1}`;
  modifier((sc) => { sc.enceintes.push(e); borner(sc); });
  etat.selection = e.id; notifier();
}

export function ajouterBloc(forme) {
  const s = etat.scene;
  let b;
  switch (forme) {
    case 'pan': { const p = Math.min(1.6, s.largeur / 3), h = Math.min(1.5, s.hauteur * 0.6);
      b = nouveauBloc({ forme, x: s.longueur / 2, y: p / 2, z: s.hauteur - h / 2, longueur: s.longueur, profondeur: p, hauteur: h, azimut: 90, materiau: 'platre' }); break; }
    case 'cylindre': b = nouveauBloc({ forme, x: s.longueur / 2, y: s.largeur / 2, z: s.hauteur / 2, longueur: 0.35, profondeur: 0.35, hauteur: s.hauteur, materiau: 'beton' }); break;
    case 'ouverture': b = nouveauBloc({ forme, x: s.longueur, y: s.largeur / 2, z: 1.4, longueur: 1.2, profondeur: 0.4, hauteur: 1.2, azimut: 180, materiau: 'ouvert' }); break;
    default: b = nouveauBloc({ forme: 'boite', x: s.longueur / 2, y: s.largeur / 2, z: 0.4, longueur: 1.8, profondeur: 0.9, hauteur: 0.8, materiau: 'bois' });
  }
  b.nom = `${FORMES[forme].court} ${s.blocs.filter((x) => x.forme === forme).length + 1}`;
  modifier((sc) => sc.blocs.push(b));
  etat.selection = b.id; notifier();
}

export function supprimer(id) {
  const i = murDuPlan(etat.scene, id);
  if (i != null) {
    if ((etat.scene.blocs.find((b) => b.id === id) || {}).forme === 'toit') { modifier((s) => { s.plan.murs[i].rampant = false; }); etat.selection = null; }
    return;
  }
  modifier((s) => { s.blocs = s.blocs.filter((b) => b.id !== id); s.enceintes = s.enceintes.filter((e) => e.id !== id); });
  etat.champs.delete(id);
  if (etat.placement && etat.placement.resultats.some((r) => r.positions.some((q) => q.id === id))) etat.placement = null;
  if (etat.solo === id) etat.solo = null;
  if (etat.selection === id) etat.selection = null;
  notifier();
}

export function dupliquer(id) {
  if (murDuPlan(etat.scene, id) != null) return;
  const b = etat.scene.blocs.find((x) => x.id === id);
  if (b) {
    const n = Object.assign(copie(b), { id: crypto.randomUUID(), nom: b.nom + ' (copie)', x: Math.min(b.x + 0.5, etat.scene.longueur), ancrage: null });
    modifier((s) => s.blocs.push(n)); etat.selection = n.id; notifier(); return;
  }
  const e = etat.scene.enceintes.find((x) => x.id === id);
  if (!e) return;
  const n = Object.assign(copie(e), { id: crypto.randomUUID(), nom: e.nom + ' (copie)', y: Math.min(e.y + 1, etat.scene.largeur - 0.1) });
  modifier((s) => s.enceintes.push(n)); etat.selection = n.id; notifier();
}

export function materiauEnLot(id, parois) {
  modifier((s) => {
    if (parois && s.plan) for (const m of s.plan.murs) m.materiau = id;
    for (const b of s.blocs) if (parois ? b.forme === 'paroi' : (b.forme === 'boite' && b.dansParoi !== true)) b.materiau = id;
  });
}

/// Objets tenus dans la pièce : meubles, volumes posés et enceintes (pas les fenêtres ni les portes).
const tenu = (s, id) => { const b = s.blocs.find((v) => v.id === id); return b ? b.duPlan == null && !b.dansParoi && b.forme !== 'ouverture' : s.enceintes.some((e) => e.id === id); };
const dedans = (s, id) => dansLaPiece(s, emprise(s, id) || []);

/// Plus grande part t ∈ [0, 1] du geste qui garde l'objet dans la pièce (poser(t) applique le geste).
function jusquAuMur(s, id, poser) {
  poser(1);
  if (dedans(s, id)) return 1;
  let a = 0, b = 1;
  for (let k = 0; k < 14; k++) { const m = (a + b) / 2; poser(m); if (dedans(s, id)) a = m; else b = m; }
  poser(a);
  return a;
}

/// Déplacement d'un objet à la souris : aimant contre les murs ; dès qu'un coin touche un mur, il s'arrête
/// (et glisse le long du mur pour le reste du geste).
export function deplacerObjet(id, x, y, z, aimant = true) {
  modifier((s) => {
    const b = s.blocs.find((v) => v.id === id), e = s.enceintes.find((v) => v.id === id);
    const o = b || e;
    if (!o) return;
    const garde = tenu(s, id) && dedans(s, id), x0 = o.x, y0 = o.y;
    const x1 = x != null ? x : o.x, y1 = y != null ? y : o.y;
    if (z != null) o.z = z;
    if (garde) {
      const t = jusquAuMur(s, id, (t) => { o.x = x0 + (x1 - x0) * t; o.y = y0 + (y1 - y0) * t; });
      if (t < 1) {
        const xa = o.x, ya = o.y;
        jusquAuMur(s, id, (u) => { o.x = xa + (x1 - xa) * u; });
        jusquAuMur(s, id, (u) => { o.y = ya + (y1 - ya) * u; });
      }
    } else { o.x = x1; o.y = y1; }
    if (aimant) {
      const xa = o.x, ya = o.y;
      aimanterObjet(s, id);
      if (garde && !dedans(s, id)) { o.x = xa; o.y = ya; }
    }
    if (e) borner(s);
  });
}

/// Orientation d'un objet, refusée si elle le ferait sortir de la pièce.
export function tournerObjet(id, azimut) {
  const s = etat.scene, o = s.enceintes.find((x) => x.id === id) || s.blocs.find((x) => x.id === id);
  if (!o || o.azimut === azimut) return;
  const garde = tenu(s, id) && dedans(s, id), az0 = o.azimut;
  o.azimut = azimut;
  const ok = !garde || dedans(s, id);
  o.azimut = az0;
  if (ok) modifier((sc) => { const x = sc.enceintes.find((v) => v.id === id) || sc.blocs.find((v) => v.id === id); x.azimut = azimut; });
}

/// Étire un meuble par une poignée : 'avant'/'arriere' (profondeur), 'gauche'/'droite' (largeur), le côté
/// opposé ne bouge pas ; 'haut' change la hauteur, le dessous reste posé. depart = le meuble au début du geste.
export function etirerBloc(id, poignee, depart, delta) {
  modifier((s) => {
    const b = s.blocs.find((v) => v.id === id);
    if (!b) return;
    const garde = dedans(s, id);
    const a = depart.azimut * Math.PI / 180, av = [Math.cos(a), Math.sin(a)], co = [-Math.sin(a), Math.cos(a)];
    const poser = (t) => {
      const d = delta * t;
      Object.assign(b, { x: depart.x, y: depart.y, z: depart.z, longueur: depart.longueur, profondeur: depart.profondeur, hauteur: depart.hauteur });
      if (poignee === 'haut') {
        const h = Math.min(Math.max(depart.hauteur + d, 0.05), s.hauteur - (depart.z - depart.hauteur / 2));
        b.hauteur = h; b.z = depart.z - depart.hauteur / 2 + h / 2;
        return;
      }
      const prof = poignee === 'avant' || poignee === 'arriere', sg = poignee === 'avant' || poignee === 'gauche' ? 1 : -1;
      const d0 = prof ? depart.profondeur : depart.longueur, n = Math.max(d0 + d, 0.05), dir = prof ? av : co;
      if (prof) b.profondeur = n; else b.longueur = n;
      b.x = depart.x + dir[0] * sg * (n - d0) / 2; b.y = depart.y + dir[1] * sg * (n - d0) / 2;
    };
    if (garde && poignee !== 'haut') jusquAuMur(s, id, poser); else poser(1);
    const exact = Object.assign({}, b);
    for (const k of ['x', 'y', 'z', 'longueur', 'profondeur', 'hauteur']) b[k] = Math.round(b[k] * 1000) / 1000;
    if (garde && !dedans(s, id)) Object.assign(b, exact);   // l'arrondi ne doit pas faire passer le mur
  });
}

/// Pièce rectangulaire : longueur et largeur (le coin bas-gauche reste en place).
export function dimensionsRect(l, w) {
  modifier((s) => {
    const o = s.plan.coins.reduce((m, c) => [Math.min(m[0], c[0]), Math.min(m[1], c[1])], [Infinity, Infinity]);
    s.plan.coins = [[o[0], o[1]], [o[0] + l, o[1]], [o[0] + l, o[1] + w], [o[0], o[1] + w]];
  });
}

/// Rectangulaire ↔ personnalisée (revenir au rectangle prend l'encombrement de la forme).
export function typePiece(t) {
  const s = etat.scene;
  if (s.typePiece === t || !s.plan) return;
  if (t === 'rect') {
    modifier((sc) => {
      const q = sc.plan.coins, lo = q.reduce((m, c) => [Math.min(m[0], c[0]), Math.min(m[1], c[1])], [Infinity, Infinity]),
        hi = q.reduce((m, c) => [Math.max(m[0], c[0]), Math.max(m[1], c[1])], [-Infinity, -Infinity]);
      const mat = sc.plan.murs[0] ? sc.plan.murs[0].materiau : 'platre';
      const p = rectangle(hi[0] - lo[0], hi[1] - lo[1]);
      p.coins = p.coins.map((c) => [c[0] + lo[0], c[1] + lo[1]]);
      for (const m of p.murs) m.materiau = mat;
      p.pas = sc.plan.pas; p.decalage = sc.plan.decalage.slice();
      sc.blocs = sc.blocs.filter((b) => b.duPlan == null);
      for (const b of sc.blocs) b.ancrage = null;
      sc.plan = p; sc.typePiece = 'rect';
    }, { recadrer: true });
    etat.editionPlan = false;
  } else { modifier((sc) => { sc.typePiece = 'perso'; }); etat.editionPlan = true; }
  etat.selection = null; etat.cadrage++;
  notifier();
}

export { murDuPlan, coinsPlan, normalePlan, toit, idMur, FORMES_AJOUTABLES, materiau };
