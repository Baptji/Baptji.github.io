// Vue 3D (WebGL2) : la pièce en « maison de poupée » (les murs tournés vers la caméra s'effacent),
// le toit exact, les volumes, les enceintes, le micro, la carte des niveaux à la hauteur d'écoute,
// les cotes. Traduction de Vue3D.swift.
//
//  Vue seulement : glisser = tourner ; clic droit ou ⇧ glisser = décaler ; molette = zoom ;
//  clic = sélectionner. Tout se règle dans les vues Plan et Coupe (2D).

import { v2, v3, trianguler, turbo, divergente, teinteMateriau, dansPolygone } from './base.js?v=20261025140234';
import { polyedre, axe, avant, nouveauBloc, cleRayons, cleGeometrie, axeCote, hautCote, estOuvert } from './modele.js?v=20261025140234';
import { coinsPlan, murDuPlan, normalePlan, toit, origine, cotes, contacts, idRampant } from './plan.js?v=20261025140234';
import { etat, abonner, versEchelle, annulation, zeroDB, reglage, notifier } from './etat.js?v=20261025140234';
import { valeurRaster } from './calcul.js?v=20261025140234';

// MARK: Matrices (colonnes)

function multiplier(a, b) {
  const r = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let l = 0; l < 4; l++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + l] * b[c * 4 + k];
    r[c * 4 + l] = s;
  }
  return r;
}
function inverser(m) {
  const inv = new Float32Array(16);
  inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
  inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
  inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
  inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
  inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
  inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
  inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
  inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
  inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
  inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
  inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
  inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
  inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
  inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
  inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
  inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];
  let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];
  det = det ? 1 / det : 0;
  for (let i = 0; i < 16; i++) inv[i] *= det;
  return inv;
}

// MARK: Caméra orbitale

export class Regard {
  constructor() { this.cible = [2.5, 2, 1]; this.azimut = -2.3; this.elevation = 0.72; this.distance = 9; this.taille = [800, 600]; this.cadre = ''; }
  cadrer(s, force = false) {
    const c = `${s.longueur.toFixed(2)}|${s.largeur.toFixed(2)}|${s.hauteur.toFixed(2)}`;
    if (!force && c === this.cadre) return;
    this.cadre = c;
    this.cible = [s.longueur / 2, s.largeur / 2, s.hauteur * 0.3];
    this.distance = Math.max(s.longueur, s.largeur, s.hauteur * 1.5) * 1.45;
  }
  get oeil() {
    const ce = Math.cos(this.elevation);
    return [this.cible[0] + this.distance * ce * Math.cos(this.azimut), this.cible[1] + this.distance * ce * Math.sin(this.azimut), this.cible[2] + this.distance * Math.sin(this.elevation)];
  }
  get matrice() {
    const e = this.oeil, f = v3.norm(v3.sub(this.cible, e)), s = v3.norm(v3.cross(f, [0, 0, 1])), u = v3.cross(s, f);
    const vue = new Float32Array([s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -v3.dot(s, e), -v3.dot(u, e), v3.dot(f, e), 1]);
    const aspect = Math.max(this.taille[0], 1) / Math.max(this.taille[1], 1);
    const pres = Math.max(0.02, this.distance * 0.01), loin = this.distance * 20 + 200;
    const ys = 1 / Math.tan(38 * Math.PI / 180 / 2), xs = ys / aspect;
    const proj = new Float32Array([xs, 0, 0, 0, 0, ys, 0, 0, 0, 0, (loin + pres) / (pres - loin), -1, 0, 0, 2 * loin * pres / (pres - loin), 0]);
    return multiplier(proj, vue);
  }
  projeter(p) {
    const m = this.matrice;
    const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], y = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15];
    if (w <= 1e-4) return null;
    return [(x / w + 1) / 2 * this.taille[0], (1 - y / w) / 2 * this.taille[1]];
  }
  rayon(pt) {
    const inv = inverser(this.matrice);
    const x = 2 * pt[0] / Math.max(this.taille[0], 1) - 1, y = 1 - 2 * pt[1] / Math.max(this.taille[1], 1);
    const tr = (z) => { const r = [0, 0, 0, 0]; for (let l = 0; l < 4; l++) r[l] = inv[l] * x + inv[4 + l] * y + inv[8 + l] * z + inv[12 + l]; return [r[0] / r[3], r[1] / r[3], r[2] / r[3]]; };
    const a = tr(-1), b = tr(1);
    return { o: a, d: v3.norm(v3.sub(b, a)) };
  }
}

// MARK: Shaders

