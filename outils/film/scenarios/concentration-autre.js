// Concentration : une autre durée au curseur, lancer, mettre en pause, reprendre, arrêter.
const F = __film;
async function preparer() {
  F.camera({ x: 120, y: 60, w: 760, h: 380 });
  F.chaqueImage.push(() => F.workers.forEach((w) => w.onmessage && w.onmessage(new MessageEvent('message', { data: 0 }))));
}
function x(v) {   // abscisse du bouton du curseur pour la valeur v (1 à 120)
  const r = document.querySelector('#curseur').getBoundingClientRect(), b = 11;
  return r.left + b + (r.width - 2 * b) * (v - 1) / 119;
}
async function scenario() {
  const c = document.querySelector('#curseur'), r = c.getBoundingClientRect(), y = r.top + r.height / 2;
  F.montrer(x(20) + 120, y + 150);
  await F.attendre(400);
  await F.aller(x(20), y, 800);
  await F.attendre(120);
  F.appuyer();
  await F.pendant(1500, (k) => {
    const v = Math.round(20 + 70 * k);
    F.curseur.x = x(20 + 70 * k);
    if (+c.value !== v) { c.value = v; c.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  F.relacher();
  await F.attendre(250);
  await F.cliquer('#lancer', null, 650);
  F.camera({ x: 260, y: 130, w: 480, h: 240 }, 1000);
  await F.attendre(250);
  const p = document.querySelector('#course .pastille');
  const boutons = p.querySelector('.boutons');
  await F.aller(p.querySelector('.basculer'), null, 900);
  boutons.style.opacity = '1';
  await F.attendre(250);
  await F.cliquer();                 // pause
  await F.attendre(1400);
  await F.cliquer();                 // reprise
  await F.attendre(1200);
  await F.cliquer(p.querySelector('.arreter'), null, 450);   // arrêter : retour au choix
  F.camera({ x: 120, y: 60, w: 760, h: 380 }, 900);
  await F.attendre(300);
  await F.aller(x(90) + 140, y + 150, 900);
}
