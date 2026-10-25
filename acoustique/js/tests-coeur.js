// Vérifications du cœur de calcul (sans affichage), reprises de l'autotest de l'app Mac.
// S'exécutent dans le navigateur (tests.html) ou dans un moteur JavaScript seul.

import { aire } from './base.js?v=20261025140234';
import { nouvelleScene, nouvelleEnceinte, nouveauBloc, dansSolide, dansContour, polyedre } from './modele.js?v=20261025140234';
import { FORMES_PLAN, appliquerPlan, toit, volumePlan, coinsPlan, EPAISSEUR, aimanterObjet, contacts, nouveauPlan, dessinerPlan, dansLaPiece } from './plan.js?v=20261025140234';
import { PREREGLAGES } from './modeles.js?v=20261025140234';
import { lancerPartie, terminer, energie, direct, directivite, Bandes, NOMBRE_DE_RAYONS } from './rayons.js?v=20261025140234';
import { filtre, amplitude } from './calcul.js?v=20261025140234';

const db = (x) => 20 * Math.log10(Math.max(x, 1e-12));
const rayons = (s, e) => terminer([lancerPartie(s, e, 0, NOMBRE_DE_RAYONS)], s);

export function testsCoeur(verifier, avecRayons = true) {
  const eM = EPAISSEUR;
  // Pièce en L.
  const enL = nouvelleScene({ hauteur: 2.5, enceintes: [nouvelleEnceinte('omni', 1, 1, 1.2)], micro: [4, 1.5] });
  enL.plan = FORMES_PLAN.find((f) => f.id === 'enL').plan()[0];
  appliquerPlan(enL);
  const aireL = Math.abs(aire(enL.plan.coins));
  verifier('pièce dessinée en L : contour, murs, boîte', enL.contour.length === 6 && Math.abs(aireL - 24.25) < 1e-9
    && Math.abs(enL.longueur - (6 + 2 * eM)) < 1e-9 && !dansContour(enL, 5, 5) && dansContour(enL, 1.5, 5),
  `${aireL.toFixed(2)} m², boîte ${enL.longueur.toFixed(2)} × ${enL.largeur.toFixed(2)} m`);
  const vL = volumePlan(enL);
  verifier("pièce en L : volume d'air", Math.abs(vL / (aireL * 2.5) - 1) < 0.03, `${vL.toFixed(1)} m³`);
  // Contour à l'envers.
  const env = nouvelleScene({ hauteur: 2.5 });
  env.plan = nouveauPlan([[0, 0], [0, 4], [5, 4], [5, 0]]);
  env.plan.murs[0].materiau = 'brique';
  appliquerPlan(env);
  const brique = env.blocs.find((b) => b.forme === 'paroi' && b.materiau === 'brique');
  verifier("contour à l'envers : retourné, matériaux gardés", aire(env.plan.coins) > 0 && brique && Math.abs(brique.x - eM / 2) < 1e-6);
  // Mansarde et combles.
  const mans = PREREGLAGES[0].scene();
  verifier('mansarde : sous la pente solide, milieu libre', dansSolide(mans, [2.6 + eM, eM + 0.05, 1.2]) && !dansSolide(mans, [2.6 + eM, 2 + eM, 2.6])
    && !dansSolide(mans, [2.6 + eM, eM + 0.05, 0.9]));
  const comb = nouvelleScene({ hauteur: 2.6 });
  comb.plan = FORMES_PLAN.find((f) => f.id === 'combles').plan()[0];
  appliquerPlan(comb);
  verifier('combles : croupe dans les coins, faîte libre', dansSolide(comb, [eM + 0.3, eM + 0.3, 1.2]) && !dansSolide(comb, [3 + eM, 2.25 + eM, 2.5])
    && comb.blocs.filter((b) => b.forme === 'toit').length === 4);
  // Raccords exacts du toit, des murs et des volumes du calcul.
  const raccords = (s) => {
    const t = toit(s), faces = t.faces();
    const aireF = faces.reduce((a, f) => a + Math.abs(aire(f.points.map((p) => [p[0], p[1]]))), 0);
    let ef = 0, em = 0, faux = 0;
    for (const f of faces) {
      const c = [0, 1, 2].map((k) => f.points.reduce((a, p) => a + p[k], 0) / f.points.length);
      for (const p0 of f.points) {
        const p = [0, 1].map((k) => p0[k] + (c[k] - p0[k]) * 1e-6);
        ef = Math.max(ef, Math.abs(t.hauteur(p)[0] - (p0[2] + (c[2] - p0[2]) * 1e-6)));
      }
    }
    for (const w of t.pans) for (const [a, b] of t.hautDuMur(w.mur)) {
      for (const q of [[a[0] + (b[0] - a[0]) * 1e-6, a[1] + (b[1] - a[1]) * 1e-6], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]]) {
        if (q[0] <= 0.001 || q[0] >= w.longueur - 0.001) continue;
        em = Math.max(em, Math.abs(t.hauteur([w.a[0] + w.t[0] * q[0], w.a[1] + w.t[1] * q[0]])[0] - q[1]));
      }
    }
    for (let x = 0.05; x < s.longueur; x += 0.1) for (let y = 0.05; y < s.largeur; y += 0.1) {
      if (!dansContour(s, x, y)) continue;
      const z = t.hauteur([x, y])[0];
      if (z > 0.1 && dansSolide(s, [x, y, z - 0.02]) && !s.blocs.some((b) => b.duPlan == null && polyedre(b).contient([x, y, z - 0.02]))) faux++;
      if (z < s.hauteur - 0.03 && !dansSolide(s, [x, y, z + 0.02])) faux++;
    }
    return [Math.abs(aireF - Math.abs(aire(coinsPlan(s)))), ef, Math.max(em, faux)];
  };
  const lRamp = JSON.parse(JSON.stringify(enL));
  for (const i of [0, 1, 3]) lRamp.plan.murs[i].rampant = true;
  appliquerPlan(lRamp);
  for (const [nom, s] of [['mansarde', mans], ['combles', comb], ['L à rampants', lRamp]]) {
    const [a, f, m] = raccords(s);
    verifier(`toit sans jour ni débord (${nom})`, a < 1e-6 && f < 1e-6 && m < 1e-6, `aire ${a.toExponential(1)}, faces ${f.toExponential(1)}, murs ${m.toExponential(1)}`);
  }
  // Aimant.
  const aim = PREREGLAGES[0].scene();
  const lit = aim.blocs.find((b) => b.nom === 'Lit');
  const xMur = 5.2 + eM, demi = lit.profondeur / 2;
  lit.x = xMur - demi - 0.03;
  aimanterObjet(aim, lit.id);
  const colle = Math.abs(lit.x - (xMur - demi)) < 1e-6 && contacts(aim, lit.id).length === 1;
  lit.x = xMur - demi + 0.2;
  aimanterObjet(aim, lit.id);
  verifier('aimant contre le mur et arrêt', colle && Math.abs(lit.x - (xMur - demi)) < 1e-6);
  // Filtres et réglages.
  const lp = nouvelleEnceinte('caisson', 1, 1, 1); lp.coupure = 100;
  const hp = Object.assign({}, lp, { filtre: 'passeHaut' });
  const a1 = filtre(lp, 100), a2 = filtre(hp, 100), sm = Math.hypot(a1.re + a2.re, a1.im + a2.im);
  verifier('Linkwitz-Riley : somme plate à la coupure', Math.abs(sm - 1) < 1e-9 && Math.abs(Math.hypot(a1.re, a1.im) - 0.5) < 1e-9);
  const d = nouvelleEnceinte('omni', 1, 1, 1); d.niveau = 0; d.delai = 1;
  const ph = amplitude(d, 250);
  verifier('délai de 1 ms = quart de période à 250 Hz', Math.abs(ph.re) < 1e-9 && Math.abs(ph.im + 1) < 1e-9);
  // Rayons.
  const vide = nouvelleScene({ longueur: 10, largeur: 10, hauteur: 10, faces: Array(6).fill('ouvert') });
  const o5 = nouvelleEnceinte('omni', 5, 5, 5);
  const ec = [1, 2, 4].map((r) => 10 * Math.log10(direct([], o5, [5 + r, 5, 5], directivite(o5, 1000), 0) * r * r));
  verifier('son direct : 1/r²', ec.every((x) => Math.abs(x) < 0.01));
  // Meuble tenu dans la pièce en L : dedans, au mur (touche), en travers du coin rentrant (refusé).
  const q = coinsPlan(enL), o = q.reduce((m, c) => [Math.min(m[0], c[0]), Math.min(m[1], c[1])], [Infinity, Infinity]);
  const boite = (x0, y0, x1, y1) => [[o[0] + x0, o[1] + y0], [o[0] + x1, o[1] + y0], [o[0] + x1, o[1] + y1], [o[0] + x0, o[1] + y1]];
  verifier('meuble dans la pièce : dedans, collé au mur, à cheval sur le coin rentrant',
    dansLaPiece(enL, boite(1, 1, 2, 2)) && dansLaPiece(enL, boite(0, 0, 1, 1)) && !dansLaPiece(enL, boite(2, 2.5, 3, 3.5)) && !dansLaPiece(enL, boite(-0.1, 1, 1, 2)));
  if (!avecRayons) return;
  const sol = Object.assign(JSON.parse(JSON.stringify(vide)), {});
  sol.faces[4] = 'rigide';
  const o1 = nouvelleEnceinte('omni', 3, 5, 1.5);
  const cs = rayons(sol, o1);
  const mesure = energie(cs, [6, 5, 1.5], 1000), theorie = 1 / 18 * Math.pow(10, -Bandes.air(1000) * Math.sqrt(18) / 10);
  verifier('rayons : réflexion du sol', Math.abs(10 * Math.log10(mesure / theorie)) < 1.5, `${mesure.toFixed(4)} contre ${theorie.toFixed(4)}`);
  const piece = nouvelleScene({ longueur: 6, largeur: 5, hauteur: 3, faces: Array(6).fill('beton-peint'), micro: [4, 3] });
  const o2 = nouvelleEnceinte('omni', 1.5, 1.5, 1.2);
  const cp = rayons(piece, o2);
  const al = 0.07, surf = 2 * (30 + 18 + 15), sabine = 16 * Math.PI * (1 - al) / (surf * al);
  const pts = [[4, 3, 1.5], [4.5, 1.5, 2], [3, 4, 1], [5, 4, 2.2]];
  const moy = pts.reduce((a, q) => a + energie(cp, q, 1000), 0) / pts.length;
  verifier('rayons : champ diffus ≈ Sabine', Math.abs(10 * Math.log10(moy / sabine)) < 2, `${(10 * Math.log10(moy)).toFixed(1)} contre ${(10 * Math.log10(sabine)).toFixed(1)} dB`);
  // Un rectangle dessiné vaut la même boîte.
  const rect = nouvelleScene({ longueur: 5, largeur: 4, hauteur: 2.6, faces: Array(6).fill('beton-peint'), enceintes: [nouvelleEnceinte('omni', 1.2, 1.1, 1.2)], micro: [3.6, 2.7] });
  const dess = JSON.parse(JSON.stringify(rect));
  dessinerPlan(dess);
  const cb = rayons(rect, rect.enceintes[0]), cd = rayons(dess, dess.enceintes[0]);
  let eb = 0, ed = 0;
  for (const q of [[3.6, 2.7, 1.4], [4.2, 1.0, 1.0], [2.0, 3.2, 2.0]]) { eb += energie(cb, q, 1000); ed += energie(cd, [q[0] + eM, q[1] + eM, q[2]], 1000); }
  verifier('rayons : rectangle dessiné = boîte', Math.abs(10 * Math.log10(ed / eb)) < 1.5, `${(10 * Math.log10(ed / eb)).toFixed(2)} dB`);
  void db; void nouveauBloc;
}
