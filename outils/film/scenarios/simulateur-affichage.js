// Simulateur 3D : la vue tourne pendant que l'affichage passe de la photo aérienne aux altitudes (dégradé Turbo),
// le relief s'exagère, puis l'indice topographique d'humidité (TWI).
const segment = (cle, v) => document.querySelector(`[data-segment="${cle}"][data-valeur="${v}"]`);
async function preparer() {
  await chargerSite();
  await recadrer3D(35, 80);
  F.camera({ x: 0, y: 44, w: 940, h: 470 });
}
async function scenario() {
  tourner(-150, 11400, 0);
  await F.attendre(2600);
  segment('fond', 'altitudes').click();
  await F.attendre(1400);
  const ex = document.querySelector('[data-curseur="exageration"]');
  ex.step = 'any';
  await F.pendant(1800, (k) => { ex.value = 2 + 2 * k; ex.dispatchEvent(new Event('input', { bubbles: true })); });
  await F.attendre(1300);
  segment('fond', 'twi').click();
  await F.attendre(1700);
  const ex2 = document.querySelector('[data-curseur="exageration"]');
  ex2.step = 'any';
  await F.pendant(1500, (k) => { ex2.value = 4 - 2 * k; ex2.dispatchEvent(new Event('input', { bubbles: true })); });
  segment('fond', 'photo').click();
  await F.attendre(800);
}
