'use strict';
/* Lumière et temps qu'il fait, d'après la météo SAFRAN du jour : soleil plus bas l'hiver, ciel couvert les jours de
   pluie, pluie et neige qui tombent autour du point regardé, brume des matins d'automne et d'hiver (brouillard),
   orages d'été (éclairs), ombres douces des nuages (texture qui glisse, dans le shader : jamais d'objets opaques). */

const Ciel = {
  scene: null, soleil: null, hemi: null, eclairLum: null, pluie: null, neige: null, jourVu: -1, eclair: null, prochainEclair: 0,
  etat: { eau: 0, neige: false, brume: false, orage: false, couvert: false, nuages: 0 }, vue: null,

  init(scene, vue, demi) {
    this.scene = scene; this.vue = vue; this.jourVu = -1;
    const K = K3;
    this.hemi = new T3.HemisphereLight(K.col('#eef6ff'), K.col('#6a7a40'), 0.82); scene.add(this.hemi);
    const s = this.soleil = new T3.DirectionalLight(K.col('#fff0d4'), 1.3);
    s.castShadow = true; s.shadow.mapSize.set(2048, 2048);
    Object.assign(s.shadow.camera, { left: -demi, right: demi, top: demi, bottom: -demi, near: 1, far: 90 });
    s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; scene.add(s); scene.add(s.target);
    this.eclairLum = new T3.AmbientLight(0xffffff, 0); scene.add(this.eclairLum);
    // ombres des nuages : taches floues qui se répètent sans couture
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9; i++) {
      const x = K.hasard(i * 3.3) * 256, y = K.hasard(i * 7.1) * 256, r = 30 + K.hasard(i * 1.7) * 46;
      for (const [dx, dy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256], [256, 256], [-256, -256], [256, -256], [-256, 256]]) {
        const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
        gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.55, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x + dx, y + dy, r, 0, 7); g.fill();
      }
    }
    const t = new T3.CanvasTexture(c); t.wrapS = t.wrapT = T3.RepeatWrapping; K.U.tNuages.value = t;
    // pluie : segments ; neige : points ronds
    const N = 900, pp = new Float32Array(N * 6);
    this.gouttes = Array.from({ length: N }, () => ({ x: 0, y: 0, z: 0, v: 0.7 + Math.random() * 0.6 }));
    const gp = new T3.BufferGeometry(); gp.setAttribute('position', new T3.BufferAttribute(pp, 3));
    this.pluie = new T3.LineSegments(gp, new T3.LineBasicMaterial({ color: K.col('#cfe0f2'), transparent: true, opacity: 0.5, depthWrite: false }));
    this.pluie.frustumCulled = false; this.pluie.visible = false; scene.add(this.pluie);
    const M = 1100, np = new Float32Array(M * 3);
    this.flocons = Array.from({ length: M }, () => ({ x: 0, y: 0, z: 0, v: 0.6 + Math.random() * 0.8, ph: Math.random() * 6 }));
    const gn = new T3.BufferGeometry(); gn.setAttribute('position', new T3.BufferAttribute(np, 3));
    const fc = document.createElement('canvas'); fc.width = fc.height = 32; const fg = fc.getContext('2d'), fr = fg.createRadialGradient(16, 16, 0, 16, 16, 16);
    fr.addColorStop(0, 'rgba(255,255,255,1)'); fr.addColorStop(0.5, 'rgba(255,255,255,.8)'); fr.addColorStop(1, 'rgba(255,255,255,0)'); fg.fillStyle = fr; fg.fillRect(0, 0, 32, 32);
    this.neige = new T3.Points(gn, new T3.PointsMaterial({ size: 0.07, map: new T3.CanvasTexture(fc), transparent: true, depthWrite: false, color: 0xffffff }));
    this.neige.frustumCulled = false; this.neige.visible = false; scene.add(this.neige);
    this.bolt = new T3.Line(new T3.BufferGeometry().setAttribute('position', new T3.BufferAttribute(new Float32Array(30 * 3), 3)), new T3.LineBasicMaterial({ color: 0xfbf8ff, transparent: true, opacity: 0.95 }));
    this.bolt.frustumCulled = false; this.bolt.visible = false; scene.add(this.bolt);
  },

  // Une fois par jour de jeu : soleil, couverture, brume, couleurs du ciel
  jour(j, m, f, reduit) {
    if (this.jourVu === j) return false;
    this.jourVu = j;
    const K = K3, d = dateDe(j), eau = m.pluie + m.neige, doy = d.doy;
    const e = this.etat;
    e.eau = eau; e.neige = m.neige > 0.3; e.couvert = eau > 1; e.orage = m.pluie >= 15 && m.tmax >= 21;
    e.brume = (d.mois >= 10 || d.mois <= 3) && m.tmax - m.tmin < 4 && eau < 1;
    e.nuages = e.couvert ? 0 : Math.round(hasard(j, 3, 3) * 4);
    // hauteur du soleil selon la saison (Artois, vers 11 h solaires)
    const saison = Math.cos((doy - 172) / 365 * Math.PI * 2), el = (36 + 22 * saison) * Math.PI / 180, az = 0.75;
    this.soleil.position.set(-Math.sin(az) * Math.cos(el) * 40, Math.sin(el) * 40, Math.cos(az) * Math.cos(el) * 40);
    let sol = K.col('#fff0d4').clone(), iS = 1.3, iH = 0.82, ciel = ['#f3f8f4', '#d8ebef', '#b9d6dd'];
    if (saison < -0.3) { sol.lerp(K.col('#e8eeff'), 0.4); iS = 1.15; ciel = ['#f0f4f8', '#d6e2ec', '#b6c8d6']; }
    if (m.tmax >= 28) { sol.lerp(K.col('#ffd29a'), Math.min(0.6, (m.tmax - 27) * 0.08)); ciel = ['#fbf3e0', '#efe0c0', '#d8c8a0']; }
    if (e.couvert) { iS = e.orage ? 0.25 : 0.38; iH = 1.0; ciel = e.neige ? ['#eef0f2', '#d8dde2', '#c0c8d0'] : ['#d8dde0', '#b8c2c8', '#98a6ae']; }
    if (e.brume) { iS = 0.55; iH = 0.95; ciel = ['#eef0ee', '#e2e6e4', '#d4dad8']; }
    this.soleil.color.copy(sol); this.soleil.intensity = iS; this.hemi.intensity = iH;
    this.hemi.color.copy(e.couvert ? K.col('#e4ecf2') : K.col('#eef6ff'));
    this.vue.style.setProperty('--ciel-a', ciel[0]); this.vue.style.setProperty('--ciel-b', ciel[1]); this.vue.style.setProperty('--ciel-c', ciel[2]);
    this.brouillard = e.brume ? K.col('#e4e8e6') : e.couvert ? K.col(ciel[1]) : null;
    K.U.uNuage.value = e.nuages && !reduit ? 0.1 + e.nuages * 0.035 : 0;
    return true;
  },

  // Chaque image : nuages qui glissent, pluie et neige autour de la cible, brouillard, éclairs
  image(t, dt, cam, vent, reduit) {
    const K = K3, e = this.etat, s = Math.min(0.05, dt / 1000);
    K.U.uNuageDecal.value.x -= s * 0.012 * (0.6 + vent.force) * Math.cos(vent.dir);
    K.U.uNuageDecal.value.y -= s * 0.012 * (0.6 + vent.force) * Math.sin(vent.dir);
    // brouillard : densité rapportée à la distance de la caméra
    if (this.brouillard) {
      const dens = (e.brume ? 0.95 : 0.36) / cam.dist;
      if (!this.scene.fog) this.scene.fog = new T3.FogExp2(this.brouillard, dens);
      this.scene.fog.color.copy(this.brouillard); this.scene.fog.density = dens;
    } else if (this.scene.fog) this.scene.fog = null;
    const R = Math.max(5, cam.dist * 0.55), cx = cam.cible.x, cz = cam.cible.z, haut = Math.max(4, cam.dist * 0.3);
    const voulu = reduit || e.eau < 0.3 ? 0 : e.neige ? Math.min(1, 0.25 + e.eau / 15) : Math.min(1, 0.15 + e.eau / 25);
    // pluie
    this.pluie.visible = voulu > 0 && !e.neige;
    if (this.pluie.visible) {
      const a = this.pluie.geometry.attributes.position.array, n = Math.round(this.gouttes.length * voulu), L = 0.35, sx = -0.12, sz = 0.05;
      for (let i = 0; i < this.gouttes.length; i++) {
        const g = this.gouttes[i];
        if (i >= n) { a.fill(0, i * 6, i * 6 + 6); continue; }
        g.y -= 14 * g.v * s; g.x += sx * 14 * g.v * s; g.z += sz * 14 * g.v * s;
        if (g.y < 0 || Math.abs(g.x - cx) > R || Math.abs(g.z - cz) > R) { g.x = cx + (Math.random() * 2 - 1) * R; g.z = cz + (Math.random() * 2 - 1) * R; g.y = g.y < 0 ? haut : Math.random() * haut; }
        a[i * 6] = g.x; a[i * 6 + 1] = g.y; a[i * 6 + 2] = g.z; a[i * 6 + 3] = g.x - sx * L; a[i * 6 + 4] = g.y + L; a[i * 6 + 5] = g.z - sz * L;
      }
      this.pluie.geometry.attributes.position.needsUpdate = true;
    }
    // neige
    this.neige.visible = voulu > 0 && e.neige;
    if (this.neige.visible) {
      const a = this.neige.geometry.attributes.position.array, n = Math.round(this.flocons.length * voulu);
      this.neige.material.size = Math.max(0.05, cam.dist * 0.0062);
      for (let i = 0; i < this.flocons.length; i++) {
        const f = this.flocons[i];
        if (i >= n) { a[i * 3 + 1] = -50; continue; }
        f.y -= 1.1 * f.v * s; f.x += (Math.sin(t / 900 + f.ph) * 0.35 + 0.15) * s; f.z += Math.cos(t / 1100 + f.ph) * 0.2 * s;
        if (f.y < 0 || Math.abs(f.x - cx) > R || Math.abs(f.z - cz) > R) { f.x = cx + (Math.random() * 2 - 1) * R; f.z = cz + (Math.random() * 2 - 1) * R; f.y = f.y < 0 ? haut : Math.random() * haut; }
        a[i * 3] = f.x; a[i * 3 + 1] = f.y; a[i * 3 + 2] = f.z;
      }
      this.neige.geometry.attributes.position.needsUpdate = true;
    }
    // orage
    if (e.orage && !reduit && t > this.prochainEclair) {
      this.prochainEclair = t + 2500 + Math.random() * 6000;
      const a = this.bolt.geometry.attributes.position.array; let x = cx + (Math.random() - 0.5) * R * 1.4, z = cz + (Math.random() - 0.5) * R * 1.4, y = haut * 1.6;
      for (let i = 0; i < 30; i++) { a[i * 3] = x; a[i * 3 + 1] = Math.max(0, y); a[i * 3 + 2] = z; x += (Math.random() - 0.5) * 0.6; z += (Math.random() - 0.5) * 0.6; y -= haut * 1.6 / 29; }
      this.bolt.geometry.attributes.position.needsUpdate = true; this.eclair = t;
    }
    if (this.eclair) {
      const a = (t - this.eclair) / 380;
      if (a >= 1) { this.eclair = null; this.eclairLum.intensity = 0; this.bolt.visible = false; }
      else { this.eclairLum.intensity = 1.6 * (1 - a) * (a < 0.15 ? 1 : 0.6); this.bolt.visible = a < 0.35; }
    }
  },
};
