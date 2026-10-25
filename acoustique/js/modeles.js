// Modèles de départ (les mêmes que l'app Mac).

import { nouvelleScene, nouvelleEnceinte, nouveauBloc } from './modele.js?v=20261025135051';
import { FORMES_PLAN, appliquerPlan } from './plan.js?v=20261025135051';

export const PREREGLAGES = [
  { id: 'mansarde', nom: 'Chambre mansardée', scene() {
    const e = nouvelleEnceinte('enceinte', 0.45, 2.0, 1.0, 'Enceinte'); e.niveau = 92;
    const lit = nouveauBloc({ nom: 'Lit', forme: 'boite', x: 3.9, y: 2.0, z: 0.25, longueur: 1.6, profondeur: 2.0, hauteur: 0.5, azimut: 180, materiau: 'rideau' });
    const fen = nouveauBloc({ nom: 'Fenêtre ouverte', forme: 'ouverture', x: 5.2, y: 2.0, z: 1.6, longueur: 0.9, profondeur: 0.4, hauteur: 1.0, azimut: 180, materiau: 'ouvert' });
    const s = nouvelleScene({ nom: 'Chambre mansardée', longueur: 5.2, largeur: 4.0, hauteur: 2.7, faces: ['platre', 'platre', 'platre', 'platre', 'parquet', 'platre'],
      enceintes: [e], ecoute: 1.1, micro: [3.2, 2.0], blocs: [lit, fen] });
    s.plan = FORMES_PLAN.find((f) => f.id === 'mansarde').plan()[0];
    appliquerPlan(s);
    return s;
  } },
  { id: 'salon', nom: 'Salon avec deux enceintes et un caisson', scene() {
    const g = nouvelleEnceinte('enceinte', 0.5, 1.2, 1.0, 'Gauche'), d = nouvelleEnceinte('enceinte', 0.5, 2.8, 1.0, 'Droite');
    g.azimut = 10; d.azimut = -10; g.niveau = 94; d.niveau = 94;
    g.filtre = 'passeHaut'; d.filtre = 'passeHaut'; g.coupure = 90; d.coupure = 90;
    const c = nouvelleEnceinte('caisson', 0.65, 0.45, 0.25, 'Caisson'); c.niveau = 94;
    return nouvelleScene({ nom: 'Salon', longueur: 5.5, largeur: 4.0, hauteur: 2.5, faces: ['platre', 'vitre', 'platre', 'platre', 'parquet', 'platre'],
      enceintes: [g, d, c], ecoute: 1.1, micro: [3.6, 2.0], blocs: [
        nouveauBloc({ nom: 'Canapé', x: 4.6, y: 2.0, z: 0.42, longueur: 2.2, profondeur: 0.95, hauteur: 0.84, azimut: 180, materiau: 'rideau' }),
        nouveauBloc({ nom: 'Table basse', x: 3.3, y: 2.0, z: 0.22, longueur: 1.1, profondeur: 0.6, hauteur: 0.44, materiau: 'bois' })] });
  } },
  { id: 'studio', nom: 'Pièce nue en béton', scene() {
    const e = nouvelleEnceinte('enceinte', 0.6, 1.5, 1.2, 'Enceinte'); e.niveau = 94;
    return nouvelleScene({ nom: 'Pièce en béton', longueur: 4.2, largeur: 3.4, hauteur: 2.6,
      faces: ['beton-peint', 'beton-peint', 'beton-peint', 'beton-peint', 'carrelage', 'beton-peint'], enceintes: [e], ecoute: 1.2, micro: [3.0, 2.0] });
  } },
  { id: 'salle', nom: 'Salle des fêtes, sono de soirée', scene() {
    const g = nouvelleEnceinte('enceinte', 0.8, 2.5, 2.2, 'Façade gauche'), d = nouvelleEnceinte('enceinte', 0.8, 9.5, 2.2, 'Façade droite');
    for (const x of [g, d]) Object.assign(x, { largeur: 0.40, hauteur: 0.65, profondeur: 0.40, niveau: 112, filtre: 'passeHaut', coupure: 100 });
    g.azimut = 8; d.azimut = -8;
    const s1 = nouvelleEnceinte('caisson', 0.7, 5.0, 0.35, 'Caisson 1'), s2 = nouvelleEnceinte('caisson', 0.7, 7.0, 0.35, 'Caisson 2');
    for (const x of [s1, s2]) Object.assign(x, { niveau: 112, coupure: 100 });
    return nouvelleScene({ nom: 'Salle des fêtes', longueur: 20, largeur: 12, hauteur: 6, faces: ['platre', 'beton-peint', 'vitre', 'beton-peint', 'public', 'faux-plafond'],
      enceintes: [g, d, s1, s2], ecoute: 1.6, micro: [10, 6] });
  } },
  { id: 'rue', nom: 'Rue entre deux façades', scene() {
    const e = nouvelleEnceinte('enceinte', 8, 2.0, 2.0, 'Sono');
    Object.assign(e, { largeur: 0.40, hauteur: 0.65, profondeur: 0.40, niveau: 110, azimut: 20 });
    return nouvelleScene({ nom: 'Rue', longueur: 36, largeur: 9, hauteur: 12, faces: ['ouvert', 'ouvert', 'facade', 'facade', 'bitume', 'ouvert'],
      enceintes: [e], ecoute: 1.6, micro: [22, 5] });
  } },
  { id: 'cour', nom: 'Cour fermée à ciel ouvert', scene() {
    const e = nouvelleEnceinte('enceinte', 1.5, 7, 1.8, 'Sono'); e.niveau = 105;
    return nouvelleScene({ nom: 'Cour', longueur: 18, largeur: 14, hauteur: 10, faces: ['facade', 'facade', 'brique', 'facade', 'paves', 'ouvert'],
      enceintes: [e], ecoute: 1.6, micro: [12, 7] });
  } },
  { id: 'pleinAir', nom: 'Plein air sur pelouse', scene() {
    const g = nouvelleEnceinte('enceinte', 3, 9, 2.5, 'Gauche'), d = nouvelleEnceinte('enceinte', 3, 15, 2.5, 'Droite');
    g.niveau = 110; d.niveau = 110;
    return nouvelleScene({ nom: 'Plein air', longueur: 30, largeur: 24, hauteur: 8, faces: ['ouvert', 'ouvert', 'ouvert', 'ouvert', 'pelouse', 'ouvert'],
      enceintes: [g, d], ecoute: 1.6, micro: [18, 12] });
  } },
  { id: 'courtCircuit', nom: 'Court-circuit acoustique (sans parois)', scene() {
    const nu = nouvelleEnceinte('nu', 2.0, 1.5, 1.5, 'Haut-parleur nu'); nu.niveau = 90;
    const cl = nouvelleEnceinte('enceinte', 2.0, 4.5, 1.5, 'Même haut-parleur en caisse'); cl.niveau = 90; cl.active = false;
    return nouvelleScene({ nom: 'Court-circuit acoustique', longueur: 7, largeur: 6, hauteur: 3, faces: Array(6).fill('ouvert'),
      enceintes: [nu, cl], ecoute: 1.5, micro: [3.0, 3.0] });
  } },
];
