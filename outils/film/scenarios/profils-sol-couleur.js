// Profils de sol : un horizon encore sans couleur prend la sienne dans le livret Munsell, puis reçoit un commentaire
// tapé directement sur le schéma. Fenêtre haute (1100 × 1300) : rien ne défile, seule la caméra se déplace.
const A = { x: 220, y: 190, w: 660, h: 330 };   // les fosses 2 à 4
const B = { x: 540, y: 772, w: 560, h: 280 };   // le livret Munsell, dans le panneau de droite
async function preparer() {
  await chargerDemo((s, M) => { const h = s.fosses[2].horizons[1]; h.couleur = M.teintes[2].hex; delete h.munsell; });
  F.camera(A);
}
const bouton = (texte) => [...document.querySelectorAll('#inspecteur button')].find((b) => b.textContent.trim() === texte);
async function scenario() {
  F.montrer(800, 480);
  await F.attendre(300);
  const S = document.querySelectorAll('.case[data-horizon]')[9];
  await F.cliquer(S, { fx: .5, fy: .62 }, 800);
  await F.attendre(150);
  F.camera(B, 1100);
  await F.attendre(250);
  await F.cliquer(bouton('Munsell'), null, 850);
  await F.attendre(300);
  const puce = document.querySelector('#inspecteur .grille button[title="10YR 5/6"]');
  await F.cliquer(puce, null, 800);
  await F.attendre(500);
  F.camera(A, 1200);
  await F.aller(800, 480, 1000);
  await F.attendre(500);
  const champ = [...document.querySelectorAll('.case[data-horizon]')[9].querySelectorAll('input')].find((i) => i.placeholder === 'commentaire');
  await F.cliquer(champ, null, 700);
  await F.taper(champ, 'colluvions', 85);
  await F.attendre(300);
  await F.aller(800, 480, 800);
  await F.attendre(400);
}
