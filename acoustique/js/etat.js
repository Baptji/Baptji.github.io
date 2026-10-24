// État de l'application : la scène, les réglages d'affichage, les calculs en cours.
// Traduction d'Etat.swift. Les vues s'abonnent et se redessinent à chaque changement.

import { copie, nouvelleEnceinte, nouveauBloc, borner, cleEspace, cleGeometrie, genre, FORMES, FORMES_AJOUTABLES, materiau } from './modele.js';
import { appliquerPlan, dessinerPlan as dessinerPlanScene, retirerPlan as retirerPlanScene, FORMES_PLAN, murDuPlan, normalePlan, coinsPlan,
  aimanter, EPAISSEUR, toit, idMur, aimanterObjet } from './plan.js';
import { PREREGLAGES } from './modeles.js';
import { grillePour, calculer, estimation as estimationOndes, moteurOndes } from './ondes.js';
import { raster, courbe, courbesSources, rayonsPour, rayonsDeja, sources, fmaxOndes } from './calcul.js';
import { v2 } from './base.js';

const CLE_STOCKAGE = 'acoustique-scene';

export const etat = {
  scene: null,
  qualite: 'normal', mode: 'frequence', frequence: 63, affichage: 'troisD', coupe3D: false, ponderationA: false,
  solo: null, animer: false, plage: 30, echelleFixe: false, hautFixe: 100, selection: null, editionPlan: false,
  gravesAuto: true, courbeGraves: true, coinActif: null,
  champs: new Map(), raster: null, rasterCoupe: null, courbe: [], courbesSources: [], version: 0,
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

export function demarrer() {
  let s = null;
  try { const t = localStorage.getItem(CLE_STOCKAGE); if (t) s = JSON.parse(t); } catch { s = null; }
  etat.scene = s && s.enceintes ? s : PREREGLAGES[0].scene();
  if (etat.scene.plan) appliquerPlan(etat.scene, false);
  moteurOndes().then((m) => { etat.webgpu = !!m; notifier(); planifierGraves(); });
  recalculerCarte();
  notifier();
}

let minuterieEnregistrer = null;
function enregistrerPlusTard() {
  clearTimeout(minuterieEnregistrer);
  minuterieEnregistrer = setTimeout(() => { try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat.scene)); } catch { /* plein ou interdit */ } }, 600);
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
  if (['qualite', 'mode', 'frequence', 'affichage', 'coupe3D', 'ponderationA', 'solo'].includes(cle)) recalculerCarte();
  if (cle === 'qualite' || cle === 'gravesAuto') planifierGraves();
  if (cle === 'echelleFixe' && valeur && etat.raster) etat.hautFixe = hautEchelle();
  notifier();
}

export function hautEchelle() {
  if (etat.echelleFixe) return etat.hautFixe;
  const r = etat.raster;
  if (!r || !r.bornes) return 100;
  return isFinite(r.bornes[1]) ? Math.ceil(r.bornes[1]) : 100;
}

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
    if (etat.enCours) { minuterieGraves = setTimeout(essai, 200); return; }
    if (!aRecalculer().length) return;
    if (estimation().secondes * aRecalculer().length > 40) return;
    lancerCalcul(true);
  }, 1200);
}

export async function lancerCalcul(auto = false) {
  if (etat.enCours) return;
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
    vue: vue || (etat.affichage === 'coupe' ? 'coupe' : 'plan'), ponderationA: etat.ponderationA, solo: etat.solo };
}

let jeton = 0, minuterieCarte = null;
export function recalculerCarte() {
  clearTimeout(minuterieCarte);
  const mon = ++jeton;
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
    const rc = etat.affichage === 'troisD' && etat.coupe3D ? (() => { const x = raster(entrees('coupe'), champsR); x.bornes = bornesRaster(x); return x; })() : null;
    const p = pointMicro();
    etat.raster = r; etat.rasterCoupe = rc;
    etat.courbe = courbe(E, p, champsR);
    etat.courbesSources = courbesSources(E, p);
    etat.version++;
    notifier();
  }, 120);
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
  etat.scene = p.scene();
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
    const q = coinsPlan(s);
    const c = [q.reduce((a, x) => a + x[0], 0) / q.length, q.reduce((a, x) => a + x[1], 0) / q.length];
    const dedans = (x, y) => s.contour && (function () { let d = false; const k = s.contour; for (let i = 0, j = k.length - 1; i < k.length; j = i++) { if ((k[i][1] > y) !== (k[j][1] > y) && x < (k[j][0] - k[i][0]) * (y - k[i][1]) / (k[j][1] - k[i][1]) + k[i][0]) d = !d; } return d; })();
    if (s.enceintes.length && (!s.enceintes.every((e) => dedans(e.x, e.y)) || !dedans(s.micro[0], s.micro[1]))) {
      s.enceintes[0].x = c[0] - 1; s.enceintes[0].y = c[1]; s.enceintes[0].azimut = 0; s.micro = [c[0] + 0.8, c[1]];
      s.enceintes.forEach((e, i) => { if (i > 0 && !dedans(e.x, e.y)) { e.x = c[0] - 1; e.y = c[1] + 0.6 * i; } });
    }
    s.blocs = s.blocs.filter((b) => b.forme === 'ouverture' || dedans(b.x, b.y));
    s.nom = `Pièce ${f.nom.toLowerCase()}`;
  }, { recadrer: true });
  etat.selection = null; etat.message = null; etat.editionPlan = true; etat.cadrage++;
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
  modifier((s) => { s.plan.coins[i] = q; });
}

export function insererCoin(i, p) {
  const q = versPlan(p, true);
  if (!q) return null;
  modifier((s) => { s.plan.coins.splice(i + 1, 0, q); s.plan.murs.splice(i + 1, 0, Object.assign({}, s.plan.murs[i])); for (const b of s.blocs) b.ancrage = null; });
  return i + 1;
}

export function supprimerCoin(i) {
  if (!etat.scene.plan || etat.scene.plan.coins.length <= 3) return;
  modifier((s) => { s.plan.coins.splice(i, 1); s.plan.murs.splice(i, 1); for (const b of s.blocs) b.ancrage = null; });
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

/// Déplacement d'un objet à la souris : aimant contre les murs.
export function deplacerObjet(id, x, y, z, aimant = true) {
  modifier((s) => {
    const b = s.blocs.find((v) => v.id === id), e = s.enceintes.find((v) => v.id === id);
    const o = b || e;
    if (!o) return;
    if (x != null) o.x = x;
    if (y != null) o.y = y;
    if (z != null) o.z = z;
    if (aimant) aimanterObjet(s, id);
    if (e) borner(s);
  });
}

export { murDuPlan, coinsPlan, normalePlan, toit, idMur, FORMES_AJOUTABLES, materiau };
