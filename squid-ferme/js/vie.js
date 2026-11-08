'use strict';
/* La vie autour de la ferme, en temps réel (quelle que soit la vitesse du jeu) : vaches sur les pâtures du RPG
   d'avril à novembre, poules dans la cour, fumée des cheminées, pigeons autour du pigeonnier, voitures sur les
   routes, camion de livraison qui part de la ferme, vols d'oiseaux (oies en migration au printemps et à
   l'automne), corbeaux sur les terres nues qui s'envolent quand on approche, lièvre. Ombres en disques flous. */

const Vie = {
  scene: null, D: null, pl: null, groupe: null, etres: [], vaches: [], poules: [], fumees: [], pigeons: [], prochain: {}, pature: [], nus: [], sortie: null,

  init(scene, D, pl, f) {
    if (this.groupe) this.groupe.parent?.remove(this.groupe);
    this.scene = scene; this.D = D; this.pl = pl; this.etres = []; this.vaches = []; this.pature = []; this.nus = [];
    this.groupe = new T3.Group(); scene.add(this.groupe); this.num = 0;
    for (const id of [...Flotte.mobiles.keys()]) if (id.startsWith('trafic')) Flotte.desinscrire(id);
    // voitures et camion entrent et sortent par la tranche du plateau : découpés aux bords
    this.bords = [new T3.Plane(new T3.Vector3(1, 0, 0), pl.w / 2), new T3.Plane(new T3.Vector3(-1, 0, 0), pl.w / 2), new T3.Plane(new T3.Vector3(0, 0, 1), pl.h / 2), new T3.Plane(new T3.Vector3(0, 0, -1), pl.h / 2)];
    const t = performance.now();
    this.prochain = { oiseaux: t + 6000, corbeaux: t + 4000, lievre: t + 25000, voiture: t + 2500, pigeons: t + 9000 };
    this.geos();
    // poules dans la cour, fumée des cheminées (dans le repère de la ferme)
    this.poules = []; this.fumees = []; this.pigeons = [];
    const F = D.ferme;
    if (F) {
      const cols = ['#f4efe4', '#c8743a', '#f4efe4', '#8a4a2a', '#e8e0d0'];
      for (let i = 0; i < 5; i++) {
        const p = new T3.Group(); K3.mesh(p, this.G.poule, K3.matV()); p.add(this.ombre(0.05));
        p.children[0].material = K3.matV(); this.teinter(p.children[0], cols[i]);
        const x = F.cour.x0 + Math.random() * (F.cour.x1 - F.cour.x0), z = F.cour.z0 + Math.random() * (F.cour.z1 - F.cour.z0);
        p.position.set(x, 0.012, z); p.userData.nom = { cle: 'animal:poule-' + (i + 1), libelle: 'Poule ' + (i + 1) }; F.groupe.add(p);
        this.poules.push({ o: p, x, z, cx: x, cz: z, etat: 'picore', fin: t + Math.random() * 2000, cap: Math.random() * 6 });
      }
      const mf = () => new T3.MeshStandardMaterial({ color: K3.col('#ecebee'), transparent: true, opacity: 0.5, depthWrite: false, roughness: 1 });
      F.cheminees.forEach((c, k) => { for (let i = 0; i < 5; i++) { const m = new T3.Mesh(this.G.bouffee, mf()); m.castShadow = false; F.groupe.add(m); this.fumees.push({ o: m, c, k: i / 5 + k * 0.37 }); } });
      for (let i = 0; i < 3; i++) { const o = this.oiseau('#9aa0aa', 0.6); o.userData.nom = { cle: 'animal:pigeon-' + (i + 1), libelle: 'Pigeon ' + (i + 1) }; F.groupe.add(o); o.visible = false; this.pigeons.push({ o, ph: i * 2.1 }); }
    }
    this.sortie = this.cheminSortie();
  },

  // ---------- Modèles ----------
  G: null,
  geos() {
    if (this.G) return;
    const K = K3, G = K.G;
    this.G = {
      vache: K.fusion([K.piece(G.boule(8, 6), '#f7f6f0', [0, 0.2, 0], 0, [0.17, 0.1, 0.09]), K.piece(G.boule(8, 6), '#262626', [-0.04, 0.23, 0.065], 0, [0.06, 0.05, 0.03]),
        K.piece(G.boule(8, 6), '#262626', [0.06, 0.2, -0.065], 0, [0.05, 0.045, 0.03]), K.piece(G.boule(6, 4), '#262626', [-0.1, 0.27, -0.02], 0, [0.05, 0.03, 0.05]), K.piece(G.boule(6, 4), '#f0b4b4', [-0.06, 0.11, 0], 0, 0.03),
        K.piece(G.cyl(0.006, 0.006, 0.14, 4), '#3a3a3a', [-0.17, 0.17, 0], [0, 0, -0.5]),
        ...[[-0.1, 0.05], [-0.1, -0.05], [0.1, 0.05], [0.1, -0.05]].map(([x, z]) => K.piece(G.cyl(0.02, 0.018, 0.14, 5), '#3a3a3a', [x, 0.07, z]))]),
      tete: K.fusion([K.piece(G.boule(8, 6), '#f7f6f0', [0.05, 0, 0], 0, [0.06, 0.05, 0.045]), K.piece(G.boule(6, 4), '#262626', [0.04, 0.02, 0], 0, [0.03, 0.03, 0.047]),
        K.piece(G.boule(6, 4), '#e9a7a0', [0.1, -0.015, 0], 0, 0.03), K.piece(G.cone(0.012, 0.05, 4), '#e8e0c8', [0.04, 0.055, 0.03], [0.4, 0, 0]), K.piece(G.cone(0.012, 0.05, 4), '#e8e0c8', [0.04, 0.055, -0.03], [-0.4, 0, 0])]),
      poule: K.fusion([K.piece(G.boule(6, 4), '#ffffff', [0, 0.035, 0], 0, [0.035, 0.03, 0.025]), K.piece(G.boule(6, 4), '#ffffff', [0.03, 0.065, 0], 0, 0.014),
        K.piece(G.boule(4, 3), '#d8402a', [0.034, 0.082, 0], 0, [0.008, 0.008, 0.004]), K.piece(G.cone(0.005, 0.012, 4), '#e8b030', [0.046, 0.064, 0], [0, 0, -Math.PI / 2]),
        K.piece(G.cone(0.012, 0.03, 4), '#ffffff', [-0.032, 0.05, 0], [0, 0, 0.9])]),
      voiture: (() => { const dome = new T3.CylinderGeometry(0.1, 0.1, 0.24, 10, 1, false, 0, Math.PI); dome.rotateX(Math.PI / 2); dome.rotateY(Math.PI / 2);
        return K.fusion([K.piece(G.boite(0.38, 0.09, 0.19), '#ffffff', [0, 0.1, 0]), K.piece(dome, '#ffffff', [-0.02, 0.145, 0], 0, [1, 0.8, 0.9]),
          K.piece(G.boite(0.02, 0.05, 0.15), '#33495a', [0.08, 0.17, 0], [0, 0, -0.5]), K.piece(G.boite(0.015, 0.02, 0.05), '#fff4c0', [0.19, 0.1, 0.06]), K.piece(G.boite(0.015, 0.02, 0.05), '#fff4c0', [0.19, 0.1, -0.06]),
          ...[[0.12, 0.095], [0.12, -0.095], [-0.12, 0.095], [-0.12, -0.095]].map(([x, z]) => K.piece(G.cyl(0.045, 0.045, 0.03, 8), '#222222', [x, 0.05, z], [Math.PI / 2, 0, 0]))]); })(),
      camion: K.fusion([K.piece(G.boite(0.16, 0.16, 0.2), '#2f6a8a', [0.2, 0.13, 0]), K.piece(G.boite(0.02, 0.07, 0.17), '#33495a', [0.28, 0.17, 0]),
        K.piece(G.boite(0.4, 0.06, 0.22), '#5a4a3a', [-0.08, 0.08, 0]), K.piece(G.boite(0.4, 0.08, 0.02), '#8a6a42', [-0.08, 0.15, 0.1]), K.piece(G.boite(0.4, 0.08, 0.02), '#8a6a42', [-0.08, 0.15, -0.1]),
        ...[[0.0, 0.2, 0.09, 0.07], [-0.12, 0.3, 0.12, 0.05]].flatMap(([x, l, w, h]) => [K.piece(G.boite(l * 0.4, h, w), '#d9c271', [x, 0.14 + h / 2, 0.04]), K.piece(G.boite(l * 0.4, h, w), '#d4bc68', [x + 0.08, 0.14 + h / 2, -0.04])]),
        ...[[0.2, 0.1], [0.2, -0.1], [-0.16, 0.1], [-0.16, -0.1]].map(([x, z]) => K.piece(G.cyl(0.05, 0.05, 0.035, 8), '#222222', [x, 0.05, z], [Math.PI / 2, 0, 0]))]),
      corps: K.fusion([K.piece(G.boule(6, 4), '#ffffff', [0, 0, 0], 0, [0.05, 0.022, 0.022]), K.piece(G.boule(5, 3), '#ffffff', [0.045, 0.01, 0], 0, 0.016), K.piece(G.cone(0.02, 0.04, 4), '#ffffff', [-0.05, 0, 0], [0, 0, Math.PI / 2], [1, 1, 0.4])]),
      aile: (() => { const s = new T3.Shape(); s.moveTo(0, 0); s.lineTo(0.035, 0.0); s.lineTo(0.012, 0.09); s.lineTo(-0.02, 0.07); s.closePath(); const g = new T3.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g; })(),
      corbeau: K.fusion([K.piece(G.boule(6, 4), '#1e1e24', [0, 0.04, 0], 0, [0.045, 0.026, 0.024]), K.piece(G.boule(5, 3), '#1e1e24', [0.04, 0.062, 0], 0, 0.017), K.piece(G.cone(0.006, 0.02, 4), '#3a3a40', [0.06, 0.06, 0], [0, 0, -Math.PI / 2]),
        K.piece(G.boite(0.04, 0.006, 0.02), '#1e1e24', [-0.05, 0.045, 0], [0, 0, 0.3]), K.piece(G.cyl(0.003, 0.003, 0.03, 3), '#3a3a40', [0, 0.012, 0.01]), K.piece(G.cyl(0.003, 0.003, 0.03, 3), '#3a3a40', [0, 0.012, -0.01])]),
      lievre: K.fusion([K.piece(G.boule(6, 4), '#a8845a', [0, 0.05, 0], 0, [0.06, 0.035, 0.032]), K.piece(G.boule(5, 4), '#a8845a', [0.05, 0.075, 0], 0, 0.022), K.piece(G.boite(0.008, 0.05, 0.012), '#8a6a44', [0.045, 0.11, 0.008], [0, 0, -0.3]),
        K.piece(G.boite(0.008, 0.05, 0.012), '#8a6a44', [0.045, 0.11, -0.008], [0, 0, -0.3]), K.piece(G.boule(4, 3), '#f2ece0', [-0.06, 0.06, 0], 0, 0.012)]),
      bouffee: new T3.SphereGeometry(0.06, 8, 6),
      ombre: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,.42)'); r.addColorStop(0.6, 'rgba(0,0,0,.22)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T3.CanvasTexture(c); })(),
    };
    this.mOmbre = new T3.MeshBasicMaterial({ map: this.G.ombre, transparent: true, depthWrite: false, opacity: 1 });
  },
  caseDe(x, z) { return Math.floor(x + this.pl.w / 2) + ',' + Math.floor(z + this.pl.h / 2); },
  mOmbreBord() { if (!this._mob) { this._mob = this.mOmbre.clone(); this._mob.clippingPlanes = this.bords; } return this._mob; },
  ombre(r, l = r) { const m = new T3.Mesh(new T3.PlaneGeometry(2 * l, 2 * r).rotateX(-Math.PI / 2), this.mOmbre); m.position.y = 0.006; m.renderOrder = 1; return m; },
  teinter(mesh, c) { mesh.material.color = K3.col(c); },
  oiseau(c, s = 1) {
    const g = new T3.Group(), m = K3.mat(c, { side: T3.DoubleSide });
    const corps = new T3.Mesh(this.G.corps, K3.matV()); this.teinter(corps, c); g.add(corps);
    const a = new T3.Mesh(this.G.aile, m), b = new T3.Mesh(this.G.aile, m); b.scale.z = -1; a.position.set(0, 0.01, 0.012); b.position.set(0, 0.01, -0.012);
    g.add(a, b); g.userData.ailes = [a, b]; g.scale.setScalar(s); return g;
  },
  battre(o, t, k) { const [a, b] = o.userData.ailes, v = Math.sin(t / 90 + k) * 0.9; a.rotation.x = -v; b.rotation.x = v; },

  // ---------- Itinéraires ----------
  // De la ferme jusqu'au bord de la carte, par les chemins et les routes (cases), lissé
  cheminSortie() {
    const D = this.D, pl = this.pl; if (!D.ferme || !D.allee) return null;
    const W = pl.w, H = pl.h, fin = D.allee.at(-1), x0 = Math.floor(fin[0] + W / 2), y0 = Math.floor(fin[1] + H / 2);
    const ok = (x, y) => x >= 0 && y >= 0 && x < W && y < H && 'rp'.includes(pl.types[y][x]);
    let depart = null;
    for (let r = 0; r < 3 && !depart; r++) for (let dy = -r; dy <= r && !depart; dy++) for (let dx = -r; dx <= r && !depart; dx++) if (ok(x0 + dx, y0 + dy)) depart = [x0 + dx, y0 + dy];
    if (!depart) return null;
    const prev = new Map([[depart[1] * W + depart[0], -1]]), file = [depart[1] * W + depart[0]];
    let but = -1, mieux = 1e9;
    for (let q = 0; q < file.length; q++) {
      const i = file[q], x = i % W, y = (i / W) | 0;
      if ((x === 0 || y === 0 || x === W - 1 || y === H - 1)) { let n = 0; for (let j = i; j !== -1; j = prev.get(j)) n++; n += pl.types[y][x] === 'p' ? 8 : 0; if (n < mieux) { mieux = n; but = i; } }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const nx = x + dx, ny = y + dy, j = ny * W + nx;
        if (!ok(nx, ny) || prev.has(j)) continue;
        if (dx && dy && (ok(x + dx, y) || ok(x, y + dy))) continue;
        prev.set(j, i); file.push(j);
      }
    }
    if (but < 0) return null;
    const cases = []; for (let j = but; j !== -1; j = prev.get(j)) cases.push(j); cases.reverse();
    let pts = cases.map(i => [i % W - W / 2 + 0.5, ((i / W) | 0) - H / 2 + 0.5]);
    const b = cases.at(-1), bx = b % W, by = (b / W) | 0, last = pts.at(-1);
    pts.push([bx === 0 ? -W / 2 - 0.3 : bx === W - 1 ? W / 2 + 0.3 : last[0], by === 0 ? -H / 2 - 0.3 : by === H - 1 ? H / 2 + 0.3 : last[1]]);
    pts = [...D.allee.slice(0, -1), ...pts];
    for (let k = 0; k < 2; k++) pts = Decor.chaikin(pts);
    return pts;
  },

  // ---------- Chaque jour ----------
  // pature : cases de pâture permanente ; nus : cases de terre nue ou à peine semée (pour les corbeaux)
  jour(f, j, m, pature, nus) {
    this.nus = nus; this.meteo = m;
    const cle = c => this.caseDe(c[0] + 0.5, c[1] + 0.5);
    if (pature.map(cle).join(';') !== (this.pature || []).map(cle).join(';')) {
      this.pature = pature; this.dansPre = new Set(pature.map(cle)); this.morceaux = [];
      const vu = new Set();
      for (const c of pature) { if (vu.has(cle(c))) continue; const m = [], file = [c]; vu.add(cle(c)); while (file.length) { const a = file.pop(); m.push(a); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const b = [a[0] + dx, a[1] + dz], k = cle(b); if (this.dansPre.has(k) && !vu.has(k)) { vu.add(k); file.push(b); } } } this.morceaux.push(m); }
      this.vaches.forEach(v => this.groupe.remove(v.o)); this.vaches = [];
    }
    const mois = dateDe(j).mois, dehors = mois >= 4 && mois <= 11 && pature.length;
    const voulu = dehors ? Math.min(8, Math.max(2, Math.round(pature.length * 1.3))) : 0;
    while (this.vaches.length > voulu) { const v = this.vaches.pop(); this.groupe.remove(v.o); }
    while (this.vaches.length < voulu) {
      const o = new T3.Group(); K3.mesh(o, this.G.vache, K3.matV()); const tete = new T3.Group(); tete.position.set(0.15, 0.24, 0); o.add(tete); K3.mesh(tete, this.G.tete, K3.matV());
      o.add(this.ombre(0.13, 0.22)); o.traverse(c => { if (c.isMesh) c.castShadow = false; });
      const k = this.vaches.length, mo = this.morceaux[k % this.morceaux.length], c = mo[(Math.random() * mo.length) | 0], x = c[0] + 0.25 + Math.random() * 0.5, z = c[1] + 0.25 + Math.random() * 0.5;
      o.position.set(x, 0, z); o.scale.setScalar(0.9 + Math.random() * 0.2); o.userData.nom = { cle: 'animal:vache-' + (k + 1), libelle: 'Vache ' + (k + 1) }; this.groupe.add(o);
      this.vaches.push({ o, tete, x, z, mo, cap: Math.random() * 6, but: null, fin: 0, broute: true });
    }
    if (!dehors) this.vaches.forEach(v => this.groupe.remove(v.o));
  },

  // Sept véhicules de 1960 (voitures, fourgonnette, camion de betteraves, tracteurs des voisins), tirés au hasard selon leur fréquence
  modeles() {
    if (this._modeles) return this._modeles;
    const K = K3, G = K.G, vitre = '#9fc3d6', chrome = '#d6d6d2';
    const R = (x, z, r, l, c = '#cfcfcf') => [K.piece(G.cyl(r, r, l, 10), '#1c1c1c', [x, r, z], [Math.PI / 2, 0, 0]), K.piece(G.cyl(r * 0.5, r * 0.5, l + 0.004, 8), c, [x, r, z], [Math.PI / 2, 0, 0])];
    const quatre = (x, z, r, l, c) => [...R(x, z, r, l, c), ...R(x, -z, r, l, c), ...R(-x, z, r, l, c), ...R(-x, -z, r, l, c)];
    const berline = (c, toit, L) => [K.piece(G.boite(L, 0.085, 0.2), c, [0, 0.088, 0]), K.piece(G.boite(L * 0.52, 0.072, 0.178), toit, [-L * 0.07, 0.166, 0]),
      K.piece(G.boite(L * 0.53, 0.042, 0.184), vitre, [-L * 0.07, 0.17, 0]), K.piece(G.boite(L * 0.44, 0.018, 0.16), toit, [-L * 0.07, 0.208, 0]),
      K.piece(G.boite(0.02, 0.024, 0.2), chrome, [L / 2 + 0.005, 0.06, 0]), K.piece(G.boite(0.02, 0.024, 0.2), chrome, [-L / 2 - 0.005, 0.06, 0]), ...quatre(L * 0.32, 0.1, 0.045, 0.03)];
    const tracteurDe = (c, jante) => [K.piece(G.boite(0.2, 0.09, 0.1), c, [0.07, 0.16, 0]), K.piece(G.boite(0.15, 0.055, 0.09), '#4a4a4a', [0.07, 0.095, 0]),
      K.piece(G.boite(0.12, 0.018, 0.05), c, [-0.06, 0.19, 0.095]), K.piece(G.boite(0.12, 0.018, 0.05), c, [-0.06, 0.19, -0.095]), K.piece(G.boite(0.05, 0.018, 0.06), '#2a2a2a', [-0.07, 0.2, 0]),
      K.piece(G.cyl(0.006, 0.006, 0.09, 6), '#222222', [0.12, 0.25, 0.03]), K.piece(G.cyl(0.02, 0.024, 0.075, 8), '#6b5a40', [-0.065, 0.245, 0]), K.piece(G.boule(6, 4), '#e2b48c', [-0.06, 0.3, 0], 0, 0.019),
      K.piece(G.cyl(0.026, 0.026, 0.012, 10), '#2b2b2b', [-0.06, 0.318, 0]), ...R(-0.06, 0.1, 0.09, 0.045, jante), ...R(-0.06, -0.1, 0.09, 0.045, jante), ...R(0.12, 0.07, 0.045, 0.028, jante), ...R(0.12, -0.07, 0.045, 0.028, jante)];
    const dome = new T3.CylinderGeometry(0.1, 0.1, 0.3, 10, 1, false, 0, Math.PI); dome.rotateZ(Math.PI / 2);
    const M = [
      { nom: 'Petite voiture grise', v: [1.9, 2.4], p: 0.16, pieces: [K.piece(G.boite(0.38, 0.1, 0.2), '#8b9aa8', [0, 0.1, 0]), K.piece(dome, '#7d8c9a', [-0.02, 0.15, 0]),
        ...[[0.12, 0.1], [0.12, -0.1], [-0.12, 0.1], [-0.12, -0.1]].map(([x, z]) => K.piece(G.cyl(0.045, 0.045, 0.03, 8), '#222222', [x, 0.05, z], [Math.PI / 2, 0, 0]))] },
      { nom: 'Berline noire', v: [2.6, 3.2], p: 0.15, pieces: berline('#1f2328', '#1f2328', 0.46) },
      { nom: 'Voiture ivoire et bordeaux', v: [2.3, 2.9], p: 0.14, pieces: berline('#e4d9bd', '#8e2f2a', 0.42) },
      { nom: 'Fourgonnette bleue', v: [2.0, 2.5], p: 0.13, pieces: [K.piece(G.boite(0.1, 0.07, 0.18), '#5b7c96', [0.14, 0.075, 0]), K.piece(G.boite(0.27, 0.17, 0.19), '#5b7c96', [-0.045, 0.125, 0]),
        K.piece(G.boite(0.012, 0.05, 0.16), vitre, [0.09, 0.17, 0]), K.piece(G.boite(0.05, 0.045, 0.194), vitre, [0.055, 0.17, 0]),
        ...[-0.15, -0.09, -0.03].map(x => K.piece(G.boite(0.006, 0.14, 0.196), '#4d6b83', [x, 0.125, 0])), K.piece(G.boite(0.016, 0.02, 0.19), chrome, [0.195, 0.055, 0]), ...quatre(0.115, 0.095, 0.042, 0.028)] },
      { nom: 'Camion de betteraves', v: [1.5, 1.9], p: 0.16, pieces: [K.piece(G.boite(0.14, 0.09, 0.19), '#3f6a4a', [0.27, 0.1, 0]), K.piece(G.boite(0.12, 0.16, 0.22), '#3f6a4a', [0.15, 0.15, 0]),
        K.piece(G.boite(0.01, 0.06, 0.18), vitre, [0.211, 0.19, 0]), K.piece(G.boite(0.07, 0.05, 0.224), vitre, [0.15, 0.19, 0]), K.piece(G.boite(0.02, 0.03, 0.22), '#2a2a2a', [0.345, 0.06, 0]),
        K.piece(G.boite(0.58, 0.03, 0.16), '#2a2a2a', [-0.04, 0.065, 0]), K.piece(G.boite(0.44, 0.025, 0.24), '#7a5a3a', [-0.12, 0.095, 0]),
        K.piece(G.boite(0.44, 0.07, 0.012), '#8a6a44', [-0.12, 0.14, 0.114]), K.piece(G.boite(0.44, 0.07, 0.012), '#8a6a44', [-0.12, 0.14, -0.114]),
        K.piece(G.boite(0.012, 0.07, 0.24), '#8a6a44', [-0.334, 0.14, 0]), K.piece(G.boite(0.012, 0.09, 0.24), '#8a6a44', [0.094, 0.15, 0]),
        ...Array.from({ length: 18 }, (_, i) => K.piece(G.boule(6, 4), i % 3 ? '#e0cfa8' : '#cdb78e', [-0.29 + (i % 6) * 0.068, 0.14 + Math.floor(i / 6) * 0.025, (Math.floor(i / 6) % 2 ? 0.04 : -0.04) + ((i * 7) % 3 - 1) * 0.035], 0, 0.034)),
        ...R(0.25, 0.11, 0.055, 0.035), ...R(0.25, -0.11, 0.055, 0.035), ...R(-0.2, 0.11, 0.055, 0.035), ...R(-0.2, -0.11, 0.055, 0.035)] },
      { nom: 'Tracteur du voisin et ses bottes', v: [0.9, 1.15], p: 0.14, pieces: [...tracteurDe('#8f9497', '#8f9497'), K.piece(G.boite(0.12, 0.012, 0.012), '#2a2a2a', [-0.2, 0.07, 0]),
        K.piece(G.boite(0.4, 0.02, 0.22), '#8a6a44', [-0.46, 0.1, 0]), ...R(-0.46, 0.12, 0.05, 0.03, '#8a6a44'), ...R(-0.46, -0.12, 0.05, 0.03, '#8a6a44'),
        ...[[-0.56, 0.155, -0.055], [-0.56, 0.155, 0.055], [-0.37, 0.155, -0.055], [-0.37, 0.155, 0.055], [-0.465, 0.245, 0]].map(q => K.piece(G.boite(0.17, 0.09, 0.1), '#dcc06a', q))] },
      { nom: 'Tracteur rouge', v: [1.05, 1.35], p: 0.12, pieces: tracteurDe('#b83a2c', '#e8e2d0') },
    ];
    for (const m of M) { m.geo = K.fusion(m.pieces); m.geo.computeBoundingBox(); const b = m.geo.boundingBox; m.geo.translate(-(b.min.x + b.max.x) / 2, 0, 0); m.L = (b.max.x - b.min.x) / 2; m.W = (b.max.z - b.min.z) / 2; delete m.pieces; }
    this.matTrafic = K.matV({ clippingPlanes: this.bords });
    return (this._modeles = M);
  },
  tirer(M) { let r = M.reduce((a, m) => a + m.p, 0) * Math.random(); for (const m of M) { r -= m.p; if (r <= 0) return m; } return M.at(-1); },
  // Camion de livraison qui quitte la ferme ; plusieurs livraisons d'affilée partent l'une après l'autre
  livraison() {
    if (!this.sortie || Rendu.reduit) return;
    const enRoute = this.etres.filter(e => e.type === 'camion');
    if (enRoute.length >= 3) return;
    const o = new T3.Group(); K3.mesh(o, this.G.camion, K3.matV({ clippingPlanes: this.bords })).castShadow = false; const om = this.ombre(0.14, 0.32); om.material = this.mOmbreBord(); o.add(om); this.groupe.add(o);
    o.userData.nom = { cle: 'vehicule:camion-' + (++this.num), libelle: 'Camion de livraison' };
    const d = enRoute.length ? Math.min(0, Math.min(...enRoute.map(e => e.d)) - 0.8) : 0;
    this.etres.push({ type: 'camion', o, pts: this.sortie, L: Decor.longueur(this.sortie), d, v: 0.9 });
  },

  // ---------- Chaque image ----------
  image(t, dt, ctx) {
    const s = Math.min(0.05, dt / 1000), D = this.D, reduit = ctx.reduit;
    if (reduit) return;
    this.naitre(t, ctx);
    // vaches : marchent d'un coin d'herbe à l'autre, broutent
    for (const v of this.vaches) {
      if (!v.but || t > v.fin) {
        if (v.but && !v.broute) { v.broute = true; v.fin = t + 4000 + Math.random() * 9000; }
        else { const c = v.mo[(Math.random() * v.mo.length) | 0]; v.but = [c[0] + 0.2 + Math.random() * 0.6, c[1] + 0.2 + Math.random() * 0.6]; v.broute = false; v.fin = t + 60000; }
      }
      if (!v.broute) {
        const dx = v.but[0] - v.x, dz = v.but[1] - v.z, d = Math.hypot(dx, dz), cible = Math.atan2(dz, dx);
        let dc = ((cible - v.cap + Math.PI * 3) % (Math.PI * 2)) - Math.PI; v.cap += Math.max(-1.2 * s, Math.min(1.2 * s, dc));
        if (d < 0.05) v.fin = 0;
        else if (Math.abs(dc) < 0.8) {
          const nx = v.x + Math.cos(v.cap) * 0.09 * s, nz = v.z + Math.sin(v.cap) * 0.09 * s, a = 0.16;
          // jamais contre la clôture : la case visée doit être de la pâture, à bonne distance du bord
          const ok = [[a, a], [-a, a], [a, -a], [-a, -a]].every(([dx, dz]) => this.dansPre.has(this.caseDe(nx + dx, nz + dz)));
          if (ok) { v.x = nx; v.z = nz; } else v.fin = 0;
        }
      }
      v.o.position.set(v.x, 0, v.z); v.o.rotation.y = -v.cap; v.tete.rotation.z = v.broute ? -0.75 + Math.sin(t / 600 + v.x * 9) * 0.08 : 0;
    }
    // poules
    for (const p of this.poules) {
      const C = D.ferme.cour;
      if (t > p.fin) {
        if (p.etat === 'picore') { p.etat = 'marche'; p.cx = Math.max(C.x0, Math.min(C.x1, p.x + (Math.random() - 0.5) * 0.7)); p.cz = Math.max(C.z0, Math.min(C.z1, p.z + (Math.random() - 0.5) * 0.7)); p.fin = t + 3000; }
        else { p.etat = 'picore'; p.fin = t + 900 + Math.random() * 2600; }
      }
      if (p.etat === 'marche') {
        const dx = p.cx - p.x, dz = p.cz - p.z, d = Math.hypot(dx, dz);
        if (d < 0.01) p.fin = 0; else { p.cap = Math.atan2(dz, dx); const v = Math.min(d, 0.22 * s); p.x += dx / d * v; p.z += dz / d * v; }
      }
      p.o.position.set(p.x, 0.012 + (p.etat === 'marche' ? Math.abs(Math.sin(t / 70)) * 0.008 : 0), p.z); p.o.rotation.y = -p.cap;
      p.o.children[0].rotation.z = p.etat === 'picore' && Math.sin(t / 160 + p.x * 20) > 0.3 ? -0.5 : 0;
    }
    // fumée : plus épaisse quand il fait froid
    const froid = this.meteo ? clamp01((16 - this.meteo.tmax) / 14) : 0.5;
    for (const f of this.fumees) {
      const v = (t / 4000 + f.k) % 1, vent = ctx.vent;
      f.o.position.set(f.c.x + v * 0.45 * Math.cos(vent.dir) * (0.5 + vent.force), f.c.y + v * 1.0, f.c.z + v * 0.45 * Math.sin(vent.dir) * (0.5 + vent.force));
      f.o.scale.setScalar(0.6 + v * 2.2); f.o.material.opacity = (0.15 + 0.4 * froid) * (1 - v) * Math.min(1, v * 8);
    }
    // pigeons qui tournent autour du pigeonnier, de temps en temps
    if (D.ferme) {
      const vol = (t % 40000) < 14000;
      this.pigeons.forEach((p, i) => {
        p.o.visible = vol; if (!vol) return;
        const a = t / 1400 + p.ph, c = D.ferme.pigeonnier;
        p.o.position.set(c.x + Math.cos(a) * (0.5 + i * 0.08), c.y + 0.15 + Math.sin(a * 2) * 0.05, c.z + Math.sin(a) * (0.5 + i * 0.08));
        p.o.rotation.y = -a - Math.PI / 2; this.battre(p.o, t, i);
      });
    }
    // êtres de passage
    this.etres = this.etres.filter(e => {
      if (e.type === 'trafic') {
        const pose = e.tr.pose(e.s), libre = Flotte.veiller(e.veille ??= {}, e.x, e.y) ? Infinity : Flotte.devant(e.id, { x: pose.x, y: pose.y, cap: pose.cap }, e.L, e.W, 3, (m, dc) => Math.cos(dc) > -0.3);
        e.v = Math.min(e.v + 1.2 * s, e.v0, Math.sqrt(2 * 3.5 * Math.max(0, libre - 0.14)));
        e.s += e.v * s; const p = e.tr.pose(e.s);
        e.x = p.x; e.y = p.y; e.cap = p.cap; e.o.visible = true; e.o.position.set(p.x, 0.012, p.y); e.o.rotation.y = -p.cap;
        if (e.s >= e.tr.L - 1e-3) { this.groupe.remove(e.o); Flotte.desinscrire(e.id); return false; }
        return true;
      }
      if (e.type === 'voiture' || e.type === 'camion') {
        e.d += e.v * s;
        if (e.d < 0) { e.o.visible = false; return true; }
        const p = Decor.surLigne(e.pts, e.d, e.voie ?? Rendu.D.larg.r * 0.25); e.o.visible = true;
        e.o.position.set(p.x, 0.012, p.z); e.o.rotation.y = -p.cap;
        if (p.fini) { this.groupe.remove(e.o); return false; }
        return true;
      }
      if (e.type === 'vol') {
        const a = (t - e.t0) / e.duree; if (a >= 1) { this.groupe.remove(e.o); return false; }
        e.o.position.set(e.x0 + (e.x1 - e.x0) * a, e.y, e.z0 + (e.z1 - e.z0) * a);
        e.oiseaux.forEach((o, k) => this.battre(o, t, k * 1.7)); return true;
      }
      if (e.type === 'corbeaux') return this.corbeaux(e, t, s, ctx);
      if (e.type === 'lievre') {
        e.d += 0.55 * s; const a = e.d / e.L; if (a >= 1) { this.groupe.remove(e.o); return false; }
        const x = e.x0 + (e.x1 - e.x0) * a, z = e.z0 + (e.z1 - e.z0) * a, saut = Math.abs(Math.sin(e.d * 9));
        e.o.position.set(x, saut * 0.04, z); e.o.children[0].rotation.z = (saut - 0.5) * 0.3; return true;
      }
      return true;
    });
  },
  // De carrefour en carrefour jusqu'au bord du plateau : rend les points à suivre depuis la case « de », ou null s'il n'y a pas d'issue
  auCarrefour(routes, vus, de, n = 0) {
    if (n > 8) return null;
    const issues = routes.filter(r => !vus.has(r) && (r.debut === de || r.fin === de)).sort(() => Math.random() - 0.5);
    for (const r of issues) {
      const endroit = r.debut === de, pts = endroit ? r.pts : [...r.pts].reverse(), bord = r.auBord[endroit ? 1 : 0];
      if (bord) return pts;
      vus.add(r);
      const s = this.auCarrefour(routes, vus, endroit ? r.fin : r.debut, n + 1);
      if (s) return [...pts, ...s.slice(1)];
    }
    return null;
  },
  naitre(t, ctx) {
    const P = this.prochain, D = this.D, pl = this.pl, W = pl.w, H = pl.h, mois = ctx.mois;
    // Trafic de 1960 sur les routes qui sortent du plateau : trois véhicules au plus, dans les deux sens, voie de droite,
    // personne ne double (chacun règle sa vitesse sur ce qui roule devant lui) ; ils entrent et sortent par la tranche
    if (t > P.voiture) {
      const nb = this.etres.filter(e => e.type === 'trafic').length;
      P.voiture = t + 1500 + Math.random() * 6000 + nb * 1500;
      const routes = D.routes.filter(r => (r.auBord[0] || r.auBord[1]) && Decor.longueur(r.pts) > 5);
      if (routes.length && nb < 3) {
        const r = routes[(Math.random() * routes.length) | 0], sens = r.auBord[0] && (!r.auBord[1] || Math.random() < 0.5);
        let pts = sens ? r.pts : [...r.pts].reverse();
        const dehors = (a, b) => { const l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [a[0] + (a[0] - b[0]) / l * 0.7, a[1] + (a[1] - b[1]) / l * 0.7]; };
        const [b0, b1] = sens ? r.auBord : [r.auBord[1], r.auBord[0]];
        // une route qui s'arrête à un carrefour : le véhicule tourne ou continue tout droit jusqu'à ressortir du plateau
        const suite = b1 ? [] : this.auCarrefour(D.routes, new Set([r]), sens ? r.fin : r.debut);
        if (suite) pts = [...pts, ...suite.slice(1)];
        if (b0) pts = [dehors(pts[0], pts[1]), ...pts]; if (suite && pts.at(-1)) pts = [...pts, dehors(pts.at(-1), pts.at(-2))];
        pts = Flotte.aDroite(pts, D.larg.r * 0.28);
        const M = this.modeles(), m = this.tirer(M);
        if (suite && !Flotte.presDe(pts[0], m.L + 1.0)) {
          const o = new T3.Group(), id = 'trafic-' + (++this.num); K3.mesh(o, m.geo, this.matTrafic).castShadow = false;
          const om = this.ombre(m.W + 0.02, m.L + 0.04); om.material = this.mOmbreBord(); o.add(om); o.visible = false; this.groupe.add(o);
          o.userData.nom = { cle: 'vehicule:' + id, libelle: m.nom };
          const e = { type: 'trafic', id, o, tr: Flotte.trace([{ pts, r: 0.8 }]), s: 0, x: pts[0][0], y: pts[0][1], cap: 0, L: m.L, W: m.W, v0: m.v[0] + Math.random() * (m.v[1] - m.v[0]), v: m.v[1] };
          Flotte.inscrire(id, 'trafic', () => [{ x: e.x, y: e.y, cap: e.cap, l: e.L, w: e.W }]);
          this.etres.push(e);
        }
      }
    }
    // vols d'oiseaux : oies en V au printemps et à l'automne, petits groupes sinon
    if (t > P.oiseaux) {
      P.oiseaux = t + 22000 + Math.random() * 30000;
      const migr = [3, 10, 11].includes(mois), n = migr ? 9 : 3 + ((Math.random() * 3) | 0), g = new T3.Group(), oiseaux = [];
      for (let k = 0; k < n; k++) {
        const o = this.oiseau(migr ? '#8a8478' : '#4a4a52', migr ? 1.6 : 0.9), rang = Math.ceil(k / 2), cote = k % 2 ? 1 : -1;
        o.position.set(-rang * 0.22, (Math.random() - 0.5) * 0.05, migr ? cote * rang * 0.2 : (Math.random() - 0.5) * 0.8);
        if (!migr) o.position.x = (Math.random() - 0.5) * 0.8;
        g.add(o); oiseaux.push(o);
      }
      const a = Math.random() * Math.PI * 2, R = Math.hypot(W, H) / 2 + 3, y = migr ? 5 : 2.6 + Math.random();
      g.rotation.y = -(a + Math.PI); g.userData.nom = { cle: 'animal:oiseaux-' + (++this.num), libelle: migr ? 'Oies cendrées en migration' : 'Vol d’oiseaux' }; this.groupe.add(g);
      this.etres.push({ type: 'vol', o: g, oiseaux, t0: t, duree: (2 * R) / (migr ? 1.6 : 2.2) * 1000, x0: Math.cos(a) * R, z0: Math.sin(a) * R, x1: -Math.cos(a) * R, z1: -Math.sin(a) * R, y });
    }
    // corbeaux sur une terre nue
    if (t > P.corbeaux) {
      P.corbeaux = t + 25000 + Math.random() * 25000;
      if (this.nus.length && !this.etres.some(e => e.type === 'corbeaux')) {
        const c = this.nus[(Math.random() * this.nus.length) | 0], g = [];
        for (let k = 0; k < 3 + ((Math.random() * 3) | 0); k++) {
          const o = new T3.Group(), vol = this.oiseau('#1e1e24', 1.1), sol = new T3.Mesh(this.G.corbeau, K3.matV()); sol.castShadow = false;
          o.add(vol, sol, this.ombre(0.04, 0.06)); o.userData.nom = { cle: 'animal:corbeau-' + (++this.num), libelle: 'Corbeau freux' }; this.groupe.add(o);
          g.push({ o, vol, sol, x: c[0] + 0.2 + Math.random() * 0.6, z: c[1] + 0.2 + Math.random() * 0.6, ph: Math.random() * 6 });
        }
        const a = Math.random() * 6.28;
        this.etres.push({ type: 'corbeaux', g, etat: 'arrive', t0: t, fin: t + 18000 + Math.random() * 15000, dx: Math.cos(a), dz: Math.sin(a) });
      }
    }
    // lièvre qui traverse les champs
    if (t > P.lievre) {
      P.lievre = t + 50000 + Math.random() * 60000;
      if (mois <= 5 || mois >= 9) {
        const o = new T3.Group(); K3.mesh(o, this.G.lievre, K3.matV()).castShadow = false; o.add(this.ombre(0.05, 0.08)); o.userData.nom = { cle: 'animal:lievre-' + (++this.num), libelle: 'Lièvre d’Europe' }; this.groupe.add(o);
        const z0 = (Math.random() - 0.5) * H * 0.8, z1 = z0 + (Math.random() - 0.5) * 6, x0 = -W / 2 - 0.3, x1 = W / 2 + 0.3, sens = Math.random() < 0.5;
        const e = { type: 'lievre', o, x0: sens ? x0 : x1, x1: sens ? x1 : x0, z0, z1, d: 0, L: Math.hypot(x1 - x0, z1 - z0) };
        o.rotation.y = -Math.atan2(e.z1 - e.z0, e.x1 - e.x0); this.etres.push(e);
      }
    }
  },
  // Corbeaux : arrivent en planant, picorent, s'envolent si le pointeur s'approche ou au bout d'un moment
  corbeaux(e, t, s, ctx) {
    const p = ctx.pointeur;
    if (e.etat === 'sol' && (t > e.fin || (p && e.g.some(c => Math.hypot(c.x - p.x, c.z - p.z) < 1.4)))) { e.etat = 'fuite'; e.t1 = t; }
    const a = (t - e.t0) / 2500;
    if (e.etat === 'arrive' && a >= 1) e.etat = 'sol';
    let fini = true;
    e.g.forEach((c, k) => {
      let x = c.x, z = c.z, y = 0, vole = true;
      if (e.etat === 'arrive') { const u = 1 - a; x -= e.dx * u * 6; z -= e.dz * u * 6; y = u * u * 2.5; }
      else if (e.etat === 'fuite') { const u = (t - e.t1) / 1000 * (0.9 + k * 0.08); x += e.dx * u * 2.5; z += e.dz * u * 2.5; y = u * u * 0.9 + u * 0.4; }
      else { vole = false; if (Math.sin(t / 700 + c.ph) > 0.7) { c.x += Math.cos(c.ph) * 0.03 * s; c.z += Math.sin(c.ph) * 0.03 * s; } }
      if (e.etat !== 'fuite' || y < 6) fini = false;
      c.o.position.set(x, y, z); c.vol.visible = vole; c.sol.visible = !vole; c.o.children[2].visible = y < 1;
      c.o.rotation.y = vole ? -Math.atan2(e.dz, e.dx) : -c.ph; c.sol.rotation.z = !vole && Math.sin(t / 220 + c.ph * 3) > 0.4 ? -0.45 : 0;
      if (vole) this.battre(c.vol, t, k);
    });
    if (fini) { e.g.forEach(c => this.groupe.remove(c.o)); return false; }
    return true;
  },

  // Bête sous le pointeur, pour la bulle (vaches, poules, corbeaux, lièvre)
  animalSous(ray) {
    const w = new T3.Vector3(), proche = (o, r, h) => { o.getWorldPosition(w); w.y += h; return ray.distanceToPoint(w) < r; };
    if (this.vaches.some(v => v.o.parent && proche(v.o, 0.2, 0.2))) return ['Vache pie noire', 'laitière, à l’herbe'];
    const F = this.D?.ferme;
    if (F && this.poules.some(p => proche(p.o, 0.06 * F.s, 0.04 * F.s))) return ['Poule', 'dans la cour de la ferme'];
    for (const e of this.etres) {
      if (e.type === 'corbeaux' && e.etat === 'sol' && e.g.some(c => proche(c.o, 0.07, 0.04))) return ['Corbeau freux', 'cherche les graines'];
      if (e.type === 'lievre' && proche(e.o, 0.08, 0.05)) return ['Lièvre d’Europe', 'traverse les champs'];
    }
    return null;
  },
};
