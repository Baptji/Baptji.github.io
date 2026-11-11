// L'enchaînement : accueil → minuteur → fin → accueil (Application.swift, Pastille.swift, Final.swift).
// Ce qui change par rapport au Mac : la pastille « au-dessus de tout » devient une fenêtre flottante (Picture in
// Picture) qui montre une vidéo du compte à rebours, calculée d'avance et lue à partir du bon instant : elle tourne
// seule, même si l'onglet dort, et Safari comme Chrome savent la faire flotter. La cloche est programmée dès le départ
// dans l'horloge audio, pour sonner à l'heure même onglet caché.
import { Minuteur, texte, libelle, libelleCurseur, aiguille } from './modele.js?v=20261111153017';
import * as Chiffres from './chiffres.js?v=20261111153017';
import { Scene } from './scene.js?v=20261111153017';
import * as Bureau from './bureau.js?v=20261111153017';

const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const pastille = $('#pastille'), video = $('#video'), curseur = $('#curseur'), valeur = $('#valeur');
const TITRE = 'Concentration';
/// Secondes avant l'effacement automatique de la fin (Final.dureeAffichage).
const DUREE_FIN = 8;
/// La vidéo de la fenêtre flottante : 2 heures de compte à rebours, puis quelques secondes de fin.
const VIDEO_TOTAL = 7200;
/// Pour les essais : ?essai=3 fait durer tout minuteur 3 secondes.
const ESSAI = Number(new URLSearchParams(location.search).get('essai')) || 0;
/// Pour les essais de l'app de bureau : ?auto lance un minuteur tout seul, sans prendre le premier plan à la fin.
const AUTO = new URLSearchParams(location.search).has('auto');

Bureau.init();
const scene = new Scene($('#scene'));
scene.progression = () => (minuteur ? minuteur.progression() : null);
let minuteur = null, libelleFin = '', secondesDepart = 0, texteAffiche = '', finOuverte = false, minuterieFin = 0;

// ——— tic ———
// Un onglet en arrière-plan ralentit ses minuteries (jusqu'à une par minute sous Chrome) ; celles d'un worker,
// non. Il ne tourne que pendant un compte à rebours.
const tic = new Worker(URL.createObjectURL(new Blob(
  ['let t; onmessage = (e) => { clearInterval(t); if (e.data) t = setInterval(() => postMessage(0), e.data); };'],
  { type: 'text/javascript' })));
tic.onmessage = rafraichir;

// ——— les chiffres dessinés ———
function chiffres(svg, t, hauteur) {
  const s = Chiffres.svg(t);
  svg.setAttribute('viewBox', `0 0 ${s.largeur} 100`);
  svg.style.width = `${(s.largeur * hauteur) / 100}px`;
  svg.innerHTML = `<g class="traits">${s.traits}</g><g class="points">${s.points}</g>`;
}

// ——— accueil ———
document.querySelectorAll('.duree').forEach((b, i) => {
  const m = Number(b.dataset.minutes), svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  b.prepend(svg);
  chiffres(svg, m === 60 ? '1' : String(m), innerWidth <= 420 ? 24 : 27);
  b.style.setProperty('--i', i);
  b.setAttribute('aria-label', `Se concentrer pendant ${libelle(m)}`);
  b.addEventListener('click', () => demarrer(m));
});
function suivreCurseur() {
  const m = Number(curseur.value);
  valeur.textContent = libelleCurseur(m);
  curseur.style.setProperty('--rempli', `${((m - 1) / 119) * 100}%`);
}
curseur.addEventListener('input', suivreCurseur);
suivreCurseur();
$('#lancer').addEventListener('click', () => demarrer(Number(curseur.value)));

