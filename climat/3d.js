// La France en 3D : une colonne par maille SAFRAN (8 km), haute de son relief (ou de sa
// température), coloriée selon la température moyenne du jour choisi en 2025.
// Une seule géométrie instanciée pour les 9 892 colonnes : changer de jour ne fait que
// réécrire leurs couleurs (et leurs hauteurs en mode « Température »).
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const CELLS = window.SAFRAN_GRID.cells;
const ALT = window.SAFRAN_ALTITUDES;              // null si data/altitudes.js manque
const COTE = window.SAFRAN_GRID.cellSize / 1000;  // 8 km : l'unité de la scène est le km
const JOINT = 0.6;                                // km laissés entre deux colonnes : on voit les mailles
const KM_PAR_DEGRE = 1.5;                         // mode « Température » : 1,5 km de colonne par °C (× exagération / 20)

const nf = (v, d = 0) => v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });

const sceneEl = document.getElementById("scene");
const attente = document.getElementById("attente3d");
const jourEl = document.getElementById("jour3d");
const dateEl = document.getElementById("date3d");
const lectureEl = document.getElementById("lecture3d");
const exagEl = document.getElementById("exag3d");
const valeurExag = document.getElementById("valeur-exag");
const bulle = document.getElementById("bulle3d");
const boutonsHauteur = [...document.querySelectorAll("[data-hauteur]")];

// ---------- état ----------
const params = new URLSearchParams(location.search);
let donnees = null;
let jour = Math.max(0, +params.get("jour") || 0);
let hauteur = ALT ? "relief" : "temperature";
let exag = +exagEl.value;
let ech = France.echelle();

// ---------- scène ----------
const css = (nom) => getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
sceneEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 1, 10000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.48;   // jamais sous le sol
controls.minDistance = 40;
controls.maxDistance = 3000;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 2.2));
const soleil = new THREE.DirectionalLight(0xffffff, 1.6);
soleil.position.set(-600, 900, -400);      // du nord-ouest : les versants sud-est dans l'ombre
scene.add(soleil);

// le centre de la France sert d'origine ; x vers l'est, z vers le sud (y Lambert inversé)
let cx = 0, cy = 0;
for (const c of CELLS) { cx += c.x; cy += c.y; }
cx /= CELLS.length; cy /= CELLS.length;

const geometrie = new THREE.BoxGeometry(1, 1, 1);
geometrie.translate(0, 0.5, 0);            // la base de la colonne au niveau 0
const materiau = new THREE.MeshLambertMaterial({ color: 0xffffff });
const colonnes = new THREE.InstancedMesh(geometrie, materiau, CELLS.length);
colonnes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
scene.add(colonnes);

function couleurDeFond() {
  scene.background = new THREE.Color(css("--plan") || "#f9f9f7");
}
couleurDeFond();

