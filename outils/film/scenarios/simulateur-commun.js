// Simulateur 3D : le site filmé, la gorge des Vaux de Vire (Calvados) : carrière en eau, versants raides, la Vire.
const F = __film;
const dormir = (ms) => F.dormirReel(ms);   // attentes réelles : réseau et calculs ne suivent pas l'horloge du film
const SITE = [[48.84215, -0.90727], [48.84280, -0.90041], [48.83895, -0.89940], [48.83763, -0.89683],
  [48.83537, -0.89925], [48.83509, -0.90541], [48.83800, -0.90886]];
const CENTRE = [48.83900, -0.90300];
const action = (a) => document.querySelector(`[data-action="${a}"]`);
/// Le point de l'écran (pixels CSS) d'un lieu de la carte.
function ecran([lat, lon]) {
  const m = window.__carte, p = m.latLngToContainerPoint([lat, lon]), r = m.getContainer().getBoundingClientRect();
  return [r.left + p.x, r.top + p.y];
}
async function carteSurLeSite() {
  for (let k = 0; k < 50 && !window.__carte; k++) await dormir(100);
  window.__carte.setView(CENTRE, 16, { animate: false });
  const pas = document.querySelector('[data-choix="pasMNT"], select[data-cle="pasMNT"]');
  if (pas) { pas.value = '1'; pas.dispatchEvent(new Event('change', { bubbles: true })); }
  await dormir(3500);   // les tuiles
}
/// Hors tournage : trace le site, le télécharge, attend la vue 3D et sa photo.
async function chargerSite() {
  await carteSurLeSite();
  action('tracer') && document.querySelector('[data-action="tracer"][data-mode="polygone"]').click();
  await dormir(200);
  for (const p of SITE) window.__carte.fire('click', { latlng: window.L.latLng(p[0], p[1]) });
  await dormir(200);
  action('trace-fermer').click();
  await dormir(400);
  action('charger-zone').click();
  await terrainPret();
}
async function terrainPret() {
  // prêt = vue 3D affichée, plus de voile de calcul ni de téléchargement en cours, et cela depuis 2 s
  let stable = 0;
  for (let k = 0; k < 600 && stable < 10; k++) {
    await dormir(200);
    const v = document.querySelector('#vue3d'), voile = document.querySelector('#voile');
    const panneau = document.querySelector('#panneau')?.innerText || '';
    const pret = v && v.offsetWidth > 0 && (!voile || voile.hidden || getComputedStyle(voile).display === 'none')
      && !document.querySelector('#progres-zone') && !/téléchargement…|Téléchargement/.test(panneau) && /Exutoire/.test(panneau);
    stable = pret ? stable + 1 : 0;
  }
  await dormir(800);
}
/// Pendant que la vue tourne sous un curseur caché, la bulle de lecture (survol) n'a pas lieu d'être.
function sansSurvol(oui) { const l = document.querySelector('#lecture'); if (l) l.style.visibility = oui ? 'hidden' : ''; }
/// Fait tourner la vue 3D : un glisser sur la toile, curseur caché.
async function tourner(dx, ms, dy = 0) {
  const c = document.querySelector('#vue3d').getBoundingClientRect();
  const x0 = c.left + c.width * .5, y0 = c.top + c.height * .5;
  F.cacher(); sansSurvol(true); F.curseur.x = x0; F.curseur.y = y0;
  F.appuyer();
  await F.pendant(ms, (k) => { F.curseur.x = x0 + dx * k; F.curseur.y = y0 + dy * k;
    F.envoyer('pointermove', F.curseur.x, F.curseur.y, F.curseur.capt || F.cible(F.curseur.x, F.curseur.y)); }, (k) => k);
  F.relacher();
}
/// Recule la vue 3D (molette de souris) puis la décale (glissé à deux doigts) pour cadrer le terrain dans le film.
async function recadrer3D(recul = 120, decalageY = 0) {
  const c = document.querySelector('#vue3d'), r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (recul) F.envoyer('wheel', x, y, c, { deltaY: recul, deltaMode: 0 });
  if (decalageY) F.envoyer('wheel', x, y, c, { deltaX: 0, deltaY: decalageY + 0.5, deltaMode: 0 });
  await dormir(300);
}
