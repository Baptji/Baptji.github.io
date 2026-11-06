/* Vue 3D du terrain en Three.js (B.3), reprise du rendu Metal de l'app Mac
 * (Sources/Rendu/Terrain3D.swift et Shaders.swift) : bloc-diagramme à parois en strates,
 * éclairage au pixel calculé depuis les altitudes complètes, photo, coloration et couches. */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

THREE.ColorManagement.enabled = false;
const VIDE = -1e30;   // altitude « sans donnée » dans la texture (plus sûr que NaN sur tous les pilotes)

const COMMUN = /* glsl */`
  uniform sampler2D hauteurs;
  uniform vec4 a;   // largeur (m), hauteur (m), 1/colonnes, 1/lignes
  uniform vec4 b;   // hmin, hmax, hcentre, exagération
  float alt(vec2 t, float defaut) { float z = texture(hauteurs, t).r; return z < -1e29 ? defaut : z; }
`;

const SOMMET_TERRAIN = COMMUN + /* glsl */`
  out vec2 vUv; out float vH; out float vVide;
  void main() {
    vec2 t = position.xz;
    float z = texture(hauteurs, t).r;
    vVide = z < -1e29 ? 1.0 : 0.0;
    if (z < -1e29) z = b.x;
    vec3 p = vec3((t.x - 0.5) * a.x, (z - b.z) * b.w, (t.y - 0.5) * a.y);
    vUv = t; vH = z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const PIXEL_TERRAIN = COMMUN + /* glsl */`
  uniform vec4 c;       // pas (m), mode de fond, opacité des couches, éclairage de la photo
  uniform vec4 soleil;  // direction (xyz), opacité de la photo (w)
  uniform vec4 d;       // photo, coloration, superposition présentes
  uniform vec4 p0;      // pinceau : centre (colonne, ligne), demi-longueur, demi-largeur (cellules)
  uniform vec4 p1;      // pinceau : forme, répartition, visible, sens (+1 camion, −1 aspirateur)
  uniform vec4 p2;      // pinceau : cosinus et sinus de l'angle
  uniform sampler2D photo, coloration, couches, calque;
  uniform vec4 e;       // calques de l'étude présents
  in vec2 vUv; in float vH; in float vVide;
  out vec4 sortie;
  // Même règle que le noyau (rayonPinceau) : la cellule est dans la forme si r <= 1.
  float rayonPinceau(vec2 cel) {
    float dx = cel.x - p0.x, dy = p0.y - cel.y;   // les lignes croissent vers le sud
    float x = dx * p2.x + dy * p2.y, y = dy * p2.x - dx * p2.y;
    float ra = max(p0.z, 1e-3), rb = max(p0.w, 1e-3);
    int f = int(p1.x + 0.5);
    if (f == 0) return length(vec2(x, y)) / ra;
    if (f == 1) return max(abs(x), abs(y)) / ra;
    if (f == 2) return max(abs(x) / ra, abs(y) / rb);
    return max(abs(y), abs(x) * 0.8660254 + abs(y) * 0.5) / (ra * 0.8660254);
  }
  vec3 hypsometrie(float t) {
    vec3 cols[6] = vec3[6](vec3(0.184, 0.420, 0.227), vec3(0.498, 0.663, 0.376), vec3(0.847, 0.816, 0.561),
                           vec3(0.725, 0.537, 0.357), vec3(0.541, 0.365, 0.278), vec3(0.929, 0.902, 0.875));
    float x = clamp(t, 0.0, 1.0) * 5.0;
    int i = min(int(x), 4);
    return mix(cols[i], cols[i + 1], x - float(i));
  }
  void main() {
    if (vVide > 0.001) discard;
    vec2 tx = a.zw;
    float z0 = vH;
    float hg = alt(vUv - vec2(tx.x, 0.0), z0), hd = alt(vUv + vec2(tx.x, 0.0), z0);
    float hn = alt(vUv - vec2(0.0, tx.y), z0), hs = alt(vUv + vec2(0.0, tx.y), z0);
    float pas = c.x, exa = b.w;
    vec3 n = normalize(vec3(-(hd - hg) / (2.0 * pas) * exa, 1.0, -(hs - hn) / (2.0 * pas) * exa));
    float lambert = max(dot(n, normalize(soleil.xyz)), 0.0);
    int mode = int(c.y + 0.5);
    float t = (z0 - b.x) / max(1e-3, b.y - b.x);
    vec3 base; float ombre;
    if (mode == 0 && d.x > 0.5) {
      base = mix(hypsometrie(t), texture(photo, vUv).rgb, soleil.w);
      ombre = mix(0.32 + 0.8 * lambert, mix(1.0, 0.45 + 0.75 * lambert, c.w), soleil.w);
    } else if (mode == 2 && d.y > 0.5) {
      vec4 v = texture(coloration, vUv);
      base = v.a > 0.01 ? v.rgb / v.a : vec3(0.6);
      ombre = 0.55 + 0.55 * lambert;
    } else {
      base = hypsometrie(t);
      ombre = 0.32 + 0.8 * lambert;
    }
    vec3 col = base * ombre;
    if (e.x > 0.5) {
      // Calques de l'étude (géologie, sols, courbes, vues anciennes), éclairés comme la photo.
      vec4 k = texture(calque, vUv);
      if (k.a > 0.0) col = mix(col, k.rgb / k.a * mix(1.0, 0.45 + 0.75 * lambert, 0.55), k.a);
    }
    if (d.z > 0.5) {
      vec4 s = texture(couches, vUv);
      if (s.a > 0.0) col = mix(col, s.rgb / s.a, s.a * c.z);
    }
    if (p1.z > 0.5) {
      // Empreinte du pinceau, cellule par cellule : teinte d'autant plus forte que la cellule reçoit
      // (ou perd) davantage, et liseré sur les cellules du bord.
      vec2 cel = floor(vUv / a.zw);
      float r = rayonPinceau(cel);
      if (r <= 1.0) {
        float f = 0.5 * (1.0 + cos(3.14159265 * r)), q = p1.y;
        float w = q < 0.0 ? 1.0 + q * (1.0 - f) : 1.0 - q * f;
        bool bord = rayonPinceau(cel + vec2(1.0, 0.0)) > 1.0 || rayonPinceau(cel - vec2(1.0, 0.0)) > 1.0
                 || rayonPinceau(cel + vec2(0.0, 1.0)) > 1.0 || rayonPinceau(cel - vec2(0.0, 1.0)) > 1.0;
        vec3 teinte = p1.w > 0.0 ? vec3(1.0, 0.62, 0.12) : vec3(0.22, 0.62, 1.0);
        col = bord ? mix(col, teinte * 0.55, 0.9) : mix(col, teinte, 0.12 + 0.5 * w);
      }
    }
    sortie = vec4(col, 1.0);
  }`;

// Pluie animée : la nappe d'eau, posée sur le terrain, plus foncée là où elle est profonde.
// Sa hauteur vient d'une grille plus grossière que le MNT (echelleEau : coordonnées du MNT → de la grille de l'eau).
const SOMMET_EAU = COMMUN + /* glsl */`
  uniform sampler2D eau; uniform vec2 echelleEau;
  out vec2 vUv;
  void main() {
    vec2 t = position.xz;
    float z = texture(hauteurs, t).r, h = texture(eau, t * echelleEau).r;
    if (z < -1e29) { z = b.x; h = 0.0; }
    // Sommet sec : sous le terrain, le bord de la nappe s'y cache.
    float y = h > 0.002 ? (z + h - b.z) * b.w : (z - b.z) * b.w - 0.3 * max(1.0, b.w);
    vUv = t;
    gl_Position = projectionMatrix * modelViewMatrix * vec4((t.x - 0.5) * a.x, y, (t.y - 0.5) * a.y, 1.0);
  }`;

const PIXEL_EAU = COMMUN + /* glsl */`
  uniform sampler2D eau; uniform vec2 echelleEau; uniform vec4 c; uniform vec4 soleil;
  in vec2 vUv; out vec4 sortie;
  void main() {
    float h = texture(eau, vUv * echelleEau).r;
    if (h < 0.004) discard;
    float z0 = alt(vUv, b.x), pas = c.x, exa = b.w;
    float hg = alt(vUv - vec2(a.z, 0.0), z0), hd = alt(vUv + vec2(a.z, 0.0), z0);
    float hn = alt(vUv - vec2(0.0, a.w), z0), hs = alt(vUv + vec2(0.0, a.w), z0);
    vec3 n = normalize(vec3(-(hd - hg) / (2.0 * pas) * exa, 1.0, -(hs - hn) / (2.0 * pas) * exa));
    float l = max(dot(n, normalize(soleil.xyz)), 0.0);
    float p = sqrt(clamp(h / 0.4, 0.0, 1.0));   // de quelques millimètres à 40 cm
    vec3 col = mix(vec3(0.50, 0.78, 0.98), vec3(0.06, 0.26, 0.60), p) * (0.78 + 0.3 * l);
    // Une lame de quelques millimètres reste discrète ; à partir de 4 cm, c'est de l'eau.
    sortie = vec4(col, mix(0.16, 0.9, smoothstep(0.004, 0.04, h)));
  }`;

// Traits qui suivent l'eau : chaque segment devient un ruban de largeur constante à l'écran (en px),
// caché par le relief comme le reste de la scène.
const SOMMET_TRAIT = /* glsl */`
  attribute vec3 debut; attribute vec3 fin; attribute vec2 bout; attribute float alpha;
  uniform vec2 demiEcran; uniform float demiLargeur;
  varying float vA;
  void main() {
    vec4 P = projectionMatrix * modelViewMatrix * vec4(debut, 1.0);
    vec4 Q = projectionMatrix * modelViewMatrix * vec4(fin, 1.0);
    vec2 d = Q.xy / Q.w * demiEcran - P.xy / P.w * demiEcran;
    float l = length(d);
    d = l > 1e-6 ? d / l : vec2(1.0, 0.0);
    vec4 R = bout.x < 0.5 ? P : Q;
    R.xy += vec2(-d.y, d.x) * bout.y * demiLargeur / demiEcran * R.w;
    vA = alpha;
    gl_Position = R;
  }`;
const PIXEL_TRAIT = /* glsl */`
  varying float vA;
  void main() { if (vA < 0.01) discard; gl_FragColor = vec4(1.0, 1.0, 1.0, vA); }`;

const SOMMET_SOCLE = COMMUN + /* glsl */`
  uniform float baseSocle;
  out vec3 vMonde; out float vH;
  void main() {
    vec2 t = position.xz;
    float z = alt(t, b.x);
    float y = position.y > 0.5 ? baseSocle : (z - b.z) * b.w;
    vec3 p = vec3((t.x - 0.5) * a.x, y, (t.y - 0.5) * a.y);
    vMonde = p; vH = y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const PIXEL_SOCLE = /* glsl */`
  uniform vec4 b; uniform vec4 soleil;
  in vec3 vMonde; in float vH;
  out vec4 sortie;
  void main() {
    vec3 n = normalize(cross(dFdx(vMonde), dFdy(vMonde)));
    float l = 0.55 + 0.35 * abs(dot(n, normalize(soleil.xyz)));
    float bande = fract(vH / max(0.5, (b.y - b.x) * b.w / 6.0)) < 0.5 ? 1.0 : 0.94;
    sortie = vec4(vec3(0.56, 0.47, 0.38) * l * bande, 1.0);
  }`;

export class Vue3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35.5, 1, 1, 1e6);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.addEventListener("change", () => this.dessiner());
    this.maxTexture = this.renderer.capabilities.maxTextureSize;
    const noir = new THREE.DataTexture(new Uint8Array(4), 1, 1);
    noir.needsUpdate = true;
    this.uniformes = {
      hauteurs: { value: null }, photo: { value: noir }, coloration: { value: noir }, couches: { value: noir }, calque: { value: noir }, e: { value: new THREE.Vector4() },
      a: { value: new THREE.Vector4() }, b: { value: new THREE.Vector4() }, c: { value: new THREE.Vector4(1, 1, 0.9, 0.55) },
      soleil: { value: new THREE.Vector4(-0.5, 0.707, -0.5, 1).normalize() }, d: { value: new THREE.Vector4() },
      baseSocle: { value: 0 },
      p0: { value: new THREE.Vector4() }, p1: { value: new THREE.Vector4() }, p2: { value: new THREE.Vector4(1, 0, 0, 0) },
    };
    this.uniformes.soleil.value.w = 1;
    this.reglages = { fond: 0, exageration: 2, opaciteCouches: 0.9, opacitePhoto: 1 };
    this.fondNoir = noir;
    this.couleurFond();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { this.couleurFond(); this.dessiner(); });
    new ResizeObserver(() => this.redimensionner()).observe(canvas.parentElement);
    this.redimensionner();
  }

  couleurFond() {
    const sombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.renderer.setClearColor(sombre ? 0x232528 : 0xdde2e6, 1);
  }

  redimensionner() {
    const p = this.canvas.parentElement;
    const w = Math.max(1, p.clientWidth), h = Math.max(1, p.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dessiner();
  }

  dessiner() {
    if (this.attente) return;
    this.attente = requestAnimationFrame(() => { this.attente = 0; this.renderer.render(this.scene, this.camera); });
  }

  /** Un nouveau MNT : textures, maillage d'au plus 1 000 sommets de côté, parois, caméra. */
  charger(g) {
    this.grille = g;
    let mini = Infinity, maxi = -Infinity;
    for (const v of g.z) if (!Number.isNaN(v)) { if (v < mini) mini = v; if (v > maxi) maxi = v; }
    if (!Number.isFinite(mini)) { mini = 0; maxi = 1; }
    this.hmin = mini; this.hmax = Math.max(maxi, mini + 0.1);
    this.texHauteurs?.dispose();
    const donnees = new Float32Array(g.z.length);
    for (let i = 0; i < donnees.length; i++) donnees[i] = Number.isNaN(g.z[i]) ? VIDE : g.z[i];
    const t = new THREE.DataTexture(donnees, g.colonnes, g.lignes, THREE.RedFormat, THREE.FloatType);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    this.texHauteurs = t;
    this.uniformes.hauteurs.value = t;
    this.photo(null); this.coloration(null); this.couches(null); this.calque(null);
    this.eau(null); this.traits(null); this.jauges([]);
    for (const o of [this.terrain, this.socle]) if (o) { this.scene.remove(o); o.geometry.dispose(); }
    // Maillage : sommets au centre des cellules (u = (c + 0,5) / C), comme dans l'app Mac.
    const pas = Math.max(1, Math.ceil(Math.max(g.lignes, g.colonnes) / 1000));
    const cols = [], lignes = [];
    for (let c = 0; c < g.colonnes; c += pas) cols.push(c);
    if (cols[cols.length - 1] !== g.colonnes - 1) cols.push(g.colonnes - 1);
    for (let l = 0; l < g.lignes; l += pas) lignes.push(l);
    if (lignes[lignes.length - 1] !== g.lignes - 1) lignes.push(g.lignes - 1);
    const W = cols.length, H = lignes.length;
    const pos = new Float32Array(W * H * 3);
    lignes.forEach((l, j) => cols.forEach((c, i) => {
      const k = 3 * (j * W + i);
      pos[k] = (c + 0.5) / g.colonnes; pos[k + 1] = 0; pos[k + 2] = (l + 0.5) / g.lignes;
    }));
    const idx = new Uint32Array((W - 1) * (H - 1) * 6);
    let q = 0;
    for (let j = 0; j < H - 1; j++) for (let i = 0; i < W - 1; i++) {
      const a = j * W + i, b = a + 1, c = a + W, d = c + 1;
      idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: this.uniformes,
      vertexShader: SOMMET_TERRAIN, fragmentShader: PIXEL_TERRAIN, side: THREE.DoubleSide });
    this.terrain = new THREE.Mesh(geo, mat);
    this.terrain.frustumCulled = false;
    this.scene.add(this.terrain);
    // Parois : le tour du maillage, un sommet en haut (altitude lue dans la texture) et un en bas.
    const tour = [];
    cols.forEach(c => tour.push([c, lignes[0]]));
    lignes.slice(1).forEach(l => tour.push([cols[W - 1], l]));
    cols.slice(0, -1).reverse().forEach(c => tour.push([c, lignes[H - 1]]));
    lignes.slice(0, -1).reverse().forEach(l => tour.push([cols[0], l]));
    const s = [];
    for (let k = 0; k < tour.length - 1; k++) {
      const [c1, l1] = tour[k], [c2, l2] = tour[k + 1];
      const u1 = (c1 + 0.5) / g.colonnes, v1 = (l1 + 0.5) / g.lignes, u2 = (c2 + 0.5) / g.colonnes, v2 = (l2 + 0.5) / g.lignes;
      s.push(u1, 0, v1, u2, 0, v2, u1, 1, v1, u2, 0, v2, u2, 1, v2, u1, 1, v1);
    }
    const gs = new THREE.BufferGeometry();
    gs.setAttribute("position", new THREE.BufferAttribute(new Float32Array(s), 3));
    this.socle = new THREE.Mesh(gs, new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: this.uniformes,
      vertexShader: SOMMET_SOCLE, fragmentShader: PIXEL_SOCLE, side: THREE.DoubleSide }));
    this.socle.frustumCulled = false;
    this.scene.add(this.socle);
    this.majUniformes();
    this.recadrer();
  }

  /** Terrain remodelé (même taille) : seules les altitudes changent, la vue reste. */
  remplacerAltitudes(g) {
    if (!this.grille || this.grille.z.length !== g.z.length) return this.charger(g);
    this.grille = g;
    const t = this.texHauteurs.image.data;
    for (let i = 0; i < t.length; i++) {
      const v = g.z[i];
      t[i] = Number.isNaN(v) ? VIDE : v;
      if (!Number.isNaN(v)) { if (v < this.hmin) this.hmin = v; if (v > this.hmax) this.hmax = v; }
    }
    this.texHauteurs.needsUpdate = true;
    this.majUniformes();
  }

  /** Terrain peint en direct (camion, aspirateur) : seule la fenêtre touchée part vers la carte graphique. */
  peindre(g, r) {
    this.grille = g;
    const C = g.colonnes, w = r.c1 - r.c0 + 1, h = r.l1 - r.l0 + 1, t = this.texHauteurs.image.data, bloc = new Float32Array(w * h);
    for (let l = r.l0; l <= r.l1; l++) {
      for (let c = r.c0; c <= r.c1; c++) {
        const i = l * C + c, v = g.z[i], d = Number.isNaN(v) ? VIDE : v;
        t[i] = d; bloc[(l - r.l0) * w + c - r.c0] = d;
        if (!Number.isNaN(v)) { if (v < this.hmin) this.hmin = v; if (v > this.hmax) this.hmax = v; }
      }
    }
    const morceau = new THREE.DataTexture(bloc, w, h, THREE.RedFormat, THREE.FloatType);
    // Three r160 ne réactive pas l'unité 0 si son cache la croit liée : l'envoi partirait vers une autre texture.
    this.renderer.state.activeTexture(this.renderer.getContext().TEXTURE0);
    this.renderer.copyTextureToTexture(new THREE.Vector2(r.c0, r.l0), morceau, this.texHauteurs);
    morceau.dispose();
    this.majUniformes();
  }

  /** Empreinte du pinceau sous le curseur : { cellule, pinceau, ajout }, ou null pour la cacher. */
  apercu(a) {
    const u = this.uniformes, g = this.grille;
    if (!a || !g || a.cellule < 0 || a.cellule >= g.z.length) {
      if (u.p1.value.z !== 0) { u.p1.value.z = 0; this.dessiner(); }
      return;
    }
    const p = a.pinceau;
    u.p0.value.set(a.cellule % g.colonnes, Math.floor(a.cellule / g.colonnes), p.longueur / 2 / g.pas,
                   (p.forme === "rectangle" ? p.largeur : p.longueur) / 2 / g.pas);
    u.p1.value.set(["rond", "carre", "rectangle", "hexagone"].indexOf(p.forme), p.repartition, 1, a.ajout ? 1 : -1);
    const ang = p.angle * Math.PI / 180;
    u.p2.value.set(Math.cos(ang), Math.sin(ang), 0, 0);
    this.dessiner();
  }

  /** Camion ou aspirateur en main : le clic gauche peint, ⇧ + glisser déplace la vue. */
  modePinceau(actif) {
    this.controls.mouseButtons.LEFT = actif ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
  }

  texture(img) {
    if (!img) return null;
    // Alpha prémultiplié, comme l'app Mac : le filtrage et les niveaux réduits ne bavent pas sur les bords.
    const px = img.pixels;
    for (let i = 0; i < px.length; i += 4) {
      const a = px[i + 3];
      if (a === 255) continue;
      px[i] = px[i] * a / 255; px[i + 1] = px[i + 1] * a / 255; px[i + 2] = px[i + 2] * a / 255;
    }
    const t = new THREE.DataTexture(px, img.largeur, img.hauteur, THREE.RGBAFormat);
    t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    return t;
  }
  photo(tex) {
    if (this.texPhoto && this.texPhoto !== tex) this.texPhoto.dispose();
    this.texPhoto = tex;
    if (tex) { tex.flipY = false; tex.needsUpdate = true; }
    this.majUniformes();
  }
  coloration(img) { this.texColoration?.dispose(); this.texColoration = this.texture(img); this.majUniformes(); }
  couches(img) { this.texCouches?.dispose(); this.texCouches = this.texture(img); this.majUniformes(); }
  /** Calques de l'étude, déjà composés dans un canvas calé sur le MNT (ligne 0 au nord). */
  calque(canvas) {
    this.texCalque?.dispose();
    this.texCalque = canvas ? this.texture({ pixels: canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data, largeur: canvas.width, hauteur: canvas.height }) : null;
    this.majUniformes();
  }
  get aUnePhoto() { return !!this.texPhoto; }

  // Onglets : le terrain qu'on quitte garde sa photo et son point de vue, le suivant les reprend.
  /** Rend la photo sans la libérer (elle repartira avec son onglet). */
  detacherPhoto() { const t = this.texPhoto || null; this.texPhoto = null; this.majUniformes(); return t; }
  etatVue() {
    return { position: this.camera.position.clone(), cible: this.controls.target.clone(), near: this.camera.near, far: this.camera.far,
             hmin: this.hmin, hmax: this.hmax, exageration: this.reglages.exageration };
  }
  /** Après charger() : mêmes bornes d'altitude et même point de vue qu'au départ de l'onglet. */
  retablirVue(e) {
    if (!e) return;
    this.hmin = e.hmin; this.hmax = e.hmax;
    const f = this.reglages.exageration / Math.max(0.01, e.exageration);
    this.controls.target.copy(e.cible); this.controls.target.y *= f;
    this.camera.position.copy(e.position); this.camera.position.y *= f;
    this.camera.near = e.near; this.camera.far = e.far;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.majUniformes();
  }
  // Pluie animée -----------------------------------------------------------
  /** Nappe d'eau : e = { w, h, hauteur (m, w × h), echelle: [sx, sy] }, ou null pour l'enlever. */
  eau(e) {
    if (!e) {
      if (this.nappe) { this.scene.remove(this.nappe); this.nappe.material.dispose(); this.nappe = null; }
      this.texEau?.dispose(); this.texEau = null;
      this.dessiner();
      return;
    }
    if (!this.terrain) return;
    if (!this.texEau || this.texEau.image.width !== e.w || this.texEau.image.height !== e.h) {
      this.texEau?.dispose();
      const t = new THREE.DataTexture(new Float32Array(e.w * e.h), e.w, e.h, THREE.RedFormat, THREE.FloatType);
      t.minFilter = t.magFilter = this.renderer.extensions.has("OES_texture_float_linear") ? THREE.LinearFilter : THREE.NearestFilter;
      this.texEau = t;
    }
    if (!this.nappe) {
      const u = this.uniformes;
      this.uEau = { eau: { value: this.texEau }, echelleEau: { value: new THREE.Vector2(1, 1) } };
      const mat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3,
        uniforms: { hauteurs: u.hauteurs, a: u.a, b: u.b, c: u.c, soleil: u.soleil, ...this.uEau },
        vertexShader: SOMMET_EAU, fragmentShader: PIXEL_EAU, transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4, side: THREE.DoubleSide });
      this.nappe = new THREE.Mesh(this.terrain.geometry, mat);
      this.nappe.frustumCulled = false;
      this.nappe.renderOrder = 2;
      this.scene.add(this.nappe);
    }
    this.uEau.eau.value = this.texEau;
    this.uEau.echelleEau.value.set(e.echelle[0], e.echelle[1]);
    this.texEau.image.data.set(e.hauteur);
    this.texEau.needsUpdate = true;
    this.dessiner();
  }

  /** Rubans des traits blancs : nb segments, 4 sommets chacun. Rend les tableaux à remplir
   *  (debut, fin : xyz ; alpha : par sommet, 0–1 au début puis 2–3 à la fin du segment). */
  creerTraits(nb) {
    this.traits(null);
    const v = nb * 4, debut = new Float32Array(v * 3), fin = new Float32Array(v * 3), alpha = new Float32Array(v), bout = new Float32Array(v * 2);
    const index = new Uint32Array(nb * 6);
    for (let s = 0; s < nb; s++) {
      const o = s * 4;
      bout.set([0, -1, 0, 1, 1, -1, 1, 1], o * 2);
      index.set([o, o + 2, o + 1, o + 1, o + 2, o + 3], s * 6);
    }
    const geo = new THREE.BufferGeometry(), dyn = a => a.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("debut", dyn(new THREE.BufferAttribute(debut, 3)));
    geo.setAttribute("position", geo.getAttribute("debut"));
    geo.setAttribute("fin", dyn(new THREE.BufferAttribute(fin, 3)));
    geo.setAttribute("alpha", dyn(new THREE.BufferAttribute(alpha, 1)));
    geo.setAttribute("bout", new THREE.BufferAttribute(bout, 2));
    geo.setIndex(new THREE.BufferAttribute(index, 1));
    this.uTraits = { demiEcran: { value: new THREE.Vector2(1, 1) }, demiLargeur: { value: 0.8 } };
    this.lignes = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: this.uTraits, vertexShader: SOMMET_TRAIT, fragmentShader: PIXEL_TRAIT,
      transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    this.lignes.frustumCulled = false;
    this.lignes.renderOrder = 3;
    this.scene.add(this.lignes);
    return { debut, fin, alpha };
  }

  /** Les tableaux des traits ont été remplis : à envoyer. null : plus de traits. */
  traits(maj) {
    if (!maj) {
      if (this.lignes) { this.scene.remove(this.lignes); this.lignes.geometry.dispose(); this.lignes.material.dispose(); this.lignes = null; }
      this.dessiner();
      return;
    }
    if (!this.lignes) return;
    const g = this.lignes.geometry, taille = new THREE.Vector2();
    this.renderer.getDrawingBufferSize(taille);
    this.uTraits.demiEcran.value.set(taille.x / 2, taille.y / 2);
    this.uTraits.demiLargeur.value = 0.8 * this.renderer.getPixelRatio();
    for (const k of ["debut", "fin", "alpha"]) g.attributes[k].needsUpdate = true;
    this.dessiner();
  }

  // Jauges -----------------------------------------------------------------
  /** Poteaux gradués posés sur le terrain : [{ cle, cellule, echelle (m d'eau sur toute la hauteur), profondeur, maxi }].
   *  Bandes claires et foncées de 10 cm, chapeau et socle rouges ; le bleu monte avec l'eau, le trait rouge marque
   *  le plus haut niveau de l'événement. La jauge est agrandie pour rester lisible : ses graduations ne sont pas
   *  à l'échelle du relief. */
  jauges(liste) {
    const g = this.grille;
    if (!this.groupeJauges) {
      this.groupeJauges = new THREE.Group();
      this.scene.add(this.groupeJauges);
      this.scene.add(new THREE.AmbientLight(0xffffff, 1.7));
      const soleil = new THREE.DirectionalLight(0xffffff, 2.2);
      soleil.position.set(-0.5, 0.707, -0.5);
      this.scene.add(soleil);
      this.jaugesVues = new Map();
    }
    const vues = new Set();
    for (const j of g ? liste || [] : []) {
      vues.add(j.cle);
      let o = this.jaugesVues.get(j.cle);
      if (!o || o.echelle !== j.echelle || o.taille !== Math.max(g.colonnes, g.lignes) * g.pas) {
        if (o) this.retirerJauge(o);
        o = this.creerJauge(j.echelle);
        this.jaugesVues.set(j.cle, o);
      }
      const z = g.z[j.cellule], c = j.cellule % g.colonnes, l = Math.floor(j.cellule / g.colonnes);
      const [x, y, zz] = this.versMonde(c + 0.5, l + 0.5, Number.isNaN(z) ? this.hmin : z);
      o.groupe.position.set(x, y, zz);
      const h = o.hauteur, eau = Math.max(0, Math.min(1, j.profondeur / j.echelle)), maxi = Math.max(0, Math.min(1, j.maxi / j.echelle));
      o.eau.visible = eau > 0.002;
      o.eau.scale.y = Math.max(1e-3, eau * h);
      o.eau.position.y = eau * h / 2;
      o.maxi.visible = maxi > 0.002;
      o.maxi.position.y = maxi * h;
      o.sommet = new THREE.Vector3(x, y + h + o.largeur * 1.2, zz);
    }
    for (const [cle, o] of this.jaugesVues) if (!vues.has(cle)) { this.retirerJauge(o); this.jaugesVues.delete(cle); }
    this.dessiner();
  }

  creerJauge(echelle) {
    const g = this.grille, taille = Math.max(g.colonnes, g.lignes) * g.pas;
    const l = taille * 0.011, h = taille * 0.075, groupe = new THREE.Group();
    // Graduations : une bande par 10 cm, un trait et la valeur tous les 50 cm.
    const n = Math.max(1, Math.round(echelle / 0.1)), cv = document.createElement("canvas");
    cv.width = 64; cv.height = 512;
    const x = cv.getContext("2d"), bande = cv.height / n;
    for (let k = 0; k < n; k++) {
      x.fillStyle = k % 2 ? "#8f6136" : "#e3c08a";
      x.fillRect(0, cv.height - (k + 1) * bande, cv.width, bande + 0.5);
      x.fillStyle = "rgba(0, 0, 0, 0.18)";
      x.fillRect(0, cv.height - (k + 1) * bande, cv.width, 1.5);
    }
    x.font = "bold 15px -apple-system, system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    for (let k = 5; k < n; k += 5) {
      const y = cv.height - k * bande;
      x.fillStyle = "#3b2414"; x.fillRect(0, y - 1.5, cv.width, 3);
      x.fillStyle = "#fff8ec"; x.strokeStyle = "#3b2414"; x.lineWidth = 3;
      const texte = (k / 10).toFixed(1).replace(".", ",");
      x.strokeText(texte, cv.width / 2, y - 12); x.fillText(texte, cv.width / 2, y - 12);
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.NoColorSpace;
    const bois = new THREE.MeshLambertMaterial({ map: tex }), bout = new THREE.MeshLambertMaterial({ color: 0xb98a55 });
    const rouge = new THREE.MeshLambertMaterial({ color: 0xc0392b });
    const poteau = new THREE.Mesh(new THREE.BoxGeometry(l, h, l), [bois, bois, bout, bout, bois, bois]);
    poteau.position.y = h / 2;
    const socle = new THREE.Mesh(new THREE.BoxGeometry(l * 1.9, l * 0.18, l * 1.9), rouge);
    socle.position.y = l * 0.09;
    const chapeau = new THREE.Mesh(new THREE.ConeGeometry(l * 0.85, l * 1.1, 4), rouge);
    chapeau.rotation.y = Math.PI / 4;
    chapeau.position.y = h + l * 0.55;
    const eau = new THREE.Mesh(new THREE.BoxGeometry(l * 1.14, 1, l * 1.14),
      new THREE.MeshLambertMaterial({ color: 0x3f93e8, transparent: true, opacity: 0.62, depthWrite: false }));
    const maxi = new THREE.Mesh(new THREE.BoxGeometry(l * 1.42, h * 0.014, l * 1.42), new THREE.MeshLambertMaterial({ color: 0xe53935 }));
    groupe.add(poteau, socle, chapeau, eau, maxi);
    for (const m of groupe.children) m.renderOrder = 4;
    this.groupeJauges.add(groupe);
    return { groupe, eau, maxi, hauteur: h, largeur: l, echelle, taille, tex };
  }

  retirerJauge(o) {
    this.groupeJauges.remove(o.groupe);
    o.groupe.traverse(m => { if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => x.dispose()); } });
    o.tex.dispose();
  }

  /** Position à l'écran (px dans le canvas) du haut de chaque jauge, pour les étiquettes. */
  positionsJauges() {
    const r = this.canvas.getBoundingClientRect(), out = new Map();
    for (const [cle, o] of this.jaugesVues || []) {
      if (!o.sommet) continue;
      const p = o.sommet.clone().project(this.camera);
      if (p.z > 1) continue;
      out.set(cle, [(p.x + 1) / 2 * r.width, (1 - p.y) / 2 * r.height]);
    }
    return out;
  }

  /** Point de la scène pour une position continue du MNT (colonne, ligne depuis le coin nord-ouest) et une altitude. */
  versMonde(colonne, ligne, z) {
    const g = this.grille, hc = (this.hmin + this.hmax) / 2;
    return [colonne * g.pas - g.colonnes * g.pas / 2, (z - hc) * this.reglages.exageration, ligne * g.pas - g.lignes * g.pas / 2];
  }

  /** Plus aucun terrain : maillage et textures libérés. */
  vider() {
    for (const o of [this.terrain, this.socle]) if (o) { this.scene.remove(o); o.geometry.dispose(); o.material.dispose(); }
    this.terrain = this.socle = null;
    this.photo(null); this.coloration(null); this.couches(null); this.calque(null); this.eau(null); this.traits(null); this.jauges([]);
    this.texHauteurs?.dispose(); this.texHauteurs = null; this.uniformes.hauteurs.value = null;
    this.grille = null;
    this.dessiner();
  }

  majUniformes() {
    const g = this.grille;
    if (!g) return;
    const u = this.uniformes, r = this.reglages;
    const W = g.colonnes * g.pas, H = g.lignes * g.pas, hc = (this.hmin + this.hmax) / 2;
    u.a.value.set(W, H, 1 / g.colonnes, 1 / g.lignes);
    u.b.value.set(this.hmin, this.hmax, hc, r.exageration);
    u.c.value.set(g.pas, r.fond, r.opaciteCouches, 0.55);
    u.soleil.value.w = r.opacitePhoto;
    u.photo.value = this.texPhoto || this.fondNoir;
    u.coloration.value = this.texColoration || this.fondNoir;
    u.couches.value = this.texCouches || this.fondNoir;
    u.calque.value = this.texCalque || this.fondNoir;
    u.e.value.set(this.texCalque ? 1 : 0, 0, 0, 0);
    u.d.value.set(this.texPhoto ? 1 : 0, this.texColoration ? 1 : 0, this.texCouches ? 1 : 0, 0);
    u.baseSocle.value = (this.hmin - hc) * r.exageration - Math.max(W, H) * 0.04;
    this.dessiner();
  }

  regler(r) {
    const avant = this.reglages.exageration;
    Object.assign(this.reglages, r);
    if (this.grille && r.exageration !== undefined && r.exageration !== avant) {
      // Garder la cible à la surface quand on change l'exagération.
      const f = r.exageration / Math.max(0.01, avant);
      this.controls.target.y *= f; this.camera.position.y *= f; this.controls.update();
    }
    this.majUniformes();
  }

  get taille() { const g = this.grille; return g ? [g.colonnes * g.pas, g.lignes * g.pas] : [1000, 1000]; }

  /** Vue d'ensemble : tout le MNT, vu de biais depuis le sud-est (comme l'app Mac). */
  recadrer() {
    const [w, h] = this.taille;
    const relief = (this.hmax - this.hmin) * this.reglages.exageration;
    const cible = new THREE.Vector3(0, relief * 0.1, 0);
    this.placer(cible, Math.max(w, h) * 1.45 + relief, Math.PI * 0.15, 0.62);
  }
  vueDessus() {
    // Tout le MNT dans le cadre, quelle que soit la forme de la fenêtre.
    const [w, h] = this.taille, t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const d = Math.max(h / 2 / t, w / 2 / (t * this.camera.aspect)) * 1.08 + (this.hmax - this.hmin) * this.reglages.exageration;
    this.placer(new THREE.Vector3(0, 0, 0), d, 0, Math.PI / 2 - 0.021);
  }
  placer(cible, distance, azimut, elevation) {
    this.controls.target.copy(cible);
    this.camera.position.set(cible.x + distance * Math.cos(elevation) * Math.sin(azimut), cible.y + distance * Math.sin(elevation),
                             cible.z + distance * Math.cos(elevation) * Math.cos(azimut));
    this.camera.near = Math.max(0.5, distance / 2000); this.camera.far = distance * 20 + 1e4;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.dessiner();
  }

  /** Position du centre de la cellule i dans la scène. */
  positionMonde(i) {
    const g = this.grille;
    if (!g || i < 0) return null;
    const z = g.z[i];
    if (Number.isNaN(z)) return null;
    const l = Math.floor(i / g.colonnes), c = i % g.colonnes, hc = (this.hmin + this.hmax) / 2;
    return new THREE.Vector3((c + 0.5) * g.pas - g.colonnes * g.pas / 2, (z - hc) * this.reglages.exageration, (l + 0.5) * g.pas - g.lignes * g.pas / 2);
  }

  approcher(i, facteur = 0.6) {
    const p = this.positionMonde(i);
    if (!p) return;
    const decalage = this.camera.position.clone().sub(this.controls.target).multiplyScalar(facteur);
    this.controls.target.copy(p);
    this.camera.position.copy(p).add(decalage);
    this.controls.update();
    this.dessiner();
  }

  /** Cellule sous le point (x, y) du canvas : marche le long du rayon sur la grille des altitudes. */
  cellule(x, y) {
    const g = this.grille;
    if (!g) return null;
    const r = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(2 * (x - r.left) / r.width - 1, 1 - 2 * (y - r.top) / r.height);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const o = ray.ray.origin, dir = ray.ray.direction;
    const W = g.colonnes * g.pas, H = g.lignes * g.pas, hc = (this.hmin + this.hmax) / 2, exa = this.reglages.exageration;
    const boite = new THREE.Box3(new THREE.Vector3(-W / 2, (this.hmin - hc) * exa - 1, -H / 2), new THREE.Vector3(W / 2, (this.hmax - hc) * exa + 1, H / 2));
    const entree = new THREE.Vector3();
    if (!ray.ray.intersectBox(boite, entree)) return null;
    let t0 = entree.distanceTo(o);
    const sortie = new THREE.Ray(o.clone().addScaledVector(dir, t0 + 1e6), dir.clone().negate());
    const fin = new THREE.Vector3();
    const t1 = sortie.intersectBox(boite, fin) ? fin.distanceTo(o) : t0 + Math.hypot(W, H);
    const pas = Math.max(g.pas * 0.5, (t1 - t0) / 3000);
    const p = new THREE.Vector3();
    const dessous = t => {
      p.copy(o).addScaledVector(dir, t);
      const c = Math.floor((p.x + W / 2) / g.pas), l = Math.floor((p.z + H / 2) / g.pas);
      if (c < 0 || c >= g.colonnes || l < 0 || l >= g.lignes) return -1;
      const z = g.z[l * g.colonnes + c];
      if (Number.isNaN(z)) return -1;
      return p.y <= (z - hc) * exa ? l * g.colonnes + c : -1;
    };
    let precedent = t0;
    for (let t = t0; t <= t1 + pas; t += pas) {
      if (dessous(t) >= 0) {
        let lo = precedent, hi = t;
        for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (dessous(m) >= 0) hi = m; else lo = m; }
        return dessous(hi);
      }
      precedent = t;
    }
    return null;
  }

  /** Image PNG de la vue à la taille demandée. */
  async capturer(largeur, hauteur) {
    const avant = new THREE.Vector2();
    this.renderer.getSize(avant);
    const ratio = this.renderer.getPixelRatio(), visible = this.uniformes.p1.value.z;
    this.uniformes.p1.value.z = 0;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(largeur, hauteur, false);
    this.camera.aspect = largeur / hauteur; this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const blob = await new Promise(res => this.canvas.toBlob(res, "image/png"));
    this.renderer.setPixelRatio(ratio);
    this.uniformes.p1.value.z = visible;
    this.redimensionner();
    return blob;
  }
}
