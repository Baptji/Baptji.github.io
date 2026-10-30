// L'enchaînement : choix → pastille → fin → choix (Application.swift, Pastille.swift, Final.swift).
// Ce qui change par rapport au Mac : la pastille « au-dessus de tout » devient une fenêtre flottante
// (Picture in Picture : celle de document sous Chrome et Edge, celle de vidéo sous Safari), et la cloche
// est programmée dès le départ dans l'horloge audio, pour sonner à l'heure même si l'onglet est en arrière-plan.
import { Minuteur, texte, libelle, libelleCurseur } from './modele.js?v=20261030094611';

const $ = (s, r = document) => r.querySelector(s);
const choix = $('#choix'), course = $('#course'), fin = $('#fin');
const curseur = $('#curseur'), valeur = $('#valeur');
const TITRE = 'Concentration';
/// Secondes avant l'effacement automatique de la fin (Final.dureeAffichage).
const DUREE_FIN = 8;
/// Pour les essais : ?essai=3 fait durer tout minuteur 3 secondes.
const ESSAI = Number(new URLSearchParams(location.search).get('essai')) || 0;

let minuteur = null, libelleFin = '', finOuverte = false, minuterieFin = 0;

// ——— tic ———
// Un onglet en arrière-plan ralentit ses minuteries (jusqu'à une par minute sous Chrome) ; celles d'un worker,
// non. Il ne tourne que pendant un compte à rebours.
const tic = new Worker(URL.createObjectURL(new Blob(
  ['let t; onmessage = (e) => { clearInterval(t); if (e.data) t = setInterval(() => postMessage(0), e.data); };'],
  { type: 'text/javascript' })));
tic.onmessage = rafraichir;

// ——— écran de choix ———
for (const b of document.querySelectorAll('.duree')) {
  const m = Number(b.dataset.minutes);
  b.title = `Se concentrer pendant ${m} minutes`;
  b.addEventListener('click', () => demarrer(m));
}
curseur.addEventListener('input', () => { valeur.textContent = libelleCurseur(Number(curseur.value)); });
$('#lancer').addEventListener('click', () => demarrer(Number(curseur.value)));

// ——— pastilles : celle de la page, et celle de la fenêtre flottante quand elle existe ———
function creerPastille() {
  const p = $('#modele-pastille').content.firstElementChild.cloneNode(true);
  $('.basculer', p).addEventListener('click', basculerPause);
  $('.arreter', p).addEventListener('click', arreter);
  return p;
}
const pastilles = new Set();

function rafraichir() {
  if (!minuteur) return;
  if (minuteur.termine) { terminer(); return; }
  const t = texte(minuteur.restant()), p = minuteur.progression(), pause = minuteur.enPause;
  for (const el of pastilles) {
    $('.temps', el).textContent = t;
    const plein = $('.plein', el);
    plein.style.strokeDasharray = `${p} 1`;
    plein.style.opacity = p > 0 ? 1 : 0;
    el.classList.toggle('en-pause', pause);
    const b = $('.basculer', el), aide = pause ? 'Reprendre' : 'Mettre en pause';
    b.title = aide; b.setAttribute('aria-label', aide);
  }
  document.title = `${t} · ${TITRE}`;
  dessinerToile(t, p, pause);
}

// ——— déroulement ———
function demarrer(minutes) {
  // Tout ce qui demande un geste de l'utilisateur se fait ici, dans le clic : le son et la fenêtre flottante.
  preparerSon();
  minuteur = new Minuteur(ESSAI || minutes * 60);
  libelleFin = libelle(minutes);
  choix.hidden = true;
  course.hidden = false;
  course.replaceChildren();
  const p = creerPastille();
  course.append(p);
  pastilles.add(p);
  ouvrirFlottant();
  rafraichir();
  programmerCloche();
  tic.postMessage(200);
}

function basculerPause() {
  if (!minuteur) return;
  minuteur.basculerPause();
  if (minuteur.enPause) annulerCloche(); else programmerCloche();
  if (video && !minuteur.enPause && video.paused) video.play().catch(() => {});
  rafraichir();
}

/// Arrêt demandé : pas d'animation, retour au choix.
function arreter() {
  arreterCompte();
  annulerCloche();
  fermerFlottant();
  afficherChoix();
}

function arreterCompte() {
  minuteur = null;
  tic.postMessage(0);
  pastilles.clear();
  course.replaceChildren();
  course.hidden = true;
}

