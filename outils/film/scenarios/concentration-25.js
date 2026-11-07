// Concentration : choisir 25 minutes, le compte à rebours file (avance rapide), la fin, retour au choix.
const F = __film;
async function preparer() {
  // le minuteur se rafraîchit sur les tics d'un worker (temps réel) : ici, à chaque image
  F.camera({ x: 120, y: 60, w: 760, h: 380 });
  F.chaqueImage.push(() => F.workers.forEach((w) => w.onmessage && w.onmessage(new MessageEvent('message', { data: 0 }))));
}
function survol(el, oui) { const b = el && el.querySelector('.boutons'); if (b) b.style.opacity = oui ? '1' : ''; }
async function scenario() {
  F.montrer(800, 420);
  await F.attendre(400);
  await F.aller('.duree[data-minutes="25"]', null, 900);
  await F.attendre(150);
  F.appuyer(); document.querySelector('.duree[data-minutes="25"]').style.transform = 'scale(.96)';
  await F.attendre(110); F.relacher();
  const p = document.querySelector('#course .pastille');
  F.aller(F.curseur.x + 230, F.curseur.y + 200, 900).then(F.cacher);   // le curseur s'écarte
  F.camera({ x: 260, y: 130, w: 480, h: 240 }, 1100);                     // la caméra s'approche de la pastille
  await F.attendre(500);
  // avance rapide : 25 minutes en 5,5 secondes, qui ralentit à l'approche de la fin
  const total = 25 * 60 * 1000 - 1600;
  await F.pendant(5500, (k) => { F.avance = total * k; });
  F.camera({ x: 120, y: 60, w: 760, h: 380 }, 1500);   // et recule pour la fin
  await F.attendre(1900);   // 0:01, 0:00 → la fin
  await F.attendre(2600);   // les ondes
  F.montrer(700, 400);
  await F.cliquer(600, 330, 650);   // un clic ferme la fin : retour au choix (la boucle reprend au début)
  await F.aller(800, 420, 900);
}