// ——— le fond : la mer ou l'aube, gardé d'une visite à l'autre (?fond=aube pour les essais) ———
const boutonsFond = document.querySelectorAll('.fonds button');
function choisirFond(nom, sansFondu) {
  scene.choisirFond(nom, sansFondu);
  boutonsFond.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.fond === scene.fond)));
}
boutonsFond.forEach((b) => b.addEventListener('click', () => {
  choisirFond(b.dataset.fond);
  try { localStorage.setItem('concentration-fond', scene.fond); } catch {}
}));
{
  let nom = new URLSearchParams(location.search).get('fond');
  if (!nom) try { nom = localStorage.getItem('concentration-fond'); } catch {}
  if (nom) choisirFond(nom, true);
}
if (AUTO) setTimeout(() => demarrer(1), 1500);
// Dans l'app de bureau, c'est la fenêtre elle-même qui flotte : ni vidéo ni Picture in Picture.
if (Bureau.actif) { video.removeAttribute('src'); video.load(); }
else {
  if (!document.pictureInPictureEnabled) $('.si-flottant').hidden = true;
  video.addEventListener('error', () => { $('.si-flottant').hidden = true; });
}

// ——— déroulement ———
function demarrer(minutes) {
  // Tout ce qui demande un geste de l'utilisateur se fait ici, dans le clic : le son et la fenêtre flottante.
  preparerSon();
  minuteur = new Minuteur(ESSAI || minutes * 60);
  secondesDepart = Math.ceil(minuteur.total);
  libelleFin = libelle(minutes);
  texteAffiche = '';
  document.body.dataset.etat = 'course';
  scene.demarrer(minutes);
  Bureau.course();
  ouvrirFlottant();
  rafraichir();
  programmerCloche();
  tic.postMessage(200);
}

function rafraichir() {
  if (!minuteur) return;
  if (minuteur.termine) { terminer(); return; }
  const r = minuteur.restant(), t = texte(r), s = Math.ceil(r - 1e-9), pause = minuteur.enPause;
  if (t !== texteAffiche) { texteAffiche = t; chiffres($('.temps', pastille), t, 24); }
  // L'aiguille tourne d'un cran par seconde, toujours dans le même sens (angle cumulé, pas de retour à 0).
  $('.aiguille', pastille).style.transform = `rotate(${aiguille(secondesDepart) + (secondesDepart - s) * 6}deg)`;
  const arc = $('.arc', pastille), part = (60 - (s % 60)) % 60;
  arc.style.strokeDasharray = `${part} 60`;
  arc.style.opacity = part ? 1 : 0;
  pastille.classList.toggle('en-pause', pause);
  const b = $('.basculer', pastille), aide = pause ? 'Reprendre' : 'Mettre en pause';
  b.title = aide; b.setAttribute('aria-label', aide);
  pastille.setAttribute('aria-label', `Temps restant ${t}`);
  document.title = `${t} · ${TITRE}`;
  icone(minuteur.progression());
  synchroniserVideo(false);
}

function basculerPause() {
  if (!minuteur) return;
  minuteur.basculerPause();
  if (minuteur.enPause) annulerCloche(); else programmerCloche();
  synchroniserVideo(true);
  rafraichir();
}
$('.basculer', pastille).addEventListener('click', basculerPause);
$('.arreter', pastille).addEventListener('click', arreter);
// Un clic sur le temps rouvre la fenêtre flottante si on l'a fermée.
$('.temps', pastille).addEventListener('click', ouvrirFlottant);

/// Arrêt demandé : pas d'animation de fin, retour à l'accueil.
function arreter() {
  minuteur = null;
  tic.postMessage(0);
  annulerCloche();
  fermerFlottant();
  scene.arreter();
  Bureau.accueil();
  document.body.dataset.etat = 'choix';
  document.title = TITRE;
  iconeRepos();
}

/// Fin naturelle : le soleil se couche, la nuit tombe, la cloche sonne.
function terminer() {
  minuteur = null;
  tic.postMessage(0);
  sonnerSiPasEncore();
  scene.finir();
  Bureau.fin();
  icone(1);
  document.title = `C'est terminé · ${TITRE}`;
  $('#fin .detail').textContent = `${libelleFin} de concentration. Prenez une pause.`;
  document.body.dataset.etat = 'fin';
  finOuverte = true;
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
  scene.repos();
  Bureau.accueil();
  document.body.dataset.etat = 'choix';
  document.title = TITRE;
  iconeRepos();
}
document.addEventListener('click', () => { if (finOuverte) fermerFin(); });
document.addEventListener('keydown', (e) => {
  if (finOuverte && !e.metaKey && !e.ctrlKey) { e.preventDefault(); fermerFin(); }
});