function afficherChoix() {
  document.title = TITRE;
  choix.hidden = false;
}

/// Fin naturelle : la pastille s'efface, la fin prend tout l'écran (et la fenêtre flottante).
function terminer() {
  arreterCompte();
  sonnerSiPasEncore();
  document.title = `C'est terminé · ${TITRE}`;
  $('.detail', fin).textContent = `${libelleFin} de concentration. Prenez une pause.`;
  fin.classList.remove('sortie');
  fin.hidden = false;
  finOuverte = true;
  finFlottante();
  // Les 8 secondes ne courent que sous les yeux : si l'onglet est caché, la fin attend qu'on y revienne.
  compterFin();
}

function compterFin() {
  clearTimeout(minuterieFin);
  if (document.visibilityState === 'visible') minuterieFin = setTimeout(fermerFin, DUREE_FIN * 1000);
}
document.addEventListener('visibilitychange', () => { if (finOuverte) compterFin(); });

function fermerFin() {
  if (!finOuverte) return;
  finOuverte = false;
  clearTimeout(minuterieFin);
  eteindreCloche();
  fermerFlottant();
  fin.classList.add('sortie');
  setTimeout(() => { fin.hidden = true; fin.classList.remove('sortie'); }, 450);
  afficherChoix();
}
fin.addEventListener('click', fermerFin);
document.addEventListener('keydown', (e) => {
  if (finOuverte && !e.metaKey && !e.ctrlKey) { e.preventDefault(); fermerFin(); }
});

// ——— la cloche ———
// Un bourdon de 5 s (Ressources/cloches/clocher-profond.wav de l'app Mac). Il est programmé dans l'horloge audio
// au démarrage : il sonne à l'heure même si l'onglet dort ; la pause le déprogramme, la reprise le reprogramme.
const donneesCloche = fetch('cloche.mp3').then((r) => r.arrayBuffer()).catch(() => null);
let audio = null, tampon = null, source = null, gain = null, heureCloche = 0;

function preparerSon() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!audio) {
    audio = new AC();
    donneesCloche.then((d) => d && audio.decodeAudioData(d)).then((t) => {
      if (!t) return;
      tampon = t;
      programmerCloche();
    }).catch(() => {});
  }
  audio.resume().catch(() => {});
}

function jouerCloche(quand) {
  annulerCloche();
  if (!audio || !tampon) return;
  source = audio.createBufferSource();
  gain = audio.createGain();
  source.buffer = tampon;
  source.connect(gain).connect(audio.destination);
  heureCloche = Math.max(audio.currentTime, quand);
  source.start(heureCloche);
}

function programmerCloche() {
  if (!audio || !minuteur || minuteur.enPause) return;
  jouerCloche(audio.currentTime + minuteur.restant());
}

function annulerCloche() {
  if (!source) return;
  try { source.stop(); } catch {}
  source.disconnect();
  source = null;
}

/// À la fin : si la cloche programmée n'a pas encore sonné (horloge audio en retard après une mise en veille), tout de suite.
function sonnerSiPasEncore() {
  if (!audio) return;
  audio.resume().catch(() => {});
  if (!source || audio.currentTime < heureCloche - 0.25) jouerCloche(audio.currentTime);
}

/// Fermeture anticipée : la cloche s'éteint en fondu plutôt que net.
function eteindreCloche() {
  if (!source) return;
  const s = source;
  gain.gain.setTargetAtTime(0, audio.currentTime, 0.08);
  setTimeout(() => { try { s.stop(); } catch {} s.disconnect(); }, 500);
  source = null;
}

// ——— la fenêtre flottante ———
// Chrome et Edge : une vraie petite fenêtre HTML (Document Picture-in-Picture) qui reçoit sa propre pastille.
// Safari : la pastille est dessinée dans une toile filmée par une vidéo, et c'est la vidéo qui flotte ;
// ses boutons lecture et pause pilotent le minuteur.
const docPiP = 'documentPictureInPicture' in window;
let flottant = null;
let toile = null, video = null;
const videoPiP = !docPiP && 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled
  && 'captureStream' in HTMLCanvasElement.prototype;

if (!docPiP && !videoPiP) $('.si-flottant').hidden = true;

