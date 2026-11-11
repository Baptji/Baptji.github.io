// L'enchaînement : accueil → minuteur → fin → accueil (Application.swift, Pastille.swift, Final.swift).
// La pastille reste dans la page, en haut ; la cloche est programmée dès le départ dans l'horloge audio, pour sonner
// à l'heure même onglet caché.
import { Minuteur, texte, libelle, libelleCurseur } from './modele.js?v=20261111153509';
import * as Chiffres from './chiffres.js?v=20261111153509';
import { Scene } from './scene.js?v=20261111153509';
import * as Bureau from './bureau.js?v=20261111153509';

const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const pastille = $('#pastille'), curseur = $('#curseur'), valeur = $('#valeur');
const TITRE = 'Concentration';
/// Secondes avant l'effacement automatique de la fin (Final.dureeAffichage).
const DUREE_FIN = 8;
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

if (AUTO) setTimeout(() => demarrer(1), 1500);

// ——— déroulement ———
function demarrer(minutes) {
  // Le son demande un geste de l'utilisateur : il se prépare ici, dans le clic.
  preparerSon();
  minuteur = new Minuteur(ESSAI || minutes * 60);
  secondesDepart = Math.ceil(minuteur.total);
  libelleFin = libelle(minutes);
  texteAffiche = '';
  document.body.dataset.etat = 'course';
  scene.demarrer();
  Bureau.course();
  rafraichir();
  programmerCloche();
  tic.postMessage(200);
}

function rafraichir() {
  if (!minuteur) return;
  if (minuteur.termine) { terminer(); return; }
  const r = minuteur.restant(), t = texte(r), s = Math.ceil(r - 1e-9), pause = minuteur.enPause;
  if (t !== texteAffiche) { texteAffiche = t; chiffres($('.temps', pastille), t, 24); }
  // Un seul tour de cadran pour toute la durée : l'aiguille part d'en haut et l'arc doré se remplit jusqu'à la fin.
  const fait = secondesDepart ? (secondesDepart - s) / secondesDepart : 1;
  $('.aiguille', pastille).style.transform = `rotate(${(fait * 360).toFixed(2)}deg)`;
  const arc = $('.arc', pastille);
  arc.style.strokeDasharray = `${(fait * 60).toFixed(3)} 60`;
  arc.style.opacity = fait > 0 ? 1 : 0;
  pastille.classList.toggle('en-pause', pause);
  const b = $('.basculer', pastille), aide = pause ? 'Reprendre' : 'Mettre en pause';
  b.title = aide; b.setAttribute('aria-label', aide);
  pastille.setAttribute('aria-label', `Temps restant ${t}`);
  document.title = `${t} · ${TITRE}`;
  icone(minuteur.progression());
}

function basculerPause() {
  if (!minuteur) return;
  minuteur.basculerPause();
  if (minuteur.enPause) annulerCloche(); else programmerCloche();
  rafraichir();
}
$('.basculer', pastille).addEventListener('click', basculerPause);
$('.arreter', pastille).addEventListener('click', arreter);

/// Arrêt demandé : pas d'animation de fin, retour à l'accueil.
function arreter() {
  minuteur = null;
  tic.postMessage(0);
  annulerCloche();
  scene.arreter();
  Bureau.accueil();
  document.body.dataset.etat = 'choix';
  document.title = TITRE;
  iconeRepos();
}

/// Fin naturelle : la nuit retombe, la cloche sonne.
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
