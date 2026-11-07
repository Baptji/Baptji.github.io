// Simulateur 3D : tracer le site en polygone sur la carte de l'IGN, le charger, et le voir en 3D.
async function preparer() {
  await carteSurLeSite();
  document.querySelector('[data-action="tracer"][data-mode="polygone"]').click();
  await dormir(300);
  F.camera({ x: 0, y: 44, w: 1280, h: 640 });
}
async function scenario() {
  const pts = SITE.map(ecran);
  F.montrer(pts[0][0] - 120, pts[0][1] + 160);
  await F.attendre(300);
  for (const [x, y] of pts) { await F.aller(x, y, 520); await F.cliquer(); }
  await F.aller(pts[0][0], pts[0][1], 600);    // retour au premier sommet : le polygone se ferme
  await F.cliquer();
  await F.attendre(400);
  await F.cliquer(document.querySelector('[data-action="charger-zone"]'), null, 900);
  await F.attendre(1300);                         // le site miroite pendant le téléchargement
  F.pause = true;                                 // l'attente n'est pas filmée
  await terrainPret();
  F.pause = false;
  await F.attendre(400);
  await tourner(-170, 4200, 10);
  await F.attendre(300);
}