// ——— l'icône de l'onglet : un anneau doré qui se remplit ———
const lienIcone = $('link[rel="icon"]'), iconeOrigine = lienIcone.href;
let crans = -1;
function icone(p) {
  const c = Math.round(p * 48);
  if (c === crans) return;
  crans = c;
  const toile = Object.assign(document.createElement('canvas'), { width: 64, height: 64 }), x = toile.getContext('2d');
  const fond = x.createLinearGradient(0, 0, 64, 64);
  fond.addColorStop(0, '#4a3fe0'); fond.addColorStop(1, '#261e8c');
  x.fillStyle = fond;
  x.beginPath(); x.arc(32, 32, 32, 0, Math.PI * 2); x.fill();
  x.lineWidth = 9; x.lineCap = 'round';
  x.strokeStyle = 'rgba(255,255,255,.22)';
  x.beginPath(); x.arc(32, 32, 19, 0, Math.PI * 2); x.stroke();
  if (c > 0) {
    x.strokeStyle = '#ffd15c';
    x.beginPath(); x.arc(32, 32, 19, -Math.PI / 2, -Math.PI / 2 + (c / 48) * Math.PI * 2); x.stroke();
  }
  lienIcone.href = toile.toDataURL('image/png');
}
function iconeRepos() {
  crans = -1;
  lienIcone.href = iconeOrigine;
}

// ——— la fenêtre flottante ———
// La vidéo est un compte à rebours de 2 heures : pour un minuteur de T secondes, on la lit à partir de 7200 − T.
// Ses boutons lecture et pause pilotent le minuteur ; s'ils sont pressés dans la fenêtre flottante, on suit.
let derniereSynchro = 0;
const videoPrete = () => video.readyState >= 1 && !video.error;

function ouvrirFlottant() {
  if (!minuteur || Bureau.actif || !document.pictureInPictureEnabled || !videoPrete()) return;
  try {
    video.currentTime = VIDEO_TOTAL - minuteur.restant();
    derniereSynchro = performance.now();
    if (!minuteur.enPause) video.play().catch(() => {});
    if (document.pictureInPictureElement !== video) video.requestPictureInPicture().catch(() => {});
  } catch { /* refusé : la pastille reste dans la page */ }
}

function fermerFlottant() {
  if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {});
  video.pause();
}

/// La vidéo suit le minuteur : même pause, et recalée si elle dérive de plus de 0,7 s (veille, onglet endormi).
function synchroniserVideo(force) {
  if (!minuteur || Bureau.actif || !videoPrete()) return;
  if (minuteur.enPause) { if (!video.paused) video.pause(); }
  else if (video.paused) video.play().catch(() => {});
  const t = performance.now();
  if (!force && t - derniereSynchro < 3000) return;
  derniereSynchro = t;
  const attendu = VIDEO_TOTAL - minuteur.restant();
  if (force || Math.abs(video.currentTime - attendu) > 0.7) video.currentTime = attendu;
}

// Un instant de recul avant d'obéir au bouton pause : les navigateurs mettent aussi la vidéo en pause quand on
// ferme la fenêtre flottante, et ce n'est pas une demande de pause du minuteur.
video.addEventListener('pause', () => setTimeout(() => {
  if (video.paused && !video.ended && document.pictureInPictureElement === video && minuteur && !minuteur.enPause) basculerPause();
}, 120));
video.addEventListener('play', () => {
  if (document.pictureInPictureElement === video && minuteur && minuteur.enPause) basculerPause();
});
video.addEventListener('leavepictureinpicture', () => { if (finOuverte) fermerFin(); });

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