const VS = `#version 300 es
in vec3 p; in vec4 n; in vec4 c;
uniform mat4 vp;
out vec4 vn; out vec4 vc;
void main() { gl_Position = vp * vec4(p, 1.0); vn = n; vc = c; }`;
const FS = `#version 300 es
precision highp float;
in vec4 vn; in vec4 vc;
uniform vec3 lumiere;
out vec4 sortie;
void main() {
  if (vn.w < 0.5) { sortie = vc; return; }
  float l = 0.42 + 0.58 * abs(dot(normalize(vn.xyz), normalize(lumiere)));
  sortie = vec4(vc.rgb * l, vc.a);
}`;
const VST = `#version 300 es
in vec3 p; in vec2 t;
uniform mat4 vp;
out vec2 vt;
void main() { gl_Position = vp * vec4(p, 1.0); vt = t; }`;
const FST = `#version 300 es
precision highp float;
in vec2 vt;
uniform sampler2D tex;
out vec4 sortie;
void main() { vec4 c = texture(tex, vt); if (c.a < 0.05) discard; sortie = c; }`;
// Volume : un triangle plein écran ; chaque pixel lance un rayon dans la boîte de la pièce et dessine,
// nettes et éclairées, les surfaces où le niveau franchit un seuil (texture 3D : niveau, partie réelle,
// partie imaginaire, cellule d'air). Niveaux : +seuil (rouge), −seuil (bleu), −12 dB (annulation).
// Onde animée : surpression et dépression au même seuil.
const VSV = `#version 300 es
in vec2 p;
out vec2 ndc;
void main() { gl_Position = vec4(p, 0.0, 1.0); ndc = p; }`;
const FSV = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 ndc;
uniform sampler3D vol;
uniform mat4 inv;
uniform vec3 oeil, bmax, texel;
uniform float cphase, sphase, onde, seuil;
out vec4 sortie;
vec3 turbo(float x) {
  x = clamp(x, 0.0, 1.0) * 4.0;
  vec3 p0 = vec3(0.0, 0.0, 80.0), p1 = vec3(0.0, 180.0, 255.0), p2 = vec3(0.0, 255.0, 0.0), p3 = vec3(255.0, 255.0, 0.0), p4 = vec3(255.0, 0.0, 0.0);
  vec3 c = x < 1.0 ? mix(p0, p1, x) : x < 2.0 ? mix(p1, p2, x - 1.0) : x < 3.0 ? mix(p2, p3, x - 2.0) : mix(p3, p4, x - 3.0);
  return c / 255.0;
}
float valeur(vec3 u) {
  vec4 s = texture(vol, u);
  if (onde > 0.5) return s.g * cphase - s.b * sphase;
  return s.r;
}
vec3 normale(vec3 u) {
  vec3 h = 1.5 * texel;   // différences centrées sur un pas et demi : normales lisses
  vec3 g = vec3(valeur(u + vec3(h.x, 0.0, 0.0)) - valeur(u - vec3(h.x, 0.0, 0.0)),
                valeur(u + vec3(0.0, h.y, 0.0)) - valeur(u - vec3(0.0, h.y, 0.0)),
                valeur(u + vec3(0.0, 0.0, h.z)) - valeur(u - vec3(0.0, 0.0, h.z))) / (h * bmax);
  float l = length(g);
  return l > 1e-6 ? g / l : vec3(0.0, 0.0, 1.0);
}
void main() {
  vec4 a = inv * vec4(ndc, -1.0, 1.0), b = inv * vec4(ndc, 1.0, 1.0);
  vec3 d = normalize(b.xyz / b.w - a.xyz / a.w);
  vec3 iv = 1.0 / d, t0 = (vec3(0.0) - oeil) * iv, t1 = (bmax - oeil) * iv;
  vec3 tn3 = min(t0, t1), tf3 = max(t0, t1);
  float tn = max(max(max(tn3.x, tn3.y), tn3.z), 0.0), tf = min(min(tf3.x, tf3.y), tf3.z);
  if (tf <= tn) discard;
  const int N = 360;
  float pas = (tf - tn) / float(N);
  // Seuils : niveaux (échelle 0…1 pour −12…+12 dB) ou onde (−1.5…+1.5).
  float hi = onde > 0.5 ? seuil / 12.0 : 0.5 + seuil / 24.0;
  float lo = onde > 0.5 ? -seuil / 12.0 : 0.5 - seuil / 24.0;
  float ann = onde > 0.5 ? -100.0 : 0.02;
  vec3 cHi = vec3(0.95, 0.22, 0.12), cLo = vec3(0.12, 0.45, 0.95), cAnn = vec3(0.04, 0.04, 0.32);
  vec4 acc = vec4(0.0);
  float prev = 0.0; bool avant = false;
  for (int i = 0; i < N; i++) {
    vec3 q = oeil + d * (tn + (float(i) + 0.5) * pas), u = q / bmax;
    if (texture(vol, u).a < 0.5) { avant = false; continue; }
    float v = valeur(u);
    if (avant) {
      for (int k = 0; k < 3; k++) {
        float iso = k == 0 ? hi : (k == 1 ? lo : ann);
        if ((prev - iso) * (v - iso) >= 0.0) continue;
        // Position exacte de la surface : dichotomie entre les deux échantillons.
        float ta = -pas, tb = 0.0, va = prev;
        for (int r = 0; r < 5; r++) {
          float tm = 0.5 * (ta + tb), vm = valeur((q + d * tm) / bmax);
          if ((va - iso) * (vm - iso) <= 0.0) tb = tm; else { ta = tm; va = vm; }
        }
        vec3 uh = (q + d * tb) / bmax, n = normale(uh);
        float lum = 0.3 + 0.7 * abs(dot(n, d)), brillant = pow(abs(dot(reflect(d, n), -d)), 24.0) * 0.35;
        vec3 c = (k == 0 ? cHi : (k == 1 ? cLo : cAnn)) * lum + brillant;
        float al = k == 2 ? 0.8 : 0.55;
        acc.rgb += (1.0 - acc.a) * al * c; acc.a += (1.0 - acc.a) * al;
      }
      if (acc.a > 0.97) break;
    }
    prev = v; avant = true;
  }
  if (acc.a < 0.003) discard;
  sortie = vec4(acc.rgb / acc.a, acc.a);
}`;

const N = 11;   // flottants par sommet : position, normale + éclairé, couleur

export class Vue3D {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.regard = new Regard();
    this.canvas = document.createElement('canvas');
    this.calque = document.createElement('canvas');
    this.calque.className = 'calque';
    conteneur.append(this.canvas, this.calque);
    const gl = this.canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: false });
    this.gl = gl;
    if (!gl) { conteneur.insertAdjacentHTML('beforeend', '<p class="sans-3d">La vue 3D demande WebGL 2.</p>'); return; }
    this.prog = this.programme(VS, FS);
    this.progT = this.programme(VST, FST);
    this.progV = this.programme(VSV, FSV);
    this.tamponV = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tamponV);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.tampon = gl.createBuffer();
    this.tamponT = gl.createBuffer();
    this.textures = {};
    this.cleGeo = '';
    this.prise = null;
    this.besoin = true;
    this.cadrage = -1;
    this.recadrage = 0;
    new ResizeObserver(() => this.redimensionner()).observe(conteneur);
    this.redimensionner();
    this.souris();
    abonner(() => { this.besoin = true; });
    const boucle = () => {
      const anime = (etat.animer && ((etat.raster && etat.raster.phaseurs) || (etat.volume3D && etat.volume && etat.volume.phaseurs))) || etat.enCours;
      if (this.besoin || anime) { this.besoin = false; this.dessiner(); }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  }

  programme(vs, fs) {
    const gl = this.gl;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    return p;
  }

  redimensionner() {
    const r = this.conteneur.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    for (const c of [this.canvas, this.calque]) { c.width = Math.max(1, Math.round(r.width * dpr)); c.height = Math.max(1, Math.round(r.height * dpr)); }
    this.regard.taille = [r.width, r.height];
    this.besoin = true;
  }

  // MARK: Géométrie

  /// Construit les morceaux de la scène (refait seulement quand elle change).
  construire() {
    const s = etat.scene;
    const cle = `${cleRayons(s)}|${s.enceintes.map((e) => cleGeometrie(e) + (e.active ? 'a' : 'i')).join()}|${etat.selection}|${s.micro}|${s.ecoute}`;
    if (cle === this.cleGeo) return;
    this.cleGeo = cle;
    const L = s.longueur, W = s.largeur, H = s.hauteur;
    const opaques = [], translucides = [], traits = [], faces = [], murs = [[], [], [], [], [], []], ouvParoi = [];
    const tri = (t, a, b, c, n, col) => { for (const p of [a, b, c]) t.push(p[0], p[1], p[2], n[0], n[1], n[2], 1, col[0], col[1], col[2], col[3]); };
    const trait = (t, a, b, col) => { for (const p of [a, b]) t.push(p[0], p[1], p[2], 0, 0, 0, 0, col[0], col[1], col[2], col[3]); };
    const coul = (id, a = 1) => [...teinteMateriau(id), a];
    const poly = (p, col, aretes, dest) => {
      p.facettes.forEach((f, k) => { for (let i = 1; i < f.length - 1; i++) tri(dest, p.sommets[f[0]], p.sommets[f[i]], p.sommets[f[i + 1]], p.plans[k].n, col); });
      if (aretes) for (const f of p.facettes) for (let j = 0; j < f.length; j++) trait(traits, p.sommets[f[j]], p.sommets[f[(j + 1) % f.length]], aretes);
    };
    const coins = [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0], [0, 0, H], [L, 0, H], [L, W, H], [0, W, H]];
    const facesBoite = [[[0, 3, 7, 4], [1, 0, 0]], [[1, 5, 6, 2], [-1, 0, 0]], [[0, 4, 5, 1], [0, 1, 0]], [[3, 2, 6, 7], [0, -1, 0]], [[0, 1, 2, 3], [0, 0, 1]], [[4, 7, 6, 5], [0, 0, -1]]];
    const scan = s.contour != null;
    const t0 = s.plan ? toit(s) : null;
    const facesToit = t0 ? t0.faces() : [];
    // Coupes dessinées : leurs volumes pleins sont ôtés des surfaces de la pièce (murs, sol, plafond,
    // pentes) ; d'eux-mêmes, on ne voit que les faces tournées vers l'air.
    const creux = s.blocs.filter((b) => b.duPlan === 'profil').map(polyedre);
    const demi = (pts, n, c) => {   // garde n · p ≤ c
      const r = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length], fa = v3.dot(n, a) - c, fb = v3.dot(n, b) - c;
        if (fa <= 0) r.push(a);
        if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) r.push(v3.add(a, v3.mul(v3.sub(b, a), fa / (fa - fb))));
      }
      return r;
    };
    const aireP = (q) => { let n = [0, 0, 0]; for (let i = 0; i < q.length; i++) n = v3.add(n, v3.cross(q[i], q[(i + 1) % q.length])); return v3.len(n) / 2; };
    const sansCreux = (pts, sauf = null) => {
      let morceaux = [pts];
      for (const P of creux) {
        if (P === sauf) continue;
        const suite = [];
        for (const m of morceaux) {
          if (m.every((q) => q[0] < P.bmin[0] - 1e-4) || m.every((q) => q[0] > P.bmax[0] + 1e-4) || m.every((q) => q[1] < P.bmin[1] - 1e-4)
            || m.every((q) => q[1] > P.bmax[1] + 1e-4) || m.every((q) => q[2] < P.bmin[2] - 1e-4) || m.every((q) => q[2] > P.bmax[2] + 1e-4)) { suite.push(m); continue; }
          let reste = m;
          for (const pl of P.plans) {
            if (reste.length < 3) break;
            const dehors = demi(reste, v3.mul(pl.n, -1), -(pl.d + 1e-4));
            if (dehors.length >= 3 && aireP(dehors) > 1e-6) suite.push(dehors);
            reste = demi(reste, pl.n, pl.d + 1e-4);
          }
        }
        morceaux = suite;
      }
      return morceaux;
    };
    const remplir = (t, q, n, col, envers = false) => { for (let i = 1; i < q.length - 1; i++) (envers ? tri(t, q[0], q[i + 1], q[i], n, col) : tri(t, q[0], q[i], q[i + 1], n, col)); };
    facesBoite.forEach(([q, n], c) => {
      const t = murs[c];
      if (c === 4 && s.contour) {
        const col = coul(s.faces[4]).map((v, i) => (i < 3 ? v * 0.8 : v));
        for (const [a, b, d] of trianguler(s.contour)) for (const q of sansCreux([[a[0], a[1], 0.002], [b[0], b[1], 0.002], [d[0], d[1], 0.002]])) remplir(t, q, [0, 0, 1], col);
      } else if (c === 5 && s.plan && !estOuvert(s.faces[5])) {
        const col = coul(s.faces[5]);
        for (const f of facesToit) if (f.mur == null) for (const q of sansCreux(f.points)) remplir(t, q, [0, 0, -1], col, true);
      } else if (!estOuvert(s.faces[c]) && !scan) {
        const col = coul(s.faces[c]).map((v, i) => (i < 3 && c === 4 ? v * 0.8 : v));
        tri(t, coins[q[0]], coins[q[1]], coins[q[2]], n, col); tri(t, coins[q[0]], coins[q[2]], coins[q[3]], n, col);
      }
    });
    if (!s.plan) for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) trait(traits, coins[a], coins[b], [0.75, 0.78, 0.85, scan ? 0.18 : 0.55]);
    const murSel = murDuPlan(s, etat.selection);
    // Volumes (sauf murs et rampants de la pièce dessinée, dessinés à part).
    for (const b of s.blocs) {
      if ((typeof b.duPlan === 'number' && (b.forme === 'toit' || b.forme === 'paroi')) || b.duPlan === 'profil') continue;
      const sel = etat.selection === b.id;
      const p = polyedre(b);
      if (b.forme === 'ouverture') {
        const t = [], ar = [];
        p.facettes.forEach((f, k) => { for (let i = 1; i < f.length - 1; i++) tri(t, p.sommets[f[0]], p.sommets[f[i]], p.sommets[f[i + 1]], p.plans[k].n, [0.30, 0.55, 0.95, sel ? 0.45 : 0.28]); });
        for (const f of p.facettes) for (let j = 0; j < f.length; j++) trait(ar, p.sommets[f[j]], p.sommets[f[(j + 1) % f.length]], sel ? [1, 0.6, 0.1, 1] : [0.4, 0.7, 1, 0.9]);
        if (b.dansParoi) ouvParoi.push({ av: avant(b), c: [b.x, b.y, b.z], t, ar }); else { translucides.push(...t); traits.push(...ar); }
        continue;
      }
      let col = coul(b.materiau);
      if (sel) col = col.map((v, i) => v * 0.82 + [0.18, 0.08, 0, 0.18][i]);
      p.facettes.forEach((f, k) => {
        const t = [];
        for (let i = 1; i < f.length - 1; i++) tri(t, p.sommets[f[0]], p.sommets[f[i]], p.sommets[f[i + 1]], p.plans[k].n, col);
        let mur = null;
        for (let c = 0; c < 6; c++) { const a = axeCote(c), v = hautCote(c) ? [L, W, H][a] : 0; if (f.every((i) => Math.abs(p.sommets[i][a] - v) < 0.02)) mur = c; }
        const ar = [], ac = sel ? [1, 0.6, 0.1, 1] : [0, 0, 0, 0.35];
        for (let j = 0; j < f.length; j++) trait(ar, p.sommets[f[j]], p.sommets[f[(j + 1) % f.length]], ac);
        faces.push({ n: p.plans[k].n, p: p.sommets[f[0]], mur, t, ar, paroi: b.dansParoi ? [avant(b), [b.x, b.y, b.z]] : null, objet: true });
      });
    }
    if (t0) {
      // Murs : face intérieure seule, du coin au coin, arrêtée sous le toit.
      for (const w of t0.pans) {
        const m = s.plan.murs[w.mur];
        let col = coul(m.materiau);
        const sel = w.mur === murSel;
        if (sel) col = col.map((v, i) => v * 0.82 + [0.18, 0.08, 0, 0.18][i]);
        const t = [], ar = [], ac = sel ? [1, 0.6, 0.1, 1] : [0, 0, 0, 0.35];
        const pt = (u, z) => [w.a[0] + w.t[0] * u, w.a[1] + w.t[1] * u, z];
        const nIn = [w.n[0], w.n[1], 0];
        for (const [a, b] of t0.hautDuMur(w.mur)) {
          const s0 = Math.max(a[0], 0), s1 = Math.min(b[0], w.longueur);
          if (s1 - s0 <= 1e-6) continue;
          const zh = (u) => a[1] + (b[1] - a[1]) * (u - a[0]) / Math.max(b[0] - a[0], 1e-12);
          const p0 = pt(s0, 0), p1 = pt(s1, 0), p2 = pt(s1, zh(s1)), p3 = pt(s0, zh(s0)), quad = [p0, p1, p2, p3];
          const morceaux = sansCreux(quad);
          for (const q of morceaux) remplir(t, q, nIn, col);
          if (morceaux.length === 1 && Math.abs(aireP(morceaux[0]) - aireP(quad)) < 1e-6) { trait(ar, p3, p2, ac); trait(ar, p0, p3, ac); trait(ar, p1, p2, ac); }
        }
        faces.push({ n: nIn, p: [w.a[0], w.a[1], 0], mur: null, t, ar, paroi: [nIn, [w.a[0], w.a[1], 0]] });
      }
      // Pentes du toit : des deux côtés, effacées avec leur mur vu de dehors.
      const colT = coul(s.faces[5]);
      for (const f of facesToit) {
        if (f.mur == null || f.points.length < 3) continue;
        const r = t0.bord(f.mur);
        let col = colT;
        if (f.mur === murSel) col = col.map((v, i) => v * 0.82 + [0.18, 0.08, 0, 0.18][i]);
        let nb = v3.norm(v3.cross(v3.sub(f.points[2], f.points[0]), v3.sub(f.points[1], f.points[0])));
        if (nb[2] > 0) nb = v3.mul(nb, -1);
        const dessous = [], dessus = [];
        for (const q of sansCreux(f.points)) {
          remplir(dessous, q, nb, col, true);
          remplir(dessus, q, v3.mul(nb, -1), col.map((v, k) => (k < 3 ? v * 0.85 : v)));
        }
        const paroi = [[r.n[0], r.n[1], 0], [r.a[0], r.a[1], r.pied]];
        faces.push({ n: nb, p: f.points[0], mur: null, t: dessous, ar: [], paroi });
        faces.push({ n: v3.mul(nb, -1), p: f.points[0], mur: null, t: dessus, ar: [], paroi });
      }
      // Coupes dessinées : faces des volumes pleins tournées vers l'air, vues de l'intérieur (comme les murs).
      const air = (p) => p[2] > 1e-3 && p[2] < H - 1e-3 && (!s.contour || dansPolygone(p[0], p[1], s.contour)) && !creux.some((P) => P.contient(p, -1e-4));
      const colP = coul(s.plan.murs[0] ? s.plan.murs[0].materiau : 'platre');
      for (const P of creux) {
        P.facettes.forEach((f, k) => {
          const pts = f.map((i) => P.sommets[i]), n = P.plans[k].n;
          const c = pts.reduce((m, q) => v3.add(m, v3.mul(q, 1 / pts.length)), [0, 0, 0]);
          if (!air(v3.add(c, v3.mul(n, 0.02)))) return;
          const dedans = [];
          for (const q of sansCreux(pts, P)) remplir(dedans, q, n, colP);
          faces.push({ n, p: pts[0], mur: null, t: dedans, ar: [] });
        });
      }
      // Retombées (marches verticales du toit au droit d'un coin rentrant).
      for (const q of t0.retombees()) {
        const n = v3.norm(v3.cross(v3.sub(q[1], q[0]), v3.sub(q[3], q[0])));
        const a = [], b = [];
        tri(a, q[0], q[1], q[2], n, colT); tri(a, q[0], q[2], q[3], n, colT);
        tri(b, q[0], q[2], q[1], v3.mul(n, -1), colT); tri(b, q[0], q[3], q[2], v3.mul(n, -1), colT);
        faces.push({ n, p: q[0], mur: null, t: a, ar: [] }, { n: v3.mul(n, -1), p: q[0], mur: null, t: b, ar: [] });
      }
      // Cotes des murs, le long de leur face intérieure.
      const qc = coinsPlan(s);
      qc.forEach((c, i) => {
        const nIn = normalePlan(s, i);
        if (!nIn) return;
        const a = v2.add(c, v2.mul(nIn, 0.22)), b = v2.add(qc[(i + 1) % qc.length], v2.mul(nIn, 0.22)), u = v2.mul(v2.norm(v2.sub(b, a)), 0.06);
        const col = [1, 1, 1, 0.8];
        trait(traits, [a[0], a[1], 0.01], [b[0], b[1], 0.01], col);
        for (const e of [a, b]) trait(traits, [e[0] - u[1], e[1] + u[0], 0.01], [e[0] + u[1], e[1] - u[0], 0.01], col);
      });
    }
    // Objet sélectionné : contact avec un mur (vert), distances aux murs (orange).
    if (etat.selection) {
      for (const [a, b] of contacts(s, etat.selection)) {
        const vert = [0.35, 0.9, 0.45, 1];
        for (const dz of [0.01, 0.03, 0.05]) trait(traits, [a[0], a[1], dz], [b[0], b[1], dz], vert);
        trait(traits, [a[0], a[1], 0.01], [a[0], a[1], 0.6], vert); trait(traits, [b[0], b[1], 0.01], [b[0], b[1], 0.6], vert);
      }
      for (const [a, b] of cotes(s, etat.selection)) {
        if (v2.dist(a, b) <= 0.04) continue;
        const col = [1, 0.6, 0.1, 1], u = v2.mul(v2.norm(v2.sub(b, a)), 0.06);
        trait(traits, [a[0], a[1], 0.02], [b[0], b[1], 0.02], col);
        for (const e of [a, b]) trait(traits, [e[0] - u[1], e[1] + u[0], 0.02], [e[0] + u[1], e[1] - u[0], 0.02], col);
      }
    }
    // Règles au sol, depuis le coin de la pièce.
    if (s.plan || s.contour) {
      const o = origine(s), q = s.plan ? coinsPlan(s) : s.contour;
      const hi = q.reduce((m, x) => v2.max(m, x), [-Infinity, -Infinity]);
      const col = [1, 1, 1, 0.75], yr = o[1] - 0.45, xr = o[0] - 0.45;
      trait(traits, [o[0], yr, 0.005], [hi[0], yr, 0.005], col); trait(traits, [xr, o[1], 0.005], [xr, hi[1], 0.005], col);
      for (let t = 0; o[0] + t <= hi[0] + 1e-6; t += 0.5) { const l = t % 1 < 1e-6 ? 0.18 : 0.08; trait(traits, [o[0] + t, yr, 0.005], [o[0] + t, yr - l, 0.005], col); }
      for (let t = 0; o[1] + t <= hi[1] + 1e-6; t += 0.5) { const l = t % 1 < 1e-6 ? 0.18 : 0.08; trait(traits, [xr, o[1] + t, 0.005], [xr - l, o[1] + t, 0.005], col); }
    }
    // Enceintes.
    for (const e of s.enceintes) {
      const sel = etat.selection === e.id;
      const corps = !e.active ? [0.45, 0.45, 0.47, 1] : (sel ? [0.95, 0.55, 0.15, 1] : [0.16, 0.17, 0.2, 1]);
      const o = [e.x, e.y, e.z], a = axe(e), b = [-a[1], a[0], 0];
      if (e.genre === 'enceinte' || e.genre === 'caisson') {
        poly(polyedre(nouveauBloc({ x: o[0] - a[0] * e.profondeur / 2, y: o[1] - a[1] * e.profondeur / 2, z: e.z, longueur: e.largeur, profondeur: e.profondeur, hauteur: e.hauteur, azimut: e.azimut })),
          corps, [1, 1, 1, sel ? 0.9 : 0.35], opaques);
        const r = Math.min(e.largeur, e.hauteur) * 0.36, c0 = v3.add(o, v3.mul(a, 0.003));
        for (let k = 0; k < 16; k++) {
          const t0a = 2 * Math.PI * k / 16, t1a = 2 * Math.PI * (k + 1) / 16;
          tri(opaques, c0, v3.add(c0, [b[0] * r * Math.cos(t0a), b[1] * r * Math.cos(t0a), r * Math.sin(t0a)]), v3.add(c0, [b[0] * r * Math.cos(t1a), b[1] * r * Math.cos(t1a), r * Math.sin(t1a)]), a, [0.55, 0.57, 0.62, 1]);
        }
      } else if (e.genre === 'nu') {
        poly(polyedre(nouveauBloc({ x: e.x, y: e.y, z: e.z, longueur: Math.max(e.baffle, 0.12), profondeur: 0.02, hauteur: Math.max(e.baffle, 0.12), azimut: e.azimut })), corps, [1, 1, 1, 0.5], opaques);
      } else {
        poly(polyedre(nouveauBloc({ forme: 'cylindre', x: e.x, y: e.y, z: e.z, longueur: 0.14, profondeur: 0.14, hauteur: 0.14 })), corps, null, opaques);
      }
      if (e.genre !== 'omni') trait(traits, o, v3.add(o, v3.mul(a, 0.6)), [1, 0.75, 0.3, 0.9]);
      trait(traits, [e.x, e.y, 0], [e.x, e.y, Math.max(e.z - e.hauteur / 2, 0)], [1, 1, 1, 0.25]);
    }
    // Micro.
    const m = [s.micro[0], s.micro[1], s.ecoute];
    trait(traits, [m[0], m[1], 0], m, [1, 1, 1, 0.8]);
    poly(polyedre(nouveauBloc({ forme: 'cylindre', x: m[0], y: m[1], z: m[2] + 0.06, longueur: 0.06, profondeur: 0.06, hauteur: 0.12 })), [0.95, 0.95, 0.95, 1], null, opaques);
    this.geo = { opaques, translucides, traits, faces, murs, ouvParoi };
  }

  // MARK: Textures des cartes

  texture(nom, l, h, remplir) {
    const gl = this.gl;
    let t = this.textures[nom];
    if (!t) { t = gl.createTexture(); this.textures[nom] = t; }
    const px = new Uint8Array(l * h * 4);
    remplir(px);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, l, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  textureRaster(nom, r, phase) {
    return this.texture(nom, r.l, r.h, (px) => {
      const c = Math.cos(phase || 0), sn = Math.sin(phase || 0);
      for (let k = 0; k < r.l * r.h; k++) {
        const v = r.db[k];
        if (isNaN(v)) continue;
        let col;
        if (phase != null && r.phaseurs) col = divergente(r.phaseurs[2 * k] * c - r.phaseurs[2 * k + 1] * sn);
        else if (annulation(v, r)) col = (k % r.l + Math.floor(k / r.l)) % 6 < 2 ? [15, 15, 25] : turbo(0);
        else col = turbo(versEchelle(v, r));
        px[4 * k] = col[0]; px[4 * k + 1] = col[1]; px[4 * k + 2] = col[2]; px[4 * k + 3] = 235;
      }
    });
  }

  /// Texture 3D du volume (refaite quand le calcul, l'échelle ou l'étendue change).
  textureVolume(v) {
    const gl = this.gl, cle = `${etat.version}`;
    if (this.cleVolume === cle && this.texVolume) return this.texVolume;
    this.cleVolume = cle;
    if (!this.texVolume) this.texVolume = gl.createTexture();
    // Texture en nombres flottants (demi-précision) : pas de paliers, surfaces lisses.
    const n = v.nx * v.ny * v.nz, px = new Float32Array(n * 4), ph = v.phaseurs;
    for (let k = 0; k < n; k++) {
      const d = v.db[k];
      if (isNaN(d)) continue;
      px[4 * k] = isFinite(d) ? Math.min(Math.max(versEchelle(d, v), -0.5), 1.5) : -0.5;
      if (ph) { px[4 * k + 1] = ph[2 * k]; px[4 * k + 2] = ph[2 * k + 1]; }
      px[4 * k + 3] = 1;
    }
    // Léger lissage 3D (noyau 1-2-1 sur chaque axe, cases d'air seulement) : le bruit de la grille
    // de calcul au ras des parois ne fait plus de grain sur les surfaces.
    {
      const nx = v.nx, ny = v.ny, nz = v.nz, nxy = nx * ny, pas = [1, nx, nxy], taille = [nx, ny, nz];
      for (let ax = 0; ax < 3; ax++) {
        const src = px.slice();
        for (let k = 0; k < n; k++) {
          if (!src[4 * k + 3]) continue;
          const pos = [k % nx, Math.floor(k / nx) % ny, Math.floor(k / nxy)][ax];
          let w = 2, r = 2 * src[4 * k], g = 2 * src[4 * k + 1], b = 2 * src[4 * k + 2];
          for (const sg of [-1, 1]) {
            const p2 = pos + sg;
            if (p2 < 0 || p2 >= taille[ax]) continue;
            const m = k + sg * pas[ax];
            if (!src[4 * m + 3]) continue;
            r += src[4 * m]; g += src[4 * m + 1]; b += src[4 * m + 2]; w++;
          }
          px[4 * k] = r / w; px[4 * k + 1] = g / w; px[4 * k + 2] = b / w;
        }
      }
    }
    // Les cases pleines (murs, toit, meubles) prennent la valeur de leurs voisines d'air :
    // l'interpolation au bord ne crée pas de fausse surface.
    const nx = v.nx, nxy = v.nx * v.ny, connu = new Uint8Array(n);
    for (let k = 0; k < n; k++) connu[k] = px[4 * k + 3] ? 1 : 0;
    for (let passe = 0; passe < 3; passe++) {
      const deja = connu.slice();
      for (let k = 0; k < n; k++) {
        if (deja[k]) continue;
        const i = k % nx, j = Math.floor(k / nx) % v.ny, l = Math.floor(k / nxy);
        let r = 0, g = 0, b = 0, c = 0;
        for (const [di, dj, dl] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
          const ii = i + di, jj = j + dj, ll = l + dl;
          if (ii < 0 || jj < 0 || ll < 0 || ii >= nx || jj >= v.ny || ll >= v.nz) continue;
          const m = ll * nxy + jj * nx + ii;
          if (!deja[m]) continue;
          r += px[4 * m]; g += px[4 * m + 1]; b += px[4 * m + 2]; c++;
        }
        if (c) { px[4 * k] = r / c; px[4 * k + 1] = g / c; px[4 * k + 2] = b / c; connu[k] = 1; }
      }
    }
    gl.bindTexture(gl.TEXTURE_3D, this.texVolume);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA16F, v.nx, v.ny, v.nz, 0, gl.RGBA, gl.FLOAT, px);
    for (const [k, x] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_3D, k, x);
    return this.texVolume;
  }

  volume(v, vp, phase) {
    const gl = this.gl, p = this.progV, s = etat.scene;
    gl.useProgram(p);
    gl.disable(gl.DEPTH_TEST);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tamponV);
    const lp = gl.getAttribLocation(p, 'p');
    gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 8, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_3D, this.textureVolume(v));
    gl.uniform1i(gl.getUniformLocation(p, 'vol'), 0);
    gl.uniformMatrix4fv(gl.getUniformLocation(p, 'inv'), false, inverser(vp));
    gl.uniform3fv(gl.getUniformLocation(p, 'oeil'), this.regard.oeil);
    gl.uniform3fv(gl.getUniformLocation(p, 'bmax'), [s.longueur, s.largeur, s.hauteur]);
    gl.uniform1f(gl.getUniformLocation(p, 'onde'), phase != null && v.phaseurs ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(p, 'seuil'), etat.seuilVolume);
    gl.uniform3fv(gl.getUniformLocation(p, 'texel'), [1 / v.nx, 1 / v.ny, 1 / v.nz]);
    gl.uniform1f(gl.getUniformLocation(p, 'cphase'), Math.cos(phase || 0));
    gl.uniform1f(gl.getUniformLocation(p, 'sphase'), Math.sin(phase || 0));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(lp);
    gl.enable(gl.DEPTH_TEST);
  }

  textureApercu(a) {
    const s = etat.scene;
    let m = 1e-12;
    for (const v of a.valeurs) if (!isNaN(v)) m = Math.max(m, Math.abs(v));
    return this.texture('apercu', a.l, a.h, (px) => {
      for (let k = 0; k < a.l * a.h; k++) {
        const v = a.valeurs[k];
        if (isNaN(v)) continue;
        const x = ((k % a.l) + 0.5) / a.l * s.longueur, y = (Math.floor(k / a.l) + 0.5) / a.h * s.largeur;
        if (!dansPolygone(x, y, s.contour)) continue;
        const u = v / m, col = divergente(Math.sign(u) * Math.sqrt(Math.abs(u)));
        px[4 * k] = col[0]; px[4 * k + 1] = col[1]; px[4 * k + 2] = col[2]; px[4 * k + 3] = 235;
      }
    });
  }

  // MARK: Dessin

  dessiner() {
    const gl = this.gl;
    if (!gl) return;
    const s = etat.scene;
    if (this.cadrage !== etat.cadrage) { this.cadrage = etat.cadrage; this.regard.cadrer(s, true); }
    if (this.recadrage !== etat.recadrage.n) {
      this.recadrage = etat.recadrage.n;
      this.regard.cible = [this.regard.cible[0] + etat.recadrage.dx, this.regard.cible[1] + etat.recadrage.dy, this.regard.cible[2]];
    }
    if (!s.plan) this.regard.cadrer(s);
    this.construire();
    const g = this.geo, oeil = this.regard.oeil, vp = this.regard.matrice;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.17, 0.18, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.prog, 'vp'), false, vp);
    const lum = v3.norm([oeil[0] - this.regard.cible[0], oeil[1] - this.regard.cible[1], oeil[2] - this.regard.cible[2] + this.regard.distance]);
    gl.uniform3fv(gl.getUniformLocation(this.prog, 'lumiere'), lum);
    const dims = [s.longueur, s.largeur, s.hauteur];
    const cache = [0, 1, 2, 3, 4, 5].map((c) => (hautCote(c) ? oeil[axeCote(c)] > dims[axeCote(c)] : oeil[axeCote(c)] < 0));
    const piece = [], objets = [], ar = [];
    g.murs.forEach((t, c) => { if (!cache[c]) piece.push(...t); });
    for (const f of g.faces) {
      if (f.mur != null && cache[f.mur]) continue;
      if (f.paroi && v3.dot(f.paroi[0], v3.sub(oeil, f.paroi[1])) < 0) continue;
      if (v3.dot(f.n, v3.sub(oeil, f.p)) < 0) continue;
      (f.objet ? objets : piece).push(...f.t); ar.push(...f.ar);
    }
    const anime = etat.animer && etat.raster && etat.raster.phaseurs ? (performance.now() / 1000 % 1.6) / 1.6 * 2 * Math.PI : null;
    const L = s.longueur, W = s.largeur, z = s.ecoute;
    if (etat.volume3D && etat.volume && !etat.enCours) {
      // Volume : la pièce, puis l'onde qui la remplit, puis les meubles et les enceintes par-dessus.
      this.lot(piece, gl.TRIANGLES);
      this.volume(etat.volume, vp, etat.animer && etat.volume.phaseurs ? (performance.now() / 1000 % 1.6) / 1.6 * 2 * Math.PI : null);
      this.lot(objets.concat(g.opaques), gl.TRIANGLES);
      this.lot(ar, gl.LINES);
      gl.depthMask(false);
    } else {
      this.lot(piece.concat(objets, g.opaques), gl.TRIANGLES);
      this.lot(ar, gl.LINES);
      // Nappe à la hauteur d'écoute (translucide, sans écrire la profondeur).
      gl.depthMask(false);
      let tex = null;
      if (etat.enCours && etat.apercu) tex = this.textureApercu(etat.apercu);
      else if (etat.raster && etat.raster.vue === 'plan' && !etat.volume3D) {
        if (anime != null || this.versionTex !== etat.version) {
          this.texPlan = this.textureRaster('plan', etat.raster, anime);
          this.versionTex = anime != null ? -1 : etat.version;
        }
        tex = this.texPlan;
      }
      if (tex) this.quad(tex, [0, 0, z], [L, 0, z], [L, W, z], [0, W, z], vp);
    }
    gl.useProgram(this.prog);
    const ouv = [], ouvA = [];
    for (const o of g.ouvParoi) if (v3.dot(o.av, v3.sub(oeil, o.c)) >= 0) { ouv.push(...o.t); ouvA.push(...o.ar); }
    this.lot(g.translucides.concat(ouv), gl.TRIANGLES);
    this.lot(g.traits.concat(ouvA), gl.LINES);
    gl.depthMask(true);
    this.etiquettes();
  }

  lot(donnees, mode) {
    if (!donnees.length) return;
    const gl = this.gl, p = this.prog;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tampon);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(donnees), gl.DYNAMIC_DRAW);
    const att = (nom, taille, dec) => { const l = gl.getAttribLocation(p, nom); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, taille, gl.FLOAT, false, N * 4, dec * 4); };
    att('p', 3, 0); att('n', 4, 3); att('c', 4, 7);
    gl.drawArrays(mode, 0, donnees.length / N);
  }

  quad(tex, a, b, c, d, vp) {
    const gl = this.gl, p = this.progT;
    gl.useProgram(p);
    gl.uniformMatrix4fv(gl.getUniformLocation(p, 'vp'), false, vp);
    const v = new Float32Array([...a, 0, 0, ...b, 1, 0, ...c, 1, 1, ...a, 0, 0, ...c, 1, 1, ...d, 0, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tamponT);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
    const lp = gl.getAttribLocation(p, 'p'), lt = gl.getAttribLocation(p, 't');
    gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(lt); gl.vertexAttribPointer(lt, 2, gl.FLOAT, false, 20, 12);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(p, 'tex'), 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // MARK: Étiquettes (calque 2D)

  etiquettes() {
    const ctx = this.calque.getContext('2d'), dpr = window.devicePixelRatio || 1, s = etat.scene, R = this.regard;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, R.taille[0], R.taille[1]);
    ctx.font = '11px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const pastille = (texte, p, fond, encre, gras) => {
      if (!p) return;
      ctx.font = `${gras ? '600 ' : ''}11px -apple-system, system-ui, sans-serif`;
      const w = ctx.measureText(texte).width + 8;
      ctx.fillStyle = fond; ctx.beginPath(); ctx.roundRect(p[0] - w / 2, p[1] - 8, w, 16, 3); ctx.fill();
      ctx.fillStyle = encre; ctx.fillText(texte, p[0], p[1] + 0.5);
    };
    for (const e of s.enceintes) pastille(e.nom, R.projeter([e.x, e.y, e.z + Math.max(e.hauteur / 2, 0.1) + 0.12]), 'rgba(0,0,0,0.55)', etat.selection === e.id ? '#f90' : '#fff', etat.selection === e.id);
    const q = coinsPlan(s);
    if (q.length > 2) {
      const ms = murDuPlan(s, etat.selection);
      q.forEach((a, i) => {
        const b = q[(i + 1) % q.length], n = normalePlan(s, i) || [0, 0], m = v2.add(v2.mul(v2.add(a, b), 0.5), v2.mul(n, 0.22));
        pastille(`${v2.dist(a, b).toFixed(2)} m`, R.projeter([m[0], m[1], 0.01]), 'rgba(0,0,0,0.5)', '#fff', ms === i);
      });
    }
    if (etat.selection) for (const [a, b] of cotes(s, etat.selection)) {
      if (v2.dist(a, b) <= 0.04) continue;
      const m = v2.mul(v2.add(a, b), 0.5);
      pastille(v2.dist(a, b).toFixed(2), R.projeter([m[0], m[1], 0.02]), '#fb8c00', '#000', true);
    }
    if (s.plan || s.contour) {
      const o = origine(s), pts = s.plan ? q : s.contour, hi = pts.reduce((mm, x) => v2.max(mm, x), [-Infinity, -Infinity]);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let k = 0; k <= Math.floor(hi[0] - o[0] + 1e-6); k++) { const p = R.projeter([o[0] + k, o[1] - 0.85, 0.005]); if (p) ctx.fillText(k ? `${k} m` : '0', p[0], p[1]); }
      for (let k = 1; k <= Math.floor(hi[1] - o[1] + 1e-6); k++) { const p = R.projeter([o[0] - 0.85, o[1] + k, 0.005]); if (p) ctx.fillText(`${k} m`, p[0], p[1]); }
    }
    if (etat.coinActif != null && q[etat.coinActif]) {
      const c = q[etat.coinActif], o = origine(s);
      pastille(`x ${(c[0] - o[0]).toFixed(2)} · y ${(c[1] - o[1]).toFixed(2)} m`, R.projeter([c[0], c[1], s.hauteur + 0.15]), '#fb8c00', '#000', true);
    }
    const v = etat.raster ? valeurRaster(etat.raster, s.micro[0], s.micro[1]) : null;
    const rel = v != null ? v - zeroDB(etat.raster) : null;
    pastille(rel != null ? `${rel >= 0 ? '+' : '−'}${Math.abs(rel).toFixed(1)} dB` : 'micro', R.projeter([s.micro[0], s.micro[1], s.ecoute + 0.22]), 'rgba(255,255,255,0.88)', '#000', true);
    this.dessinerMarquesPlacement(ctx);
  }

  /// Places proposées par la recherche de la meilleure position (numérotées).
  dessinerMarquesPlacement(ctx) {
    const P = etat.placement;
    if (!P) return;
    for (const q of (P.resultats[0] || { positions: [] }).positions) {
      const e = etat.scene.enceintes.find((x) => x.id === q.id), a = e && this.regard.projeter([e.x, e.y, e.z]), b = this.regard.projeter([q.x, q.y, q.z]);
      if (!a || !b) continue;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(52,199,89,0.95)'; ctx.stroke(); ctx.setLineDash([]);
    }
    P.resultats.slice(0, 3).forEach((r, k) => r.positions.forEach((q) => {
      const p = this.regard.projeter([q.x, q.y, q.z]);
      if (!p) return;
      ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 2 * Math.PI); ctx.fillStyle = k === 0 ? '#34c759' : 'rgba(52,199,89,0.75)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = '600 11px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(k + 1), p[0], p[1] + 0.5);
    }));
  }

  // MARK: Souris

  point(ev) { const r = this.canvas.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }

  surPlan(pt, z) {
    const { o, d } = this.regard.rayon(pt);
    if (Math.abs(d[2]) < 1e-6) return null;
    const t = (z - o[2]) / d[2];
    return t > 0 ? v3.add(o, v3.mul(d, t)) : null;
  }

  /// Objet sous le pointeur : [id ou 'micro', distance].
  viser(pt) {
    const { o, d } = this.regard.rayon(pt), s = etat.scene, oeil = this.regard.oeil;
    let best = null;
    const garder = (id, t) => { if (!best || t < best[1]) best = [id, t]; };
    for (const e of s.enceintes) {
      const a = axe(e);
      const p = polyedre(nouveauBloc({ x: e.x - a[0] * e.profondeur / 2, y: e.y - a[1] * e.profondeur / 2, z: e.z,
        longueur: Math.max(e.genre === 'nu' ? e.baffle : e.largeur, 0.2), profondeur: Math.max(e.profondeur, 0.2), hauteur: Math.max(e.genre === 'nu' ? e.baffle : e.hauteur, 0.2), azimut: e.azimut }));
      const h = p.intersection(o, d, 1e4); if (h) garder(e.id, h[0]);
    }
    const t0 = s.plan ? toit(s) : null;
    if (t0) {
      for (const f of t0.faces()) {
        if (f.mur == null || Math.abs(d[2]) < 1e-9) continue;
        const r = t0.bord(f.mur);
        if (r.n[0] * (oeil[0] - r.a[0]) + r.n[1] * (oeil[1] - r.a[1]) < 0) continue;
        const den = d[2] - r.g[0] * d[0] - r.g[1] * d[1];
        if (Math.abs(den) < 1e-9) continue;
        const t = (r.g[0] * o[0] + r.g[1] * o[1] + r.c - o[2]) / den;
        if (t <= 0) continue;
        const qp = [o[0] + d[0] * t, o[1] + d[1] * t];
        if (dansPolygone(qp[0], qp[1], f.points)) garder(idRampant(f.mur), t);
      }
    }
    for (const b of s.blocs) {
      if ((b.duPlan != null && b.forme === 'toit') || b.duPlan === 'profil') continue;
      if ((b.dansParoi || b.duPlan != null) && b.forme !== 'toit') {
        const av = avant(b);
        if (av[0] * (oeil[0] - b.x) + av[1] * (oeil[1] - b.y) < 0) continue;
      }
      const h = polyedre(b).intersection(o, d, 1e4);
      if (h) {
        const p = v3.add(o, v3.mul(d, h[0]));
        if (h[1][2] > 0.9 && Math.abs(p[2] - s.hauteur) < 0.02 && oeil[2] > s.hauteur) continue;
        garder(b.id, h[0]);
      }
    }
    const micro = polyedre(nouveauBloc({ x: s.micro[0], y: s.micro[1], z: s.ecoute, longueur: 0.25, profondeur: 0.25, hauteur: 0.25 }));
    const hm = micro.intersection(o, d, 1e4); if (hm) garder('micro', hm[0]);
    return best;
  }

  /// La 3D n'est qu'une vue : tourner, décaler, zoomer ; un simple clic sélectionne un élément
  /// (il se règle dans les vues Plan et Coupe, ou dans le panneau).
  souris() {
    const c = this.calque;
    c.addEventListener('contextmenu', (ev) => ev.preventDefault());
    c.addEventListener('pointerdown', (ev) => {
      c.setPointerCapture(ev.pointerId);
      const pt = this.point(ev);
      this.depart = pt; this.dernier = pt; this.bouge = false;
      this.prise = { type: ev.button === 2 || ev.shiftKey ? 'decalage' : 'orbite' };
    });
    c.addEventListener('pointermove', (ev) => {
      if (!this.prise) return;
      const pt = this.point(ev), dx = pt[0] - this.dernier[0], dy = pt[1] - this.dernier[1];
      this.dernier = pt;
      if (Math.hypot(pt[0] - this.depart[0], pt[1] - this.depart[1]) > 3) this.bouge = true;
      const R = this.regard;
      if (this.prise.type === 'orbite') { R.azimut -= dx * 0.008; R.elevation = Math.min(Math.max(R.elevation + dy * 0.008, -0.15), 1.55); }
      else this.decaler(dx, dy);
      this.besoin = true;
    });
    c.addEventListener('pointerup', (ev) => {
      const P = this.prise;
      this.prise = null;
      if (P && !this.bouge && P.type === 'orbite') {
        const v = this.viser(this.point(ev));
        etat.selection = v && v[0] !== 'micro' ? v[0] : null;
        notifier();
      }
      this.besoin = true;
    });
    c.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const k = ev.ctrlKey ? 0.01 : 0.0015;
      this.regard.distance = Math.min(Math.max(this.regard.distance * Math.exp(ev.deltaY * k), 0.5), 400);
      this.besoin = true;
    }, { passive: false });
  }

  decaler(dx, dy) {
    const R = this.regard, k = R.distance * 0.0016;
    const droite = [-Math.sin(R.azimut), Math.cos(R.azimut), 0];
    R.cible = [R.cible[0] - droite[0] * dx * k, R.cible[1] - droite[1] * dx * k, R.cible[2] + dy * k];
  }

  recadrer() { this.regard.cadrer(etat.scene, true); this.besoin = true; }
}

/// Flèche de poignée (calque 2D) : pastille + flèche double dans le sens de l'étirement.
export function flechePoignee(ctx, p, bout, actif, vertical) {
  const vif = '#33ff33', fond = '#0a0f0a';
  let u = bout ? [bout[0] - p[0], bout[1] - p[1]] : [0, -1];
  const l = Math.hypot(u[0], u[1]) || 1;
  u = [u[0] / l, u[1] / l];
  const k = 15, w = [-u[1], u[0]];
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const fleche = (sg) => {
    const t = [p[0] + u[0] * k * sg, p[1] + u[1] * k * sg];
    ctx.moveTo(p[0] + u[0] * 7 * sg, p[1] + u[1] * 7 * sg); ctx.lineTo(...t);
    ctx.moveTo(t[0] - u[0] * 5 * sg + w[0] * 4, t[1] - u[1] * 5 * sg + w[1] * 4); ctx.lineTo(...t); ctx.lineTo(t[0] - u[0] * 5 * sg - w[0] * 4, t[1] - u[1] * 5 * sg - w[1] * 4);
  };
  ctx.beginPath(); fleche(1); fleche(-1);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = actif ? '#fff' : vif; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  if (vertical) ctx.rect(p[0] - 6, p[1] - 6, 12, 12); else ctx.arc(p[0], p[1], 6.5, 0, 2 * Math.PI);
  ctx.fillStyle = actif ? vif : fond; ctx.fill();
  ctx.strokeStyle = vif; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

export { reglage };
