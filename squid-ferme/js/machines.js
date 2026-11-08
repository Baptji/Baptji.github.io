'use strict';
/* Les machines de la ferme : chaque travail des champs (semis, récolte, labour) fait sortir sa machine de la grange.
   Elle sort de la porte charretière en marche avant, prend le chemin de la grange puis les routes (voie de droite,
   cédez-le-passage en s'engageant), entre au champ par son accès (Rendu.entree), travaille rang par rang en tournant sur la
   bordure, ressort par une route ou un chemin (sortieChamp), puis rentre se ranger dans la grange. Pour le grain, trois tracteurs et bennes se relaient : ils attendent en file au bord du champ, le premier roule
   à côté de la moissonneuse et reçoit le grain en marche ; benne pleine, il rentre par la grange, vide sur l'aire à cul dans
   la porte de cour (seule la livraison compte), fait le tour de la cour et ressort par le porche (sens unique).
   Moisson finie, chacun se gare dans la cour, dans l'ordre d'arrivée. Un seul véhicule à la fois à la porte et au vidage,
   sauf si le veilleur (Flotte.veiller) juge un engin bloqué : il passe alors outre, les verrous sont libérés de force. */

const Machines = {
  R: null, flotte: [], zone: null, zoneT: 0, portes: 0, n: 0,
  CONDUITE: { vmax: 1.6, acc: 1.2, frein: 2.6, alat: 1.0, tempo: 0.5 },
  TREMIE: 10000, BENNE: 6500,

  init(R) {
    this.R = R; this.zone = null; this.n = 0; Convoi.en = null;
    for (const u of this.flotte) { R.scene.remove(u.g, u.r); Flotte.desinscrire(u.id); }
    this.flotte = [];
    for (const id of [...Flotte.mobiles.keys()]) if (id.startsWith('machine')) Flotte.desinscrire(id);
    if (!R.D.ferme || R.planches || R.reduit) return;
    const TEINTES = [['#d4672a', 'Tracteur orange et benne'], ['#3f7d3a', 'Tracteur vert et benne'], ['#3b6a9a', 'Tracteur bleu et benne']];
    TEINTES.forEach(([c, nom], k) => this.flotte.push(this.tracteur(c, nom, k)));
  },
  // ---------- repère de la ferme ----------
  L(q) { const v = this.R.D.ferme.groupe.localToWorld(new T3.Vector3(q[0], 0, q[1])); return q.length > 2 ? [v.x, v.z, q[2]] : [v.x, v.z]; },
  capL(a) { return a - this.R.D.ferme.groupe.rotation.y; },
  V() { return this.R.D.ferme.voies; },
  // ---------- itinéraires ----------
  // Par les routes et les chemins, voie de droite ; « de » et « vers » sont des points du monde
  routes(de, vers) {
    const p = this.R.parLesRoutes(de, vers);
    const R = this.R, pl = R.pl, D = R.D, surRoute = q => pl.types[Math.floor(q[1] + pl.h / 2)]?.[Math.floor(q[0] + pl.w / 2)] === 'r';
    const v = Flotte.aDroite(p, q => surRoute(q) ? D.larg.r * 0.25 : D.larg.p * 0.3);
    // au départ, la voie de droite peut tomber juste derrière soi : on la rejoint en roulant, sans crochet
    while (v.length > 2 && Math.hypot(v[1][0] - v[0][0], v[1][1] - v[0][1]) < 0.3) v.splice(1, 1);
    return v;
  },
  // Sortie de la grange : en marche avant dans l'axe de la porte, puis le chemin de la grange jusqu'à la route
  sortieGrange() {
    const V = this.V(), ag = this.R.D.alleeGrange || [];
    return { porte: [this.L(V.abri), this.L(V.seuil), this.L(V.dehors)], suite: ag.slice(2).map(p => [p[0], p[1]]) };
  },
  // Quitter un champ pour une route ou un chemin : tout droit si le bout du rang y donne ; sinon demi-tour sur la bordure ou
  // sur ce qui est déjà travaillé, puis retour par l'entrée. Rend { pts, fin } ou null si l'engin n'est pas dans ce champ.
  sortieChamp(P, x, z, cap) {
    const E = P?.entree; if (!E) return null;
    const pl = this.R.pl, W = pl.w, H = pl.h, rp = (i, j) => 'rp'.includes(pl.types[j]?.[i] || '#'), wx = i => i + 0.5 - W / 2, wz = j => j + 0.5 - H / 2;
    const gy = z + H / 2, gx = x + W / 2, y0 = E.ys[0], y1 = E.ys.at(-1);
    if (gy < y0 - 0.8 || gy > y1 + 1.8) return null;
    const y = Math.max(y0, Math.min(y1, Math.floor(gy))), r = E.rangs.get(y); if (!r || gx < r.a - 1.3 || gx > r.b + 1.3) return null;
    const d = Math.cos(cap) >= 0 ? 1 : -1, nx = d > 0 ? r.b : r.a - 1;
    if (rp(nx, y)) return { pts: [], fin: [wx(nx), wz(y)] };
    const pts = [], zE = wz(E.y); let zc = z;
    if ((E.col - x) * d < 0.4) {
      let s = y === E.y && !rp(Math.max(r.a, Math.min(r.b - 1, Math.floor(gx))), y - E.sens) ? E.sens : -E.sens;
      if (z + s < 0.45 - H / 2 || z + s > H / 2 - 0.45) s = -s;                 // la boucle reste sur la bordure, jamais dans le vide
      const ax = d * Math.min(0.34, Math.max(0, W / 2 - 0.45 - d * x));
      zc = z + s; pts.push([x + ax, z], [x + ax, zc], [x, zc]);
    }
    if (Math.abs(zc - zE) > 0.05) pts.push([E.col, zc]);
    pts.push([E.col, zE], ...(E.retour || []));   // parcelle sans route : on ressort par les trous de la haie
    return { pts, fin: E.fin };
  },
  // Début du trajet de retour : par la sortie du champ, ou simplement droit devant (av cases) hors du champ
  quitter(P, x, z, cap, av) {
    const s = this.sortieChamp(P, x, z, cap); if (s) return { pts: [...s.pts, s.fin], de: s.fin };
    const h = [x + Math.cos(cap) * av, z + Math.sin(cap) * av]; return { pts: [h], de: h };
  },
  bout() { const ag = this.R.D.alleeGrange; return ag ? ag.at(-1) : this.L(this.V().dehors); },
  // Entrée par la porte charretière : du bout du chemin de la grange, droit dans l'axe de la porte
  entreeGrange() { const V = this.V(); return [this.L(V.dehors), this.L(V.seuil)]; },
  // Où attendre son tour : sur la route, juste avant le chemin de la grange (la porte, le chemin et l'aire ne
  // prennent qu'un véhicule à la fois)
  avantBout(route) { const b = route.at(-1), a = route.at(-2) || b, l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, k = Math.min(0.35, l * 0.5) / l; return [b[0] - (b[0] - a[0]) * k, b[1] - (b[1] - a[1]) * k]; },
  // Prendre la porte (un seul à la fois) ; libre : personne d'autre ne la tient
  prendre(id) { if (!this.zone || this.zone === id) { if (this.zone !== id) this.zoneT = performance.now(); this.zone = id; return true; } return false; },
  // Le veilleur d'un engin qui roule : bloqué, il passe outre et la porte est libérée de force
  veiller(o, id, x, z) { const avant = o.veille?.force, f = Flotte.veiller(o.veille ??= {}, x, z); if (f && !avant && this.zone && this.zone !== id) this.zone = null; return f; },
  rendre(id) { if (this.zone === id) this.zone = null; },
  routeLibre(pt, id) { return !Flotte.presDe(pt, 1.3, 'trafic', id); },

  // ---------- Machine d'un travail (moissonneuse, semoir, arracheuse, charrue) ----------
  // P : passage (trajet au champ P.pts, P.L, P.v) ; la tâche avance P.d. Rend l'estimation du temps d'arrivée (ms).
  preparerSortie(P) {
    const R = this.R, id = 'machine-' + (++this.n), V = this.V(), so = this.sortieGrange(), champ0 = P.pts[0], champ1 = P.pts[1] || P.pts[0];
    const dx = champ1[0] - champ0[0], dz = champ1[1] - champ0[1], l = Math.hypot(dx, dz) || 1, E = P.entree, avant = E ? E.fin : [champ0[0] - dx / l * 0.7, champ0[1] - dz / l * 0.7];
    const route = this.routes(this.bout(), avant);
    const allerTr = [{ pts: [...so.porte, ...so.suite, ...route.slice(1, -1), avant, ...(E ? E.approche : []), champ0], r: 0.4, attendre: () => !this.prendre(id),
      cedez: [{ pt: this.bout(), tant: () => !this.routeLibre(this.bout(), id) }] }];
    Object.assign(P, { id, phase: 'attente', aller: Flotte.trace(allerTr), c: null, quitte: false });
    // la porte est rendue dès la machine dehors : les suivants s'engagent sans attendre qu'elle ait gagné la route
    P.sRendre = Flotte.trace([{ pts: so.porte }]).L + 0.4;
    P.c = Flotte.conduite(P.aller, this.CONDUITE);
    // l'encombrement de la machine, pour que les autres gardent leurs distances
    const larg = P.type === 'moissonneuse' ? 0.52 : P.type === 'semoir' ? 0.46 : 0.3;
    Flotte.inscrire(id, 'machine', () => P.o.visible ? [{ x: P.o.position.x, y: P.o.position.z, cap: -P.o.rotation.y, l: 0.42, w: larg }] : []);
    return (P.aller.L / this.CONDUITE.vmax + 2.5) * 1000;
  },
  // Retour du bout du champ jusqu'à la grange, en marche avant jusqu'à sa place
  retourMachine(P, pose) {
    const V = this.V(), id = P.id, ent = this.entreeGrange(), q = this.quitter(P, pose.x, pose.y, pose.cap, 0.5);
    const route = this.routes(q.de, this.bout()), al = (this.R.D.alleeGrange || []).slice().reverse();
    P.retourTr = Flotte.trace([{ pts: [[pose.x, pose.y], ...q.pts, ...route.slice(1, -1), ...al.slice(0, -1), ...ent, this.L(V.abri)], r: 0.4,
      cedez: [{ pt: this.avantBout([q.de, ...route.slice(1)]), tant: () => !this.prendre(id) }] }]);
    P.c = Flotte.conduite(P.retourTr, this.CONDUITE); P.phase = 'retour';
  },
  // Une machine au travail : sortie, tâche (P.d avancé par l'appelant), retour. Rend vrai quand elle est rangée.
  avancerMachine(P, t, s, tache) {
    const R = this.R, now = performance.now();
    if (P.phase === 'attente') { if (now < P.t0 || (P.apres && R.passages.includes(P.apres) && P.apres.phase !== 'retour') || !this.prendre(P.id)) { P.o.visible = false; return false; } P.phase = 'aller'; }   // on attend son tour rangé dans la grange
    if (P.phase === 'aller' || P.phase === 'retour') {
      // on regarde dans le sens de la marche : en marche arrière, c'est derrière soi
      const av = P.c.tr.pose(P.c.s), force = this.veiller(P, P.id, av.x, av.y);
      const gene = force ? Infinity : Flotte.devant(P.id, { x: av.x, y: av.y, cap: av.cap + (av.recul ? Math.PI : 0) }, 0.45, 0.25, 2.5, (m, dc) => Math.cos(dc) > 0.3);
      Flotte.conduire(P.c, s, gene, force);
      const p = P.c.tr.pose(P.c.s);
      P.o.visible = true; P.o.scale.setScalar(1); P.o.position.set(p.x, 0.004, p.y); P.o.rotation.y = -p.cap;
      // la porte est rendue quand la machine est bien sortie, ou rangée
      if (P.phase === 'aller' && P.c.s > P.sRendre) this.rendre(P.id);
      if (P.c.fini) {
        if (P.phase === 'aller') { this.rendre(P.id); P.phase = 'tache'; P.d = 0; }
        else {
          this.rendre(P.id); Flotte.desinscrire(P.id); P.o.visible = false;
          if (P.transport && P.tremie >= 1) { P.livrer(P.tremie); P.tremie = 0; }   // rentrée seule : elle vide sa trémie à la ferme
          return true;
        }
      }
      return false;
    }
    if (P.phase === 'tache') {
      const fin = tache();
      if (fin) { const a = Decor.surLigne(P.pts, P.L), b = Decor.surLigne(P.pts, Math.max(0, P.L - 0.1)); this.retourMachine(P, { x: a.x, y: a.z, cap: Math.atan2(a.z - b.z, a.x - b.x) }); }
    }
    return false;
  },

  // ---------- Tracteurs et bennes ----------
  tracteur(coul, nom, k) {
    const R = this.R, K = K3, G = K.G, g = new T3.Group(), r = new T3.Group(), benne = new T3.Group();
    const roue = (x, z, rr, l) => [K.piece(G.cyl(rr, rr, l, 14), '#242424', [x, rr, z], [Math.PI / 2, 0, 0]), K.piece(G.cyl(rr * 0.5, rr * 0.5, l + 0.006, 10), '#e8b62a', [x, rr, z], [Math.PI / 2, 0, 0])];
    K.mesh(g, K.fusion([
      K.piece(G.boite(0.22, 0.1, 0.12), coul, [0.07, 0.17, 0]), K.piece(G.boite(0.16, 0.06, 0.1), '#4a4a4a', [0.07, 0.1, 0]), K.piece(G.boite(0.02, 0.08, 0.1), '#333333', [0.185, 0.16, 0]),
      K.piece(G.boite(0.14, 0.02, 0.05), coul, [-0.07, 0.2, 0.1]), K.piece(G.boite(0.14, 0.02, 0.05), coul, [-0.07, 0.2, -0.1]),
      K.piece(G.boite(0.06, 0.02, 0.07), '#2a2a2a', [-0.08, 0.21, 0]), K.piece(G.boite(0.012, 0.06, 0.07), '#2a2a2a', [-0.11, 0.25, 0]),
      K.piece(G.cyl(0.007, 0.007, 0.1, 6), '#222222', [0.12, 0.27, 0.035]), K.piece(G.cyl(0.02, 0.02, 0.006, 10), '#222222', [-0.02, 0.26, 0], [0, 0, 0.5]),
      K.piece(G.cyl(0.022, 0.026, 0.08, 8), '#3d5f8f', [-0.075, 0.26, 0]), K.piece(G.boule(6, 4), '#e2b48c', [-0.07, 0.32, 0], 0, 0.02), K.piece(G.boule(6, 4), '#4a5868', [-0.07, 0.335, 0], 0, [0.024, 0.01, 0.024]),
      ...roue(-0.07, 0.11, 0.1, 0.05), ...roue(-0.07, -0.11, 0.1, 0.05), ...roue(0.13, 0.075, 0.05, 0.03), ...roue(0.13, -0.075, 0.05, 0.03),
    ]), K.matV());
    benne.position.set(-0.2, 0, 0); r.add(benne);
    K.mesh(r, K.fusion([K.piece(G.boite(0.13, 0.015, 0.015), '#2a2a2a', [0.26, 0.08, 0]), ...roue(0, 0.135, 0.06, 0.04), ...roue(0, -0.135, 0.06, 0.04)]), K.matV());
    K.mesh(benne, K.fusion([K.piece(G.boite(0.42, 0.03, 0.25), '#8a5a34', [0.2, 0.12, 0]), K.piece(G.boite(0.42, 0.07, 0.015), '#9a6a40', [0.2, 0.17, 0.118]), K.piece(G.boite(0.42, 0.07, 0.015), '#9a6a40', [0.2, 0.17, -0.118]),
      K.piece(G.boite(0.015, 0.07, 0.25), '#9a6a40', [0.41, 0.17, 0]), K.piece(G.boite(0.015, 0.07, 0.25), '#9a6a40', [-0.005, 0.17, 0])]), K.matV());
    const tas = K.mesh(benne, G.boule(8, 6), K.mat('#e2b04a'), [0.2, 0.14, 0], 0, [0.18, 0.001, 0.1]);
    g.add(Vie.ombre(0.1, 0.16)); r.add(Vie.ombre(0.15, 0.26)); R.sansOmbre(g); R.sansOmbre(r);
    const n = { cle: 'machine:tracteur-' + (k + 1), libelle: nom }; g.userData.nom = r.userData.nom = n;
    R.scene.add(g, r);
    const id = 'machine-tracteur-' + k, place = this.V().places[k], p = this.L(place), cap = this.capL(-Math.PI / 2);
    const u = { id, g, r, benne, tas, etat: 'cour', x: p[0], z: p[1], cap, rx: 0, rz: 0, rcap: cap, charge: 0, c: null, pause: 0, place: k, arrivee: 0, source: null, rang: 0 };
    u.rx = u.x - Math.cos(cap) * 0.48; u.rz = u.z - Math.sin(cap) * 0.48;
    Flotte.inscrire(id, 'machine', () => u.cache ? [] : [{ x: u.x + 0.03 * Math.cos(u.cap), y: u.z + 0.03 * Math.sin(u.cap), cap: u.cap, l: 0.2, w: 0.14 }, ...(u.sansBenne ? [] : [{ x: u.rx + 0.05 * Math.cos(u.rcap), y: u.rz + 0.05 * Math.sin(u.rcap), cap: u.rcap, l: 0.27, w: 0.16 }])]);
    this.poser(u, 0);
    return u;
  },
  // remorque attelée : elle suit le point d'attelage, sans pivoter sur place ; garée, elle se remet dans l'axe
  poser(u, s) {
    u.g.position.set(u.x, 0.004, u.z); u.g.rotation.y = -u.cap;
    if (u.sansBenne) return;                                                    // la remorque attend dans la cour
    const ax = u.x - Math.cos(u.cap) * 0.18, az = u.z - Math.sin(u.cap) * 0.18;
    let dx = ax - u.rx, dz = az - u.rz; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    u.rx = ax - dx * 0.3; u.rz = az - dz * 0.3; u.rcap = Math.atan2(dz, dx);
    if (u.etat === 'cour') { let d = u.cap - u.rcap; d = Math.atan2(Math.sin(d), Math.cos(d)); u.rcap += d * Math.min(1, s * 3); u.rx = ax - Math.cos(u.rcap) * 0.3; u.rz = az - Math.sin(u.rcap) * 0.3; }
    u.r.position.set(u.rx, 0.004, u.rz); u.r.rotation.y = -u.rcap;
  },
  rouler(u, s) {
    // les tracteurs garés ne gênent pas : les trajets de la cour les contournent
    const gares = new Set(this.flotte.filter(x => x.etat === 'cour').map(x => x.id));
    const force = this.veiller(u, u.id, u.x, u.z);
    const gene = force ? Infinity : Flotte.devant(u.id, { x: u.x, y: u.z, cap: u.cap }, 0.2, 0.14, 2.5, (m, dc) => !gares.has(m.id) && (Math.cos(dc) > 0.5 || (m.genre === 'machine' && Math.cos(dc) > -0.5)));
    Flotte.conduire(u.c, s, gene, force); const p = u.c.tr.pose(u.c.s); u.x = p.x; u.z = p.y; u.cap = p.cap; return u.c.fini;
  },
  partir(u, troncons, etat) { u.c = Flotte.conduite(Flotte.trace(troncons), { vmax: 3.2, acc: 1.8, frein: 3.4, alat: 1.2, tempo: 0.4 }); u.etat = etat; },
  // Sortie de la cour par le porche, puis l'allée du porche et les routes ; « vers » : point du monde
  parLePorche(depuis, vers, id) {
    const V = this.V(), al = this.R.D.allee || [], bout = al.at(-1) || this.L(V.sortie);
    const route = this.routes(bout, vers);
    return { pts: [...depuis, ...V.tour.map(q => this.L(q)), this.L(V.porche), this.L(V.sortie), ...al.slice(1).map(p => [p[0], p[1]]), ...route.slice(1)], r: 0.35,
      cedez: [{ pt: bout, tant: () => !this.routeLibre(bout, id) }] };
  },
  // Des champs (ou de la file) jusqu'à l'aire de vidage, par la porte charretière (une benne à la fois)
  versVidage(u) {
    const V = this.V(), ent = this.entreeGrange(), h = [u.x + Math.cos(u.cap) * 0.8, u.z + Math.sin(u.cap) * 0.8];   // dégager la moissonneuse avant de tourner
    const q = this.quitter(u.source, h[0], h[1], u.cap, 0), route = this.routes(q.de, this.bout()), al = (this.R.D.alleeGrange || []).slice().reverse();
    return [{ pts: [[u.x, u.z], h, ...q.pts, ...route.slice(1, -1), ...al.slice(0, -1), ...ent, this.L(V.cour), this.L(V.vide)], r: 0.35,
      cedez: [{ pt: this.avantBout([q.de, ...route.slice(1)]), tant: () => !this.prendre(u.id) }] }];
  },
  // De l'aire (ou de l'entrée) jusqu'à sa place dans la cour, en faisant le tour de la fumière
  versPlace(u, depuis, k) {
    const V = this.V(), [px, pz] = V.places[k];
    return [{ pts: [...depuis, ...V.tour.slice(0, 3).map(q => this.L(q)), this.L([-0.45, V.rangee, 0.3]), this.L([px, V.rangee, 0.3]), this.L([px, pz])], r: 0.3 }];
  },
  // Points de la file d'attente, au bord du champ, sur la route qui y mène
  file(P) {
    if (P.fileP) return P.fileP;
    const so = this.bout(), avant = P.aller ? P.aller.pose(P.aller.L - 0.9) : null, cible = avant ? [avant.x, avant.y] : P.pts[0];
    const route = this.routes(so, cible), tr = Flotte.trace([{ pts: route, r: 0.4 }]);
    P.fileP = [0, 1, 2].map(k => { const q = tr.pose(Math.max(0, tr.L - 0.2 - k * 0.75)); return [q.x, q.y]; });
    return P.fileP;
  },
  // Les récoltes en cours que la flotte peut servir
  actifs() { return this.R.passages.filter(p => p.transport && ['aller', 'tache'].includes(p.phase) && !p.finRecolte && !p.autonome); },
  affectes(P) { return this.flotte.filter(x => x.source === P && x.etat !== 'cour').length; },
  // La récolte la moins bien servie (la plus ancienne à égalité) : plusieurs champs à la fois ont chacun leur tracteur
  servi() { let m = null, n = Infinity; for (const p of this.actifs()) { const k = this.affectes(p); if (k < n) { n = k; m = p; } } return m; },

  image(t, dt) {
    const R = this.R, s = Math.min(0.05, dt / 1000);
    if (!this.flotte.length) return;
    const V = this.V();
    if (this.zone && performance.now() - this.zoneT > 15000) this.zone = null;      // une porte n'est jamais tenue indéfiniment
    for (const u of this.flotte) {
      if (u.etat === 'cour') {
        const P = this.servi();
        if (P) {
          const dep = this.affectes(P);                                             // un à la fois : ils sortent l'un derrière l'autre
          if (!this.flotte.some(x => x.etat === 'sortie' && x.c.s < 1.4)) {
            const f = this.file(P), px = V.places[u.place][0];
            if (u.depart?.P !== P || u.depart.k !== dep) u.depart = { P, k: dep, tr: [this.parLePorche([[u.x, u.z], this.L([px, -0.38, 0.22]), this.L([px - 0.28, V.vide[1], 0.22])], f[Math.min(2, dep)], u.id)] };
            u.depart.T ??= Flotte.trace(u.depart.tr).L / 3.2 * 1.25 + 1.5;
            // la moissonneuse arrive au champ la première : sinon la file d'attente lui barrerait l'entrée
            const M = P.phase === 'tache' ? 0 : P.phase === 'aller' ? (P.aller.L - P.c.s) / this.CONDUITE.vmax * 1.3 : Infinity;
            if (u.depart.T > M + 1.5) { this.partir(u, u.depart.tr, 'sortie'); u.source = P; u.depart = null; }
          }
        }
      } else if (u.etat === 'sortie' || u.etat === 'retour') {
        if (this.rouler(u, s)) { u.etat = 'file'; u.arrivee = t; }
      } else if (u.etat === 'file') {
        // sa récolte est finie : il va servir la suivante, ou il rentre
        if (!this.actifs().includes(u.source)) {
          const N = this.servi();
          if (N) { const q = this.file(N)[Math.min(2, this.affectes(N))]; u.source = N; this.partir(u, [{ pts: this.routes([u.x, u.z], q), r: 0.35 }], 'retour'); }
          else this.partir(u, this.rentrer(u), 'rentrer');
          continue;
        }
        // file d'attente de chaque champ : ordre d'arrivée
        const P = u.source, avant = this.flotte.filter(x => x.etat === 'file' && x.source === P).sort((a, b) => a.arrivee - b.arrivee)[0];
        if (avant === u && P.phase === 'tache' && !this.flotte.some(x => x.etat === 'accompagne' && x.source === P)) u.etat = 'accompagne';
      } else if (u.etat === 'accompagne') this.accompagner(u, s);
      else if (u.etat === 'livre') {
        if (this.rouler(u, s)) { u.etat = 'vide'; u.pause = 0; u.livre = false; }
      } else if (u.etat === 'vide') {
        u.pause += s;
        if (!u.livre && u.pause > 0.5) { u.source?.livrer(u.charge); u.livre = true; u.livraison = u.charge; }
        if (u.pause > 0.5) u.charge = Math.max(0, u.charge - (u.livraison || 0) * s / 1.6);
        if (u.pause > 2.6) {
          u.charge = 0; this.rendre(u.id);
          const encore = this.servi();
          if (encore) { const f = this.file(encore); this.partir(u, [this.parLePorche([[u.x, u.z]], f[2], u.id)], 'retour'); u.source = encore; }
          else { u.place = this.placeLibre(); this.partir(u, this.versPlace(u, [[u.x, u.z]], u.place), 'garer'); }
        }
      } else if (u.etat === 'rentrer') {
        if (this.rouler(u, s)) { this.rendre(u.id); if (!u.sansBenne) u.place = this.placeLibre(u); this.partir(u, this.versPlace(u, [[u.x, u.z]], u.place), 'garer'); }
      } else if (u.etat === 'garer') {
        if (this.rouler(u, s)) { u.etat = 'cour'; u.source = null; u.sansBenne = false; }
      }
      // vidage : la benne bascule et le grain coule par l'arrière
      u.benne.rotation.z = u.etat === 'vide' ? Math.min(0.55, Math.max(0, u.pause - 0.3) * 0.8) * (u.pause < 2.3 ? 1 : Math.max(0, (2.6 - u.pause) / 0.3)) : 0;
      u.tas.scale.set(0.18, Math.max(0.001, 0.075 * Math.min(1, u.charge / this.BENNE)), 0.1); u.tas.visible = u.charge > 20;
      if (u.etat === 'vide' && u.pause > 0.6 && u.charge > 20 && !R.reduit) {
        const q = u.benne.localToWorld(new T3.Vector3(-0.01, 0.13, 0));
        for (let i = 0; i < 2; i++) R.parts.push({ x: q.x, y: q.y, z: q.z, vx: (Math.random() - 0.5) * 0.15, vy: 0.05, vz: (Math.random() - 0.5) * 0.15, g: 2.4, vie: 0.5, age: 0, c: K3.col(i ? '#e8b84a' : '#d8a83a') });
      }
      this.poser(u, s);
    }
    Convoi.image(s);
  },
  placeLibre(sauf) {
    const prises = new Set(this.flotte.filter(x => x !== sauf && ['garer', 'cour'].includes(x.etat)).map(x => x.place));
    for (let k = 0; k < 3; k++) if (!prises.has(k)) return k;
    return 0;
  },
  // Rentrer à vide : par la porte charretière, la grange et la cour (sans vider), puis sa place
  rentrer(u, av = 0) {
    const V = this.V(), ent = this.entreeGrange(), q = this.quitter(u.source, u.x, u.z, u.cap, av), route = this.routes(q.de, this.bout()), al = (this.R.D.alleeGrange || []).slice().reverse();
    return [{ pts: [[u.x, u.z], ...q.pts, ...route.slice(1, -1), ...al.slice(0, -1), ...ent, this.L(V.cour), this.L(V.vide)], r: 0.35, cedez: [{ pt: this.avantBout([q.de, ...route.slice(1)]), tant: () => !this.prendre(u.id) }] }];
  },
  // À côté de la moissonneuse, dans le rang déjà fauché, sous la vis de vidange
  accompagner(u, s) {
    const P = u.source, R = this.R;
    if (!P || !R.passages.includes(P) || P.phase !== 'tache' || P.autonome) { this.partir(u, this.versVidage(u), u.charge > 1 ? 'livre' : 'livre'); return; }
    const a = Decor.surLigne(P.pts, Math.min(P.d, P.L)), b = Decor.surLigne(P.pts, Math.min(P.L, P.d + 0.12)), cap = Math.atan2(b.z - a.z, b.x - a.x), droit = Math.abs(Math.sin(cap)) < 0.2;
    const cible = [a.x + 0.4 * Math.cos(cap), a.z - P.sens * 0.72 + 0.4 * Math.sin(cap)], d = Math.hypot(cible[0] - u.x, cible[1] - u.z);
    const versCap = (c, k) => { let e = c - u.cap; e = Math.atan2(Math.sin(e), Math.cos(e)); u.cap += e * k; };
    if (d < 0.6) { const k = Math.min(1, s * 10); u.x += (cible[0] - u.x) * k; u.z += (cible[1] - u.z) * k; versCap(cap, Math.min(1, s * 8)); }
    else { const v = Math.min(2.0, d * 3) * s / d; u.x += (cible[0] - u.x) * v; u.z += (cible[1] - u.z) * v; versCap(Math.atan2(cible[1] - u.z, cible[0] - u.x), Math.min(1, s * 5)); }
    let transfert = false;
    if (d < 0.2 && droit && P.tremie > 0) { const q = Math.min(P.tremie, 3000 * s, this.BENNE - u.charge); P.tremie -= q; u.charge += q; transfert = q > 0; }
    P.transfert = transfert; P.benne = u;
    const fini = P.reste <= 0 && P.tremie < 1;
    // benne pleine : on ne part que si la moissonneuse a une ligne droite devant elle (pas en plein demi-tour, où elle
    // couperait la route du tracteur) ou si elle est arrêtée, trémie pleine
    const q = Decor.surLigne(P.pts, Math.min(P.L, P.d + 1.6)), libre = droit && P.d + 1.6 < P.L && Math.hypot(q.x - a.x, q.z - a.z) > 1.55;
    if ((u.charge >= this.BENNE - 1 && (libre || P.tremie >= this.TREMIE || P.d >= P.L - 0.26)) || (fini && u.charge > 1)) { this.partir(u, this.versVidage(u), 'livre'); if (fini) P.finRecolte = true; }
    else if (fini) { P.finRecolte = true; this.partir(u, this.rentrer(u), 'rentrer'); }
    // vis de vidange : dépliée du côté de la benne pendant le transfert
    const vis = P.o.userData.vis;
    if (vis) {
      const loc = new T3.Vector3(u.x - a.x, 0, u.z - a.z).applyAxisAngle(new T3.Vector3(0, 1, 0), cap), cibleV = transfert ? (loc.z > 0 ? -Math.PI / 2 : Math.PI / 2) : Math.PI;
      let dv = cibleV - vis.rotation.y; dv = Math.atan2(Math.sin(dv), Math.cos(dv)); vis.rotation.y += dv * Math.min(1, s * 3);
      if (transfert && Math.abs(dv) < 0.3 && !R.reduit) {
        const bec = vis.localToWorld(new T3.Vector3(0.69, -0.06, 0)), tasW = u.benne.localToWorld(new T3.Vector3(0.2, 0.2, 0)), T = 0.4, gv = 3;
        for (let i = 0; i < 2; i++) R.parts.push({ x: bec.x, y: bec.y, z: bec.z, vx: (tasW.x - bec.x) / T, vy: (tasW.y - bec.y + 0.5 * gv * T * T) / T, vz: (tasW.z - bec.z) / T, g: gv, vie: T, age: Math.random() * 0.05, c: K3.col(i ? '#e8b84a' : '#f2cc5a') });
      }
    }
  },
  // Portes de la grange : ouvertes tant qu'un véhicule est tout près de la porte charretière ou de la porte de cour
  majPortes(dt) {
    const F = this.R.D.ferme; if (!F || !F.portes) return;
    const V = this.V(), pts = [this.L(V.seuil), this.L(V.cour), this.L(V.abri)];
    // seulement ce qui roule : machines en sortie ou en retour, tracteurs qui ne sont pas garés
    const roulants = [...this.R.passages.filter(p => p.sortie && (p.phase === 'aller' || p.phase === 'retour')).map(p => [p.o.position.x, p.o.position.z]),
      ...this.flotte.filter(u => u.etat !== 'cour').flatMap(u => [[u.x, u.z], [u.rx, u.rz]])];
    const proche = roulants.some(([x, z]) => Math.hypot(x - pts[0][0], z - pts[0][1]) < 1.3 || Math.hypot(x - pts[1][0], z - pts[1][1]) < 0.7 || Math.hypot(x - pts[2][0], z - pts[2][1]) < 0.8);
    const u = F.portes.u, cible = proche ? 1 : 0;
    F.portes.u = Math.max(0, Math.min(1, u + Math.sign(cible - u) * dt / 1000 * 1.6)); F.portes.poser();
  },
};

