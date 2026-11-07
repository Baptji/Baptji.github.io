// Simulateur 3D : un événement de pluie sur le site (50 mm en une heure, en accéléré) : les dépressions se remplissent,
// les écoulements s'allument, la vue tourne lentement.
const segment = (cle, v) => document.querySelector(`[data-segment="${cle}"][data-valeur="${v}"]`);
async function preparer() {
  await chargerSite();
  segment('ongletAffichage', 'hydrologie').click();
  await dormir(500);
  segment('vitessePluie', '600')?.click();
  await dormir(300);
  await recadrer3D(35, 80);
  F.camera({ x: 0, y: 44, w: 940, h: 470 });   // fenêtre de 1280 × 560 : la toile 3D presque entière, légende et bilan compris
}
async function scenario() {
  await F.attendre(500);
  document.querySelector('[data-action="pluie"]').click();
  tourner(120, 9800, 0);
  await F.attendre(10000);
}
