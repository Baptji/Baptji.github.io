// L'app de bureau (Windows et Mac) : la même page, ouverte par Neutralino (bureau/) au lieu d'un navigateur.
// Pas de Picture in Picture ici : c'est la fenêtre elle-même qui change de forme. À l'accueil, une fenêtre ordinaire ;
// pendant le minuteur, elle devient la pastille, sans bord et au-dessus de tout, en haut de l'écran ; à la fin, elle
// couvre l'écran entier le temps de l'animation, puis redevient la fenêtre d'accueil.
const N = globalThis.Neutralino;
export const actif = Boolean(N && globalThis.NL_OS);

const ACCUEIL = { largeur: 880, hauteur: 640 };
const PASTILLE = { largeur: 236, hauteur: 52 };

// Selon le système et l'écran, Neutralino compte en pixels physiques ou en pixels de la page : `k` = pixels de la page
// par unité de Neutralino, mesuré une fois sur la fenêtre elle-même (1 partout, 1/1,5 sur un écran Windows à 150 %…).
let k = 0, file = Promise.resolve(), etat = 'choix';

async function mesurer() {
  if (k) return k;
  const t = await N.window.getSize().catch(() => null);
  k = t && t.width ? innerWidth / t.width : 1;
  if (!(k > 0.3 && k < 1.05)) k = 1;
  return k;
}

/// Les changements de forme s'enchaînent dans l'ordre, jamais deux à la fois.
function enchainer(f) {
  file = file.then(f).catch((e) => console.warn('bureau :', e));
  return file;
}

const u = (px) => Math.round(px / k);

/// Fenêtre sans bord de `l` × `h` pixels de la page. La première mesure (fenêtre à bord) n'est qu'approchée :
/// ici, sans bord, la page occupe toute la fenêtre, d'où la vraie valeur de `k`, et un second essai si besoin.
/// On ne mesure qu'une fois la fenêtre vraiment redimensionnée : `k` vaut 1 (Mac, Windows à 100 %) ou 1/échelle
/// de l'écran (Windows à 125, 150, 200 %…) ; toute autre valeur est une mesure prise trop tôt, ignorée.
async function taille(l, h) {
  const avant = innerWidth, w = u(l);
  await N.window.setSize({ width: w, height: u(h), resizable: false });
  if (await redimensionnee(avant)) {
    const vrai = innerWidth / w;
    if (vrai > 0.3 && vrai < 1.05) k = vrai;
  }
  if (Math.abs(l - innerWidth) > 1 || Math.abs(h - innerHeight) > 1) await N.window.setSize({ width: u(l), height: u(h), resizable: false });
}

/// Attend que la largeur de la page quitte `avant` (au plus 0,6 s), puis qu'elle se stabilise.
async function redimensionnee(avant) {
  for (let i = 0; i < 30 && innerWidth === avant; i++) await attendre(20);
  if (innerWidth === avant) return false;
  await attendre(40);
  return true;
}

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

export function init() {
  if (!actif) return;
  document.body.classList.add('bureau');
  N.init();
  N.events.on('windowClose', () => N.app.exit());
  // Après le démarrage seulement : avant, la fenêtre n'a pas encore sa taille.
  N.events.on('ready', () => enchainer(mesurer));
}

export function course() {
  if (!actif) return;
  etat = 'course';
  enchainer(async () => {
    await mesurer();
    await N.window.setBorderless(true);
    await N.window.setAlwaysOnTop(true);
    await taille(PASTILLE.largeur, PASTILLE.hauteur);
    const x = (screen.availLeft || 0) + (screen.availWidth - PASTILLE.largeur) / 2;
    const y = (screen.availTop || 0) + 10;
    await N.window.move(u(x), u(y));
    if (etat !== 'course') return;
    await N.window.setDraggableRegion('pastille', { exclude: [document.querySelector('#pastille .boutons')] }).catch(() => {});
  });
}

export function fin() {
  if (!actif) return;
  etat = 'fin';
  enchainer(async () => {
    await N.window.unsetDraggableRegion('pastille').catch(() => {});
    await N.window.setBorderless(true);
    await N.window.setAlwaysOnTop(true);
    await N.window.move(u(screen.left || 0), u(screen.top || 0));
    await N.window.setSize({ width: u(screen.width), height: u(screen.height), resizable: false });
    if (!new URLSearchParams(location.search).has('auto')) await N.window.focus();
  });
}

export function accueil() {
  if (!actif) return;
  etat = 'choix';
  enchainer(async () => {
    await N.window.unsetDraggableRegion('pastille').catch(() => {});
    await N.window.setAlwaysOnTop(false);
    await N.window.setBorderless(false);
    await N.window.setSize({ width: u(ACCUEIL.largeur), height: u(ACCUEIL.hauteur), resizable: true });
    await N.window.center();
  });
}