if (videoPiP) {
  // La vidéo doit déjà tourner au moment du clic : la mise en flottant exige le geste de l'utilisateur.
  toile = Object.assign(document.createElement('canvas'), { width: 416, height: 88 });
  video = Object.assign(document.createElement('video'), { muted: true, playsInline: true, autoplay: true });
  video.setAttribute('aria-hidden', 'true');
  video.style.cssText = 'position:fixed;left:0;bottom:0;width:2px;height:2px;opacity:0;pointer-events:none';
  dessinerToile('0:00', 0, false);
  video.srcObject = toile.captureStream();
  document.body.append(video);
  video.play().catch(() => {});
  // Un instant de recul avant d'obéir au bouton pause : Safari met aussi la vidéo en pause quand on ferme la fenêtre.
  video.addEventListener('pause', () => setTimeout(() => {
    if (video.paused && document.pictureInPictureElement === video && minuteur && !minuteur.enPause) basculerPause();
  }, 80));
  video.addEventListener('play', () => { if (document.pictureInPictureElement === video && minuteur && minuteur.enPause) basculerPause(); });
  video.addEventListener('leavepictureinpicture', () => {
    if (finOuverte) fermerFin();
    else if (video.paused && !(minuteur && minuteur.enPause)) video.play().catch(() => {});
  });
}

async function ouvrirFlottant() {
  if (docPiP) {
    try {
      const w = await window.documentPictureInPicture.requestWindow({ width: 240, height: 56 });
      if (!minuteur) { w.close(); return; }
      flottant = w;
      for (const l of document.querySelectorAll('link[rel="stylesheet"]')) {
        const c = w.document.createElement('link');
        c.rel = 'stylesheet'; c.href = l.href;
        w.document.head.append(c);
      }
      w.document.title = TITRE;
      w.document.body.className = 'flottant';
      const p = creerPastille();
      w.document.body.append(p);
      pastilles.add(p);
      w.document.addEventListener('keydown', (e) => { if (finOuverte) { e.preventDefault(); fermerFin(); } });
      w.addEventListener('pagehide', () => {
        pastilles.delete(p);
        if (flottant === w) flottant = null;
      });
      rafraichir();
    } catch { /* refusé ou impossible : la pastille reste dans la page */ }
  } else if (videoPiP) {
    try {
      if (video.paused) video.play().catch(() => {});
      await video.requestPictureInPicture();
    } catch {}
  }
}

/// La fin, en petit, dans la fenêtre flottante.
function finFlottante() {
  if (flottant) {
    const f = fin.cloneNode(true);
    f.id = 'fin';
    f.hidden = false;
    f.addEventListener('click', fermerFin);
    flottant.document.body.replaceChildren(f);
  } else if (video && document.pictureInPictureElement === video) {
    dessinerToile(null);
  }
}

function fermerFlottant() {
  if (flottant) { flottant.close(); flottant = null; }
  if (video && document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
}

/// La pastille dessinée pour la vidéo flottante de Safari (texte = null : la fin).
function dessinerToile(t, progression = 0, pause = false) {
  if (!toile) return;
  const c = toile.getContext('2d'), L = toile.width, H = toile.height;
  const style = getComputedStyle(document.documentElement);
  const accent = style.getPropertyValue('--accent').trim(), encre = style.getPropertyValue('--texte').trim();
  c.fillStyle = style.getPropertyValue('--fond').trim();
  c.fillRect(0, 0, L, H);
  const cx = 52, cy = H / 2, r = 19;
  c.lineWidth = 6; c.lineCap = 'round';
  if (t === null) {
    c.fillStyle = accent;
    c.beginPath(); c.arc(cx, cy, 24, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(cx - 11, cy + 1); c.lineTo(cx - 3, cy + 9); c.lineTo(cx + 12, cy - 8); c.stroke();
    c.fillStyle = encre;
    c.font = '700 34px ui-rounded, -apple-system, system-ui, sans-serif';
    c.textBaseline = 'middle';
    c.fillText("C'est terminé", 94, cy + 1);
  } else {
    c.strokeStyle = encre; c.globalAlpha = .16;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
    c.globalAlpha = 1;
    if (progression > 0) {
      c.strokeStyle = accent;
      c.beginPath(); c.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progression * Math.PI * 2); c.stroke();
    }
    c.fillStyle = encre; c.globalAlpha = pause ? .5 : 1;
    c.font = '500 40px ui-rounded, -apple-system, system-ui, sans-serif';
    c.textBaseline = 'middle';
    c.fillText(t, 94, cy + 2);
    c.globalAlpha = 1;
  }
}
