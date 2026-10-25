// Travailleur (Web Worker) : lance une part des rayons d'une enceinte, ou termine le champ.

import { lancerPartie, terminer, NOMBRE_DE_RAYONS } from './rayons.js?v=20261025140234';

self.onmessage = (ev) => {
  const m = ev.data;
  if (m.type === 'partie') {
    const acc = lancerPartie(m.scene, m.enceinte, m.debut, m.fin, NOMBRE_DE_RAYONS);
    self.postMessage({ id: m.id, acc }, [acc.buffer]);
  } else if (m.type === 'terminer') {
    const c = terminer(m.parties, m.scene, NOMBRE_DE_RAYONS);
    self.postMessage({ id: m.id, champ: c }, [c.reflechi.buffer, c.solide.buffer]);
  }
};