function cadrer() {
  const w = sceneEl.clientWidth, h = sceneEl.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// vue de départ : depuis le sud, un peu en hauteur, la France entière dans le cadre
camera.position.set(0, 820, 980);
controls.target.set(0, 0, 0);
controls.update();

// ---------- colonnes ----------
const m4 = new THREE.Matrix4();
const pos = new THREE.Vector3(), echelle3 = new THREE.Vector3(), rot = new THREE.Quaternion();
const couleur = new THREE.Color();

function hauteurColonne(i, t) {
  if (hauteur === "relief") return Math.max(0.3, (ALT.moyenne[i] / 1000) * exag);
  return Math.max(0.3, (t - ech.bas) * KM_PAR_DEGRE * (exag / 20));
}

function majColonnes() {
  if (!donnees) return;
  const o = jour * donnees.mailles;
  for (let i = 0; i < CELLS.length; i++) {
    const t = donnees.valeurs[o + i] / 10;
    const c = CELLS[i];
    pos.set((c.x - cx) / 1000, 0, -(c.y - cy) / 1000);
    echelle3.set(COTE - JOINT, hauteurColonne(i, t), COTE - JOINT);
    m4.compose(pos, rot, echelle3);
    colonnes.setMatrixAt(i, m4);
    const [r, g, b] = ech.rvb(t);
    couleur.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    colonnes.setColorAt(i, couleur);
  }
  colonnes.instanceMatrix.needsUpdate = true;
  colonnes.instanceColor.needsUpdate = true;
  colonnes.computeBoundingSphere();
  dessiner();
}

// ---------- rendu à la demande : rien ne tourne quand rien ne bouge ----------
let demande = false;
function dessiner() {
  if (demande) return;
  demande = true;
  requestAnimationFrame(() => { demande = false; renderer.render(scene, camera); });
}
controls.addEventListener("change", dessiner);
window.addEventListener("resize", () => { cadrer(); dessiner(); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { couleurDeFond(); dessiner(); });

// ---------- réglages ----------
function afficherJour(j) {
  jour = j;
  jourEl.value = j;
  dateEl.textContent = France.fmtDate(donnees.date(j));
  history.replaceState(null, "", `?jour=${j}`);
  majColonnes();
  if (survolee !== null) majBulle();
}

jourEl.addEventListener("input", () => afficherJour(+jourEl.value));

let lectureMinuteur = null;
function arreterLecture() {
  clearTimeout(lectureMinuteur);
  lectureMinuteur = null;
  lectureEl.classList.remove("en-lecture");
  lectureEl.title = lectureEl.ariaLabel = "Lecture";
}
function lire() {
  afficherJour((jour + 1) % donnees.jours);
  requestAnimationFrame(() => { if (lectureMinuteur) lectureMinuteur = setTimeout(lire, 80); });
}
lectureEl.addEventListener("click", () => {
  if (!donnees) return;
  if (lectureMinuteur) return arreterLecture();
  lectureEl.classList.add("en-lecture");
  lectureEl.title = lectureEl.ariaLabel = "Pause";
  lectureMinuteur = setTimeout(lire, 0);
});

function majBoutonsHauteur() {
  for (const b of boutonsHauteur) {
    b.setAttribute("aria-pressed", String(b.dataset.hauteur === hauteur));
    if (b.dataset.hauteur === "relief" && !ALT) { b.disabled = true; b.title = "Altitudes indisponibles"; }
  }
}
for (const b of boutonsHauteur) {
  b.addEventListener("click", () => {
    if (b.disabled) return;
    hauteur = b.dataset.hauteur;
    majBoutonsHauteur();
    majColonnes();
  });
}
majBoutonsHauteur();

exagEl.addEventListener("input", () => {
  exag = +exagEl.value;
  valeurExag.textContent = `× ${exag}`;
  majColonnes();
});

// ---------- survol : la maille sous la souris ----------
const rayon = new THREE.Raycaster();
const souris = new THREE.Vector2();
let survolee = null, bx = 0, by = 0, survolDemande = false;

function majBulle() {
  if (survolee === null || !donnees) { bulle.hidden = true; return; }
  const t = donnees.valeur(jour, survolee);
  const alt = ALT ? ` · ${nf(ALT.moyenne[survolee])} m` : "";
  bulle.innerHTML = `${CELLS[survolee].id}${alt}<br><b>${nf(t, 1)} °C</b>`;
  bulle.hidden = false;
  const w = bulle.offsetWidth, h = bulle.offsetHeight;
  bulle.style.left = `${Math.min(bx + 14, innerWidth - w - 8)}px`;
  bulle.style.top = `${Math.max(8, by - h - 10)}px`;
}

renderer.domElement.addEventListener("pointermove", (e) => {
  bx = e.clientX; by = e.clientY;
  if (survolDemande || e.buttons) return;     // pas de lancer de rayon pendant qu'on tourne
  survolDemande = true;
  requestAnimationFrame(() => {
    survolDemande = false;
    const r = renderer.domElement.getBoundingClientRect();
    souris.set(((bx - r.left) / r.width) * 2 - 1, -((by - r.top) / r.height) * 2 + 1);
    rayon.setFromCamera(souris, camera);
    const touche = rayon.intersectObject(colonnes, false)[0];
    survolee = touche ? touche.instanceId : null;
    majBulle();
  });
});
renderer.domElement.addEventListener("pointerleave", () => { survolee = null; majBulle(); });

// ---------- départ ----------
cadrer();
dessiner();
France.charger(2025).then((d) => {
  donnees = d;
  jourEl.max = d.jours - 1;
  France.legende(document.getElementById("legende3d"), ech);
  attente.hidden = true;
  afficherJour(Math.min(jour, d.jours - 1));
}).catch((err) => {
  attente.textContent = `Températures indisponibles : ${err.message}`;
});