/* Sortir de la faillite : les tracteurs de la ferme, sans leur remorque, quittent la cour déguisés en buissons (le modèle et les
   teintes des haies du décor) et se postent au bord d'une route ouverte, près de la ferme. Dès qu'un camion du trafic ordinaire
   arrive, ils jaillissent, le bloquent devant, sur le flanc et derrière ; on le revend, puis tout le monde rentre. Si aucun camion
   ne passe, le trafic en envoie un. Tout est à l'horloge réelle et borné : rien ne peut retenir le joueur. */
const Convoi = {
  en: null,
  PRIX: 10000, ATTENTE: 2500, PAYER_AU_PLUS_TARD: 40000, ABANDON: 75000,
  // Trois cachettes autour du point d'arrêt du camion, de part et d'autre de la route : ds le long de la route, cote : droite (+1) ou gauche du camion, lat : où le tracteur s'arrête
  ROLES: [{ role: 'devant', ds: 0.68, cote: 1, lat: 0.123, part: 400 }, { role: 'flanc', ds: -0.05, cote: -1, lat: -0.22, part: 1700 }, { role: 'derriere', ds: -0.68, cote: 1, lat: 0.123, part: 900 }],
  // La route : un tronçon droit qui reçoit du trafic, au plus près de la ferme, à l'écart de l'allée, des carrefours et du parking
  site() {
    const M = Machines, D = M.R.D, ref = D.allee?.at(-1) || M.bout(), gardes = [ref, M.bout(), ...(D.parking?.places || []).map(p => [p.x, p.z])];
    const ecart = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
    let m = null;
    for (const r of D.routes) for (const sens of [true, false]) {
      if (!r.auBord[sens ? 0 : 1] || !Vie.itineraire(r, sens)) continue;
      const pts = sens ? r.pts : [...r.pts].reverse(), L = Decor.longueur(pts);
      for (let s = 3.5; s <= L - 2.2; s += 0.5) {
        const a = Decor.surLigne(pts, s, 0);
        if (![-1.9, -0.9, 0.9, 1.5].every(d => ecart(Decor.surLigne(pts, s + d, 0).cap, a.cap) < 0.06) || gardes.some(q => Math.hypot(q[0] - a.x, q[1] - a.z) < 1.7)) continue;
        const note = Math.hypot(ref[0] - a.x, ref[1] - a.z);
        if (!m || note < m.note) m = { r, sens, pts, s, note, Q: [a.x, a.z], cap: a.cap };
      }
    }
    return m;
  },
  // Un buisson de haie comme les autres, assez fourni pour cacher un tracteur
  bosquet() {
    const D = Machines.R.D, g = new T3.Group(), P = [[-0.13, 0.03, 1.32], [0.13, -0.04, 1.24], [0, 0.01, 1.44]], im = K3.inst(g, D.buissons.geometry, D.buissons.material, P.length), c = new T3.Color();
    P.forEach(([x, z, e], i) => { D.buissons.getColorAt(Math.floor(Math.random() * D.nbBuissons), c); K3.poser(im, i, [x, 0, z], [0, 1.1 + i * 2.1, 0], [e * 1.15, e * 1.06, e], c.clone()); });
    Vie.groupe.add(g); return g;
  },
  // Rend faux quand l'embuscade est impossible (mouvement réduit, maraîchage, aucune route ouverte, tracteurs tous pris) : l'appelant paie alors sans animation
  lancer(payer) {
    const M = Machines, R = M.R;
    if (this.en || !R || R.reduit || R.planches || !R.D?.buissons || !R.D.nbBuissons) return false;
    const libres = M.flotte.filter(u => u.etat === 'cour'), site = libres.length && this.site();
    if (!site) return false;
    const t0 = performance.now(), c = this.en = { t0, payer, site, camion: null, go: 0, vendu: 0, fini: 0, unites: [] };
    const plan = this.ROLES.slice(0, libres.length).map(r => {
      const a = Decor.surLigne(site.pts, site.s + r.ds, 0), Nx = -Math.sin(a.cap), Nz = Math.cos(a.cap);
      return { ...r, spot: [a.x + Nx * r.cote * 0.4, a.z + Nz * r.cote * 0.4], route: [a.x, a.z], coin: [a.x - Nx * r.cote * 0.32, a.z - Nz * r.cote * 0.32], cible: [a.x + Nx * r.lat, a.z + Nz * r.lat] };
    });
    // on les envoie du plus loin au plus proche, selon le côté d'où ils arrivent : personne n'attend derrière un tracteur qui recule
    const arrivee = M.routes(M.bout(), site.Q), da = arrivee.at(-1), db = arrivee.at(-2) || da, deVant = (da[0] - db[0]) * Math.cos(site.cap) + (da[1] - db[1]) * Math.sin(site.cap) > 0;
    plan.sort((x, y) => (deVant ? y.ds - x.ds : x.ds - y.ds));
    plan.forEach((r, k) => { const u = libres[k]; u.etat = 'convoi'; u.source = null; u.sansBenne = true; c.unites.push({ ...r, u, b: this.bosquet(), et: 'attend', t: t0 + k * 950 }); });
    for (const v of c.unites) { v.b.position.set(v.u.x, 0, v.u.z); v.b.rotation.y = -v.u.cap; }
    return true;
  },
  partirAuBuisson(v) {
    const M = Machines, u = v.u, V = M.V(), px = V.places[u.place][0];
    const T = M.parLePorche([[u.x, u.z], M.L([px, -0.38, 0.22]), M.L([px - 0.28, V.vide[1], 0.22])], v.route, u.id);
    M.partir(u, [{ ...T, pts: [...T.pts, v.coin] }, { pts: [v.coin, v.spot], recul: true, r: 0.3 }], 'convoi');
  },
  image(s) {
    const c = this.en; if (!c) return;
    const M = Machines, now = performance.now(), age = now - c.t0;
    if (age > this.ABANDON) { this.abandonner(c); return; }
    if (age > this.PAYER_AU_PLUS_TARD && !c.vendu) this.vendre(c, now);
    for (const v of c.unites) this.unite(c, v, now, s);
    if (!c.vendu) this.camion(c, now);
    else if (c.camion && now - c.vendu > 1000) { c.camion.stop = null; c.camion = null; }
    // tout le monde reparti : les buissons disparaissent peu à peu
    if (c.vendu && c.unites.every(v => v.u.etat !== 'convoi')) {
      c.fini ||= now;
      const k = Math.max(0, 1 - (now - c.fini) / 700);
      for (const v of c.unites) v.b.scale.setScalar(k);
      if (k <= 0 && c.unites.every(v => v.u.etat === 'cour')) this.finir(c);
    }
  },
  unite(c, v, now, s) {
    const M = Machines, u = v.u;
    if (v.et === 'attend') { if (now >= v.t) { this.partirAuBuisson(v); v.et = 'va'; } }
    else if (v.et === 'va') {
      if (M.rouler(u, s)) { v.et = 'cache'; u.cache = true; u.g.visible = false; }
      v.b.position.set(u.x, 0, u.z); v.b.rotation.y = -u.cap;
    } else if (v.et === 'cache') {
      const passe = v.role !== 'derriere' || !c.camion || c.camion.s - c.camion.L > c.sQ + v.ds + 0.25 || c.camion.v < 0.05;
      if (c.go && passe) {
        v.et = 'jaillit'; u.cache = false; u.g.visible = true;
        u.c = Flotte.conduite(Flotte.trace([{ pts: [[u.x, u.z], v.cible], r: 0.3 }]), { vmax: 3, acc: 7, frein: 6, alat: 1.2, tempo: 0.2 });
      }
    } else if (v.et === 'jaillit') { if (M.rouler(u, s)) v.et = 'bloque'; }
    else if (v.et === 'bloque' && c.vendu && now - c.vendu > v.part) { M.partir(u, M.rentrer(u, 0.28), 'rentrer'); v.et = 'rentre'; }
  },
  camion(c, now) {
    const site = c.site, caches = c.unites.every(v => ['cache', 'jaillit', 'bloque'].includes(v.et));
    if (!c.camion) {
      // Temps qu'il faut encore aux tracteurs pour être en place
      const reste = Math.max(...c.unites.map(v => v.et === 'attend' ? (v.t - now) / 1000 + 13 : v.et === 'va' ? (v.u.c.tr.L - v.u.c.s) / 0.85 + 0.8 : 0)), pret = temps => caches || reste + 1 < temps;
      // un camion du trafic ordinaire qui arrive sur cette route, dans ce sens, et que les tracteurs auront le temps d'attendre : c'est lui
      for (const e of Vie.etres) {
        if (e.type !== 'trafic' || e.modele !== 'Camion de betteraves' || e.stop != null) continue;
        const sQ = Flotte.abscisse(e.tr, site.Q), p = e.tr.pose(sQ);
        if (Math.hypot(p.x - site.Q[0], p.y - site.Q[1]) < 0.35 && Math.cos(p.cap - site.cap) > 0.8 && sQ - e.s > 1.9 && pret((sQ - 1.75 - e.s) / e.v0)) { c.camion = e; c.sQ = sQ; break; }
      }
      // sinon on en fait venir un, assez tôt pour qu'il arrive quand tout le monde est caché
      if (!c.camion && now - c.t0 > this.ATTENTE && (c.vu ??= this.itineraire(c)) && pret(c.vu.temps)) {
        const m = Vie.modeles().find(x => x.nom === 'Camion de betteraves');
        if (!Flotte.presDe(c.vu.pts[0], m.L + 1) || caches) { const e = Vie.lancerTrafic(m, c.vu.pts); c.camion = e; c.sQ = Flotte.abscisse(e.tr, site.Q); }
      }
      if (!c.camion) return;
    }
    const e = c.camion;
    if (!Vie.etres.includes(e)) { this.vendre(c, now); return; }
    Vie.prochain.voiture = Math.max(Vie.prochain.voiture, now + 1500);      // personne ne s'engage derrière le camion
    e.stop = caches ? c.sQ : c.sQ - 2.2;
    if (caches) c.tousCaches ||= now;
    e.presse = c.tousCaches && now - c.tousCaches > 1500;                   // rien ne le retarde plus : il traverse ce qui le gêne
    if (!c.go && caches && e.s > c.sQ - 1.75) c.go = now;
    const arret = e.v < 0.03 && e.s > c.sQ - 0.3;
    if (c.go && arret && (c.unites.every(v => v.et === 'bloque') || now - c.go > 3000)) { c.tient ||= now; if (now - c.tient > 650) this.vendre(c, now); }
  },
  itineraire(c) { const pts = Vie.itineraire(c.site.r, c.site.sens); if (!pts) return null; return { pts, temps: Math.max(0, Flotte.abscisse(Flotte.trace([{ pts, r: 0.8 }]), c.site.Q) - 1.75) / 1.7 }; },
  vendre(c, now) {
    c.vendu = now;
    for (const v of c.unites) if (['attend', 'va', 'cache', 'jaillit'].includes(v.et)) v.perdu = true;
    const o = c.camion ? [c.camion.x, c.camion.y] : c.site.Q;
    c.payer(); Anim.texte(() => Rendu.ecranDe(o[0], 0.62, o[1]), '+' + euros(this.PRIX), '#ffe08a', 0, Anim.spritePiece());
    // ceux qui n'ont pas eu le temps de se placer rentrent directement
    for (const v of c.unites) if (v.perdu) { const u = v.u; u.cache = false; u.g.visible = true; if (v.et !== 'attend') { Machines.partir(u, Machines.rentrer(u, 0.2), 'rentrer'); v.et = 'rentre'; } else { u.etat = 'cour'; u.sansBenne = false; v.et = 'rentre'; } }
  },
  finir(c) { for (const v of c.unites) v.b.parent?.remove(v.b); this.en = null; },
  // Dernier recours : tout le monde est ramené à sa place d'un coup
  abandonner(c) {
    const M = Machines, cap = M.capL(-Math.PI / 2);
    if (!c.vendu) this.vendre(c, performance.now());
    if (c.camion) c.camion.stop = null;
    for (const v of c.unites) { const u = v.u, p = M.L(M.V().places[u.place]); Object.assign(u, { x: p[0], z: p[1], cap, etat: 'cour', source: null, sansBenne: false, cache: false, c: null }); u.g.visible = true; M.rendre(u.id); M.poser(u, 1); }
    this.finir(c);
  },
};
