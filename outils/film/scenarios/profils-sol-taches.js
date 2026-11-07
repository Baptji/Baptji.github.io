// Profils de sol : des taches d'hydromorphie dans un horizon (abondance, forme), puis la nappe.
// Écran partagé : le schéma à gauche, le panneau de réglages à droite (fenêtre haute, rien ne défile).
const G = { x: 199, y: 290, w: 300, h: 300 };               // la fosse 2, horizon BTg
const R0 = { x: 800, y: 40, w: 300, h: 300 }, R1 = { x: 800, y: 1236, w: 300, h: 300 }, R2 = { x: 800, y: 300, w: 300, h: 300 };
async function preparer() {
  await chargerDemo((s) => { delete s.fosses[1].taches; });
  F.camera([G, R0]);
}
const insp = () => document.querySelector('#inspecteur');
const bouton = (texte) => [...insp().querySelectorAll('button')].filter((b) => b.textContent.trim().startsWith(texte)).pop();
async function curseur(input, de, a, ms) {
  const r = input.getBoundingClientRect(), y = r.top + r.height / 2, x = (v) => r.left + 9 + (r.width - 18) * v / 100;
  await F.aller(x(de), y, 750);
  F.appuyer();
  await F.pendant(ms, (k) => {
    const v = Math.round(de + (a - de) * k);
    F.curseur.x = x(de + (a - de) * k);
    if (+input.value !== v) { input.value = v; input.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  F.relacher();
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
async function scenario() {
  F.montrer(440, 560);
  await F.attendre(300);
  await F.cliquer(document.querySelectorAll('.case[data-horizon]')[6], { fx: .55, fy: .5 }, 750);   // fosse 2, BTg
  await F.attendre(200);
  F.camera([G, R1], 1000);
  await F.attendre(500);
  await F.cliquer(bouton('Ajouter dans cet horizon'), null, 700);
  await F.attendre(450);
  const carte = [...insp().querySelectorAll('.carte')].pop();
  await curseur(carte.querySelector('input[type=range]'), 5, 40, 1300);
  await F.attendre(350);
  await F.cliquer([...insp().querySelectorAll('.carte')].pop().querySelectorAll('.segmente button')[1], null, 650);   // concentriques
  await F.attendre(900);
  F.camera([G, R2], 1000);
  await F.attendre(300);
  const nappe = insp().querySelector('input.nombre');
  await F.cliquer(nappe, null, 800);
  await F.taper(nappe, '70', 140);
  await F.attendre(200);
  F.touche('Enter', nappe);
  nappe.blur();
  await F.aller(440, 560, 900);
  await F.attendre(600);
}
