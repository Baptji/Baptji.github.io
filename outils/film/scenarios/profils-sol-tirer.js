// Profils de sol : on tire les limites entre horizons, centimètre par centimètre.
async function preparer() {
  await chargerDemo();
  F.camera({ x: 190, y: 150, w: 620, h: 310 });
  const c = document.querySelector('.case[data-horizon]').getBoundingClientRect();
  echelle = c.height / 28;   // pixels par centimètre (le premier horizon fait 28 cm)
}
let echelle = 1;
/// La poignée de la limite n° index (0 = sous le premier horizon) de la fosse fi : son centre à l'écran.
function poignee(fi, index) {
  const s = [...document.querySelectorAll('.case[data-horizon]')];
  const colonnes = [...new Set(s.map((c) => Math.round(c.getBoundingClientRect().left)))].sort((a, b) => a - b);
  const x0 = colonnes[fi];
  const cases = s.filter((c) => Math.round(c.getBoundingClientRect().left) === x0).map((c) => c.getBoundingClientRect()).sort((a, b) => a.top - b.top);
  const r = cases[index];
  return [r.left + r.width * .62, r.bottom];
}
async function tirer(fi, index, cm) {
  const [x, y] = poignee(fi, index);
  await F.aller(x, y, 800);
  F.curseur.forme = 'ns';
  await F.attendre(160);
  await F.glisser(x, y + cm * echelle, 1100);
  await F.attendre(160);
  F.curseur.forme = 'fleche';
}
async function scenario() {
  F.montrer(560, 470);
  await F.attendre(300);
  await tirer(0, 0, 10);    // fosse 1 : LA de 28 à 38 cm
  await tirer(1, 1, 12);    // fosse 2 : Eg de 45 à 57 cm
  await tirer(3, 0, -6);    // fosse 4 : A de 20 à 14 cm
  await tirer(2, 0, 8);     // fosse 3 : A de 35 à 43 cm
  await F.aller(560, 470, 900);
}
