// Profils de sol : le schéma de démonstration (une toposéquence de quatre fosses), ouvert comme un fichier lâché sur la page.
const F = __film;
let M = null;
async function chargerDemo(retouche = () => {}) {
  const v = document.querySelector('script[type=module]').textContent.match(/\?v=(\d+)/)[1];
  M = await import(`./js/modele.js?v=${v}`);
  const hz = (nom, libelle, epaisseur, munsell, o = {}) => {
    const p = M.trouverMunsell(munsell);
    return M.horizon({ nom, libelle, epaisseur, couleur: p.hex, munsell: p.notation, ...o });
  };
  const fosse = (n, sousTitre, horizons, o = {}) => M.fosse({ nom: `Fosse ${n}`, sousTitre, horizons, ...o });
  const s = M.schema({ titre: 'Toposéquence du bois des Noues', sousTitre: 'Profil schématique 0–120 cm', profondeur: 120 });
  s.fosses = [
    fosse(1, 'Plateau', [hz('H1', 'LA', 28, '10YR 4/3'), hz('H2', 'E', 17, '10YR 6/4'), hz('H3', 'BT', 50, '7.5YR 5/6'), hz('H4', 'C', 25, '10YR 6/6')]),
    fosse(2, 'Haut de versant', [hz('H1', 'LA', 25, '10YR 4/3'), hz('H2', 'Eg', 20, '10YR 6/3'), hz('H3', 'BTg', 55, '7.5YR 5/6'), hz('H4', 'C', 20, '10YR 6/6')]),
    fosse(3, 'Bas de versant', [hz('H1', 'A', 35, '10YR 3/3'), hz('H2', 'S', 45, '10YR 5/4'), hz('H3', 'C', 40, '2.5Y 6/4')]),
    fosse(4, 'Fond de vallon', [hz('H1', 'A', 20, '10YR 3/2'), hz('H2', 'g', 40, '2.5Y 5/2'), hz('H3', 'Gr', 60, '5GY 6/1')]),
  ];
  const [f1, f2, f3, f4] = s.fosses;
  f2.taches = [M.tache({ horizon: f2.horizons[1].id, abondance: 5, gris: 25, forme: 'tachete' })];
  f3.elementsGrossiers = [M.elementGrossier({ horizon: f3.horizons[2].id, abondance: 15, taille: 'cailloux' })];
  f4.taches = [M.tache({ horizon: f4.horizons[1].id, abondance: 40, gris: 50, forme: 'concentrique' })];
  retouche(s, M);
  const dt = new DataTransfer();
  dt.items.add(new File([JSON.stringify(s)], 'demo.json', { type: 'application/json' }));
  document.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 500));
}
