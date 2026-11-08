'use strict';
/* Rendu 3D du plateau (three.js r128), qui remplace le dessin en pixels. Même interface pour jeu.js, mecaniques.js et
   animations.js : preparer, dimensionner, centre(case) → point de la fenêtre, sous(évènement) → case, animerChamp
   (machine qui passe rang par rang, demi-tour en demi-ellipse sur la fournière), graines, onde, dessiner.
   Les cultures sont instanciées par blocs de 4 × 4 cases : un bloc hors de l'écran n'est pas dessiné, un bloc proche
   de la caméra prend les épis détaillés. Une case n'est reconstruite que si son état visible change.
   Gestes : glisser fait tourner, molette ou pincement zoome vers le point visé, clic droit, Maj ou deux doigts
   déplacent la vue ; Option (Alt) + glisser sème case par case. Le léger balancement de la caméra s'arrête dès
   qu'on la touche, sans à-coup. */

const Rendu = {
  cv: null, vue: null, gl: null, scene: null, camera: null, monde: null, D: null, pl: null, k: 1, dpr: 1,
  reduit: matchMedia('(prefers-reduced-motion: reduce)').matches,
  revel: new Map(), parts: [], ondes: [], murs: [], unitesMures: new Set(), dernierMur: 0,
  survol: null, selection: null, pointeur: null, ventForce: 0.5, ventDir: 0,
  quandClic: null, quandSurvol: null, quandPeint: null, quandSort: null,
  cel: [], pools: new Map(), chunks: [], passages: [], jourVu: -1, cleStruct: '', derniereMaj: 0, ombreSale: true,
  CH: 4,

  init(cv) {
    this.cv = cv; this.vue = cv.closest('.defile');
    try {
      this.gl = new T3.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { this.vue.classList.add('sans-3d'); this.vue.dataset.message = 'Ce navigateur ne sait pas afficher la 3D (WebGL).'; return; }
    const r = this.gl;
    this.dpr = devicePixelRatio || 1; this.qualite = Math.min(1.5, this.dpr);
    r.setPixelRatio(this.qualite);
    r.shadowMap.enabled = true; r.shadowMap.type = T3.PCFSoftShadowMap; r.shadowMap.autoUpdate = false;
    r.localClippingEnabled = true; r.outputEncoding = T3.sRGBEncoding; r.toneMapping = T3.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
    this.scene = new T3.Scene();
    this.camera = new T3.PerspectiveCamera(30, 1.6, 0.3, 400);
    this.ray = new T3.Raycaster(); this.plan = new T3.Plane(new T3.Vector3(0, 1, 0), -0.1); this.v2 = new T3.Vector2();
    this.frustum = new T3.Frustum(); this.m4 = new T3.Matrix4();
    Ciel.init(this.scene, this.vue, 24);
    this.gestes();
    this.calques();
  },

  // ---------- Monde du lieu ----------
  preparer() {
    if (!this.gl) return;
    const f = F(), pl = this.pl = planDe(f), mode = MODES[f.mode], W = pl.w, H = pl.h;
    if (this.monde) { this.scene.remove(this.monde); this.monde.traverse(o => { if (o.geometry && !o.userData.partage) o.geometry.dispose(); }); }
    for (const p of this.pools.values()) { this.scene.remove(p.im); p.im.dispose?.(); }
    this.viderTransports();
    for (const p of this.passages) { this.scene.remove(p.o); if (p.id) Flotte.desinscrire(p.id); }
    if (this.cloture) { this.scene.remove(this.cloture); this.cloture = null; } this.clePature = ''; this.coupes = new Map();
    for (const a of this.halos || []) this.scene.remove(a.g); this.halos = [];
    for (const o of this.verrous?.values() || []) this.scene.remove(o); this.verrous = new Map(); this.anims = [];
    this.pools.clear(); this.passages = []; this.revel.clear(); this.parts = []; this.ondes.forEach(o => this.scene.remove(o.m)); this.ondes = [];
    this.echelle = mode.echelle; this.planches = mode.echelle === 'planches';
    this.D = Decor.construire(this.scene, pl, mode.echelle); this.monde = this.D.groupe;
    this.cel = Array.from({ length: W * H }, () => ({ cle: '', desc: null }));
    const NX = Math.ceil(W / this.CH), NZ = Math.ceil(H / this.CH);
    this.chunks = [];
    for (let cz = 0; cz < NZ; cz++) for (let cx = 0; cx < NX; cx++) {
      const x0 = cx * this.CH, z0 = cz * this.CH, x1 = Math.min(W, x0 + this.CH), z1 = Math.min(H, z0 + this.CH), cases = [];
      for (let y = z0; y < z1; y++) for (let x = x0; x < x1; x++) cases.push(y * W + x);
      this.chunks.push({ cases, boite: new T3.Box3(new T3.Vector3(x0 - W / 2, 0, z0 - H / 2), new T3.Vector3(x1 - W / 2, 1.1, z1 - H / 2)), vu: true, proche: false });
    }
    this.chunkDe = i => { const x = i % W, y = (i / W) | 0; return ((y / this.CH) | 0) * NX + ((x / this.CH) | 0); };
    Vie.init(this.scene, this.D, pl, f);
    this.sansOmbre(Vie.groupe); [...Vie.poules, ...Vie.pigeons, ...Vie.fumees].forEach(e => this.sansOmbre(e.o));
    Machines.init(this);
    this.cleLimite = ''; this.cleMurs = ''; this.uniteSurvol = null; this.cleSel = ''; this.cleIrr = ''; if (this.enrouleur) { this.scene.remove(this.enrouleur); this.enrouleur = null; }
    this.jourVu = -1; this.cleStruct = ''; this.ombreSale = true;
    // caméra : sur la ferme et ses champs, à mi-distance
    const own = Object.keys(f.cases).map(k => k.split(',').map(Number));
    const cx = own.length ? own.reduce((s, c) => s + c[0], 0) / own.length : (pl.ferme ? pl.ferme[0] + 2 : W / 2), cz = own.length ? own.reduce((s, c) => s + c[1], 0) / own.length : (pl.ferme ? pl.ferme[1] + 2 : H / 2);
    this.cam.dist0 = 1.62 * Math.max(W, H * 1.3); this.cam.base.set(0, -0.3, 0.6);
    this.cam.zoom = 0.5; this.cam.cible.set(cx + 0.5 - W / 2, 0, cz + 0.5 - H / 2); this.cam.az = 0; this.cam.el = 0; this.cam.dernier = -99;
    this.dimensionner();
    // crochets pour le calque de relecture (commentaires) : il s'y branche sans toucher au rendu
    const anc = window.SF3D || {};
    window.SF3D = Object.assign(anc, {
      scene: this.scene, camera: this.camera, renderer: this.gl, canvas: this.cv, conteneur: this.vue, modeCommentaire: !!anc.modeCommentaire,
      nommer: h => this.nommer(h), pointDe: c => this.pointDe(c), objetSous: (x, y) => this.objetSous(x, y), regarder: (p, z) => this.regarder(p, z),
    });
  },
  // ---------- Relecture : nommer ce qu'on vise, retrouver un point, y amener la caméra ----------
  objetSous(cx, cy) {
    if (!this.pl) return null;
    const visible = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
    this.rayon(cx, cy);
    return this.ray.intersectObjects(this.scene.children, true).find(h => h.object.isMesh && !(h.object.material && h.object.material.transparent) && visible(h.object)) || null;
  },
  nommer(hit) {
    if (!hit) return null;
    for (let o = hit.object; o; o = o.parent) {
      const n = o.userData && o.userData.nom; if (n) return typeof n === 'string' ? { cle: n, libelle: n } : { cle: n.cle, libelle: n.libelle };
      if (o.userData && o.userData.ferme) return this.nomFerme(hit, o);
    }
    const ud = hit.object.userData, id = hit.instanceId;
    if (ud.arbres && id != null) return ud.arbres[id].t === 'haie' ? { cle: 'arbre:haie-' + (id + 1), libelle: 'Arbre de haut jet de la haie' } : ud.arbres[id].t === 'jardin' ? { cle: 'arbre:fruitier-' + (id + 1), libelle: 'Arbre fruitier' } : { cle: 'arbre:bois-' + (id + 1), libelle: 'Arbre du bois' };
    if (ud.buissons && id != null) return { cle: 'haie:' + (id + 1), libelle: 'Haie' };
    return this.nomCase(hit.point);
  },
  // ailes de la ferme dans son repère (64 unités = 4 cases, porche au sud)
  AILES: { logis: [32, 8, 'Logis'], etables: [7, 32, 'Étables'], grange: [57, 32, 'Grange'], remises: [14, 57, 'Remises (aile du porche)'], 'pigeonnier-porche': [32, 57, 'Pigeonnier-porche'],
    fumiere: [32, 33, 'Fumière'], charrette: [46, 44, 'Charrette de petites bottes'], cour: [24, 24, 'Cour pavée'] },
  nomFerme(hit, fg) {
    const p = fg.worldToLocal(hit.point.clone()), u = (p.x + 2) * 16, v = (p.z + 2) * 16;
    const aile = u >= 25 && u <= 39 && v >= 48 ? 'pigeonnier-porche' : v < 14 ? 'logis' : v > 50 ? 'remises' : u < 14 ? 'etables' : u > 50 ? 'grange'
      : Math.abs(u - 32) < 8 && Math.abs(v - 33) < 5 ? 'fumiere' : Math.abs(u - 46) < 5 && Math.abs(v - 44) < 4 ? 'charrette' : 'cour';
    const role = this.D.ferme.roles.get(hit.object.material), slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/gi, '-').toLowerCase();
    return { cle: 'batiment:' + aile + (role ? '/' + slug(role) : ''), libelle: this.AILES[aile][2] + (role ? ' · ' + role : '') };
  },
  nomCase(pt) {
    const pl = this.pl, W = pl.w, H = pl.h, tx = Math.floor(pt.x + W / 2), ty = Math.floor(pt.z + H / 2);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return { cle: 'socle', libelle: 'Socle de la maquette' };
    const t = pl.types[ty][tx], u = pl.unite[ty * W + tx], ici = `${tx}-${ty}`, maj = s => s.replace(/^./, c => c.toUpperCase());
    if (t === 'c' && u >= 0) {
      const f = F(), N = u + 1, lot = this.planches ? 'planche' : 'champ';
      let c = null, etat = 'terre nue';
      if (f.parcelles[u]) { const cs = f.cases[tx + ',' + ty]; if (cs?.cult) c = CULTURE[cs.cult]; else if (cs?.chaume != null && S.jour - cs.chaume < 45) etat = 'chaume'; }
      else {
        const v = this.voisinDe(f, u, S.jour);
        if (v.type === 'prairie') return { cle: `culture:prairie@${lot}-${N}`, libelle: `Prairie, ${lot} ${N}` };
        if (v.type !== 'culture') return { cle: `${lot}:${N}`, libelle: `Friche, ${lot} ${N}` };
        if (v.p !== null) c = v.c; else etat = v.chaume ? 'chaume' : 'terre labourée';
      }
      return c ? { cle: `culture:${c.id}@${lot}-${N}`, libelle: `${c.nom}, ${lot} ${N}` } : { cle: `${lot}:${N}`, libelle: `${maj(etat)}, ${lot} ${N}` };
    }
    const L = { h: 'Herbe', r: 'Bord de route', p: 'Bord de chemin', f: 'Sous-bois', a: 'Haie', b: 'Maison', m: 'Ferme', e: 'Mare' }[t] || 'Sol';
    return { cle: `case:${ici}`, libelle: `${L} · case ${ici}` };
  },
  pointDe(cle) {
    if (!cle || !this.pl) return null;
    const V = T3.Vector3, W = this.pl.w, H = this.pl.h, centre = (x, y) => new V(x + 0.5 - W / 2, 0.25, y + 0.5 - H / 2);
    const m = /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\s*$/.exec(cle); if (m) return new V(+m[1], +m[2], +m[3]);
    const u = /^(?:culture:[^@]*@(?:champ|planche)-|champ:|planche:)(\d+)$/.exec(cle);
    if (u) { const cs = [...this.casesUnite(+u[1] - 1)]; if (!cs.length) return null; const x = cs.reduce((a, i) => a + i % W, 0) / cs.length, y = cs.reduce((a, i) => a + ((i / W) | 0), 0) / cs.length; return centre(x, y); }
    const c = /^(?:case:|eau:|batiment:maison-)(\d+)-(\d+)$/.exec(cle); if (c) return centre(+c[1], +c[2]);
    if (cle.startsWith('batiment:') && this.D.ferme) { const a = this.AILES[cle.slice(9).split('/')[0]]; if (a) return this.D.ferme.groupe.localToWorld(new V(a[0] / 16 - 2, 0.3, a[1] / 16 - 2)); }
    const n = /^(route|chemin):(\d+)$/.exec(cle); if (n) { const ch = (n[1] === 'route' ? this.D.routes : this.D.chemins)[+n[2] - 1]; if (ch) { const p = ch.pts[(ch.pts.length / 2) | 0]; return new V(p[0], 0.1, p[1]); } }
    const ar = /^arbre:(?:bois|haie)-(\d+)$/.exec(cle); if (ar) { const a = this.D.arbres[+ar[1] - 1]; if (a) return new V(a.x, 0.6, a.z); }
    const hb = /^haie:(\d+)$/.exec(cle); if (hb) { const b = this.D.buissonsPos[+hb[1] - 1]; if (b) return new V(b.x, 0.15, b.z); }
    if (cle === 'socle') return new V(0, 0, H / 2);
    let o = null; this.scene.traverse(x => { if (!o && x.userData && x.userData.nom && x.userData.nom.cle === cle) o = x; });
    return o ? o.getWorldPosition(new V()).add(new V(0, 0.25, 0)) : null;
  },
  regarder(p, z = 0.45) {
    if (!p || !this.pl) return;
    this.figer(); this.cam.cible.set(p.x, 0, p.z); this.cam.zoom = Math.max(0.09, Math.min(1.2, z)); this.borner(); this.placer(this.cam.tt);
  },
  // un geste de caméra il y a moins d'une seconde ; rien qui bouge vite
  bouge() { return performance.now() / 1000 - this.cam.dernier < 1.2 && this.cam.dernier < 1e8; },
  calme() { return !this.passages.length && !this.parts.length && !Machines.flotte.some(u => u.etat !== 'cour'); },
  sansOmbre(o) { o.traverse(c => { if (c.isMesh) c.castShadow = false; }); },

  dimensionner() {
    if (!this.gl) return;
    const w = this.vue.clientWidth, h = this.vue.clientHeight; if (!w || !h) return;
    this.gl.setSize(w, h, false); this.cv.style.width = '100%'; this.cv.style.height = '100%';
    this.camera.aspect = w / h; this.camera.fov = w / h < 1.2 ? 38 : 30; this.camera.updateProjectionMatrix();
  },

  // ---------- Repères écran ↔ cases ----------
  versMonde(tx, ty, y = 0.25) { return new T3.Vector3(tx + 0.5 - this.pl.w / 2, y, ty + 0.5 - this.pl.h / 2); },
  centre(tx, ty) {
    const r = this.cv.getBoundingClientRect();
    if (!this.gl || !this.pl) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const v = this.versMonde(tx, ty).project(this.camera);
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  },
  rayon(cx, cy) {
    const r = this.cv.getBoundingClientRect();
    this.v2.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.v2, this.camera); return this.ray.ray;
  },
  solSous(cx, cy, h = 0) { const p = new T3.Plane(new T3.Vector3(0, 1, 0), -h); return this.rayon(cx, cy).intersectPlane(p, new T3.Vector3()); },
  sous(e) {
    if (!this.pl) return { tx: -1, ty: -1, px: 0, py: 0 };
    const p = this.rayon(e.clientX, e.clientY).intersectPlane(this.plan, new T3.Vector3());
    if (!p) return { tx: -1, ty: -1, px: 0, py: 0 };
    return { tx: Math.floor(p.x + this.pl.w / 2), ty: Math.floor(p.z + this.pl.h / 2), px: p.x, py: p.z };
  },
  animalSous(e) { if (!this.pl) return null; return Vie.animalSous(this.rayon(e.clientX, e.clientY)); },

  // ---------- Caméra et gestes ----------
  cam: { dist0: 50, R: 30, zoom: 0.42, cible: new T3.Vector3(), base: new T3.Vector3(), az: 0, el: 0, dernier: -99, AZ: -0.25, EL: 0.9, tt: 0 },
  balancement(t) {
    const c = this.cam, cl = (v, a, b) => Math.max(a, Math.min(b, v));
    if (this.reduit) return 0;
    return Math.sin(t * 0.12) * 0.2 * cl((t - c.dernier - 4) / 3, 0, 1) * cl((c.zoom - 0.9) * 10, 0, 1);
  },
  figer() { const c = this.cam; c.tt = performance.now() / 1000; c.az += this.balancement(c.tt); c.dernier = c.tt; },   // le balancement en cours devient la position, sans saut
  placer(t) {
    const c = this.cam, a = c.AZ + c.az + this.balancement(t), e = Math.min(1.35, Math.max(0.5, c.EL + c.el));
    const etroit = this.camera.aspect < 1.2, R = c.dist0 * c.zoom * (etroit ? 1.25 : 1);
    this.camera.position.set(c.cible.x + Math.sin(a) * Math.cos(e) * R, c.cible.y + Math.sin(e) * R, c.cible.z + Math.cos(a) * Math.cos(e) * R);
    this.camera.lookAt(c.cible); c.R = R;
  },
  borner() {
    const c = this.cam, W = this.pl.w, H = this.pl.h, cl = (v, a, b) => Math.max(a, Math.min(b, v));
    c.cible.x = cl(c.cible.x, -W / 2, W / 2); c.cible.z = cl(c.cible.z, -H / 2, H / 2);
    if (c.zoom > 0.97) c.cible.lerp(c.base, cl((c.zoom - 0.97) * 6, 0, 1));
  },
  zoomer(f, cx, cy) {
    const c = this.cam; this.figer();
    const nz = Math.max(0.09, Math.min(1.2, c.zoom * f)), P = this.solSous(cx, cy);
    if (P) { const k = 1 - nz / c.zoom; c.cible.x += (P.x - c.cible.x) * k; c.cible.z += (P.z - c.cible.z) * k; }
    c.zoom = nz; this.borner(); c.dernier = performance.now() / 1000; this.placer(c.tt);
  },
  deplacer(cx, cy) {
    if (!this.prise) return; const P = this.solSous(cx, cy); if (!P) return;
    this.cam.cible.x += this.prise.x - P.x; this.cam.cible.z += this.prise.z - P.z; this.borner(); this.placer(this.cam.tt);
  },
  gestes() {
    const cv = this.cv, pts = new Map(); let glisse = null, pince = null;
    cv.addEventListener('wheel', e => { if (!this.pl) return; e.preventDefault(); this.zoomer(Math.exp(e.deltaY * (e.ctrlKey ? 0.012 : 0.0018)), e.clientX, e.clientY); }, { passive: false });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    cv.addEventListener('pointerdown', e => {
      if (!this.pl) return;
      this.figer(); try { cv.setPointerCapture(e.pointerId); } catch (er) { /* pointeur synthétique */ } pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; glisse = null; pince = { d: Math.hypot(a.x - b.x, a.y - b.y) }; this.prise = this.solSous(m.x, m.y); return; }
      const pan = e.button === 2 || e.button === 1 || e.shiftKey, peint = e.altKey && e.button === 0 && !(window.SF3D && SF3D.modeCommentaire);
      glisse = { x: e.clientX, y: e.clientY, az: this.cam.az, el: this.cam.el, bouge: false, pan, peint, curseur: cv.style.cursor };
      this.prise = pan ? this.solSous(e.clientX, e.clientY) : null;
      if (peint && this.quandPeint) this.quandPeint(this.sous(e), e, true);
    });
    cv.addEventListener('pointermove', e => {
      if (!this.pl) return;
      if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pince && pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (d > 10) this.zoomer(pince.d / d, m.x, m.y); pince.d = d; this.deplacer(m.x, m.y); return;
      }
      if (!glisse) { if (e.pointerType === 'mouse' && this.quandSurvol) this.quandSurvol(this.sous(e), e); this.pointeurMonde(e); return; }
      const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
      if (Math.abs(dx) + Math.abs(dy) > 5 && !glisse.bouge) { glisse.bouge = true; if (!glisse.peint) cv.style.cursor = glisse.pan ? 'move' : 'grabbing'; }
      if (glisse.peint) { if (this.quandPeint) this.quandPeint(this.sous(e), e, false); return; }
      if (!glisse.bouge) return;
      if (glisse.pan) this.deplacer(e.clientX, e.clientY);
      else { this.cam.az = glisse.az - dx * 0.006; this.cam.el = Math.max(-0.45, Math.min(0.35, glisse.el + dy * 0.004)); }
      this.cam.dernier = performance.now() / 1000;
    });
    const fin = e => {
      pts.delete(e.pointerId); if (pts.size < 2) pince = null;
      const relecture = window.SF3D && SF3D.modeCommentaire;   // en relecture, le calque de commentaires prend le clic
      if (glisse && !glisse.bouge && !glisse.pan && !glisse.peint && !relecture && this.quandClic && (e.button === 0 || e.pointerType !== 'mouse')) this.quandClic(this.sous(e), e);
      if (glisse?.bouge) { cv.style.cursor = glisse.curseur; if (this.quandSurvol && e.pointerType === 'mouse') this.quandSurvol(this.sous(e), e); }
      glisse = null; this.prise = null;
    };
    cv.addEventListener('pointerup', fin);
    cv.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pince = null; glisse = null; this.prise = null; });
    cv.addEventListener('pointerleave', () => { if (!glisse && this.quandSort) this.quandSort(); this.pointeur = null; this.pointeurM = null; });
  },
  pointeurMonde(e) { const p = this.solSous(e.clientX, e.clientY); this.pointeurM = p ? { x: p.x, z: p.z } : null; },

  // ---------- Champs voisins : culture de la PAC et stade d'après le calendrier ----------
  voisins: [], jourVoisins: -1,
  voisinDe(f, u, j) {
    if (this.jourVoisins !== j) { this.voisins = []; this.jourVoisins = j; }
    let v = this.voisins[u];
    if (v) return v;
    const vo = voisin(f, u, j);
    v = { type: vo.type, c: vo.c || null, code: vo.code, p: null, chaume: 0 };
    if (vo.type === 'culture') {
      const d = dateDe(j);
      for (const an of [d.an, d.an - 1]) {
        const debut = indexJour(an, 0) + Math.round((Date.UTC(an, vo.c.semis[0] - 1, 15) - Date.UTC(an, 0, 1)) / MS_JOUR);
        let p = (j - debut) / vo.c.cycle;
        if (p < 0) continue;
        if (vo.c.hiver && p <= 1) {
          // pas plus de la moitié du cycle avant le 1er février, puis une reprise lente au printemps
          const fev = indexJour(an + 1, 31), fin = debut + vo.c.cycle;
          p = j < fev ? Math.min(0.5, p) : 0.5 + 0.5 * Math.pow(clamp01((j - fev) / Math.max(1, fin - fev)), 1.5);
        }
        if (p <= 1.08) v.p = Math.min(1, p);
        else if (['Céréales', 'Oléagineux'].includes(vo.c.cat)) v.chaume = clamp01(1 - ((p - 1.08) * vo.c.cycle) / 45);
        break;
      }
    }
    return (this.voisins[u] = v);
  },

  // ---------- État visible de chaque case ----------
  etatCase(i, f, mode, ctx) {
    const pl = this.pl, W = pl.w, x = i % W, y = (i / W) | 0, u = pl.unite[i];
    if (pl.types[y][x] !== 'c' || u < 0) return null;
    const base = { mois: ctx.mois, doy: ctx.doy, neige: ctx.neige, givre: ctx.givre, planches: this.planches };
    const rv = this.revel.get(i), voile = rv && performance.now() < rv.jusque ? rv : null;
    if (f.parcelles[u] && !(voile && voile.voisin)) {
      const cs = f.cases[x + ',' + y]; if (!cs) return null;
      let c = cs.cult ? CULTURE[cs.cult] : null, p = cs.p, mur = cs.mur;
      if (voile) { if (voile.avant) { c = voile.avant.c; p = voile.avant.p; mur = voile.avant.pourri ? 13 : 0; } else c = null; }
      const chaume = !c && cs.chaume != null ? clamp01(1 - (S.jour - cs.chaume) / 45) : 0;
      const sec = clamp01((0.4 - cs.r / ruMax(f, cs)) / 0.3) * (ctx.mois >= 4 && ctx.mois <= 10 ? 1 : 0.3);
      return Object.assign(base, { propre: true, c, p, mur, chaume, paille: cs.fam === 'poacée', labour: mode.labour && !c && !chaume, couvert: mode.couvert && !c && !chaume,
        residus: !mode.labour && !mode.couvert && (!c || p < 0.4), fum: cs.fum > 0, goutte: mode.irrigation === 'goutte' && f.irrigation, mo: cs.mo, sec,
        arbres: mode.arbres && y % 2 === 0 ? ageArbres(f, S.jour) : null });
    }
    const v = this.voisinDe(f, u, S.jour);
    base.verrou = true;   // tout champ voisin est grisé, à vendre comme à objectif
    if (v.type === 'culture') return Object.assign(base, { c: v.p !== null ? v.c : null, p: v.p ?? 0, mur: 0, chaume: v.p === null ? v.chaume : 0, paille: v.c.famille === 'poacée' && v.c.forme !== 'mais', labour: v.p === null && !v.chaume, mo: 2.2, sec: f.sec * 0.6 });
    if (v.type === 'prairie') return Object.assign(base, { prairie: ['PPH', 'SPH', 'SPL'].includes(v.code) ? 'ppn' : 'fauche', sec: f.sec * 0.6 });
    return Object.assign(base, { friche: true, sec: f.sec * 0.6 });
  },
  cleEtat(e) {
    const q = (v, n) => Math.round((v || 0) * n);
    return `${e.c ? e.c.id : ''}|${q(e.p, 48)}|${e.mur > 12 ? 1 : 0}|${q(e.chaume, 30)}|${e.paille ? 1 : 0}${e.labour ? 1 : 0}${e.couvert ? 1 : 0}${e.residus ? 1 : 0}${e.fum ? 1 : 0}${e.goutte ? 1 : 0}${e.propre ? 1 : 0}|${q(e.mo, 4)}|${q(e.sec, 8)}|${q(e.neige, 10)}${e.givre ? 'g' : ''}|${e.mois}|${e.prairie || ''}${e.friche ? 1 : 0}|${e.prairie || e.friche || e.arbres != null ? Math.floor(e.doy / 3) : ''}|${e.arbres != null ? Math.round(e.arbres * 2) : ''}|${e.verrou ? 'v' : ''}`;
  },
  // Met à jour les cases dont l'état visible a changé (toutes si force)
  majCases(f, ctx, force, seules) {
    const mode = MODES[f.mode], ids = seules || this.cel.keys();
    const pature = force ? [] : null, nus = force ? [] : null, W = this.pl.w, H = this.pl.h;
    for (const i of ids) {
      const e = this.etatCase(i, f, mode, ctx), c = this.cel[i];
      if (force && e) { const pt = [i % W - W / 2, ((i / W) | 0) - H / 2]; if (e.prairie === 'ppn') pature.push(pt); else if (!e.prairie && !e.friche && (!e.c || e.p < 0.12)) nus.push(pt); }
      if (!e) continue;
      const cle = this.cleEtat(e);
      if (cle === c.cle && !force) continue;
      if (cle === c.cle) continue;
      const desc = Plantes.decrire(e);
      if (e.verrou) { const gris = K3.col('#a7a596'); desc.sol.lerp(gris, 0.5); for (const pt of desc.parts) pt.col = pt.col.clone().lerp(gris, 0.45); }
      if (this.planches && e.propre) {
        for (const pt of desc.parts) pt.y = (pt.y || 0) + 0.035;
        desc.parts.unshift({ g: 'planche', d: 'planche', s: [1, 1, 1], col: desc.sol.clone() });
        desc.solCase = K3.col(couleursSaison(ctx.doy, f.sec).h).clone().multiplyScalar(0.8);
      }
      const ch = this.chunkDe(i);
      for (const pt of c.desc?.parts || []) this.salir(pt.g, ch);
      for (const pt of desc.parts) this.salir(pt.g, ch);
      c.cle = cle; c.desc = desc;
      const sol = (desc.solCase || desc.sol).clone(); if (ctx.givre) sol.lerp(K3.col('#e6eef2'), 0.3);
      this.D.colorer(i, sol); this.solSale = true;
    }
    if (force) { Vie.jour(f, S.jour, f.meteo || {}, pature, nus); this.cloturer(pature); }
  },
  // Bords d'un ensemble de cases, rentrés de « ins » : rentrés aux coins saillants, prolongés aux coins rentrants (en cases)
  bordsDe(ens, ins) {
    const W = this.pl.w, H = this.pl.h, dans = (x, y) => x >= 0 && y >= 0 && x < W && y < H && ens.has(y * W + x), segs = [];
    for (const i of ens) {
      const x = i % W, y = (i / W) | 0, co = this.coinLibre(i, dans);
      for (const [nx, ny] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        if (dans(x + nx, y + ny)) continue;
        const tx = -ny, ty = nx, cx = x + 0.5 + nx * (0.5 - ins), cy = y + 0.5 + ny * (0.5 - ins);
        const bout = sg => { const ax = x + sg * tx, ay = y + sg * ty; return !dans(ax, ay) ? 0.5 - ins : dans(ax + nx, ay + ny) ? 0.5 + ins : 0.5; };
        let a = bout(-1), b = bout(1);
        // coin arrondi (virage d'un chemin) : le bord s'arrête où l'arc commence
        if (co && nx === co.sx && !ny) { if (co.sx === co.sz) b = co.t; else a = co.t; }
        if (co && ny === co.sz && !nx) { if (-co.sz === co.sx) b = co.t; else a = co.t; }
        segs.push({ x0: cx - tx * a, y0: cy - ty * a, x1: cx + tx * b, y1: cy + ty * b, i, cle: `${i}:${nx},${ny}` });
      }
      if (co) { const p = this.D.arcCoin(i, ins, 4); for (let k = 0; k + 1 < p.length; k++) segs.push({ x0: p[k][0], y0: p[k][1], x1: p[k + 1][0], y1: p[k + 1][1], i, cle: `${i}:arc${k}` }); }
    }
    return segs;
  },
  // Coin arrondi d'une case dont les trois voisines du coin sont hors de l'ensemble (sinon le bord ne passe pas là)
  coinLibre(i, dans) {
    const co = this.D?.coinDe?.(i); if (!co) return null;
    const x = i % this.pl.w, y = (i / this.pl.w) | 0;
    return dans(x + co.sx, y) || dans(x, y + co.sz) || dans(x + co.sx, y + co.sz) ? null : co;
  },
  // Champs voisins : teintes éteintes, piquets à ruban rouge et blanc sur le pourtour ; panneau à cadenas s'ils attendent un objectif
  majVerrous(f) {
    const pl = this.pl, W = pl.w, H = pl.h, po = f.parcellesObjectif || {};
    const voulu = new Map(); pl.unites.forEach((_, u) => { if (!f.parcelles[u]) voulu.set(u, po[u]); });
    for (const [u, o] of this.verrous) if (!voulu.has(u)) { this.verrous.delete(u); this.anims.push({ o, t0: performance.now(), dur: 700, de: 1, a: 0, fin: () => this.scene.remove(o) }); }
    const K = K3, G = K.G, own = new Set(Object.keys(f.cases).map(k => { const [x, y] = k.split(',').map(Number); return y * W + x; }));
    for (const [u, id] of voulu) {
      if (this.verrous.has(u)) continue;
      const ob = id != null ? OBJ_PARCELLES.find(o => o.id === id) : null, ens = this.casesUnite(u), g = new T3.Group(), pieces = [];
      // piquets blancs à tête rouge et ruban rouge et blanc
      for (const sg of this.bordsDe(ens, 0.09)) {
        const L = Math.hypot(sg.x1 - sg.x0, sg.y1 - sg.y0), n = Math.max(1, Math.round(L / 0.5)), ry = Math.atan2(-(sg.y1 - sg.y0), sg.x1 - sg.x0);
        for (let k = 0; k <= n; k++) { const x = sg.x0 + (sg.x1 - sg.x0) * k / n - W / 2, z = sg.y0 + (sg.y1 - sg.y0) * k / n - H / 2; pieces.push(K.piece(G.boite(0.012, 0.12, 0.012), '#f4f1e8', [x, 0.06, z]), K.piece(G.boite(0.014, 0.025, 0.014), '#d8402a', [x, 0.125, z])); }
        for (let k = 0; k < n * 2; k++) { const f0 = (k + 0.5) / (n * 2), x = sg.x0 + (sg.x1 - sg.x0) * f0 - W / 2, z = sg.y0 + (sg.y1 - sg.y0) * f0 - H / 2; pieces.push(K.piece(G.boite(L / (n * 2), 0.018, 0.003), k % 2 ? '#f4f1e8' : '#d8402a', [x, 0.1, z], [0, ry, 0])); }
      }
      K.mesh(g, K.fusion(pieces), K.matV()).castShadow = false;
      g.userData.nom = { cle: 'parcelle:voisine-' + (u + 1), libelle: 'Champ voisin' };
      this.scene.add(g); this.verrous.set(u, g);
      if (!ob) { this.sansOmbre(g); continue; }
      // panneau à cadenas, sur la case la plus proche de l'exploitation
      let mieux = [...ens][0], dm = 1e9;
      for (const i of ens) for (const j of own) { const d = Math.hypot(i % W - j % W, ((i / W) | 0) - ((j / W) | 0)); if (d < dm) { dm = d; mieux = i; } }
      const tex = this.texPanneau(ob.court), pan = new T3.Group();
      K.mesh(pan, G.cyl(0.012, 0.014, 0.3, 5), K.mat('#7a5a3a'), [0, 0.15, 0]);
      K.mesh(pan, G.boite(0.34, 0.18, 0.02), K.mat('#8a6440'), [0, 0.33, 0]);
      const face = new T3.Mesh(new T3.PlaneGeometry(0.32, 0.16), K.patcher(new T3.MeshStandardMaterial({ map: tex, roughness: 0.9 }))); face.position.set(0, 0.33, 0.011); pan.add(face);
      pan.position.set(mieux % W + 0.5 - W / 2, 0.004, ((mieux / W) | 0) + 0.5 - H / 2); pan.rotation.y = this.cam.AZ; pan.scale.setScalar(1.5);
      g.add(pan); this.sansOmbre(g);
      g.userData.nom = { cle: 'parcelle:verrou-' + (u + 1), libelle: `Parcelle à débloquer · objectif : ${ob.txt}` };
    }
  },
  texPanneau(txt) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, 256, 128); g.strokeStyle = '#6a4a2a'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 120);
    // cadenas
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 9; g.beginPath(); g.arc(52, 52, 20, Math.PI, 0); g.stroke();
    g.fillStyle = '#c8962a'; g.fillRect(24, 50, 56, 46); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(52, 68, 7, 0, 7); g.fill(); g.fillRect(49, 70, 6, 14);
    g.fillStyle = '#2b2118'; g.font = '800 30px -apple-system, system-ui, sans-serif'; g.textBaseline = 'middle';
    const mots = txt.split(' '), l1 = mots.length > 1 && txt.length > 8 ? mots.slice(0, Math.ceil(mots.length / 2)).join(' ') : txt, l2 = l1 === txt ? '' : mots.slice(Math.ceil(mots.length / 2)).join(' ');
    if (l2) { g.fillText(l1, 96, 46); g.fillText(l2, 96, 84); } else g.fillText(l1, 96, 64);
    const t = new T3.CanvasTexture(c); t.encoding = T3.sRGBEncoding; t.anisotropy = 4; return t;
  },
  // Un champ rejoint l'exploitation : ses rubans tombent, un halo le désigne, la charrue laboure
  integrer(u) {
    if (!this.gl || !this.pl) return;
    const W = this.pl.w, cases = [...this.casesUnite(u)].map(i => [i % W, (i / W) | 0]);
    this.majVerrous(F()); this.halo(u);
    if (!this.planches) this.animerChamp(cases, 'labour', 'charrue', null, 1500);
  },
  // Halo du champ qui vient d'être débloqué : nappe dorée et rideau de lumière sur le pourtour, trois pulsations
  halo(u) {
    const W = this.pl.w, H = this.pl.h, ens = this.casesUnite(u), g = new T3.Group(), plein = [], mur = [], uv = [];
    if (!this.texHalo) { const c = document.createElement('canvas'); c.width = 4; c.height = 64; const x = c.getContext('2d'), d = x.createLinearGradient(0, 0, 0, 64); d.addColorStop(0, 'rgba(255,225,130,0)'); d.addColorStop(1, 'rgba(255,225,130,1)'); x.fillStyle = d; x.fillRect(0, 0, 4, 64); this.texHalo = new T3.CanvasTexture(c); }
    for (const i of ens) { const x = i % W - W / 2, z = ((i / W) | 0) - H / 2, y = 0.05; plein.push(x, y, z, x, y, z + 1, x + 1, y, z, x + 1, y, z, x, y, z + 1, x + 1, y, z + 1); }
    for (const sg of this.bordsDe(ens, 0)) { const [a, b, c, d, y1] = [sg.x0 - W / 2, sg.y0 - H / 2, sg.x1 - W / 2, sg.y1 - H / 2, 0.75]; mur.push(a, 0, b, c, 0, d, a, y1, b, c, 0, d, c, y1, d, a, y1, b); uv.push(0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1); }
    const geo = pos => { const q = new T3.BufferGeometry(); q.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); return q; };
    const mNappe = new T3.MeshBasicMaterial({ color: '#ffdf85', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: T3.AdditiveBlending, side: T3.DoubleSide });
    const gm = geo(mur); gm.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
    const mMur = new T3.MeshBasicMaterial({ map: this.texHalo, transparent: true, opacity: 0, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide });
    const n = new T3.Mesh(geo(plein), mNappe), m = new T3.Mesh(gm, mMur); n.renderOrder = 28; m.renderOrder = 29; g.add(n, m); this.scene.add(g);
    (this.halos ||= []).push({ g, n, m, t0: performance.now(), dur: this.reduit ? 1500 : 4200 });
  },
  animer(t) {
    const now = performance.now();
    this.halos = (this.halos || []).filter(a => {
      const k = (now - a.t0) / a.dur;
      if (k >= 1) { this.scene.remove(a.g); a.n.geometry.dispose(); a.m.geometry.dispose(); a.n.material.dispose(); a.m.material.dispose(); return false; }
      const v = Math.min(1, k * 10) * Math.min(1, (1 - k) * 4) * (0.68 + 0.32 * Math.cos(k * Math.PI * 6)); a.n.material.opacity = v * 0.5; a.m.material.opacity = v; return true;
    });
    for (const m of Flotte.mobiles.values()) if (m.genre === 'machine') for (const b of m.boites()) this.D?.degager?.(b.x, b.y, b.cap, b.l);
    this.anims = this.anims.filter(a => {
      const k = Math.max(0, Math.min(1, (now - a.t0) / a.dur)), e = k * k * (3 - 2 * k), v = a.de + (a.a - a.de) * e;
      a.o.scale.y = Math.max(0.001, v); a.o.position.y = 0.004 - (1 - v) * 0.02;
      if (k >= 1) { a.fin?.(); return false; }
      return true;
    });
  },
  // Clôture de pâture : piquets de bois tous les 0,3 case, deux rangs de barbelé, une barrière du côté de la route ou du chemin
  cloturer(pature) {
    const pl = this.pl, W = pl.w, H = pl.h, cle = pature.map(c => c.join(',')).join(';');
    if (cle === this.clePature) return;
    this.clePature = cle; if (this.cloture) { this.scene.remove(this.cloture); this.cloture = null; }
    if (!pature.length) return;
    const ens = new Set(pature.map(([x, z]) => Math.round(z + H / 2) * W + Math.round(x + W / 2))), dans = (x, y) => x >= 0 && y >= 0 && x < W && y < H && ens.has(y * W + x);
    const ins = 0.06, segs = this.bordsDe(ens, ins);   // bouts rentrés aux coins saillants, prolongés aux coins rentrants, arcs aux virages
    // une barrière par morceau de pâture, sur le côté le plus proche d'une route ou d'un chemin
    const voies = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ('rp'.includes(pl.types[y][x])) voies.push([x + 0.5, y + 0.5]);
    const loin = sg => { const mx = (sg.x0 + sg.x1) / 2, my = (sg.y0 + sg.y1) / 2; return voies.length ? Math.min(...voies.map(([vx, vy]) => Math.hypot(vx - mx, vy - my))) : 0; };
    const vu = new Set(), portes = new Set();
    for (const i of ens) {
      if (vu.has(i)) continue;
      const m = new Set([i]), file = [i]; vu.add(i);
      while (file.length) { const j = file.pop(), x = j % W, y = (j / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (y + dy) * W + x + dx; if (dans(x + dx, y + dy) && !vu.has(k)) { vu.add(k); m.add(k); file.push(k); } } }
      const cand = segs.filter(sg => m.has(sg.i) && Math.hypot(sg.x1 - sg.x0, sg.y1 - sg.y0) > 0.6).sort((a, b) => loin(a) - loin(b))[0]; if (cand) portes.add(cand);
    }
    const piquets = new Map(), fils = [], K = K3, G = K.G, g = new T3.Group();
    for (const sg of segs) {
      const L = Math.hypot(sg.x1 - sg.x0, sg.y1 - sg.y0), n = Math.max(1, Math.round(L / 0.3)), porte = portes.has(sg) ? 0.5 : null;
      const pt = f => [sg.x0 + (sg.x1 - sg.x0) * f, sg.y0 + (sg.y1 - sg.y0) * f];
      for (let k = 0; k <= n; k++) { const f = k / n; if (porte != null && Math.abs(f - porte) * L < 0.2) continue; const [x, y] = pt(f); piquets.set(x.toFixed(3) + ',' + y.toFixed(3), [x, y]); }
      const tron = (fa, fb) => { const [ax, ay] = pt(fa), [bx, by] = pt(fb); [0.07, 0.12].forEach(h => fils.push({ x: (ax + bx) / 2, y: (ay + by) / 2, h, L: Math.hypot(bx - ax, by - ay), ry: Math.atan2(-(by - ay), bx - ax) })); };
      if (porte != null) {
        const e = 0.2 / L; tron(0, porte - e); tron(porte + e, 1);
        const [gx, gy] = pt(porte), bar = [];
        for (let k = 0; k < 4; k++) bar.push(K.piece(G.boite(0.4, 0.012, 0.012), '#9a7a52', [0, 0.04 + k * 0.035, 0]));
        bar.push(K.piece(G.boite(0.4, 0.012, 0.012), '#9a7a52', [0, 0.1, 0], [0, 0, 0.32]));
        [-0.2, 0.2].forEach(x => bar.push(K.piece(G.boite(0.02, 0.16, 0.02), '#7a5a3a', [x, 0.08, 0])));
        const m = K.mesh(g, K.fusion(bar), K.matV(), [gx - W / 2, 0, gy - H / 2], [0, Math.atan2(-(sg.y1 - sg.y0), sg.x1 - sg.x0), 0]);
        m.userData.nom = { cle: 'cloture:barriere', libelle: 'Barrière de la pâture' };
      } else tron(0, 1);
    }
    const pq = [...piquets.values()], ip = K.inst(g, G.cyl(0.012, 0.014, 0.15, 5), K.mat('#7a5a3a'), pq.length);
    pq.forEach(([x, y], i) => K.poser(ip, i, [x - W / 2, 0.075, y - H / 2], [0, i, 0]));
    const ifl = K.inst(g, G.boite(1, 0.005, 0.005), K.mat('#6f6f6f', { metalness: 0.4, roughness: 0.5 }), fils.length, false);
    fils.forEach((f, i) => K.poser(ifl, i, [f.x - W / 2, f.h, f.y - H / 2], [0, f.ry, 0], [f.L, 1, 1]));
    ip.userData.nom = ifl.userData.nom = { cle: 'cloture:pature', libelle: 'Clôture de la pâture' };
    this.scene.add(g); this.cloture = g; this.ombreSale = true;
  },
  salir(g, ch) {
    const k = g + '|' + ch; let p = this.pools.get(k);
    if (!p) { p = { g, ch, im: null, cap: 0, n: 0, sale: true }; this.pools.set(k, p); }
    p.sale = true;
  },
  _mats: new Map(),
  matPlante(souple) { let m = this._mats.get(souple); if (!m) { m = K3.matV({ side: T3.DoubleSide, roughness: 0.85 }, this.reduit ? 0 : souple); this._mats.set(souple, m); } return m; },
  // Réécrit les instances d'un modèle dans un bloc
  reconstruire(p) {
    const W = this.pl.w, H = this.pl.h, cases = this.chunks[p.ch].cases, DISPO = Plantes.DISPO;
    let n = 0;
    for (const i of cases) for (const pt of this.cel[i].desc?.parts || []) if (pt.g === p.g) { const d = DISPO[pt.d]; n += d.n * d.m; }
    if (n > p.cap) {
      if (p.im) { this.scene.remove(p.im); p.im.dispose(); }
      p.cap = Math.ceil(n * 1.4) + 8;
      const im = new T3.InstancedMesh(Plantes.geo(p.g), this.matPlante(Plantes.SOUPLE[p.g] || 0), p.cap);
      im.instanceColor = new T3.InstancedBufferAttribute(new Float32Array(p.cap * 3), 3);
      im.castShadow = Plantes.OMBRE.has(p.g); im.receiveShadow = true; im.frustumCulled = false; im.userData.partage = true; im.userData.pool = true;
      this.scene.add(im); p.im = im;
    }
    if (!p.im) { p.sale = false; return; }
    const M = p.im.instanceMatrix.array, C = p.im.instanceColor.array, base = this.planches ? 0.001 : 0.004;
    let o = 0;
    for (const i of cases) {
      const desc = this.cel[i].desc; if (!desc) continue;
      const x = i % W, y = (i / W) | 0, x0 = x - W / 2, z0 = y - H / 2, cp = this.coupes.get(i), co = this.D.coinDe?.(i);
      for (const pt of desc.parts) {
        if (pt.g !== p.g) continue;
        const d = DISPO[pt.d], cont = d.m === 1, tilt = pt.tilt ?? 0.04, c = pt.col;
        for (let r = 0; r < d.n; r++) for (let k = 0; k < d.m; k++) {
          const idx = r * d.m + k, h1 = hasard(x, y, idx * 3 + 1), h2 = hasard(x, y, idx * 3 + 2), h3 = hasard(x, y, idx * 3 + 3);
          if (pt.dens && h3 > pt.dens) continue;
          let px = x0 + (cont ? 0.5 : (k + 0.5 + (h1 - 0.5) * d.j) / d.m), pz = z0 + (r + 0.5 + (cont ? 0 : (h2 - 0.5) * d.j)) / d.n, lx = 1;
          if (co) {   // coin arrondi : rien au-delà de l'arc ; un rang continu s'arrête à l'arc
            const R = co.r - 0.06, dx = px + W / 2 - co.ox, dz = pz + H / 2 - co.oz;
            if (cont) { if (dz * co.sz > 0) { const lim = co.ox - W / 2 + co.sx * (Math.abs(dz) < R ? Math.sqrt(R * R - dz * dz) : 0), a = co.sx > 0 ? x0 : Math.max(x0, lim), b = co.sx > 0 ? Math.min(x0 + 1, lim) : x0 + 1; if (b < a + 0.03) continue; px = (a + b) / 2; lx = b - a; } }
            else if (dx * co.sx > 0 && dz * co.sz > 0 && Math.hypot(dx, dz) > R) continue;
          }
          const ry = cont ? 0 : pt.rot != null ? pt.rot + (h1 - 0.5) * 0.35 : h3 * 6.2832, v = cont ? 1 : 0.86 + 0.28 * h2, vy = (cont ? 1 : 0.92 + 0.16 * h1) * (cp && cp.s * (px - cp.fx) < 0 ? 0.1 : 1);
          K3.matrice(M, o * 16, px, base + (pt.y || 0), pz, ry, cont ? 0 : (h1 - 0.5) * 2 * tilt, cont ? 0 : (h2 - 0.5) * 2 * tilt, pt.s[0] * v * lx, pt.s[1] * v * vy, pt.s[2] * v);
          const b = cont ? 1 : 0.9 + 0.2 * h1;
          C[o * 3] = c.r * b; C[o * 3 + 1] = c.g * b; C[o * 3 + 2] = c.b * b; o++;
        }
      }
    }
    p.n = o; p.im.count = o; p.im.instanceMatrix.needsUpdate = true; p.im.instanceColor.needsUpdate = true; p.sale = false;
    if (p.im.castShadow) this.ombreSale = true;
  },

  // ---------- Animation d'un champ : la machine passe rang par rang (semis ou récolte) ----------
  // cases : [[x, y], …] ; avant : Map 'x,y' → { c, p, v, pourri } pour la récolte. Rend [{ x, y, fin }] (ms depuis maintenant).
  // opts.livrer(kg) : récolte portée à la ferme par un tracteur et sa benne ; les tonnes ne comptent qu'à la livraison
  transporte(machine) { return !!(this.gl && this.pl && !this.planches && this.D.ferme && ['moissonneuse', 'arracheuse'].includes(machine) && !this.reduit); },
  transportEnCours() { return this.passages.some(p => p.transport) || Machines.flotte.some(u => u.charge > 1 && !u.livre); },
  animerChamp(cases, type, machine, avant, retard = 0, opts = {}) {
    if (!this.gl || !this.pl) return cases.map(([x, y]) => ({ x, y, fin: retard }));
    const W = this.pl.w, H = this.pl.h, now = performance.now();
    if (!machine) {
      // une seule case semée à la main : elle apparaît tout de suite
      return cases.map(([x, y]) => { this.revel.set(y * W + x, { jusque: now + retard + 120, avant: null }); return { x, y, fin: retard + 120 }; });
    }
    const transport = type === 'recolte' && opts.livrer && this.transporte(machine);
    const sortie = machine !== 'personne' && !this.planches && !!this.D.ferme && !this.reduit;
    const personne = machine === 'personne', v = this.reduit ? 40 : personne ? 2.6 : transport ? 1.7 : 4.2, avance = machine === 'moissonneuse' ? 0.05 : machine === 'semoir' || machine === 'charrue' ? -0.3 : 0;
    // la moisson commence par le rang qui longe la route ou le chemin le plus proche : la benne ne roule jamais dans le blé debout
    const sens = transport ? this.sensRangs(cases) : 1;
    const { pts, passe } = this.trajet(cases, personne ? 0.16 : 0.34, avance, sens);
    const P = { transport };
    const sortie_ = passe.map(c => {
      const av = type === 'recolte' ? avant?.get(c.x + ',' + c.y) || null : null;
      this.revel.set(c.y * W + c.x, sortie ? { jusque: Infinity, avant: av, passe: P, dPass: c.d, kg: av?.kg || 0, voisin: type === 'labour' } : { jusque: now + retard + c.d / v * 1000, avant: av, voisin: type === 'labour' });
      return { x: c.x, y: c.y, d: c.d };
    });
    // la machine
    const o = this.machine(machine); o.visible = false; o.userData.nom = { cle: 'machine:' + machine, libelle: { moissonneuse: 'Moissonneuse-batteuse', semoir: 'Tracteur et semoir', arracheuse: 'Tracteur et arracheuse', charrue: 'Tracteur et charrue', personne: 'Maraîcher' }[machine] || 'Machine' }; this.scene.add(o);
    const L = Decor.longueur(pts);
    Object.assign(P, { o, pts: pts.map(([x, z]) => [x - W / 2, z - H / 2]), L, v, t0: now + retard, type: machine, recolte: type === 'recolte', derniere: 0, sortie, d: -1, reste: passe.length, sens });
    if (transport) Object.assign(P, { tremie: 0, livrer: opts.livrer });
    // la machine sort de la grange et va au champ par les routes : la tâche commence à son arrivée
    const trajetMs = sortie ? Machines.preparerSortie(P) : 0;
    for (const c of sortie_) c.fin = retard + trajetMs + c.d / v * 1000;
    this.passages.push(P);
    this.majCases(F(), this.ctx || this.contexte(F()), false, cases.map(([x, y]) => y * W + x));
    return sortie_.map(({ x, y, fin }) => ({ x, y, fin }));
  },
  // Trajet en cases : chaque rang de bout en bout, demi-tour en demi-ellipse au-delà des deux bouts de rang (fournière)
  trajet(cases, RX, avance, sens = 1) {
    const rangs = new Map();
    for (const [x, y] of cases) { if (!rangs.has(y)) rangs.set(y, []); rangs.get(y).push(x); }
    const ys = [...rangs.keys()].sort((a, b) => (a - b) * sens);
    const R = ys.map((y, r) => { const xs = rangs.get(y).sort((a, b) => a - b); return { y, xs, a: xs[0], b: xs.at(-1) + 1, s: r % 2 ? -1 : 1 }; });
    const pts = [], passe = []; let L = 0;
    const ajout = (x, z) => { const p = pts.at(-1); if (p) L += Math.hypot(x - p[0], z - p[1]); pts.push([x, z]); };
    R.forEach((r, k) => {
      const z = r.y + 0.5, prev = R[k - 1], next = R[k + 1];
      const xin = k === 0 ? (r.s > 0 ? r.a - 0.7 : r.b + 0.7) : (r.s > 0 ? Math.min(r.a, prev.a) : Math.max(r.b, prev.b));
      const xout = !next ? (r.s > 0 ? r.b + 0.7 : r.a - 0.7) : (r.s > 0 ? Math.max(r.b, next.b) : Math.min(r.a, next.a));
      if (k === 0) ajout(xin, z);
      const L0 = L;
      for (const x of (r.s > 0 ? r.xs : [...r.xs].reverse())) passe.push({ x, y: r.y, d: Math.max(0, L0 + Math.abs(x + 0.5 - xin) - avance) });
      ajout(xout, z);
      if (next) {
        const z1 = next.y + 0.5, cz = (z + z1) / 2, RZ = (z1 - z) / 2;
        for (let i = 1; i <= 12; i++) { const th = i / 12 * Math.PI; ajout(xout + r.s * RX * Math.sin(th), cz - RZ * Math.cos(th)); }
      }
    });
    return { pts, passe };
  },
  // Côté par où commencer : celui de la route ou du chemin le plus proche du champ (1 = par le nord, -1 = par le sud)
  sensRangs(cases) {
    const pl = this.pl, cx = cases.reduce((a, c) => a + c[0], 0) / cases.length + 0.5, cy = cases.reduce((a, c) => a + c[1], 0) / cases.length + 0.5;
    let mieux = null, dm = 1e9;
    for (let y = 0; y < pl.h; y++) for (let x = 0; x < pl.w; x++) if ('rp'.includes(pl.types[y][x])) { const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d < dm) { dm = d; mieux = [x, y]; } }
    return mieux && mieux[1] + 0.5 > cy ? -1 : 1;
  },
  // Itinéraire par les routes et chemins (cases r, p) d'un point monde à un autre, lissé
  parLesRoutes(de, vers) {
    const pl = this.pl, W = pl.w, H = pl.h, ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H && 'rp'.includes(pl.types[y][x]);
    const proche = q => { let m = -1, dm = 1e9; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ok(x, y)) { const d = Math.hypot(x + 0.5 - W / 2 - q[0], y + 0.5 - H / 2 - q[1]); if (d < dm) { dm = d; m = y * W + x; } } return m; };
    const a = proche(de), b = proche(vers);
    if (a < 0 || b < 0) return [de, vers];
    const prev = new Map([[a, -1]]), file = [a];
    for (let q = 0; q < file.length && !prev.has(b); q++) {
      const i = file[q], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy, j = ny * W + nx;
        if (!ok(nx, ny) || prev.has(j) || (dx && dy && (ok(x + dx, y) || ok(x, y + dy)))) continue;
        prev.set(j, i); file.push(j);
      }
    }
    if (!prev.has(b)) return [de, vers];
    const cs = []; for (let j = b; j !== -1; j = prev.get(j)) cs.push(j); cs.reverse();
    let pts = cs.map(i => [i % W + 0.5 - W / 2, ((i / W) | 0) + 0.5 - H / 2]);
    if (pts.length > 2) pts = Decor.simplifier(pts, 0.6);
    return [de, ...pts, vers];
  },
  // Tout ce qui est encore en route (trémie, benne, cases pas encore fauchées) est livré d'un coup
  viderTransports() {
    for (const u of Machines.flotte) if (u.charge > 1 && u.source && !u.livre) { u.source.livrer(u.charge); u.charge = 0; }
    for (const p of this.passages) if (p.transport) { let kg = p.tremie; for (const rv of this.revel.values()) if (rv.passe === p) kg += rv.kg || 0; if (kg > 0) p.livrer(kg); p.tremie = 0; }
  },
  centreFerme() {
    const r = this.cv.getBoundingClientRect();
    if (!this.D?.ferme) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const v = this.D.ferme.groupe.localToWorld(new T3.Vector3(0.6, 0.6, 0)).project(this.camera);
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  },
  // Modèles des machines (tournées vers +x)
  machine(type) {
    const K = K3, G = K.G, g = new T3.Group();
    const roue = (x, z, r, l, jante = '#e2b62a') => [K.piece(G.cyl(r, r, l, 12), '#262626', [x, r, z], [Math.PI / 2, 0, 0]), K.piece(G.cyl(r * 0.45, r * 0.45, l + 0.01, 8), jante, [x, r, z], [Math.PI / 2, 0, 0])];
    const chauffeur = (x, y) => [K.piece(G.boite(0.05, 0.07, 0.06), '#3a5a8a', [x, y + 0.035, 0]), K.piece(G.boule(6, 4), '#e8b88a', [x + 0.005, y + 0.095, 0], 0, 0.022), K.piece(G.cyl(0.035, 0.035, 0.008, 8), '#d8b050', [x + 0.005, y + 0.118, 0]), K.piece(G.cyl(0.016, 0.02, 0.02, 8), '#c8a040', [x + 0.005, y + 0.128, 0])];
    const tracteur = (coul) => [
      K.piece(G.boite(0.2, 0.09, 0.1), coul, [0.08, 0.13, 0]), K.piece(G.boite(0.04, 0.08, 0.09), '#3a3a3a', [0.19, 0.13, 0]),
      K.piece(G.boite(0.1, 0.05, 0.16), coul, [-0.06, 0.12, 0]), ...roue(-0.06, 0.1, 0.085, 0.045), ...roue(-0.06, -0.1, 0.085, 0.045), ...roue(0.15, 0.06, 0.045, 0.03), ...roue(0.15, -0.06, 0.045, 0.03),
      K.piece(G.cyl(0.008, 0.008, 0.09, 5), '#2a2a2a', [0.12, 0.21, 0.03]), K.piece(G.boite(0.05, 0.015, 0.05), '#2a2a2a', [-0.05, 0.16, 0]), ...chauffeur(-0.05, 0.165),
      K.piece(G.boite(0.12, 0.012, 0.2), coul, [-0.06, 0.19, 0]),
    ];
    if (type === 'moissonneuse') {
      K.mesh(g, K.fusion([
        K.piece(G.boite(0.62, 0.34, 0.48), '#c9352a', [-0.02, 0.33, 0]), K.piece(G.boite(0.4, 0.14, 0.42), '#dc4a31', [-0.1, 0.56, 0]),
        K.piece(G.boite(0.2, 0.025, 0.24), '#8e2a20', [0.18, 0.512, -0.06]), K.piece(G.boite(0.2, 0.06, 0.012), '#a82a1f', [0.18, 0.54, -0.18]), K.piece(G.boite(0.012, 0.06, 0.24), '#a82a1f', [0.28, 0.54, -0.06]),
        K.piece(G.boite(0.06, 0.02, 0.07), '#2a2a2a', [0.12, 0.54, -0.06]), K.piece(G.boite(0.012, 0.06, 0.07), '#2a2a2a', [0.09, 0.57, -0.06]),
        K.piece(G.cyl(0.006, 0.006, 0.09, 5), '#2a2a2a', [0.21, 0.565, -0.06], [0, 0, 0.5]), K.piece(G.cyl(0.03, 0.03, 0.006, 12), '#1e1e1e', [0.235, 0.61, -0.06], [0, 0, 0.5]),
        K.piece(G.boite(0.05, 0.07, 0.06), '#3a5a8a', [0.125, 0.585, -0.06]), K.piece(G.boule(6, 4), '#e8b88a', [0.13, 0.64, -0.06], 0, 0.022), K.piece(G.cyl(0.034, 0.034, 0.008, 10), '#d8b050', [0.13, 0.662, -0.06]),
        K.piece(G.cyl(0.005, 0.005, 0.32, 5), '#cfcfcf', [0.1, 0.69, 0.02]), K.piece(G.cone(0.19, 0.06, 10), '#f0e6c8', [0.1, 0.86, 0.02]), K.piece(G.cyl(0.19, 0.19, 0.008, 10), '#c8402a', [0.1, 0.828, 0.02]),
        K.piece(G.boite(0.2, 0.14, 0.3), '#a82a1f', [0.36, 0.2, 0]), K.piece(G.boite(0.16, 0.1, 1.02), '#e2b62a', [0.5, 0.08, 0]),
        ...roue(0.12, 0.27, 0.16, 0.1), ...roue(0.12, -0.27, 0.16, 0.1), ...roue(-0.25, 0.24, 0.1, 0.08), ...roue(-0.25, -0.24, 0.1, 0.08),
        K.piece(G.cyl(0.02, 0.02, 0.14, 6), '#262626', [-0.05, 0.7, 0.15]),
      ]), K.matV());
      // vis de vidange sur pivot : repliée vers l'arrière, dépliée sur le côté au-dessus de la benne
      const vis = new T3.Group(); vis.position.set(-0.08, 0.66, 0.16); vis.rotation.y = Math.PI; g.add(vis); g.userData.vis = vis;
      K.mesh(vis, K.fusion([K.piece(G.cyl(0.025, 0.025, 0.7, 6), '#9a9a9a', [0.35, 0, 0], [0, 0, Math.PI / 2]), K.piece(G.cyl(0.02, 0.02, 0.07, 6), '#7a7a7a', [0.69, -0.03, 0])]), K.matV());
      const parts = [K.piece(G.cyl(0.03, 0.03, 0.96, 6), '#c99a18', [0, 0, 0], [Math.PI / 2, 0, 0])];
      for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; parts.push(K.piece(G.boite(0.025, 0.025, 0.94), '#f0c53a', [Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0])); }
      g.userData.rabatteur = K.mesh(g, K.fusion(parts), K.matV(), [0.52, 0.2, 0]);
      g.add(Vie.ombre(0.4, 0.5));
    } else if (type === 'semoir') {
      K.mesh(g, K.fusion([...tracteur('#c8402a'),
        K.piece(G.boite(0.12, 0.08, 0.9), '#d8a830', [-0.3, 0.12, 0]), K.piece(G.boite(0.13, 0.02, 0.92), '#f2cc5a', [-0.3, 0.165, 0]),
        ...[-0.42, 0.42].flatMap(z => roue(-0.3, z, 0.05, 0.025, '#d8a830')),
        ...Array.from({ length: 9 }, (_, i) => K.piece(G.boite(0.01, 0.07, 0.01), '#4a4038', [-0.33, 0.05, -0.4 + i * 0.1])),
        K.piece(G.boite(0.14, 0.012, 0.02), '#4a4038', [-0.18, 0.09, 0]),
      ]), K.matV());
      g.add(Vie.ombre(0.46, 0.32));
    } else if (type === 'charrue') {
      // charrue à trois corps, déportée sur le côté du sillon
      const corps = []; for (let i = 0; i < 3; i++) corps.push(K.piece(G.boite(0.12, 0.06, 0.02), '#9aa0a8', [-0.3 - i * 0.1, 0.05, 0.12 + i * 0.08], [0, 0.6, 0.3]), K.piece(G.cyl(0.006, 0.006, 0.12, 4), '#3a3a3a', [-0.3 - i * 0.1, 0.11, 0.12 + i * 0.08]));
      K.mesh(g, K.fusion([...tracteur('#d4672a'), K.piece(G.boite(0.36, 0.025, 0.025), '#3a4a6a', [-0.34, 0.16, 0.18], [0, 0.55, 0]), ...corps, ...roue(-0.5, 0.36, 0.05, 0.03)]), K.matV());
      g.userData.terre = true; g.add(Vie.ombre(0.26, 0.34));
    } else if (type === 'arracheuse') {
      K.mesh(g, K.fusion([...tracteur('#3f7a3a'),
        K.piece(G.boite(0.3, 0.1, 0.4), '#8a5a3a', [-0.36, 0.12, 0.05]), K.piece(G.boite(0.3, 0.02, 0.42), '#a87a4a', [-0.36, 0.18, 0.05]),
        K.piece(G.boite(0.22, 0.03, 0.12), '#5a4228', [-0.32, 0.25, 0.2], [0.5, 0, 0]), ...roue(-0.4, 0.27, 0.06, 0.03), ...roue(-0.4, -0.17, 0.06, 0.03),
        K.piece(G.boite(0.16, 0.012, 0.02), '#4a4038', [-0.17, 0.09, 0]),
      ]), K.matV());
      g.userData.terre = true; g.add(Vie.ombre(0.3, 0.36));
    } else {
      // maraîcher au chapeau de paille, panier au bras
      const corps = K.mesh(g, K.fusion([K.piece(G.boite(0.05, 0.075, 0.07), '#3a5a8a', [0, 0.115, 0]), K.piece(G.boule(6, 4), '#e8b88a', [0.005, 0.175, 0], 0, 0.024),
        K.piece(G.cyl(0.045, 0.045, 0.008, 10), '#d8b050', [0.005, 0.2, 0]), K.piece(G.cyl(0.02, 0.024, 0.022, 8), '#c8a040', [0.005, 0.21, 0]),
        K.piece(G.boite(0.05, 0.03, 0.04), '#a87a42', [0.01, 0.09, 0.055]), K.piece(G.boule(4, 3), '#7cbf52', [0.01, 0.11, 0.055], 0, 0.012)]), K.matV());
      const jambe = () => K.mesh(g, K.fusion([K.piece(G.boite(0.022, 0.08, 0.022), '#4a3a2a', [0, -0.04, 0])]), K.matV(), [0, 0.08, 0]);
      g.userData.jambes = [jambe(), jambe()]; g.userData.jambes[0].position.z = 0.017; g.userData.jambes[1].position.z = -0.017;
      corps.castShadow = false; g.add(Vie.ombre(0.04, 0.05));
    }
    this.sansOmbre(g);
    return g;
  },
  // Une erreur dans la conduite d'un engin ne doit jamais arrêter le jeu
  sansBlocage(f) { try { f(); } catch (e) { if (!this.erreurVue) { this.erreurVue = true; console.error(e); } } },
  animerPassages(t, dt) {
    const now = performance.now(), s = Math.min(0.05, dt / 1000);
    this.passages = this.passages.filter(p => {
      if (p.sortie) {
        // sortie de la grange, tâche au champ (avance pilotée, arrêts trémie pleine), retour à la grange
        const range = Machines.avancerMachine(p, t, s, () => {
          // sans benne pour la vider depuis quelques secondes, la machine ne reste pas plantée : trémie pleine elle poursuit, au bout du champ elle rentre vider elle-même
          if (p.transport && !p.autonome && Flotte.veiller(p.veilleTache ??= {}, p.d, p.tremie / 300)) { if (p.d >= p.L - 0.3) p.autonome = true; else p.sansAttendre = true; p.veilleTache = null; }
          if (p.sansAttendre && p.tremie < Machines.TREMIE * 0.7) p.sansAttendre = false;
          if (p.sansAttendre && p.d >= p.L - 0.3) p.autonome = true;
          const pleine = p.transport && !p.autonome && !p.sansAttendre && p.tremie >= Machines.TREMIE, dMax = p.transport && !p.autonome && (p.reste > 0 || p.tremie >= 1) ? p.L - 0.25 : p.L;
          if (!pleine) p.d = Math.min(dMax, Math.max(0, p.d) + p.v * s);
          this.poserAuChamp(p, t, p.d, 1);
          return p.d >= p.L - 1e-6;
        });
        if (range) { this.scene.remove(p.o); return false; }
        return true;
      }
      const d = (now - p.t0) / 1000 * p.v;
      if (d < 0) return true;
      if (d > p.L + 0.2) { this.scene.remove(p.o); return false; }
      const e = Math.max(0, Math.min(1, d / 0.35, (p.L + 0.2 - d) / 0.35));
      this.poserAuChamp(p, t, d, e * e * (3 - 2 * e));
      return true;
    });
  },
  // La machine sur son trajet au champ, à la distance d (k : échelle d'apparition)
  poserAuChamp(p, t, d, k) {
    const a = Decor.surLigne(p.pts, Math.min(d, p.L)), b = Decor.surLigne(p.pts, Math.min(p.L, d + 0.12));
    const cap = Math.atan2(b.z - a.z, b.x - a.x);
    p.o.visible = true; p.o.position.set(a.x, 0.004, a.z); p.o.rotation.y = -cap; p.o.scale.setScalar(Math.max(0.01, k));
    if (p.o.userData.rabatteur) p.o.userData.rabatteur.rotation.z = -t / 1000 * 5;
    // la barre de coupe (0,55 case devant le centre) couche les tiges une à une sur le rang en cours
    if (p.recolte && p.type === 'moissonneuse' && Math.abs(Math.sin(cap)) < 0.2 && d < p.L) {
      const sx = Math.sign(Math.cos(cap)), fx = a.x + Math.cos(cap) * 0.55, fz = a.z + Math.sin(cap) * 0.55, W = this.pl.w, H = this.pl.h;
      const tx = Math.floor(fx + W / 2), ty = Math.floor(fz + H / 2), i = ty * W + tx, rv = this.revel.get(i);
      if (tx >= 0 && tx < W && ty >= 0 && ty < H && rv && rv.avant) {
        this.coupes.set(i, { fx, s: sx });
        for (const pt of this.cel[i].desc?.parts || []) this.salir(pt.g, this.chunkDe(i));
      }
    }
    if (p.o.userData.jambes) { const sw = Math.sin(t / 110) * 0.5; p.o.userData.jambes[0].rotation.z = sw; p.o.userData.jambes[1].rotation.z = -sw; p.o.position.y = Math.abs(Math.sin(t / 110)) * 0.006; }
    // poussière, paille, terre derrière la machine
    if (!this.reduit && t - p.derniere > 40 && k > 0.5) {
      p.derniere = t;
      const arriere = p.type === 'moissonneuse' ? 0.4 : p.type === 'personne' ? 0.05 : 0.38, cx = a.x - Math.cos(cap) * arriere, cz = a.z - Math.sin(cap) * arriere;
      const n = p.type === 'personne' ? 1 : 3, cols = p.type === 'moissonneuse' ? ['#e8d08a', '#c8a860', '#f2e2a8'] : p.type === 'arracheuse' || p.type === 'charrue' ? ['#8a6440', '#6a4a2a'] : ['#b89870', '#d8c098'];
      for (let i = 0; i < n; i++) this.parts.push({ x: cx + (Math.random() - 0.5) * 0.3, y: p.type === 'moissonneuse' ? 0.45 : 0.08, z: cz + (Math.random() - 0.5) * 0.3, vx: -Math.cos(cap) * (0.3 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.3, vy: 0.2 + Math.random() * 0.5, vz: -Math.sin(cap) * (0.3 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.3, g: 1.4, vie: 0.8 + Math.random() * 0.6, age: 0, c: K3.col(cols[i % cols.length]) });
    }
  },
  // Enrouleur et canon d'arrosage sur le plus grand champ cultivé, quand l'irrigation est en marche (mai à septembre)
  irrigation(t, f, mode) {
    const mois = this.ctx.mois, pl = this.pl, W = pl.w, H = pl.h;
    let cle = '';
    if (f.irrigation && mode.irrigation === 'enrouleur' && mois >= 5 && mois <= 9) {
      const n = new Map(); for (const k in f.cases) if (f.cases[k].cult) { const [x, y] = k.split(',').map(Number), u = pl.unite[y * W + x]; n.set(u, (n.get(u) || 0) + 1); }
      const u = [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (u != null) cle = String(u);
    }
    if (cle !== this.cleIrr) {
      this.cleIrr = cle; if (this.enrouleur) { this.scene.remove(this.enrouleur); this.enrouleur = null; }
      if (cle) {
        const cases = [...this.casesUnite(+cle)], c = cases[(cases.length / 2) | 0], K = K3, G = K.G, o = new T3.Group();
        K.mesh(o, K.fusion([K.piece(G.cyl(0.11, 0.11, 0.09, 14), '#2f6aa8', [0, 0.15, 0], [Math.PI / 2, 0, 0]), K.piece(G.cyl(0.05, 0.05, 0.1, 8), '#d8d8d8', [0, 0.15, 0], [Math.PI / 2, 0, 0]),
          K.piece(G.boite(0.26, 0.03, 0.16), '#2a4a7a', [0, 0.05, 0]), K.piece(G.cyl(0.04, 0.04, 0.02, 8), '#222222', [-0.08, 0.04, 0.09], [Math.PI / 2, 0, 0]), K.piece(G.cyl(0.04, 0.04, 0.02, 8), '#222222', [-0.08, 0.04, -0.09], [Math.PI / 2, 0, 0])]), K.matV());
        const tuyau = new T3.Mesh(new T3.CylinderGeometry(0.008, 0.008, 1, 5).rotateZ(Math.PI / 2).translate(0.5, 0, 0), K.mat('#2a2a2a')); tuyau.scale.x = 1.2; tuyau.position.y = 0.02; o.add(tuyau);
        const canon = K.mesh(o, K.fusion([K.piece(G.boite(0.12, 0.03, 0.12), '#7a7a7a', [0, 0.03, 0]), K.piece(G.cyl(0.01, 0.012, 0.12, 5), '#5a5a5a', [0, 0.1, 0])]), K.matV(), [1.2, 0, 0]);
        this.sansOmbre(o); o.position.set(c % W - W / 2 - 0.6, 0.004, ((c / W) | 0) - H / 2 + 0.5); o.userData.nom = { cle: 'machine:enrouleur', libelle: 'Enrouleur d’irrigation' }; this.scene.add(o); this.enrouleur = o; this.canon = canon;
      }
    }
    if (!this.enrouleur || this.reduit) return;
    const p = this.enrouleur.position, gx = p.x + 1.2, gz = p.z;
    for (let i = 0; i < 4; i++) {
      const a = Math.sin(t / 2600) * 2.2 + (Math.random() - 0.5) * 0.15, v = 1.3 + Math.random() * 0.25;
      this.parts.push({ x: gx, y: 0.17, z: gz, vx: Math.cos(a) * v, vy: 1.0 + Math.random() * 0.2, vz: Math.sin(a) * v, g: 2.6, vie: 0.9, age: 0, c: K3.col(i % 2 ? '#e8f2fa' : '#bcd8f0') });
    }
  },
  // Petites graines lancées au semis case par case
  graines(x, y) {
    if (!this.pl || this.reduit) return;
    const W = this.pl.w, H = this.pl.h;
    for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28, v = 0.3 + Math.random() * 0.5; this.parts.push({ x: x + 0.5 - W / 2, y: 0.15, z: y + 0.5 - H / 2, vx: Math.cos(a) * v, vy: 0.6 + Math.random() * 0.5, vz: Math.sin(a) * v, g: 3, vie: 0.5, age: 0, c: K3.col(i % 2 ? '#d8b878' : '#8a6440') }); }
  },
  onde(px, py) {
    if (!this.gl || !this.pl) return;
    const m = new T3.Mesh(new T3.RingGeometry(0.85, 1, 32).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthTest: false, depthWrite: false }));
    m.position.set(px, 0.12, py); m.renderOrder = 30; this.scene.add(m);
    this.ondes.push({ m, t0: performance.now() });
  },

  // ---------- Calques de jeu : limite de la ferme, champs mûrs, survol, sélection ----------
  calques() {
    const mk = (c, o, dt = false, ro = 20) => { const m = new T3.Mesh(new T3.BufferGeometry(), new T3.MeshBasicMaterial({ color: K3.col(c), transparent: true, opacity: o, depthTest: dt, depthWrite: false })); m.renderOrder = ro; m.frustumCulled = false; this.scene.add(m); return m; };
    this.cLimite = mk('#fade8c', 0.9, true, 3); this.cMurs = mk('#ffd65a', 0.6, true, 4); this.cSurvol = mk('#ffffff', 0.7); this.cSel = mk('#ffe27a', 0.95); this.cCase = mk('#ffffff', 0.14);
    const pts = new T3.BufferGeometry(); pts.setAttribute('position', new T3.BufferAttribute(new Float32Array(600 * 3), 3)); pts.setAttribute('color', new T3.BufferAttribute(new Float32Array(600 * 3), 3));
    this.points = new T3.Points(pts, new T3.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })); this.points.frustumCulled = false; this.scene.add(this.points);
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,252,230,1)'); rg.addColorStop(0.25, 'rgba(255,240,170,.7)'); rg.addColorStop(1, 'rgba(255,240,170,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64); g.fillStyle = '#fffbe8'; g.fillRect(30, 4, 4, 56); g.fillRect(4, 30, 56, 4);
    this.texEclat = new T3.CanvasTexture(c); this.eclats = [];
  },
  // Bandes le long des bords d'un ensemble de cases (à l'intérieur), largeur lw
  bordure(ens, lw, y) {
    const W = this.pl.w, H = this.pl.h, pos = [];
    const quad = (x0, z0, x1, z1) => pos.push(x0, y, z0, x0, y, z1, x1, y, z0, x1, y, z0, x0, y, z1, x1, y, z1);
    const dans = (x, y) => x >= 0 && y >= 0 && x < W && y < H && ens.has(y * W + x);
    for (const i of ens) {
      const x = i % W, yy = (i / W) | 0, X = x - W / 2, Z = yy - H / 2, a = (dx, dy) => dans(x + dx, yy + dy), co = this.coinLibre(i, dans);
      // au coin arrondi, les deux bandes du coin s'arrêtent où l'arc commence
      const bx = s => !co || s !== co.sz ? [X, X + 1] : co.sx > 0 ? [X, X + 0.5 + co.t] : [X + 0.5 - co.t, X + 1];
      const bz = s => !co || s !== co.sx ? [Z, Z + 1] : co.sz > 0 ? [Z, Z + 0.5 + co.t] : [Z + 0.5 - co.t, Z + 1];
      if (!a(0, -1)) { const [p, q] = bx(-1); quad(p, Z, q, Z + lw); } if (!a(0, 1)) { const [p, q] = bx(1); quad(p, Z + 1 - lw, q, Z + 1); }
      if (!a(-1, 0)) { const [p, q] = bz(-1); quad(X, p, X + lw, q); } if (!a(1, 0)) { const [p, q] = bz(1); quad(X + 1 - lw, p, X + 1, q); }
      if (co) {
        const ex = this.D.arcCoin(i, 0, 8), inn = this.D.arcCoin(i, lw, 8), tri = (A, B, C) => { if ((B[1] - A[1]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[1] - A[1]) < 0) [B, C] = [C, B]; for (const P of [A, B, C]) pos.push(P[0] - W / 2, y, P[1] - H / 2); };
        for (let k = 0; k + 1 < ex.length; k++) { tri(ex[k], ex[k + 1], inn[k]); tri(ex[k + 1], inn[k + 1], inn[k]); }
      }
    }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); return g;
  },
  casesUnite(u) { const pl = this.pl, s = new Set(); for (let i = 0; i < pl.unite.length; i++) if (pl.unite[i] === u) s.add(i); return s; },
  remplacer(m, g) { m.geometry.dispose(); m.geometry = g; },
  recenserMurs(f, t) {
    this.dernierMur = t; this.murs = []; this.unitesMures = new Set();
    const pl = this.pl;
    for (const k in f.cases) { const c = f.cases[k]; if (c.cult && c.p >= 1) { const [x, y] = k.split(',').map(Number); this.murs.push([x, y]); this.unitesMures.add(pl.unite[y * pl.w + x]); } }
  },
  majCalques(t, f) {
    const pl = this.pl, W = pl.w, lw = this.planches ? 0.06 : 0.045;
    // liseré doré autour des champs possédés
    const cl = S.active + '|' + Object.keys(f.cases).length;
    if (cl !== this.cleLimite) { this.cleLimite = cl; const s = new Set(Object.keys(f.cases).map(k => { const [x, y] = k.split(',').map(Number); return y * W + x; })); this.remplacer(this.cLimite, this.bordure(s, lw * 1.5, 0.04)); }
    // champs mûrs : contour qui palpite et étincelles
    const cm = [...this.unitesMures].sort().join(',');
    if (cm !== this.cleMurs) {
      // contour posé à la hauteur des plantes mûres : visible au-dessus des épis, caché derrière la machine ou la ferme
      this.cleMurs = cm; const geos = [];
      const H = { mais: 0.68, sorgho: 0.55, topi: 0.75, tournesol: 0.64, epi: 0.33, avoine: 0.33, colza: 0.45, lin: 0.26 };
      for (const u of this.unitesMures) {
        const cs = this.casesUnite(u), i0 = [...cs][0], c = f.cases[(i0 % W) + ',' + ((i0 / W) | 0)], fo = c?.cult ? CULTURE[c.cult].forme : '';
        geos.push(this.bordure(cs, lw, (H[fo] ?? 0.16) + 0.02));
      }
      const pos = geos.flatMap(g => [...g.attributes.position.array]), g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); geos.forEach(x => x.dispose());
      this.remplacer(this.cMurs, g);
    }
    this.cMurs.material.opacity = 0.45 + 0.35 * Math.sin(t / 260);
    if (this.murs.length && !this.reduit && Math.random() < Math.min(0.9, 0.12 + this.murs.length * 0.02) && this.eclats.length < 24) {
      const [x, y] = this.murs[(Math.random() * this.murs.length) | 0], sp = new T3.Sprite(new T3.SpriteMaterial({ map: this.texEclat, transparent: true, depthWrite: false, opacity: 0 }));
      sp.position.set(x - W / 2 + Math.random(), 0.25 + Math.random() * 0.25, y - pl.h / 2 + Math.random()); sp.renderOrder = 25; this.scene.add(sp); this.eclats.push({ sp, t0: t, vie: 650 });
    }
    this.eclats = this.eclats.filter(e => { const a = (t - e.t0) / e.vie; if (a >= 1) { this.scene.remove(e.sp); e.sp.material.dispose(); return false; } const k = Math.sin(a * Math.PI); e.sp.scale.setScalar(0.08 + k * 0.14); e.sp.material.opacity = k; return true; });
    // survol : contour blanc du champ ; voile clair sur la case quand elle est à vous
    const sv = this.survol, u = sv && sv.tx >= 0 && sv.ty >= 0 && sv.tx < W && sv.ty < pl.h ? pl.unite[sv.ty * W + sv.tx] : -1;
    if (u !== this.uniteSurvol) { this.uniteSurvol = u; this.remplacer(this.cSurvol, u >= 0 ? this.bordure(this.casesUnite(u), lw, 0.06) : new T3.BufferGeometry()); }
    this.cSurvol.material.opacity = 0.55 + 0.25 * Math.sin(t / 200);
    const surCase = u >= 0 && f.parcelles[u];
    this.cCase.visible = !!surCase;
    if (surCase) { if (!this.cCase.geometry.attributes.position) this.remplacer(this.cCase, new T3.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)); this.cCase.position.set(sv.tx + 0.5 - W / 2, 0.055, sv.ty + 0.5 - pl.h / 2); }
    // sélection
    const sel = this.selection, cs = sel ? (sel.type === 'parcelle' ? 'p' + sel.u : 'c' + sel.tx + ',' + sel.ty) : '';
    if (cs !== this.cleSel) { this.cleSel = cs; this.remplacer(this.cSel, !sel ? new T3.BufferGeometry() : this.bordure(sel.type === 'parcelle' ? this.casesUnite(sel.u) : new Set([sel.ty * W + sel.tx]), lw * 1.1, 0.065)); }
    // ondes de clic
    this.ondes = this.ondes.filter(o => { const a = (performance.now() - o.t0) / 420; if (a >= 1) { this.scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); return false; } o.m.scale.setScalar(0.06 + a * 0.4); o.m.material.opacity = 0.8 * (1 - a); return true; });
  },
  animerParticules(dt) {
    const s = Math.min(0.05, dt / 1000), P = this.points.geometry.attributes.position.array, C = this.points.geometry.attributes.color.array;
    this.parts = this.parts.filter(p => { p.age += s; if (p.age >= p.vie) return false; p.x += p.vx * s; p.y += p.vy * s; p.z += p.vz * s; p.vy -= p.g * s; if (p.y < 0.01) { p.y = 0.01; p.vx *= 0.5; p.vz *= 0.5; } return true; });
    if (this.parts.length > 600) this.parts.splice(0, this.parts.length - 600);
    const n = this.parts.length;
    for (let i = 0; i < n; i++) { const p = this.parts[i]; P[i * 3] = p.x; P[i * 3 + 1] = p.y; P[i * 3 + 2] = p.z; C[i * 3] = p.c.r; C[i * 3 + 1] = p.c.g; C[i * 3 + 2] = p.c.b; }
    this.points.geometry.setDrawRange(0, n); this.points.geometry.attributes.position.needsUpdate = true; this.points.geometry.attributes.color.needsUpdate = true;
    this.points.material.size = Math.max(0.025, this.cam.R * 0.0016);
  },

  // ---------- Vent du jour ----------
  vent(j, m) {
    const force = Math.min(1, 0.3 + 0.6 * hasard(j, 5, 9) + (m.pluie > 5 ? 0.25 : 0)), dir = -0.3 + 0.6 * hasard(j, 6, 9);
    this.ventForce = force; this.ventDir = dir;
    K3.U.uForce.value = this.reduit ? 0 : force; K3.U.uVent.value.set(Math.cos(dir), Math.sin(dir));
    return { force, dir };
  },
  contexte(f) {
    const d = dateDe(S.jour), m = f.meteo || { tmin: 6, tmax: 14, pluie: 0, neige: 0 }, neige = Math.min(0.92, (f.neigeSol || 0) / 8);
    return (this.ctx = { mois: d.mois, doy: d.doy, neige, givre: m.tmin < -0.5 && neige < 0.1, m });
  },

  // ---------- Image ----------
  dessiner(t, dt) {
    if (!this.gl || !this.pl) return;
    const f = F(), mode = MODES[f.mode], c = this.cam;
    c.tt = t / 1000;
    // structure (achat, changement de mode) : tout revoir ; nouveau jour : tout revoir aussi (stades, saison, météo)
    const cs = `${S.active}|${f.mode}|${Object.keys(f.parcelles).length}|${f.irrigation ? 1 : 0}`;
    if (cs !== this.cleStruct || this.jourVu !== S.jour) {
      const ctx = this.contexte(f), nouveauJour = this.jourVu !== S.jour;
      this.cleStruct = cs; this.jourVu = S.jour;
      if (nouveauJour) {
        const m = ctx.m;
        this.v = this.vent(S.jour, m);
        if (Ciel.jour(S.jour, m, f, this.reduit)) this.ombreSale = true;
        const s = this.D.maj(ctx.doy, f.sec || 0, ctx.neige);
        // herbe et bords de chemins hors des champs
        const pl = this.pl, W = pl.w, herbe = s.herbe.clone(), bois = s.herbe.clone().multiplyScalar(0.7);
        if (ctx.givre) { herbe.lerp(K3.col('#e6eef2'), 0.35); bois.lerp(K3.col('#e6eef2'), 0.2); }
        if (ctx.neige > 0.02) { herbe.lerp(K3.col('#f2f6fa'), ctx.neige); bois.lerp(K3.col('#f2f6fa'), ctx.neige * 0.8); }
        for (let i = 0; i < W * pl.h; i++) { const ty = pl.types[(i / W) | 0][i % W]; if (ty !== 'c' || pl.unite[i] < 0) this.D.colorer(i, ty === 'f' ? bois : herbe); }
        this.solSale = true;
      }
      this.majCases(f, ctx, true);
      this.derniereMaj = t;
    } else if (t - this.derniereMaj > 250) { this.derniereMaj = t; this.majCases(f, this.ctx, false); }
    // voiles des machines qui se lèvent : la case prend son nouvel état quand la machine passe
    if (this.revel.size) {
      const now = performance.now(), fini = [];
      for (const [i, rv] of this.revel) if (now >= rv.jusque || (rv.passe && (rv.passe.d >= rv.dPass || !this.passages.includes(rv.passe)))) {
        fini.push(i); this.revel.delete(i); this.coupes.delete(i);
        if (rv.passe) { if (rv.passe.transport) rv.passe.tremie += rv.kg || 0; rv.passe.reste--; }
      }
      if (fini.length) this.majCases(f, this.ctx, false, fini);
    }
    if (this.solSale) { this.D.solFini(); this.solSale = false; }
    for (const p of this.pools.values()) if (p.sale) this.reconstruire(p);
    if (t - this.dernierMur > 250) this.recenserMurs(f, t);
    this.majCalques(t, f);
    this.majVerrous(f); this.animer(t);
    this.sansBlocage(() => this.animerPassages(t, dt)); this.sansBlocage(() => { Machines.image(t, dt); Machines.majPortes(dt); });
    this.irrigation(t, f, mode);
    this.animerParticules(dt);
    const v = this.v || this.vent(S.jour, f.meteo || { pluie: 0 });
    Vie.image(t, dt, { pointeur: this.pointeurM, vent: v, reduit: this.reduit, mois: this.ctx.mois });
    K3.U.uTemps.value = t / 1000;
    this.placer(c.tt);
    Ciel.image(t, dt, { dist: c.R, cible: c.cible }, v, this.reduit);
    // blocs hors champ : pas dessinés ; blocs proches : épis détaillés
    this.camera.updateMatrixWorld();
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
    for (const ch of this.chunks) { ch.vu = this.frustum.intersectsBox(ch.boite); ch.proche = ch.boite.distanceToPoint(this.camera.position) < 8.5; }
    for (const p of this.pools.values()) {
      if (!p.im) continue;
      const ch = this.chunks[p.ch]; p.im.visible = p.n > 0 && ch.vu;
      if (Plantes.PROCHE.has(p.g)) { const g = Plantes.geo(ch.proche ? p.g + '_p' : p.g); if (p.im.geometry !== g) p.im.geometry = g; }
    }
    if (this.ombreSale) { this.gl.shadowMap.needsUpdate = true; this.ombreSale = false; }
    const t0 = performance.now();
    this.gl.render(this.scene, this.camera);
    this.qualiteAuto(performance.now() - t0, dt);
  },
  // Si les images tardent, on rend moins de pixels (le Mac reste frais)
  _n: 0, _cumul: 0,
  qualiteAuto(ms, dt) {
    this._n++; this._cumul += dt;
    if (this._n < 90) return;
    const moy = this._cumul / this._n; this._n = 0; this._cumul = 0;
    if (moy > 40 && this.qualite > 1) { this.qualite = Math.max(1, this.qualite - 0.25); this.gl.setPixelRatio(this.qualite); this.dimensionner(); }
  },
};
