// web/src/sim/horloge.ts
var VITESSES = [
  1,
  2,
  4,
  100
];
var MS_PAR_PAS = 4e3;
var MS_PAR_JOUR = MS_PAR_PAS * 24;
var SEUIL_RETARD_MS = 3e3;
var Horloge = class {
  /** Heures de jeu écoulées depuis le départ. */
  heure = 0;
  vitesse = 1;
  enPause = true;
  /** Temps de jeu dû et pas encore exécuté (ms, ramené à la vitesse de base). */
  reserveMs = 0;
  /** Nombre de pas dus après `dtMs` millisecondes réelles. */
  pasDus(dtMs) {
    if (this.enPause) return 0;
    this.reserveMs += dtMs * this.vitesse;
    const n = Math.floor(this.reserveMs / MS_PAR_PAS + 1e-9);
    this.reserveMs -= n * MS_PAR_PAS;
    return n;
  }
  /** La boucle a exécuté `faits` pas sur `dus` : on garde les autres en réserve. */
  rendre(dus, faits) {
    this.heure += faits;
    this.reserveMs += (dus - faits) * MS_PAR_PAS;
  }
  /** Part du pas suivant déjà écoulée (0 à 1) : pour interpoler l'affichage entre deux pas. */
  fraction() {
    return Math.min(1, Math.max(0, this.reserveMs / MS_PAR_PAS));
  }
  /**
   * Vrai si la boucle ne suit plus (des pas dus et non faits valent plus de SEUIL_RETARD_MS de temps réel) : la vitesse a
   * alors été baissée d'un cran. Le temps qui attend le pas suivant (moins d'un pas) n'est pas du retard : à la vitesse de
   * base, il monte jusqu'à quatre secondes, plus que le seuil (25/10 : le jeu ne pouvait plus avancer à la base).
   */
  verifierRetard() {
    if ((this.reserveMs - MS_PAR_PAS) / this.vitesse <= SEUIL_RETARD_MS) return false;
    this.reserveMs = 0;
    const i = VITESSES.indexOf(this.vitesse);
    if (i > 0) this.vitesse = VITESSES[i - 1];
    return true;
  }
  regler(vitesse) {
    this.vitesse = vitesse;
    this.reserveMs = 0;
  }
  basculerPause() {
    this.enPause = !this.enPause;
    this.reserveMs = 0;
  }
};

// web/src/sim/alea.ts
var Alea = class {
  a;
  b;
  c;
  d;
  constructor(graine) {
    let s = graine >>> 0;
    const suivant = () => {
      s = s + 2654435769 >>> 0;
      let z = s;
      z = Math.imul(z ^ z >>> 16, 2246822507);
      z = Math.imul(z ^ z >>> 13, 3266489909);
      return (z ^ z >>> 16) >>> 0;
    };
    this.a = suivant();
    this.b = suivant();
    this.c = suivant();
    this.d = suivant();
    for (let i = 0; i < 12; i++) this.entier();
  }
  /** Entier non signé sur 32 bits. */
  entier() {
    const t = (this.a + this.b >>> 0) + this.d >>> 0;
    this.d = this.d + 1 >>> 0;
    this.a = this.b ^ this.b >>> 9;
    this.b = this.c + (this.c << 3) >>> 0;
    this.c = (this.c << 21 | this.c >>> 11) >>> 0;
    this.c = this.c + t >>> 0;
    return t;
  }
  /** Réel dans [0, 1[. */
  reel() {
    return this.entier() / 4294967296;
  }
  /** Réel dans [min, max[. */
  entre(min, max) {
    return min + (max - min) * this.reel();
  }
  /** État complet, pour la sauvegarde. */
  etat() {
    return [
      this.a,
      this.b,
      this.c,
      this.d
    ];
  }
  restaurer([a, b, c, d]) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
};

// web/src/sim/monde.ts
var HEURE = 1;
var JOUR = 24;
var Monde = class {
  graine;
  /** Heures de jeu écoulées depuis le départ. */
  heure;
  alea;
  systemes;
  couts;
  constructor(graine) {
    this.graine = graine;
    this.heure = 0;
    this.systemes = [];
    this.couts = /* @__PURE__ */ new Map();
    this.alea = new Alea(graine);
  }
  ajouter(s) {
    if (this.systemes.some((x) => x.nom === s.nom)) throw new Error(`syst\xE8me \xAB ${s.nom} \xBB d\xE9j\xE0 pr\xE9sent`);
    this.systemes.push(s);
    this.couts.set(s.nom, {
      nom: s.nom,
      ms: 0,
      executions: 0
    });
  }
  retirer(nom) {
    this.systemes = this.systemes.filter((s) => s.nom !== nom);
    this.couts.delete(nom);
  }
  /** Noms des systèmes, dans leur ordre d'exécution. */
  noms() {
    return this.systemes.map((s) => s.nom);
  }
  /** Avance d'une heure de jeu. `mesurer` = chronométrer chaque système (coûte un peu). */
  pas(mesurer = false) {
    this.heure++;
    for (const s of this.systemes) {
      if (this.heure % s.periode !== 0) continue;
      if (!mesurer) {
        s.executer(this);
        continue;
      }
      const t0 = performance.now();
      s.executer(this);
      const c = this.couts.get(s.nom);
      const dt = performance.now() - t0;
      c.ms = c.executions === 0 ? dt : c.ms * 0.9 + dt * 0.1;
      c.executions++;
    }
  }
  /** Empreinte FNV-1a de l'état : deux parties de même graine doivent avoir la même. Systèmes pris dans l'ordre de leur
   *  nom, pas dans celui du chargement. */
  empreinte() {
    let h = melanger(2166136261, this.heure);
    for (const v of this.alea.etat()) h = melanger(h, v);
    const parNom = this.systemes.filter((s) => s.empreinte).sort((a, b) => a.nom < b.nom ? -1 : a.nom > b.nom ? 1 : 0);
    for (const s of parNom) h = s.empreinte(h);
    return h >>> 0;
  }
};
function melanger(h, v) {
  h ^= v & 255;
  h = Math.imul(h, 16777619);
  h ^= v >>> 8 & 255;
  h = Math.imul(h, 16777619);
  h ^= v >>> 16 & 255;
  h = Math.imul(h, 16777619);
  h ^= v >>> 24 & 255;
  return Math.imul(h, 16777619) >>> 0;
}

// web/src/sim/calendrier.ts
var DEPART_UTC = Date.UTC(2026, 9, 21, 6, 0);
var departUtc = DEPART_UTC;
function fixerDepart(utc) {
  departUtc = Number.isFinite(utc) ? utc : DEPART_UTC;
}
function departPartie() {
  return departUtc;
}
function departDe(date) {
  const d = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [a, m, j] = d.split("-").map(Number);
  const t = Date.UTC(a, m - 1, j, 6, 0);
  return Number.isFinite(t) ? t : DEPART_UTC;
}
var FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

// web/src/sim/rendu-collecte.ts
var Trajets = class {
  n = 0;
  nPts = 0;
  mode = new Uint8Array(64);
  /** premier point de chaque trajet (n + 1 valeurs) */
  debut = new Uint32Array(65);
  xy = new Float32Array(4096);
  /** longueur sur le globe (km), pour régler la vitesse : dt = km/h ÷ kmGlobe */
  kmGlobe = new Float32Array(64);
  cles = /* @__PURE__ */ new Map();
  /** Ajoute un trajet (ou rend celui de même clé déjà enregistré). */
  ajouter(cle5, mode, xy, kmGlobe) {
    if (cle5 !== null) {
      const deja = this.cles.get(cle5);
      if (deja !== void 0) return deja;
    }
    const i = this.n, nPts = this.nPts + xy.length / 2;
    if (i + 2 > this.debut.length) {
      const cap = 2 * this.debut.length;
      this.debut = agrandir(this.debut, cap), this.mode = agrandir(this.mode, cap), this.kmGlobe = agrandir(this.kmGlobe, cap);
    }
    if (2 * nPts > this.xy.length) this.xy = agrandir(this.xy, Math.max(2 * nPts, 2 * this.xy.length));
    this.xy.set(xy, 2 * this.nPts);
    this.mode[i] = mode;
    this.kmGlobe[i] = kmGlobe;
    this.debut[i] = this.nPts;
    this.debut[i + 1] = nPts;
    this.n++, this.nPts = nPts;
    if (cle5 !== null) this.cles.set(cle5, i);
    return i;
  }
  /** Trajets à partir du numéro `premier`, en copies transférables. */
  depuis(premier) {
    const d = this.debut[premier], f = this.debut[this.n];
    const offsets = new Uint32Array(this.n - premier + 1);
    for (let i = premier; i <= this.n; i++) offsets[i - premier] = this.debut[i] - d;
    return {
      premier,
      n: this.n - premier,
      mode: this.mode.slice(premier, this.n),
      offsets,
      xy: this.xy.slice(2 * d, 2 * f)
    };
  }
};
function agrandir(t, cap) {
  const n = new t.constructor(cap);
  n.set(t);
  return n;
}
var Pile = class {
  t;
  largeur;
  n;
  constructor(t, largeur = 1) {
    this.t = t;
    this.largeur = largeur;
    this.n = 0;
  }
  place(k) {
    const o = this.n * this.largeur;
    if (o + k * this.largeur > this.t.length) this.t = agrandir(this.t, Math.max(o + k * this.largeur, 2 * this.t.length));
    return o;
  }
  fin(n) {
    return this.t.slice(0, n * this.largeur);
  }
};
var f32 = (l = 1) => new Pile(new Float32Array(256 * l), l);
var u8 = () => new Pile(new Uint8Array(256));
var CollecteRendu = class {
  b = {
    n: 0,
    trajet: new Pile(new Uint32Array(256)),
    t: f32(),
    dt: f32(),
    genre: u8()
  };
  g = {
    n: 0,
    id: new Pile(new Int32Array(64)),
    xy: f32(2),
    trajet: new Pile(new Int32Array(64)),
    t: f32(),
    dt: f32(),
    type: u8(),
    camp: u8(),
    effectif: f32(),
    compo: f32(3),
    etat: u8()
  };
  /** 25/10 : combats en cours (membres à plat), événements de la guerre, paires de pays en guerre */
  k = {
    n: 0,
    id: [],
    xy: [],
    mode: [],
    camp: [],
    balance: [],
    masse: [],
    debut: [
      0
    ],
    membre: [],
    role: []
  };
  e = {
    genre: [],
    xy: [],
    camp: [],
    pays: [],
    retard: []
  };
  paires = [];
  o = {
    n: 0,
    id: new Pile(new Int32Array(64)),
    xy: f32(2),
    rayon: f32(),
    genre: u8(),
    camp: u8(),
    nombre: f32()
  };
  m = {
    n: 0,
    xy: f32(2),
    genre: u8(),
    camp: u8(),
    niveau: u8()
  };
  /** Une bille : trajet, abscisse (0 à 1), avance par heure, sorte (SORTE_*) et produit (PRODUIT_*). */
  bille(trajet, t, dt, sorte, produit) {
    this.billes(1, [
      trajet
    ], [
      t
    ], [
      dt
    ], [
      sorte | produit << 2
    ]);
  }
  /** Billes en bloc (tableaux de même longueur, `genre` = sorte | produit << 2). */
  billes(n, trajet, t, dt, genre) {
    const b = this.b;
    for (const p of [
      b.trajet,
      b.t,
      b.dt,
      b.genre
    ]) p.place(n);
    const o = b.n;
    for (let i = 0; i < n; i++) {
      b.trajet.t[o + i] = trajet[i], b.t.t[o + i] = t[i], b.dt.t[o + i] = dt[i], b.genre.t[o + i] = genre[i];
    }
    b.n += n;
    for (const p of [
      b.trajet,
      b.t,
      b.dt,
      b.genre
    ]) p.n = b.n;
  }
  /**
   * Un groupe : sur un trajet (trajet ≥ 0, t, dt) ou immobile en (x, y). `compo` = soldats, chars, canons (sinon tout
   * l'effectif dans le type dominant) ; `etat` = bits GROUPE_RENFORTS.
   */
  groupe(id, x, y, trajet, t, dt, type, camp, effectif, compo, etat = 0) {
    const g = this.g, i = g.n;
    for (const p of [
      g.id,
      g.xy,
      g.trajet,
      g.t,
      g.dt,
      g.type,
      g.camp,
      g.effectif,
      g.compo,
      g.etat
    ]) p.place(1), p.n = i + 1;
    g.id.t[i] = id, g.xy.t[2 * i] = x, g.xy.t[2 * i + 1] = y, g.trajet.t[i] = trajet, g.t.t[i] = t, g.dt.t[i] = dt;
    g.type.t[i] = type, g.camp.t[i] = camp, g.effectif.t[i] = effectif, g.etat.t[i] = etat;
    for (let k = 0; k < 3; k++) g.compo.t[3 * i + k] = compo ? compo[k] : k === type ? effectif : 0;
    g.n++;
  }
  /**
   * 25/10 : un combat en cours : centre, mode (MODE_*), camp de chaque côté vu du joueur, part de la puissance du côté 0,
   * hommes et engins engagés, membres (numéros de groupe) et leur rôle (côté | MEMBRE_APPUI).
   */
  combat(id, x, y, mode, camp0, camp1, balance, masse, membres, roles) {
    const k = this.k;
    k.id.push(id), k.xy.push(x, y), k.mode.push(mode), k.camp.push(camp0, camp1), k.balance.push(balance), k.masse.push(masse);
    k.membre.push(...membres), k.role.push(...roles), k.debut.push(k.membre.length);
    k.n++;
  }
  /** 25/10 : un événement de la guerre (EV_*) : lieu, camp et pays concernés, moment dans l'heure (0 à 1). */
  evenement(genre, x, y, camp, pays, retard = 0) {
    const e = this.e;
    e.genre.push(genre), e.xy.push(x, y), e.camp.push(camp), e.pays.push(pays), e.retard.push(Math.round(255 * Math.min(1, Math.max(0, retard))));
  }
  /** 25/10 : les paires de pays en guerre ((a << 8) | b, a < b). */
  guerres(paires) {
    this.paires = paires;
  }
  /** Une tour à rayon (avions sur un aéroport, navires sur une zone de mer). */
  tour(id, x, y, rayonKm, genre, camp, nombre2) {
    const o = this.o, i = o.n;
    for (const p of [
      o.id,
      o.xy,
      o.rayon,
      o.genre,
      o.camp,
      o.nombre
    ]) p.place(1), p.n = i + 1;
    o.id.t[i] = id, o.xy.t[2 * i] = x, o.xy.t[2 * i + 1] = y, o.rayon.t[i] = rayonKm, o.genre.t[i] = genre;
    o.camp.t[i] = camp, o.nombre.t[i] = nombre2;
    o.n++;
  }
  /** Un bâtiment (genre = indice dans BATIMENTS ; niveau 0 chantier, 1 construit, 2 doublé). */
  batiment(x, y, genre, camp, niveau = 1) {
    const m = this.m, i = m.n;
    for (const p of [
      m.xy,
      m.genre,
      m.camp,
      m.niveau
    ]) p.place(1), p.n = i + 1;
    m.xy.t[2 * i] = x, m.xy.t[2 * i + 1] = y, m.genre.t[i] = genre, m.camp.t[i] = camp, m.niveau.t[i] = niveau;
    m.n++;
  }
  fin(heure, trajets, territoire = null) {
    const b = this.b, g = this.g, o = this.o, m = this.m;
    const billes = {
      n: b.n,
      trajet: b.trajet.fin(b.n),
      t: b.t.fin(b.n),
      dt: b.dt.fin(b.n),
      genre: b.genre.fin(b.n)
    };
    const groupes2 = {
      n: g.n,
      id: g.id.fin(g.n),
      xy: g.xy.fin(g.n),
      trajet: g.trajet.fin(g.n),
      t: g.t.fin(g.n),
      dt: g.dt.fin(g.n),
      type: g.type.fin(g.n),
      camp: g.camp.fin(g.n),
      effectif: g.effectif.fin(g.n),
      compo: g.compo.fin(g.n),
      etat: g.etat.fin(g.n)
    };
    const k = this.k, e = this.e;
    const combats = {
      n: k.n,
      id: Int32Array.from(k.id),
      xy: Float32Array.from(k.xy),
      mode: Uint8Array.from(k.mode),
      camp: Uint8Array.from(k.camp),
      balance: Float32Array.from(k.balance),
      masse: Float32Array.from(k.masse),
      debut: Uint32Array.from(k.debut),
      membre: Int32Array.from(k.membre),
      role: Uint8Array.from(k.role)
    };
    const evenements = {
      n: e.genre.length,
      genre: Uint8Array.from(e.genre),
      xy: Float32Array.from(e.xy),
      camp: Uint8Array.from(e.camp),
      pays: Uint8Array.from(e.pays),
      retard: Uint8Array.from(e.retard)
    };
    const tours = {
      n: o.n,
      id: o.id.fin(o.n),
      xy: o.xy.fin(o.n),
      rayonKm: o.rayon.fin(o.n),
      genre: o.genre.fin(o.n),
      camp: o.camp.fin(o.n),
      nombre: o.nombre.fin(o.n)
    };
    const batiments = {
      n: m.n,
      xy: m.xy.fin(m.n),
      genre: m.genre.fin(m.n),
      camp: m.camp.fin(m.n),
      niveau: m.niveau.fin(m.n)
    };
    return {
      type: "rendu",
      heure,
      trajets,
      billes,
      groupes: groupes2,
      tours,
      batiments,
      territoire,
      combats,
      evenements,
      guerres: Uint16Array.from(this.paires)
    };
  }
};
function transferts(r) {
  const l = [];
  for (const partie2 of [
    r.trajets,
    r.billes,
    r.groupes,
    r.tours,
    r.batiments,
    r.territoire,
    r.combats,
    r.evenements,
    {
      g: r.guerres
    }
  ]) {
    if (!partie2) continue;
    for (const v of Object.values(partie2)) if (ArrayBuffer.isView(v)) l.push(v.buffer);
  }
  return l;
}

// web/src/carte/donnees.ts
async function decompresser(octets) {
  const flux = new Blob([
    octets
  ]).stream().pipeThrough(new DecompressionStream("deflate"));
  return await new Response(flux).arrayBuffer();
}

// web/src/carte/monde-reseau.ts
var R_TERRE_KM = 6371.0072;
var MODE_ROUTE = 1;
var MODE_RAIL = 2;
function distanceGlobeKm(lon1, lat1, lon2, lat2) {
  const r = Math.PI / 180;
  const p1 = lat1 * r, p2 = lat2 * r, dp = p2 - p1, dl = (lon2 - lon1) * r;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R_TERRE_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}
var Tas = class {
  cles = [];
  vals = [];
  get taille() {
    return this.cles.length;
  }
  pousser(cle5, val) {
    const c = this.cles, v = this.vals;
    let i = c.length;
    c.push(cle5);
    v.push(val);
    while (i > 0) {
      const p = i - 1 >> 1;
      if (c[p] <= cle5) break;
      c[i] = c[p];
      v[i] = v[p];
      i = p;
    }
    c[i] = cle5;
    v[i] = val;
  }
  /** retire le plus petit : [clé, valeur] */
  retirer() {
    const c = this.cles, v = this.vals;
    const cle0 = c[0], val0 = v[0];
    const ck = c.pop(), vk = v.pop();
    const n = c.length;
    if (n > 0) {
      let i = 0;
      for (; ; ) {
        let f = 2 * i + 1;
        if (f >= n) break;
        if (f + 1 < n && c[f + 1] < c[f]) f++;
        if (c[f] >= ck) break;
        c[i] = c[f];
        v[i] = v[f];
        i = f;
      }
      c[i] = ck;
      v[i] = vk;
    }
    return [
      cle0,
      val0
    ];
  }
};
var LecteurVarint = class {
  o;
  p;
  constructor(o, p = 0) {
    this.o = o;
    this.p = p;
  }
  uv() {
    let r = 0, m = 1, b;
    do {
      b = this.o[this.p++];
      r += (b & 127) * m;
      m *= 128;
    } while (b & 128);
    return r;
  }
  zz() {
    const u = this.uv();
    return u % 2 ? -(u + 1) / 2 : u / 2;
  }
};
var UNITE_KM = 0.1;
function lireAxes(octets) {
  const o = new Uint8Array(octets);
  if (String.fromCharCode(o[0], o[1], o[2], o[3]) !== "AXE1") throw new Error("axes : format inattendu");
  const v = new DataView(octets);
  const nNoeuds = v.getUint32(4, true), nAretes = v.getUint32(8, true), nPts = v.getUint32(12, true);
  const r = new LecteurVarint(o, 16);
  const noeuds = new Float32Array(2 * nNoeuds);
  const qx = new Int32Array(nNoeuds), qy = new Int32Array(nNoeuds);
  for (let i = 0, x = 0, y = 0; i < nNoeuds; i++) {
    x += r.zz();
    y += r.zz();
    qx[i] = x;
    qy[i] = y;
    noeuds[2 * i] = x * UNITE_KM;
    noeuds[2 * i + 1] = y * UNITE_KM;
  }
  const g = {
    nNoeuds,
    nAretes,
    noeuds,
    a: new Uint32Array(nAretes),
    b: new Uint32Array(nAretes),
    type: new Uint8Array(nAretes),
    classe: new Uint8Array(nAretes),
    km: new Float32Array(nAretes),
    offsets: new Uint32Array(nAretes + 1),
    pts: new Float32Array(2 * nPts)
  };
  let a = 0, k = 0;
  for (let e = 0; e < nAretes; e++) {
    a += r.zz();
    g.a[e] = a;
    g.b[e] = a + r.zz();
    const t = r.uv();
    g.type[e] = t % 4;
    g.classe[e] = Math.floor(t / 4);
    g.km[e] = r.uv() / 10;
    let x = qx[a], y = qy[a];
    for (let n = r.uv(); n > 0; n--) {
      x += r.zz();
      y += r.zz();
      g.pts[2 * k] = x * UNITE_KM;
      g.pts[2 * k + 1] = y * UNITE_KM;
      k++;
    }
    g.offsets[e + 1] = k;
  }
  if (r.p !== o.length || k !== nPts) throw new Error("axes : taille inattendue");
  return g;
}
function adjacenceDe(nNoeuds, a, b) {
  const debut = new Uint32Array(nNoeuds + 1);
  for (let e = 0; e < a.length; e++) {
    debut[a[e] + 1]++;
    debut[b[e] + 1]++;
  }
  for (let i = 0; i < nNoeuds; i++) debut[i + 1] += debut[i];
  const rempli = debut.slice(0, nNoeuds);
  const arete = new Uint32Array(2 * a.length);
  for (let e = 0; e < a.length; e++) {
    arete[rempli[a[e]]++] = e;
    arete[rempli[b[e]]++] = e;
  }
  return {
    debut,
    arete
  };
}
function plusCourtChemin(axes, adj, depuis, vers, modes = MODE_ROUTE | MODE_RAIL, ferme) {
  const n = axes.nNoeuds;
  const dist2 = new Float64Array(n).fill(Infinity);
  const pere = new Int32Array(n).fill(-1);
  dist2[depuis] = 0;
  const tas = new Tas();
  tas.pousser(0, depuis);
  while (tas.taille > 0) {
    const [d, u] = tas.retirer();
    if (d > dist2[u]) continue;
    if (u === vers) break;
    for (let i = adj.debut[u]; i < adj.debut[u + 1]; i++) {
      const e = adj.arete[i];
      if (!(modes & 1 << axes.type[e]) || ferme && ferme(e)) continue;
      const w = axes.a[e] === u ? axes.b[e] : axes.a[e];
      const nd = d + axes.km[e];
      if (nd < dist2[w]) {
        dist2[w] = nd;
        pere[w] = u;
        tas.pousser(nd, w);
      }
    }
  }
  if (!isFinite(dist2[vers])) return null;
  const noeuds = [
    vers
  ];
  while (noeuds[noeuds.length - 1] !== depuis) noeuds.push(pere[noeuds[noeuds.length - 1]]);
  return {
    km: dist2[vers],
    noeuds: noeuds.reverse()
  };
}
function lireVivantes(octets) {
  const v = new DataView(octets);
  if (String.fromCharCode(...new Uint8Array(octets, 0, 4)) !== "VIV1") throw new Error("vivantes : format inattendu");
  const n = v.getUint32(4, true), seuil = v.getUint32(8, true);
  if (octets.byteLength !== 12 + n * (4 + 2 + 4 + 2)) throw new Error("vivantes : taille inattendue");
  let o = 12;
  const noeudRoute = new Uint32Array(octets.slice(o, o + 4 * n));
  o += 4 * n;
  const kmRoute = new Uint16Array(octets.slice(o, o + 2 * n));
  o += 2 * n;
  const noeudRail = new Int32Array(octets.slice(o, o + 4 * n));
  o += 4 * n;
  const kmRail = new Uint16Array(octets.slice(o, o + 2 * n));
  return {
    n,
    seuil,
    noeudRoute,
    kmRoute,
    noeudRail,
    kmRail
  };
}
function lirePortsMonde(j) {
  const d = j;
  return {
    n: d.n,
    noms: d.nom,
    x: Float32Array.from(d.x),
    y: Float32Array.from(d.y),
    rang: Uint8Array.from(d.rang),
    pays: Uint8Array.from(d.pays),
    noeudRoute: Int32Array.from(d.noeud_route),
    kmRoute: Uint16Array.from(d.km_route),
    noeudRail: Int32Array.from(d.noeud_rail),
    kmRail: Uint16Array.from(d.km_rail),
    mer: Int32Array.from(d.mer),
    kmMer: Uint16Array.from(d.km_mer)
  };
}
function lireAeroportsMonde(j) {
  const d = j;
  return {
    n: d.n,
    icao: d.icao,
    iata: d.iata,
    noms: d.nom,
    x: Float32Array.from(d.x),
    y: Float32Array.from(d.y),
    grand: Uint8Array.from(d.grand),
    civil: Uint8Array.from(d.civil),
    militaire: Uint8Array.from(d.militaire),
    pays: Uint8Array.from(d.pays),
    noeudRoute: Int32Array.from(d.noeud_route),
    kmRoute: Uint16Array.from(d.km_route)
  };
}
function lireContinents(j) {
  const d = j;
  return {
    noms: d.continents,
    dePays: Int8Array.from(d.continent_du_pays)
  };
}
var ReseauMer = class {
  n;
  nAretes;
  /** degrés */
  lon;
  lat;
  a;
  b;
  km;
  /** bits des passages que l'arête traverse (0 : arête libre) */
  masque;
  passages;
  adj;
  constructor(octets, passages) {
    const o = new Uint8Array(octets);
    if (String.fromCharCode(o[0], o[1], o[2], o[3]) !== "MER1") throw new Error("mer : format inattendu");
    const v = new DataView(octets);
    const n = v.getUint32(4, true), na = v.getUint32(8, true), np = v.getUint32(12, true);
    if (np !== passages.length) throw new Error(`mer : ${np} passages dans le fichier, ${passages.length} d\xE9crits`);
    const r = new LecteurVarint(o, 16);
    this.n = n;
    this.nAretes = na;
    this.lon = new Float32Array(n);
    this.lat = new Float32Array(n);
    for (let i = 0, x = 0, y = 0; i < n; i++) {
      x += r.zz();
      y += r.zz();
      this.lon[i] = x / 100;
      this.lat[i] = y / 100;
    }
    this.a = new Uint32Array(na);
    this.b = new Uint32Array(na);
    for (let a = 0, e = 0; a < n; a++) {
      let prev = a;
      for (let k = r.uv(); k > 0; k--) {
        prev += r.uv();
        this.a[e] = a;
        this.b[e] = prev;
        e++;
      }
    }
    this.masque = new Uint16Array(na);
    for (let k = r.uv(), e = 0; k > 0; k--) {
      e += r.uv();
      this.masque[e] = r.uv();
    }
    if (r.p !== o.length) throw new Error("mer : taille inattendue");
    this.km = new Float32Array(na);
    for (let e = 0; e < na; e++) {
      this.km[e] = distanceGlobeKm(this.lon[this.a[e]], this.lat[this.a[e]], this.lon[this.b[e]], this.lat[this.b[e]]);
    }
    this.adj = adjacenceDe(n, this.a, this.b);
    this.passages = passages.map((p, bit) => ({
      id: p.id,
      nom: p.nom,
      type: p.type,
      bit: 1 << bit
    }));
  }
  /** Masque de fermeture pour une liste d'identifiants de passages (« suez », « panama »…). */
  fermeture(ids) {
    let m = 0;
    for (const id of ids) {
      const p = this.passages.find((q) => q.id === id);
      if (!p) throw new Error(`passage inconnu : ${id}`);
      m |= p.bit;
    }
    return m;
  }
  /** Plus court chemin (Dijkstra) entre deux noeuds ; `fermes` = masque des passages fermés. */
  itineraire(depuis, vers, fermes = 0) {
    const { debut, arete } = this.adj;
    const dist2 = new Float64Array(this.n).fill(Infinity);
    const pere = new Int32Array(this.n).fill(-1);
    dist2[depuis] = 0;
    const tas = new Tas();
    tas.pousser(0, depuis);
    while (tas.taille > 0) {
      const [d, u] = tas.retirer();
      if (d > dist2[u]) continue;
      if (u === vers) break;
      for (let i = debut[u]; i < debut[u + 1]; i++) {
        const e = arete[i];
        if (this.masque[e] & fermes) continue;
        const w = this.a[e] === u ? this.b[e] : this.a[e];
        const nd = d + this.km[e];
        if (nd < dist2[w]) {
          dist2[w] = nd;
          pere[w] = u;
          tas.pousser(nd, w);
        }
      }
    }
    if (!isFinite(dist2[vers])) return null;
    const noeuds = [
      vers
    ];
    while (noeuds[noeuds.length - 1] !== depuis) noeuds.push(pere[noeuds[noeuds.length - 1]]);
    return {
      km: dist2[vers],
      noeuds: noeuds.reverse()
    };
  }
  /** Composante connexe de chaque noeud (en tenant compte des fermetures). */
  composantes(fermes = 0) {
    const pere = new Int32Array(this.n).map((_, i) => i);
    const trouver = (i) => {
      while (pere[i] !== i) {
        pere[i] = pere[pere[i]];
        i = pere[i];
      }
      return i;
    };
    for (let e = 0; e < this.nAretes; e++) if (!(this.masque[e] & fermes)) pere[trouver(this.a[e])] = trouver(this.b[e]);
    return pere.map((_, i) => trouver(i));
  }
};
async function chargerReseauMonde(lire2) {
  const texte = async (nom) => JSON.parse(new TextDecoder().decode(await lire2(nom)));
  const z = async (nom) => decompresser(await lire2(nom));
  const [axesOctets, vivOctets, merOctets, ports, aeroports, continents, merInfo] = await Promise.all([
    z("monde-axes.bin.z"),
    z("monde-vivantes.bin.z"),
    z("monde-mer.bin.z"),
    texte("monde-ports.json"),
    texte("monde-aeroports.json"),
    texte("monde-continents.json"),
    texte("monde-mer.json")
  ]);
  const axes = lireAxes(axesOctets);
  return {
    axes,
    adjacence: adjacenceDe(axes.nNoeuds, axes.a, axes.b),
    vivantes: lireVivantes(vivOctets),
    ports: lirePortsMonde(ports),
    aeroports: lireAeroportsMonde(aeroports),
    continents: lireContinents(continents),
    mer: new ReseauMer(merOctets, merInfo.passages)
  };
}

// web/src/carte/projection-monde.ts
var R_KM = 6371.0072;
var CIRCONFERENCE_KM = 2 * Math.PI * R_KM;
var RAD = Math.PI / 180;
function projeter(lon, lat) {
  const p = Math.max(-89, Math.min(89, lat)) * RAD;
  return [
    R_KM * lon * RAD,
    R_KM * Math.log(Math.tan(Math.PI / 4 + p / 2))
  ];
}
function inverser(x, y) {
  const lon = ((x / R_KM / RAD + 180) % 360 + 360) % 360 - 180;
  return [
    lon,
    (2 * Math.atan(Math.exp(y / R_KM)) - Math.PI / 2) / RAD
  ];
}

// web/src/carte/trajets.ts
function pres(x, ref, c = CIRCONFERENCE_KM) {
  return x - Math.round((x - ref) / c) * c;
}
var Points = class {
  xy = [];
  ajouter(x, y) {
    const n = this.xy.length;
    if (n) {
      x = pres(x, this.xy[n - 2]);
      if (x === this.xy[n - 2] && y === this.xy[n - 1]) return;
    }
    this.xy.push(x, y);
  }
};
function areteEntre(axes, adj, u, w, modes = 3) {
  let meilleure = -1;
  for (let i = adj.debut[u]; i < adj.debut[u + 1]; i++) {
    const e = adj.arete[i];
    if (!(modes & 1 << axes.type[e])) continue;
    if ((axes.a[e] === u ? axes.b[e] : axes.a[e]) !== w) continue;
    if (meilleure < 0 || axes.km[e] < axes.km[meilleure]) meilleure = e;
  }
  return meilleure;
}
function polyligneAxes(axes, adj, noeuds, modes = 3) {
  const p = new Points();
  const n = axes.noeuds;
  if (noeuds.length) p.ajouter(n[2 * noeuds[0]], n[2 * noeuds[0] + 1]);
  for (let k = 1; k < noeuds.length; k++) {
    const u = noeuds[k - 1], w = noeuds[k];
    const e = areteEntre(axes, adj, u, w, modes);
    if (e >= 0) {
      const d = axes.offsets[e], f = axes.offsets[e + 1];
      if (axes.a[e] === u) for (let i = d; i < f; i++) p.ajouter(axes.pts[2 * i], axes.pts[2 * i + 1]);
      else for (let i = f - 1; i >= d; i--) p.ajouter(axes.pts[2 * i], axes.pts[2 * i + 1]);
    }
    p.ajouter(n[2 * w], n[2 * w + 1]);
  }
  return new Float32Array(p.xy);
}
function lisser(xy, tours = 2) {
  for (let t = 0; t < tours && xy.length >= 6; t++) {
    const r = [
      xy[0],
      xy[1]
    ];
    for (let i = 0; i + 3 < xy.length; i += 2) {
      r.push(0.75 * xy[i] + 0.25 * xy[i + 2], 0.75 * xy[i + 1] + 0.25 * xy[i + 3]);
      r.push(0.25 * xy[i] + 0.75 * xy[i + 2], 0.25 * xy[i + 1] + 0.75 * xy[i + 3]);
    }
    r.push(xy[xy.length - 2], xy[xy.length - 1]);
    xy = r;
  }
  return xy;
}
function polyligneMer(mer, noeuds, depart, arrivee) {
  const p = new Points();
  if (depart) p.ajouter(depart[0], depart[1]);
  for (const i of noeuds) p.ajouter(...projeter(mer.lon[i], mer.lat[i]));
  if (arrivee) p.ajouter(arrivee[0], arrivee[1]);
  return new Float32Array(lisser(p.xy));
}
var PositionsTrajets = class {
  n = 0;
  /** premier point de chaque trajet dans `xy` et `cumul` (n + 1 valeurs) */
  debut = new Uint32Array(1);
  mode = new Uint8Array(0);
  xy = new Float32Array(0);
  cumul = new Float32Array(0);
  nPts = 0;
  /** Ajoute les trajets d'un message (`premier` = 0 : remplace tout). */
  recevoir(t) {
    if (t.premier === 0) this.n = 0, this.nPts = 0;
    if (t.premier !== this.n) throw new Error(`trajets : ${t.premier} re\xE7u, ${this.n} attendu`);
    const nPts = this.nPts + t.xy.length / 2, n = this.n + t.n;
    if (2 * nPts > this.xy.length) {
      const cap = Math.max(2 * nPts, 2 * this.xy.length);
      const xy = new Float32Array(cap), cu = new Float32Array(cap / 2);
      xy.set(this.xy.subarray(0, 2 * this.nPts)), cu.set(this.cumul.subarray(0, this.nPts));
      this.xy = xy, this.cumul = cu;
    }
    if (n + 1 > this.debut.length) {
      const d = new Uint32Array(Math.max(n + 1, 2 * this.debut.length)), m = new Uint8Array(d.length);
      d.set(this.debut.subarray(0, this.n + 1)), m.set(this.mode.subarray(0, this.n));
      this.debut = d, this.mode = m;
    }
    this.xy.set(t.xy, 2 * this.nPts);
    for (let i = 0; i < t.n; i++) {
      const d = this.nPts + t.offsets[i], f = this.nPts + t.offsets[i + 1];
      this.debut[this.n + i] = d;
      this.mode[this.n + i] = t.mode[i];
      let s = 0;
      for (let k = d; k < f; k++) {
        if (k > d) s += Math.hypot(this.xy[2 * k] - this.xy[2 * k - 2], this.xy[2 * k + 1] - this.xy[2 * k - 1]);
        this.cumul[k] = s;
      }
    }
    this.n = n, this.nPts = nPts;
    this.debut[n] = nPts;
  }
  /** Longueur du trajet (km de carte). */
  longueur(i) {
    const f = this.debut[i + 1] - 1;
    return f >= this.debut[i] ? this.cumul[f] : 0;
  }
  /** Position à l'abscisse t (bornée à [0, 1]) : écrit x, y et la direction en x (−1 ou 1) dans `sortie` à partir de `o`. */
  position(i, t, sortie, o) {
    const d = this.debut[i], f = this.debut[i + 1] - 1;
    if (f <= d) {
      sortie[o] = this.xy[2 * d], sortie[o + 1] = this.xy[2 * d + 1], sortie[o + 2] = 1;
      return;
    }
    const s = Math.min(1, Math.max(0, t)) * this.cumul[f];
    let a = d, b = f;
    while (b - a > 1) {
      const m = a + b >> 1;
      if (this.cumul[m] <= s) a = m;
      else b = m;
    }
    const l = this.cumul[b] - this.cumul[a];
    const u = l > 0 ? (s - this.cumul[a]) / l : 0;
    const x0 = this.xy[2 * a], y0 = this.xy[2 * a + 1], x1 = this.xy[2 * b], y1 = this.xy[2 * b + 1];
    sortie[o] = x0 + (x1 - x0) * u;
    sortie[o + 1] = y0 + (y1 - y0) * u;
    sortie[o + 2] = x1 >= x0 ? 1 : -1;
  }
};

// web/src/protocole.ts
var ENVOI_MS = 100;
var SORTE_CAMION = 0;
var SORTE_TRAIN = 1;
var SORTE_CARGO = 2;
var SORTE_PETROLIER = 3;
var PRODUIT_BRUT = 1;
var PRODUIT_CARBURANT = 2;
var PRODUIT_MUNITIONS = 3;
var TRAJET_ROUTE = 0;
var TRAJET_RAIL = 1;
var TRAJET_MER = 2;
var GROUPE_SOLDATS = 0;
var GROUPE_CHARS = 1;
var GROUPE_ARTILLERIE = 2;
var TOUR_AVIONS = 0;
var TOUR_NAVIRES = 1;
var TOUR_DCA = 2;
var TOUR_IMPACT = 3;
var TOUR_BOMBE = 4;
var CAMP_JOUEUR = 0;
var CAMP_ALLIE = 1;
var CAMP_NEUTRE = 2;
var CAMP_ENNEMI = 3;
var BATIMENTS = [
  "puits",
  "raffinerie",
  "munitions",
  "caserne",
  "usine-chars",
  "usine-artillerie",
  "usine-avions",
  "aeroport",
  "chantier-naval",
  "depot",
  "dca",
  "silo"
];
var GROUPE_RENFORTS = 1;
var MEMBRE_APPUI = 2;
var EV_PRISE = 0;
var EV_FIN_COMBAT = 1;
var EV_DETRUIT = 2;
var CASE_TERRITOIRE_KM = 10;

// web/src/sim/essai-rendu.ts
var VILLES = {
  Paris: [
    2.35,
    48.86
  ],
  Lyon: [
    4.84,
    45.76
  ],
  Marseille: [
    5.37,
    43.3
  ],
  Bordeaux: [
    -0.58,
    44.84
  ],
  Lille: [
    3.06,
    50.63
  ],
  Strasbourg: [
    7.75,
    48.58
  ],
  Nantes: [
    -1.55,
    47.22
  ],
  Toulouse: [
    1.44,
    43.6
  ],
  Berlin: [
    13.4,
    52.52
  ],
  Munich: [
    11.58,
    48.14
  ],
  Hambourg: [
    9.99,
    53.55
  ],
  Madrid: [
    -3.7,
    40.42
  ],
  Barcelone: [
    2.17,
    41.39
  ],
  Rome: [
    12.5,
    41.9
  ],
  Milan: [
    9.19,
    45.46
  ],
  Varsovie: [
    21.01,
    52.23
  ],
  Vienne: [
    16.37,
    48.21
  ],
  Moscou: [
    37.62,
    55.75
  ],
  Kiev: [
    30.52,
    50.45
  ],
  Kharkiv: [
    36.23,
    49.99
  ],
  Istanbul: [
    28.98,
    41.01
  ],
  LeCaire: [
    31.24,
    30.04
  ],
  Pekin: [
    116.4,
    39.9
  ],
  Shanghai: [
    121.47,
    31.23
  ],
  Delhi: [
    77.21,
    28.61
  ],
  Bombay: [
    72.88,
    19.08
  ],
  NewYork: [
    -74,
    40.71
  ],
  Chicago: [
    -87.63,
    41.88
  ],
  LosAngeles: [
    -118.24,
    34.05
  ],
  SaoPaulo: [
    -46.63,
    -23.55
  ],
  Johannesburg: [
    28.05,
    -26.2
  ],
  Lagos: [
    3.38,
    6.52
  ]
};
var LIAISONS = [
  [
    "Paris",
    "Lyon"
  ],
  [
    "Lyon",
    "Marseille"
  ],
  [
    "Paris",
    "Bordeaux"
  ],
  [
    "Paris",
    "Lille"
  ],
  [
    "Paris",
    "Strasbourg"
  ],
  [
    "Paris",
    "Nantes"
  ],
  [
    "Bordeaux",
    "Toulouse"
  ],
  [
    "Toulouse",
    "Marseille"
  ],
  [
    "Strasbourg",
    "Munich"
  ],
  [
    "Lille",
    "Hambourg"
  ],
  [
    "Hambourg",
    "Berlin"
  ],
  [
    "Berlin",
    "Munich"
  ],
  [
    "Berlin",
    "Varsovie"
  ],
  [
    "Munich",
    "Vienne"
  ],
  [
    "Munich",
    "Milan"
  ],
  [
    "Milan",
    "Rome"
  ],
  [
    "Lyon",
    "Milan"
  ],
  [
    "Madrid",
    "Barcelone"
  ],
  [
    "Barcelone",
    "Marseille"
  ],
  [
    "Bordeaux",
    "Madrid"
  ],
  [
    "Varsovie",
    "Kiev"
  ],
  [
    "Kiev",
    "Kharkiv"
  ],
  [
    "Moscou",
    "Kharkiv"
  ],
  [
    "Varsovie",
    "Moscou"
  ],
  [
    "Vienne",
    "Istanbul"
  ],
  [
    "Pekin",
    "Shanghai"
  ],
  [
    "Delhi",
    "Bombay"
  ],
  [
    "NewYork",
    "Chicago"
  ],
  [
    "Chicago",
    "LosAngeles"
  ]
];
var LIGNES = [
  [
    [
      4.4,
      51.9
    ],
    [
      121.5,
      31.2
    ],
    false
  ],
  [
    [
      0.1,
      49.5
    ],
    [
      -74,
      40.7
    ],
    false
  ],
  [
    [
      50.2,
      26.6
    ],
    [
      4.4,
      51.9
    ],
    true
  ],
  [
    [
      -46.3,
      -23.95
    ],
    [
      4.4,
      51.9
    ],
    false
  ],
  [
    [
      103.8,
      1.26
    ],
    [
      -118.26,
      33.73
    ],
    false
  ],
  [
    [
      -95,
      29.7
    ],
    [
      5,
      43.4
    ],
    true
  ],
  [
    [
      3.4,
      6.45
    ],
    [
      -74,
      40.7
    ],
    true
  ],
  [
    [
      50.2,
      26.6
    ],
    [
      139.8,
      35.5
    ],
    true
  ]
];
var KMH = [
  80,
  100,
  30,
  28
];
function noeudPres(r, lonlat, rail) {
  const [x, y] = projeter(...lonlat);
  const a = r.axes, n = a.noeuds;
  let best = -1, d2 = Infinity;
  for (let e = 0; e < a.nAretes; e++) {
    if (a.type[e] === 1 !== rail) continue;
    for (const v of [
      a.a[e],
      a.b[e]
    ]) {
      const d = (n[2 * v] - x) ** 2 + (n[2 * v + 1] - y) ** 2;
      if (d < d2) d2 = d, best = v;
    }
  }
  return d2 < 60 ** 2 ? best : -1;
}
function portPres(r, lonlat) {
  const [x, y] = projeter(...lonlat);
  let best = -1, d2 = Infinity;
  for (let i = 0; i < r.ports.n; i++) {
    if (r.ports.mer[i] < 0) continue;
    const d = (r.ports.x[i] - x) ** 2 + (r.ports.y[i] - y) ** 2;
    if (d < d2) d2 = d, best = i;
  }
  return best;
}
var EssaiRendu = class _EssaiRendu {
  n = 0;
  trajet = new Uint32Array(0);
  t = new Float32Array(0);
  dt = new Float32Array(0);
  genre = new Uint8Array(0);
  /** groupes : trajet, abscisse, avance (aller-retour) */
  gTrajet = new Int32Array(0);
  gT = new Float32Array(0);
  gDt = new Float32Array(0);
  gType = new Uint8Array(0);
  gCamp = new Uint8Array(0);
  gEffectif = new Float32Array(0);
  tours = [];
  batiments = [];
  /** Monte l'essai : trajets enregistrés dans `trajets`, `n` billes réparties dessus. */
  static async creer(lire2, trajets, alea, n = 5e3) {
    const r = await chargerReseauMonde(lire2);
    const e = new _EssaiRendu();
    const terre = [];
    const routes = [];
    for (const [a, b] of LIAISONS) {
      for (const rail of [
        false,
        true
      ]) {
        const u = noeudPres(r, VILLES[a], rail), w = noeudPres(r, VILLES[b], rail);
        if (u < 0 || w < 0) continue;
        const mode = rail ? MODE_RAIL : MODE_ROUTE;
        const c = plusCourtChemin(r.axes, r.adjacence, u, w, mode);
        if (!c || c.noeuds.length < 2) continue;
        const id = trajets.ajouter(`essai:${rail ? "rail" : "route"}:${a}-${b}`, rail ? TRAJET_RAIL : TRAJET_ROUTE, polyligneAxes(r.axes, r.adjacence, c.noeuds, mode), c.km);
        terre.push({
          id,
          sorte: rail ? SORTE_TRAIN : SORTE_CAMION
        });
        if (!rail) routes.push(id);
      }
    }
    const mer = [];
    for (const [da, db, petrole] of LIGNES) {
      const p = portPres(r, da), q = portPres(r, db);
      const it = p >= 0 && q >= 0 ? r.mer.itineraire(r.ports.mer[p], r.ports.mer[q]) : null;
      if (!it) continue;
      const P = r.ports;
      const id = trajets.ajouter(`essai:mer:${P.noms[p]}-${P.noms[q]}`, TRAJET_MER, polyligneMer(r.mer, it.noeuds, [
        P.x[p],
        P.y[p]
      ], [
        P.x[q],
        P.y[q]
      ]), it.km + P.kmMer[p] + P.kmMer[q]);
      mer.push({
        id,
        petrole
      });
    }
    e.n = n;
    e.trajet = new Uint32Array(n), e.t = new Float32Array(n), e.dt = new Float32Array(n), e.genre = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      let id, sorte, produit;
      if (i % 20 < 17 || !mer.length) {
        const c = terre[i % terre.length];
        id = c.id, sorte = c.sorte, produit = alea.entier() % 4;
      } else {
        const c = mer[i % mer.length];
        id = c.id;
        sorte = c.petrole ? SORTE_PETROLIER : SORTE_CARGO;
        produit = c.petrole ? alea.reel() < 0.6 ? PRODUIT_BRUT : PRODUIT_CARBURANT : alea.entier() % 4;
      }
      const sens = alea.reel() < 0.5 ? 1 : -1;
      e.trajet[i] = id;
      e.t[i] = alea.reel();
      e.dt[i] = sens * KMH[sorte] * (0.85 + 0.3 * alea.reel()) / Math.max(1, trajets.kmGlobe[id]);
      e.genre[i] = sorte | produit << 2;
    }
    const ng = Math.min(24, routes.length);
    e.gTrajet = new Int32Array(ng), e.gT = new Float32Array(ng), e.gDt = new Float32Array(ng);
    e.gType = new Uint8Array(ng), e.gCamp = new Uint8Array(ng), e.gEffectif = new Float32Array(ng);
    for (let i = 0; i < ng; i++) {
      const id = routes[i * 7 % routes.length];
      e.gTrajet[i] = id;
      e.gT[i] = alea.reel();
      e.gType[i] = i % 3;
      e.gCamp[i] = [
        CAMP_JOUEUR,
        CAMP_ALLIE,
        CAMP_NEUTRE,
        CAMP_ENNEMI
      ][i % 4];
      e.gDt[i] = (e.gType[i] === 1 ? 40 : 90) / Math.max(1, trajets.kmGlobe[id]);
      e.gEffectif[i] = Math.round(500 + alea.reel() * 4e4);
    }
    const AIR = [
      [
        2.55,
        49.01,
        CAMP_JOUEUR
      ],
      [
        13.5,
        52.37,
        CAMP_ALLIE
      ],
      [
        37.41,
        55.97,
        CAMP_ENNEMI
      ],
      [
        30.9,
        50.34,
        CAMP_ALLIE
      ],
      [
        -73.78,
        40.64,
        CAMP_NEUTRE
      ],
      [
        116.6,
        40.08,
        CAMP_NEUTRE
      ]
    ];
    for (const [lon, lat, camp] of AIR) {
      const [x, y] = projeter(lon, lat);
      e.tours.push({
        x,
        y,
        rayon: 800,
        genre: TOUR_AVIONS,
        camp,
        nombre: 12 + Math.round(alea.reel() * 200)
      });
    }
    const MER = [
      [
        -5.5,
        47,
        CAMP_JOUEUR
      ],
      [
        5.5,
        42,
        CAMP_JOUEUR
      ],
      [
        33.5,
        44,
        CAMP_ENNEMI
      ],
      [
        -70,
        39.5,
        CAMP_NEUTRE
      ],
      [
        121,
        26.5,
        CAMP_NEUTRE
      ]
    ];
    for (const [lon, lat, camp] of MER) {
      const [x, y] = projeter(lon, lat);
      e.tours.push({
        x,
        y,
        rayon: 300,
        genre: TOUR_NAVIRES,
        camp,
        nombre: 3 + Math.round(alea.reel() * 20)
      });
    }
    const [px, py] = projeter(...VILLES.Paris), [mx, my] = projeter(...VILLES.Moscou);
    BATIMENTS.forEach((_, g) => {
      const a = g / BATIMENTS.length * 2 * Math.PI;
      for (const [niveau, r2] of [
        [
          1,
          70
        ],
        [
          0,
          110
        ],
        [
          2,
          150
        ]
      ]) {
        e.batiments.push({
          x: px + r2 * Math.cos(a),
          y: py + 0.8 * r2 * Math.sin(a),
          genre: g,
          camp: CAMP_JOUEUR,
          niveau
        });
      }
      e.batiments.push({
        x: mx + 70 * Math.cos(a),
        y: my + 55 * Math.sin(a),
        genre: g,
        camp: CAMP_ENNEMI,
        niveau: g % 3 === 0 ? 2 : 1
      });
    });
    const KT = [
      15,
      50,
      200,
      1e3,
      1e4
    ];
    KT.forEach((kt, i) => {
      const [bx, by] = projeter(31 + 1.2 * i, 47.2);
      e.tours.push({
        x: bx,
        y: by,
        rayon: 0,
        genre: TOUR_BOMBE,
        camp: CAMP_ENNEMI,
        nombre: kt
      });
      const [ix, iy] = projeter(33 + 1.6 * i, 49.3);
      e.tours.push({
        x: ix,
        y: iy,
        rayon: 5 * Math.cbrt(kt / Math.sqrt(15 * 21)),
        genre: TOUR_IMPACT,
        camp: CAMP_JOUEUR,
        nombre: kt
      });
    });
    return e;
  }
  systemes() {
    return [
      {
        nom: "essai-rendu",
        periode: HEURE,
        executer: (_m) => {
          for (let i = 0; i < this.n; i++) {
            let t = this.t[i] + this.dt[i];
            if (t > 1) t -= 1;
            else if (t < 0) t += 1;
            this.t[i] = t;
          }
          for (let i = 0; i < this.gT.length; i++) {
            const t = this.gT[i] + this.gDt[i];
            if (t > 1 || t < 0) this.gDt[i] = -this.gDt[i];
            else this.gT[i] = t;
          }
        },
        empreinte: (h) => {
          let s = 0;
          for (let i = 0; i < this.n; i += 97) s += this.t[i];
          return (h ^ Math.round(s * 1e4)) >>> 0;
        }
      }
    ];
  }
  rendu(c) {
    c.billes(this.n, this.trajet, this.t, this.dt, this.genre);
    for (let i = 0; i < this.gT.length; i++) {
      c.groupe(i, 0, 0, this.gTrajet[i], this.gT[i], this.gDt[i], this.gType[i], this.gCamp[i], this.gEffectif[i]);
    }
    this.tours.forEach((o, i) => c.tour(i, o.x, o.y, o.rayon, o.genre, o.camp, o.nombre));
    for (const b of this.batiments) c.batiment(b.x, b.y, b.genre, b.camp, b.niveau ?? 1);
  }
};

// web/src/donnees/depart.ts
var TYPES_USINE = [
  "chars",
  "artillerie",
  "avions",
  "chantier_naval",
  "munitions",
  "caserne"
];
function lireDepart(pays, alliances, usines) {
  const index = new Map(pays.map((p) => [
    p.iso3,
    p
  ]));
  if (index.size !== pays.length) throw new Error("pays en double");
  for (const p of pays) {
    if (!(p.population > 0) || p.recettes_heure !== p.population) throw new Error(`pays invalide : ${p.iso3}`);
  }
  for (const u of usines) {
    if (!TYPES_USINE.includes(u.type) || !index.has(u.iso3) || u.lat < -90 || u.lat > 90) throw new Error(`usine invalide : ${u.nom}`);
  }
  const defense = alliances.blocs.filter((b) => b.niveau === "defense").map((b) => new Set(b.membres));
  const accords = new Set(alliances.accords.filter((a) => a.niveau === "defense").map((a) => a.de + ">" + a.vers));
  return {
    pays,
    blocs: alliances.blocs,
    accords: alliances.accords,
    usines,
    pays_: (iso) => index.get(iso),
    usinesDuPays: (iso, type) => usines.filter((u) => u.iso3 === iso && (!type || u.type === type)),
    allies: (a, b) => a !== b && (defense.some((s) => s.has(a) && s.has(b)) || accords.has(a + ">" + b) || accords.has(b + ">" + a))
  };
}
async function chargerDepart(lire2) {
  const json = async (nom) => JSON.parse(new TextDecoder().decode(await lire2(nom)));
  return lireDepart(await json("depart-pays.json"), await json("depart-alliances.json"), await json("depart-usines.json"));
}

// web/src/donnees/petrole.ts
function verifierPoint(a, genre) {
  if (!(a.lon >= -180 && a.lon <= 180 && a.lat >= -90 && a.lat <= 90) || !(a.kbd >= 0) || !a.nom) {
    throw new Error(`${genre} invalide : ${JSON.stringify(a)}`);
  }
}
function lirePetrole(champs, raffineries, oleoducs) {
  champs.forEach((c) => verifierPoint(c, "champ"));
  raffineries.forEach((r) => verifierPoint(r, "raffinerie"));
  for (const o of oleoducs) {
    if (o.lignes.length === 0 || o.lignes.some((l) => l.length < 2)) throw new Error(`ol\xE9oduc sans trac\xE9 : ${o.nom}`);
  }
  const parPaysC = /* @__PURE__ */ new Map();
  for (const c of champs) parPaysC.set(c.iso3, [
    ...parPaysC.get(c.iso3) ?? [],
    c
  ]);
  const parPaysR = /* @__PURE__ */ new Map();
  for (const r of raffineries) parPaysR.set(r.iso3, [
    ...parPaysR.get(r.iso3) ?? [],
    r
  ]);
  const somme = (l = []) => l.reduce((s, x) => s + x.kbd, 0);
  return {
    champs,
    raffineries,
    oleoducs,
    productionPays: (iso) => somme(parPaysC.get(iso)),
    raffinagePays: (iso) => somme(parPaysR.get(iso)),
    champsDuPays: (iso) => parPaysC.get(iso) ?? [],
    raffineriesDuPays: (iso) => parPaysR.get(iso) ?? []
  };
}
async function chargerPetrole(lire2) {
  const json = async (nom) => JSON.parse(new TextDecoder().decode(await lire2(nom)));
  return lirePetrole(await json("petrole-champs.json"), await json("petrole-raffineries.json"), await json("petrole-oleoducs.json"));
}

// web/src/donnees/prix.ts
function lirePrix(t) {
  for (const x of [
    ...t.batiments,
    ...t.unites,
    ...t.bombes
  ]) {
    if (!(x.prix > 0)) throw new Error(`prix invalide : ${x.id}`);
  }
  return t;
}
async function chargerPrix(lire2) {
  return lirePrix(JSON.parse(new TextDecoder().decode(await lire2("prix.json"))));
}
var prixBatiment = (t, id) => t.batiments.find((b) => b.id === id);
var prixUnite = (t, id) => t.unites.find((u) => u.id === id);

// web/src/sim/ressources.ts
var RECRUES = 0;
var BRUT = 1;
var CARBURANT = 2;
var MUNITIONS = 3;
var NB_PRODUITS = 4;
var PUITS = 0;
var RAFFINERIE = 1;
var USINE_MUNITIONS = 2;
var CASERNE = 3;
var USINE_CHARS = 4;
var USINE_ARTILLERIE = 5;
var USINE_AVIONS = 6;
var AEROPORT = 7;
var CHANTIER_NAVAL = 8;
var DEPOT = 9;
var DCA = 10;
var SILO = 11;
var PORT = 12;
var PARAMS = {
  /** ❓ Part de la production réelle de brut et du raffinage qui sert l'armée (le reste, civil, n'est pas simulé). */
  partMilitaire: 0.1,
  /** t/h de brut pour 1 kb/j (7,33 barils par tonne). */
  tonnesHeureParKbd: 1e3 / 7.33 / 24,
  /** tonnes de carburant par tonne de brut raffinée. */
  rendementRaffinerie: 0.9,
  /** ❓ Usine de munitions : tonnes par heure, et argent par tonne (« à l'argent », CONCEPTION). */
  munitionsTHeure: 10,
  argentParTonneMunitions: 2e5,
  /** ❓ Caserne : recrues appelées par jour (1 000 = un millier de soldats par jour de production, CONCEPTION). */
  recruesJourCaserne: 1e3,
  /** ❓ On n'appelle plus quand la population du pays est sous cette part de celle du départ. */
  planchePopulation: 0.5,
  /** ❓ Trésor de départ, en heures de recettes. */
  tresorDepartHeures: 720,
  /** ❓ Capacités par genre de site : [recrues, brut, carburant, munitions] ; les puits et raffineries : en heures de débit. */
  capaciteDepot: [
    1e5,
    0,
    5e4,
    2e4
  ],
  capacitePort: [
    0,
    2e6,
    2e6,
    2e6
  ],
  /** ❓ V2.C.2 : un aéroport est ravitaillé comme un dépôt (CONCEPTION « Air, mer et nucléaire »), une DCA en munitions. */
  capaciteAeroport: [
    0,
    0,
    2e4,
    1e4
  ],
  capaciteDca: [
    0,
    0,
    0,
    2e3
  ],
  /** ❓ Dépôts de départ : part de leur capacité déjà pleine en carburant et en munitions (réserves de l'armée). */
  remplissageDepart: 0.25,
  heuresStockPuits: 72,
  heuresStockRaffinerie: 72,
  heuresStockUsine: 24,
  recruesStockCaserne: 3e3
};
var SORTIE = new Int8Array(16).fill(-1);
SORTIE[PUITS] = BRUT, SORTIE[RAFFINERIE] = CARBURANT, SORTIE[USINE_MUNITIONS] = MUNITIONS, SORTIE[CASERNE] = RECRUES;
function agrandir2(t, cap) {
  const n = new t.constructor(cap);
  n.set(t);
  return n;
}
var IndexNoeuds = class _IndexNoeuds {
  noeuds;
  static CASE = 50;
  cases;
  constructor(noeuds, garder2) {
    this.noeuds = noeuds;
    this.cases = /* @__PURE__ */ new Map();
    for (let n = 0; n < noeuds.length / 2; n++) if (garder2(n)) this.caseDe(noeuds[2 * n], noeuds[2 * n + 1], true).push(n);
  }
  cle(cx, cy) {
    return (cx + 5e3) * 1e4 + (cy + 5e3);
  }
  caseDe(x, y, creer) {
    const k = this.cle(Math.floor(x / _IndexNoeuds.CASE), Math.floor(y / _IndexNoeuds.CASE));
    let c = this.cases.get(k);
    if (!c && creer) this.cases.set(k, c = []);
    return c;
  }
  /** Noeud le plus proche à moins de `maxKm` (km de carte), −1 sinon ; [noeud, distance]. */
  proche(x, y, maxKm) {
    const C2 = _IndexNoeuds.CASE, n = this.noeuds;
    const cx = Math.floor(x / C2), cy = Math.floor(y / C2);
    let best = -1, d2 = maxKm * maxKm;
    for (let r = 0; r * C2 <= maxKm + C2; r++) {
      if (best >= 0 && (r - 1) * C2 > Math.sqrt(d2)) break;
      for (let i = cx - r; i <= cx + r; i++) {
        for (let j = cy - r; j <= cy + r; j++) {
          if (Math.max(Math.abs(i - cx), Math.abs(j - cy)) !== r) continue;
          const c = this.cases.get(this.cle(i, j));
          if (!c) continue;
          for (const v of c) {
            const d = (n[2 * v] - x) ** 2 + (n[2 * v + 1] - y) ** 2;
            if (d < d2) d2 = d, best = v;
          }
        }
      }
    }
    return [
      best,
      Math.sqrt(d2)
    ];
  }
};
async function chargerDonneesRessources(lire2, reseau, depart, petrole, prix) {
  const pays = JSON.parse(new TextDecoder().decode(await lire2("monde-pays.json")));
  const idPays = new Map(pays.map((p) => [
    p.iso3,
    p.id
  ]));
  const iso3 = [];
  for (const p of pays) iso3[p.id] = p.iso3;
  const octets = await decompresser(await lire2("monde-villes.bin.z"));
  const n = reseau.vivantes.n, d = new DataView(octets);
  const villes = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    pop: new Uint32Array(n),
    pays: new Uint8Array(n),
    capitale: new Uint8Array(n)
  };
  for (let i = 0; i < n; i++) {
    const o = 14 * i;
    villes.x[i] = d.getFloat32(o, true), villes.y[i] = d.getFloat32(o + 4, true), villes.pop[i] = d.getUint32(o + 8, true);
    villes.pays[i] = d.getUint8(o + 12), villes.capitale[i] = d.getUint8(o + 13) >> 7;
  }
  const a = reseau.axes, estRail = new Uint8Array(a.nNoeuds), estRoute = new Uint8Array(a.nNoeuds);
  for (let e = 0; e < a.nAretes; e++) {
    const t = a.type[e] === 1 ? estRail : estRoute;
    t[a.a[e]] = 1, t[a.b[e]] = 1;
  }
  return {
    reseau,
    depart,
    petrole,
    prix,
    idPays,
    iso3,
    villes,
    route: new IndexNoeuds(a.noeuds, (v) => estRoute[v] === 1),
    rail: new IndexNoeuds(a.noeuds, (v) => estRail[v] === 1)
  };
}
var KM_RAIL = 60;
var Ressources = class {
  // ---- pays (indice = identifiant de monde-pays.json)
  tresor = new Float64Array(256);
  population = new Float64Array(256);
  populationDepart = new Float64Array(256);
  /** recettes de la dernière heure */
  recettes = new Float64Array(256);
  /** argent dépensé depuis le départ */
  depense = new Float64Array(256);
  /** camp vu du joueur (CAMP_*), pour le rendu */
  camp = new Uint8Array(256).fill(CAMP_NEUTRE);
  // ---- villes vivantes
  /** pays qui tient la ville (V2.C.4 la change par `prendreVille`) */
  proprietaire;
  /** part de la population du pays d'origine portée par la ville (les campagnes vont à la ville la plus proche) */
  poids;
  recettesAJour = false;
  /** augmente à chaque ville qui change de mains (territoire.ts ne cherche que lorsqu'il a bougé) */
  villesChangees = 0;
  baseRecettes = new Float64Array(256);
  // ---- sites (tableaux qui grandissent)
  n = 0;
  genre = new Uint8Array(1024);
  pays = new Uint8Array(1024);
  x = new Float32Array(1024);
  y = new Float32Array(1024);
  noeudRoute = new Int32Array(1024);
  kmRoute = new Float32Array(1024);
  noeudRail = new Int32Array(1024);
  kmRail = new Float32Array(1024);
  /** débit nominal (t/h ; recrues/h pour la caserne) */
  debit = new Float32Array(1024);
  /** 0 : en construction ou détruit (V2.C.2) */
  actif = new Uint8Array(1024);
  /** stock et capacité par produit : [site × 4 + produit] */
  stock = new Float64Array(4096);
  capacite = new Float32Array(4096);
  noms = [];
  /** augmente à chaque site ajouté ou changé : flux.ts relie les nouveaux */
  version = 0;
  // ---- bilans du jour (offre et demande du marché) : produit, consommé, par produit, pour le monde
  produitJour = new Float64Array(NB_PRODUITS);
  consommeJour = new Float64Array(NB_PRODUITS);
  produitTotal = new Float64Array(NB_PRODUITS);
  constructor(d, joueur) {
    Object.defineProperty(this, "d", {
      value: d,
      enumerable: false
    });
    const V = d.villes;
    this.proprietaire = V.pays.slice();
    this.poids = new Float32Array(V.n);
    const somme = new Float64Array(256);
    for (let i = 0; i < V.n; i++) somme[V.pays[i]] += V.pop[i];
    const jIso = d.iso3[joueur];
    for (const p of d.depart.pays) {
      const id = d.idPays.get(p.iso3);
      if (id === void 0) continue;
      this.population[id] = this.populationDepart[id] = p.population;
      this.camp[id] = id === joueur ? CAMP_JOUEUR : jIso && d.depart.allies(jIso, p.iso3) ? CAMP_ALLIE : CAMP_NEUTRE;
    }
    for (let i = 0; i < V.n; i++) {
      const p = V.pays[i];
      this.poids[i] = somme[p] > 0 ? this.populationDepart[p] * V.pop[i] / somme[p] : 0;
    }
    this.majRecettes();
    for (let p = 0; p < 256; p++) this.tresor[p] = this.baseRecettes[p] * PARAMS.tresorDepartHeures;
  }
  /** Sites de départ : champs (un Puits), raffineries, usines et casernes réelles ou posées par règle (V2.B.2). */
  poserSitesDeDepart() {
    const d = this.d, K = PARAMS.partMilitaire * PARAMS.tonnesHeureParKbd;
    for (const c of d.petrole.champs) {
      const id = d.idPays.get(c.iso3);
      if (id !== void 0) this.ajouter(PUITS, id, ...projeter(c.lon, c.lat), c.kbd * K, c.nom);
    }
    for (const r of d.petrole.raffineries) {
      const id = d.idPays.get(r.iso3);
      if (id !== void 0) this.ajouter(RAFFINERIE, id, ...projeter(r.lon, r.lat), r.kbd * K, r.nom);
    }
    const GENRES = {
      munitions: USINE_MUNITIONS,
      caserne: CASERNE,
      chars: USINE_CHARS,
      artillerie: USINE_ARTILLERIE,
      avions: USINE_AVIONS,
      chantier_naval: CHANTIER_NAVAL
    };
    for (const u of d.depart.usines) {
      const id = d.idPays.get(u.iso3);
      if (id !== void 0) this.ajouter(GENRES[u.type], id, ...projeter(u.lon, u.lat), 0, u.nom);
    }
  }
  /**
   * Ajoute un site (V2.C.2 : bâtiment construit). `debit` en t/h pour puits et raffinerie (brut) ; les autres prennent
   * leur débit par défaut quand il vaut 0. Rend son numéro. `noeud` impose le noeud de route (dépôt posé sur un axe).
   */
  ajouter(genre, pays, x, y, debit = 0, nom = "", noeud = -1) {
    const i = this.n;
    if (i >= this.genre.length) {
      const cap = 2 * this.genre.length;
      for (const k of [
        "genre",
        "pays",
        "x",
        "y",
        "noeudRoute",
        "kmRoute",
        "noeudRail",
        "kmRail",
        "debit",
        "actif"
      ]) {
        this[k] = agrandir2(this[k], cap);
      }
      this.stock = agrandir2(this.stock, 4 * cap), this.capacite = agrandir2(this.capacite, 4 * cap);
    }
    const ax = this.d.reseau.axes.noeuds;
    if (noeud >= 0) x = ax[2 * noeud], y = ax[2 * noeud + 1];
    const [nr, kr] = noeud >= 0 ? [
      noeud,
      0
    ] : this.d.route.proche(x, y, 3e3);
    const [nf, kf] = this.d.rail.proche(x, y, KM_RAIL);
    this.genre[i] = genre, this.pays[i] = pays, this.x[i] = x, this.y[i] = y;
    this.noeudRoute[i] = nr, this.kmRoute[i] = kr, this.noeudRail[i] = nf, this.kmRail[i] = nf >= 0 ? kf : 0;
    if (genre === USINE_MUNITIONS && !debit) debit = PARAMS.munitionsTHeure;
    if (genre === CASERNE && !debit) debit = PARAMS.recruesJourCaserne / 24;
    this.debit[i] = debit, this.actif[i] = 1;
    this.poserCapacites(i, genre, debit);
    this.noms[i] = nom;
    this.n++, this.version++;
    return i;
  }
  /** Capacités de stock d'un site selon son genre et son débit (× `facteur` : site doublé, V2.C.2). */
  poserCapacites(i, genre, debit, facteur = 1) {
    const c = 4 * i, cap = this.capacite;
    cap.fill(0, c, c + 4);
    if (genre === PUITS) cap[c + BRUT] = debit * PARAMS.heuresStockPuits;
    if (genre === RAFFINERIE) {
      cap[c + BRUT] = debit * PARAMS.heuresStockRaffinerie;
      cap[c + CARBURANT] = debit * PARAMS.rendementRaffinerie * PARAMS.heuresStockRaffinerie;
    }
    if (genre === USINE_MUNITIONS) cap[c + MUNITIONS] = debit * PARAMS.heuresStockUsine;
    if (genre === CASERNE) cap[c + RECRUES] = PARAMS.recruesStockCaserne * facteur;
    if (genre === DEPOT) cap.set(PARAMS.capaciteDepot, c);
    if (genre === PORT) cap.set(PARAMS.capacitePort, c);
    if (genre === AEROPORT) cap.set(PARAMS.capaciteAeroport, c);
    if (genre === DCA) cap.set(PARAMS.capaciteDca, c);
  }
  /** V2.C.2 : un site doublé (niveau 2) produit et stocke deux fois plus ; son stock actuel est gardé. */
  doubler(site2) {
    const g = this.genre[site2];
    this.debit[site2] *= 2;
    this.poserCapacites(site2, g, this.debit[site2], 2);
    this.version++;
  }
  /** Active ou arrête un site (construction finie, bâtiment détruit ou pris). */
  activer(site2, actif) {
    this.actif[site2] = actif ? 1 : 0;
    this.version++;
  }
  /** Km entre le site et son noeud (dernier tronçon, hors des grands axes). */
  acces(site2, rail) {
    return rail ? this.kmRail[site2] : this.kmRoute[site2];
  }
  // ------------------------------------------------------------------ argent et population
  /** Recettes par heure : chaque ville tenue rapporte sa part de la population de son pays d'origine. */
  majRecettes() {
    const b = this.baseRecettes, V = this.d.villes;
    b.fill(0);
    const facteur = new Float64Array(256);
    for (let p = 0; p < 256; p++) facteur[p] = this.populationDepart[p] > 0 ? this.population[p] / this.populationDepart[p] : 0;
    for (let i = 0; i < V.n; i++) b[this.proprietaire[i]] += this.poids[i] * facteur[V.pays[i]];
    this.recettesAJour = true;
  }
  /** V2.C.4 : la ville passe au pays `pays` ; son argent suit dès l'heure suivante. */
  prendreVille(ville, pays) {
    if (this.proprietaire[ville] === pays) return;
    this.proprietaire[ville] = pays;
    this.villesChangees++;
    this.recettesAJour = false;
  }
  /** Dépense sans dette : refusée (rien n'est pris) si le trésor ne suffit pas. */
  depenser(pays, montant) {
    if (!(montant >= 0) || this.tresor[pays] < montant) return false;
    this.tresor[pays] -= montant;
    this.depense[pays] += montant;
    return true;
  }
  /** Morts : retirés de la population du pays (et de ses recettes). */
  tues(pays, n) {
    this.population[pays] = Math.max(0, this.population[pays] - n);
    this.recettesAJour = false;
  }
  /** Prend jusqu'à `q` d'un produit dans un site ; rend ce qui a été pris (compté dans la demande du marché). */
  prendre(site2, produit, q) {
    const k = 4 * site2 + produit, pris = Math.max(0, Math.min(q, this.stock[k]));
    this.stock[k] -= pris;
    this.consommeJour[produit] += pris;
    return pris;
  }
  /**
   * Coût de création d'une unité (CONCEPTION « Ressources et flux ») : argent au trésor + carburant (et recrues pour les
   * soldats) pris au dépôt. Tout ou rien : rend false sans rien prendre s'il manque quoi que ce soit.
   */
  payerUnite(pays, depot2, u, nombre2 = 1) {
    const argent = u.prix * nombre2, carb = u.carburant_t * nombre2, rec = u.recrues * nombre2, k = 4 * depot2;
    if (this.tresor[pays] < argent || this.stock[k + CARBURANT] < carb || this.stock[k + RECRUES] < rec) return false;
    this.depenser(pays, argent);
    this.prendre(depot2, CARBURANT, carb);
    this.prendre(depot2, RECRUES, rec);
    return true;
  }
  /**
   * Ce que tous les sites actifs du monde peuvent produire en un jour (offre du marché). C'est la capacité et non la
   * production faite : plein, un site s'arrête, et une production tombée à zéro faute de place ferait flamber le prix.
   */
  capaciteJour(produit) {
    let s = 0;
    for (let i = 0; i < this.n; i++) {
      if (!this.actif[i] || SORTIE[this.genre[i]] !== produit) continue;
      s += this.genre[i] === RAFFINERIE ? this.debit[i] * PARAMS.rendementRaffinerie : this.debit[i];
    }
    return 24 * s;
  }
  /** Total d'un produit dans les sites d'un pays (genre −1 : tous les genres). */
  total(pays, produit, genre = -1) {
    let s = 0;
    for (let i = 0; i < this.n; i++) if (this.pays[i] === pays && (genre < 0 || this.genre[i] === genre)) s += this.stock[4 * i + produit];
    return s;
  }
  /** Sites d'un genre (et d'un pays, −1 : tous). */
  sites(genre, pays = -1) {
    const r = [];
    for (let i = 0; i < this.n; i++) if (this.genre[i] === genre && (pays < 0 || this.pays[i] === pays)) r.push(i);
    return r;
  }
  // ------------------------------------------------------------------ chaque heure
  heure() {
    if (!this.recettesAJour) this.majRecettes();
    for (let p = 0; p < 256; p++) {
      const r = this.baseRecettes[p];
      this.recettes[p] = r;
      this.tresor[p] += r;
    }
    const st = this.stock, cap = this.capacite, P = PARAMS;
    for (let i = 0; i < this.n; i++) {
      if (!this.actif[i]) continue;
      const k = 4 * i, g = this.genre[i];
      if (g === PUITS) {
        const q = Math.min(this.debit[i], cap[k + BRUT] - st[k + BRUT]);
        if (q > 0) st[k + BRUT] += q, this.produitJour[BRUT] += q;
      } else if (g === RAFFINERIE) {
        const r = P.rendementRaffinerie;
        const q = Math.min(this.debit[i], st[k + BRUT], (cap[k + CARBURANT] - st[k + CARBURANT]) / r);
        if (q > 0) {
          st[k + BRUT] -= q, st[k + CARBURANT] += q * r;
          this.consommeJour[BRUT] += q, this.produitJour[CARBURANT] += q * r;
        }
      } else if (g === USINE_MUNITIONS) {
        const p = this.pays[i];
        const q = Math.min(this.debit[i], cap[k + MUNITIONS] - st[k + MUNITIONS], this.tresor[p] / P.argentParTonneMunitions);
        if (q > 0) {
          this.depenser(p, q * P.argentParTonneMunitions);
          st[k + MUNITIONS] += q, this.produitJour[MUNITIONS] += q;
        }
      } else if (g === CASERNE) {
        const p = this.pays[i];
        const libre = this.population[p] - P.planchePopulation * this.populationDepart[p];
        const q = Math.floor(Math.min(this.debit[i], cap[k + RECRUES] - st[k + RECRUES], libre) * 1e3) / 1e3;
        if (q > 0) {
          this.population[p] -= q;
          st[k + RECRUES] += q, this.produitJour[RECRUES] += q;
          this.recettesAJour = false;
        }
      }
    }
  }
  /** Fin de journée : bilans remis à zéro par le marché (marche.ts), recettes recalculées (population changée). */
  finJournee() {
    for (let p = 0; p < NB_PRODUITS; p++) this.produitTotal[p] += this.produitJour[p];
    this.produitJour.fill(0);
    this.consommeJour.fill(0);
    this.recettesAJour = false;
  }
  systemes() {
    return [
      {
        nom: "ressources",
        periode: HEURE,
        executer: () => this.heure(),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  /** Système de fin de journée (ajouté après le marché par le registre). */
  systemeFinJournee() {
    return {
      nom: "ressources : fin de journ\xE9e",
      periode: JOUR,
      executer: (_m) => this.finJournee()
    };
  }
  empreinte(h) {
    let s = 0;
    for (let p = 0; p < 256; p += 3) s += this.tresor[p] * 1e-9 + this.population[p] * 1e-3;
    for (let i = 0; i < 4 * this.n; i += 7) s += this.stock[i];
    return melanger(h, Math.round(s) | 0);
  }
  /** Bâtiments à dessiner (le port d'arrivée n'en est pas un). */
  rendu(c) {
    for (let i = 0; i < this.n; i++) {
      if (this.genre[i] < PORT && this.actif[i]) {
        c.batiment(this.x[i], this.y[i], this.genre[i], this.camp[this.pays[i]], this.niveauSite?.(i) ?? 1);
      }
    }
  }
};

// web/src/sim/flux.ts
var L_ROUTE = 0;
var L_RAIL = 1;
var L_MER = 2;
var L_OLEODUC = 3;
var PARAMS2 = {
  /** ❓ Portée d'un dépôt le long du réseau (CONCEPTION). */
  porteeDepotKm: 300,
  /** vitesses (km/h) : camion, train, navire (cargo et pétrolier) */
  kmh: [
    80,
    100,
    28
  ],
  /** ❓ débit d'une liaison selon la plus petite classe d'axe traversée (1 secondaire … 3 grand axe) */
  camionsHeure: [
    0,
    100,
    200,
    400
  ],
  trainsHeure: [
    0,
    2,
    4,
    6
  ],
  camionT: 25,
  trainT: 1500,
  navireT: 1e5,
  /** ❓ débit d'une liaison maritime (t/h) */
  merTHeure: 2e4,
  /** envoi minimal par mode (t) : en dessous, le site attend d'en avoir plus */
  minEnvoi: [
    25,
    25,
    2e3,
    0
  ],
  /** ❓ place d'une recrue dans un véhicule (t) */
  recrueT: 0.1,
  /** écart de remplissage au-delà duquel un dépôt envoie à son voisin */
  ecartDepots: 0.1,
  raffineriesParPuits: 2,
  kmMaxPuits: 3e3,
  /** un oléoduc relie un puits et une raffinerie qui sont tous deux à moins de cette distance de son tracé (km) */
  kmOleoduc: 60,
  /** pétrolier : puits et raffinerie à moins de cette distance d'un port du pays (km) */
  kmPortPetrole: 200,
  /** rail choisi s'il n'est pas plus long que la route × ce facteur */
  facteurRail: 1.2
};
var ENVOIE = [];
ENVOIE[PUITS] = [
  BRUT
], ENVOIE[RAFFINERIE] = [
  CARBURANT
], ENVOIE[USINE_MUNITIONS] = [
  MUNITIONS
];
ENVOIE[CASERNE] = [
  RECRUES
], ENVOIE[DEPOT] = [
  RECRUES,
  CARBURANT,
  MUNITIONS
], ENVOIE[PORT] = [
  CARBURANT,
  MUNITIONS,
  BRUT
];
var CONSO = [];
CONSO[AEROPORT] = [
  CARBURANT,
  MUNITIONS
], CONSO[DCA] = [
  MUNITIONS
];
var poids = (p) => p === RECRUES ? PARAMS2.recrueT : 1;
var Parcours = class {
  g;
  dist;
  pere;
  marque;
  fixe;
  tour;
  tc;
  tv;
  constructor(g) {
    this.g = g;
    this.tour = 0;
    this.tc = [];
    this.tv = [];
    this.dist = new Float64Array(g.n), this.pere = new Int32Array(g.n), this.marque = new Uint32Array(g.n);
    this.fixe = new Uint32Array(g.n);
  }
  d(v) {
    return this.marque[v] === this.tour ? this.dist[v] : Infinity;
  }
  /** Noeuds fixés dans l'ordre des distances ; `arret(v, d)` vrai = on s'arrête là. */
  lancer(sources, maxKm, libre, arret) {
    const g = this.g, dist2 = this.dist, pere = this.pere, marque = this.marque, tc = this.tc, tv = this.tv;
    const t = ++this.tour;
    tc.length = 0, tv.length = 0;
    const fixes = [];
    for (const s of sources) {
      if (s < 0 || marque[s] === t && dist2[s] === 0) continue;
      marque[s] = t, dist2[s] = 0, pere[s] = -1;
      this.pousser(0, s);
    }
    const fixe = this.fixe;
    while (tc.length) {
      const [d, u] = this.retirer();
      if (d > dist2[u] || fixe[u] === t) continue;
      fixe[u] = t;
      fixes.push(u);
      if (arret?.(u, d)) break;
      for (let i = g.debut[u]; i < g.debut[u + 1]; i++) {
        const e = g.arete[i];
        if (!libre(e)) continue;
        const w = g.a[e] === u ? g.b[e] : g.a[e];
        const nd = d + g.km[e];
        if (nd > maxKm) continue;
        if (marque[w] !== t || nd < dist2[w]) {
          marque[w] = t, dist2[w] = nd, pere[w] = e;
          this.pousser(nd, w);
        }
      }
    }
    return fixes;
  }
  /** Arêtes et noeuds du chemin de la source jusqu'à v (dans l'ordre). */
  chemin(v) {
    const g = this.g, aretes = [], noeuds = [
      v
    ];
    while (this.pere[v] >= 0) {
      const e = this.pere[v];
      aretes.push(e);
      v = g.a[e] === v ? g.b[e] : g.a[e];
      noeuds.push(v);
    }
    return {
      aretes: aretes.reverse(),
      noeuds: noeuds.reverse()
    };
  }
  pousser(c, v) {
    const tc = this.tc, tv = this.tv;
    let i = tc.length;
    tc.push(c), tv.push(v);
    while (i > 0) {
      const p = i - 1 >> 1;
      if (tc[p] <= c) break;
      tc[i] = tc[p], tv[i] = tv[p];
      i = p;
    }
    tc[i] = c, tv[i] = v;
  }
  retirer() {
    const tc = this.tc, tv = this.tv, c0 = tc[0], v0 = tv[0];
    const c = tc.pop(), v = tv.pop(), n = tc.length;
    if (n) {
      let i = 0;
      for (; ; ) {
        let f = 2 * i + 1;
        if (f >= n) break;
        if (f + 1 < n && tc[f + 1] < tc[f]) f++;
        if (tc[f] >= c) break;
        tc[i] = tc[f], tv[i] = tv[f];
        i = f;
      }
      tc[i] = c, tv[i] = v;
    }
    return [
      c0,
      v0
    ];
  }
};
var Flux = class {
  // ---- liaisons
  nL = 0;
  lSrc = new Int32Array(1024);
  lDst = new Int32Array(1024);
  lProduit = new Uint8Array(1024);
  lMode = new Uint8Array(1024);
  lTrajet = new Int32Array(1024);
  /** 1 : le trajet va de la source à la destination ; −1 : à l'envers (dépôts entre eux) */
  lSens = new Int8Array(1024);
  /** longueur (km sur le globe, derniers tronçons compris) et débit (t/h) */
  lKm = new Float32Array(1024);
  lCap = new Float32Array(1024);
  lOuverte = new Uint8Array(1024);
  /** arêtes de l'itinéraire (des axes, ou de la mer) : chemins[lDeb … lFin] */
  lDeb = new Uint32Array(1024);
  lFin = new Uint32Array(1024);
  chemins = new Int32Array(1 << 16);
  nChemins = 0;
  /** liaisons sortantes de chaque site */
  sortantes = [];
  /** paires déjà reliées (src, dst, produit) */
  paires = /* @__PURE__ */ new Set();
  /** sites déjà reliés (les suivants le sont au pas suivant) */
  relies = 0;
  /** reroutages faits (pour des clés de trajets uniques) */
  reroutes = 0;
  // ---- convois
  nC = 0;
  cL = new Int32Array(4096);
  cDst = new Int32Array(4096);
  cTrajet = new Uint32Array(4096);
  cT = new Float32Array(4096);
  cDt = new Float32Array(4096);
  cQ = new Float32Array(4096);
  cSorte = new Uint8Array(4096);
  cProduit = new Uint8Array(4096);
  cActif = new Uint8Array(4096);
  libres = [];
  /** quantité en route vers chaque site : [site × 4 + produit] */
  enRoute = new Float64Array(4096);
  // ---- coupures
  coupees;
  /** V2.C.2 : 1 ou 2 par arête des axes (2 : axe doublé, débit ×2) */
  niveauAxe;
  /** masque des passages maritimes fermés */
  fermes = 0;
  aRevoir = false;
  // ---- bilans
  livre = new Float64Array(4);
  convoisPartis = 0;
  constructor(res, trajets) {
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "d", {
      value: res.d,
      enumerable: false
    });
    Object.defineProperty(this, "trajets", {
      value: trajets,
      enumerable: false
    });
    this.coupees = new Uint8Array(res.d.reseau.axes.nAretes);
    this.niveauAxe = new Uint8Array(res.d.reseau.axes.nAretes).fill(1);
    this.caches();
  }
  /** Caches (créés à la construction ; les sites ajoutés en jouant y entrent au besoin). */
  caches() {
    if (!this.c) {
      const r = this.d.reseau, a = r.axes, m = r.mer;
      const madj = adjacenceDe(m.n, m.a, m.b);
      const merGraphe = {
        n: m.n,
        a: m.a,
        b: m.b,
        km: m.km,
        debut: madj.debut,
        arete: madj.arete
      };
      const oleoducs = this.d.petrole.oleoducs.map((o) => Float32Array.from(o.lignes.flatMap((l) => {
        const s2 = [];
        for (let i = 1; i < l.length; i++) s2.push(l[i - 1][0], l[i - 1][1], l[i][0], l[i][1]);
        return s2;
      })));
      Object.defineProperty(this, "c", {
        value: {
          route: new Parcours({
            n: a.nNoeuds,
            a: a.a,
            b: a.b,
            km: a.km,
            debut: r.adjacence.debut,
            arete: r.adjacence.arete
          }),
          mer: new Parcours(merGraphe),
          merGraphe,
          parNoeud: [
            /* @__PURE__ */ new Map(),
            /* @__PURE__ */ new Map()
          ],
          nSites: -1,
          oleoducs
        },
        enumerable: false,
        writable: true
      });
    }
    const c = this.c, s = this.res;
    if (c.nSites !== s.n) {
      c.parNoeud = [
        /* @__PURE__ */ new Map(),
        /* @__PURE__ */ new Map()
      ];
      for (let i = 0; i < s.n; i++) {
        for (const [k, nd] of [
          [
            0,
            s.noeudRoute[i]
          ],
          [
            1,
            s.noeudRail[i]
          ]
        ]) {
          if (nd < 0) continue;
          const l = c.parNoeud[k].get(nd);
          if (l) l.push(i);
          else c.parNoeud[k].set(nd, [
            i
          ]);
        }
      }
      c.nSites = s.n;
    }
    return c;
  }
  // ------------------------------------------------------------------ dépôts de départ
  /**
   * Dépôts de départ : un à la capitale de chaque pays, puis un sur le noeud de chaque raffinerie, usine ou caserne de
   * départ qui n'a pas encore de dépôt à portée par la route (dans l'ordre : raffineries, usines, casernes).
   */
  poserDepotsDeDepart() {
    const s = this.res, V = this.d.villes, P = PARAMS2.porteeDepotKm;
    const parcours = this.caches().route, a = this.d.reseau.axes;
    const route = (e) => a.type[e] === 0;
    const capitale = new Int32Array(256).fill(-1);
    for (let i = 0; i < V.n; i++) {
      const p = V.pays[i];
      const c = capitale[p];
      if (c < 0 || V.capitale[i] && !V.capitale[c]) capitale[p] = i;
    }
    const couverts = /* @__PURE__ */ new Map();
    const poser = (pays, noeud, nom) => {
      const i = s.ajouter(DEPOT, pays, 0, 0, 0, nom, noeud);
      for (const p of [
        CARBURANT,
        MUNITIONS
      ]) s.stock[4 * i + p] = PARAMS.remplissageDepart * s.capacite[4 * i + p];
      let c = couverts.get(pays);
      if (!c) couverts.set(pays, c = /* @__PURE__ */ new Set());
      for (const v of parcours.lancer([
        noeud
      ], P, route)) c.add(v);
    };
    for (let p = 0; p < 256; p++) {
      if (!(s.populationDepart[p] > 0) || capitale[p] < 0) continue;
      const [n] = this.d.route.proche(V.x[capitale[p]], V.y[capitale[p]], 3e3);
      if (n >= 0) poser(p, n, "D\xE9p\xF4t de la capitale");
    }
    const ORDRE = [
      RAFFINERIE,
      USINE_MUNITIONS,
      4,
      5,
      6,
      8,
      CASERNE
    ];
    const nDepart = s.n;
    for (const g of ORDRE) {
      for (let i = 0; i < nDepart; i++) {
        if (s.genre[i] !== g || s.noeudRoute[i] < 0) continue;
        if (couverts.get(s.pays[i])?.has(s.noeudRoute[i])) continue;
        poser(s.pays[i], s.noeudRoute[i], `D\xE9p\xF4t (${s.noms[i]})`);
      }
    }
  }
  // ------------------------------------------------------------------ liaisons
  /** Relie les sites ajoutés depuis la dernière fois. */
  relierNouveaux() {
    const s = this.res;
    if (this.relies >= s.n) return;
    this.caches();
    const debut = this.relies;
    this.relies = s.n;
    for (let i = debut; i < s.n; i++) {
      this.sortantes[i] ??= [];
      const g = s.genre[i];
      if (g === PUITS) this.relierPuits(i);
      else if (g === DEPOT) this.relierAutour(i, true);
      else if (ENVOIE[g]) this.relierAutour(i, false);
      else if (CONSO[g]) this.relierAutour(i, false, true);
      if (g === RAFFINERIE && debut > 0) {
        for (let k = 0; k < debut; k++) {
          if (s.pays[k] !== s.pays[i]) continue;
          if (s.genre[k] === PUITS) this.relierPuits(k);
          if (s.genre[k] === PORT) this.relierAutour(k, false);
        }
      }
    }
    if (this.enRoute.length < 4 * s.n) this.enRoute = agrandir2(this.enRoute, Math.max(4 * s.n, 2 * this.enRoute.length));
  }
  /**
   * Dépôt (`depot` vrai) : relie les sources à portée vers lui et les dépôts voisins dans les deux sens.
   * Source : la relie aux dépôts à portée. Route et rail cherchés tous deux, le rail gardé s'il n'est pas bien plus long.
   */
  relierAutour(site2, depot2, conso = false) {
    const s = this.res, P = PARAMS2.porteeDepotKm, pays = s.pays[site2];
    const trouves = /* @__PURE__ */ new Map();
    for (const mode of [
      L_ROUTE,
      L_RAIL
    ]) {
      const depart = mode === L_RAIL ? s.noeudRail[site2] : s.noeudRoute[site2];
      if (depart < 0) continue;
      const parcours = this.c.route, a = this.d.reseau.axes, coupees = this.coupees;
      const fixes = parcours.lancer([
        depart
      ], P, (e) => a.type[e] === mode && !coupees[e]);
      for (const v of fixes) {
        for (const j of this.c.parNoeud[mode].get(v) ?? []) {
          if (j === site2 || s.pays[j] !== pays) continue;
          const g = s.genre[j];
          const bon = conso ? g === DEPOT : depot2 ? ENVOIE[g] && g !== PUITS || !!CONSO[g] : g === DEPOT || g === RAFFINERIE && s.genre[site2] === PORT;
          if (!bon) continue;
          const km = parcours.d(v);
          const deja = trouves.get(j);
          if (deja && (mode === L_ROUTE || km > deja.km * PARAMS2.facteurRail)) continue;
          trouves.set(j, {
            km,
            mode,
            ...parcours.chemin(v)
          });
        }
      }
    }
    for (const [j, t] of trouves) {
      if (conso || depot2 && CONSO[s.genre[j]]) {
        const [src, dst] = conso ? [
          j,
          site2
        ] : [
          site2,
          j
        ];
        const noeuds = conso ? t.noeuds.slice().reverse() : t.noeuds, aretes = conso ? t.aretes.slice().reverse() : t.aretes;
        const tr = this.trajet(`l:${src}-${dst}:${t.mode}`, t.mode, noeuds, t.km + s.acces(src, t.mode === L_RAIL) + s.acces(dst, t.mode === L_RAIL));
        for (const p of CONSO[s.genre[dst]]) this.lier(src, dst, p, t.mode, tr, 1, aretes);
      } else if (depot2 && s.genre[j] === DEPOT) {
        const [u, w] = site2 < j ? [
          site2,
          j
        ] : [
          j,
          site2
        ];
        const noeuds = site2 < j ? t.noeuds : t.noeuds.slice().reverse(), aretes = site2 < j ? t.aretes : t.aretes.slice().reverse();
        const tr = this.trajet(`d:${u}-${w}:${t.mode}`, t.mode, noeuds, t.km + s.acces(u, t.mode === L_RAIL) + s.acces(w, t.mode === L_RAIL));
        for (const p of [
          RECRUES,
          CARBURANT,
          MUNITIONS
        ]) {
          this.lier(u, w, p, t.mode, tr, 1, aretes);
          this.lier(w, u, p, t.mode, tr, -1, aretes);
        }
      } else {
        const [src, dst] = depot2 ? [
          j,
          site2
        ] : [
          site2,
          j
        ];
        const noeuds = depot2 ? t.noeuds.slice().reverse() : t.noeuds, aretes = depot2 ? t.aretes.slice().reverse() : t.aretes;
        const tr = this.trajet(`l:${src}-${dst}:${t.mode}`, t.mode, noeuds, t.km + s.acces(src, t.mode === L_RAIL) + s.acces(dst, t.mode === L_RAIL));
        for (const p of ENVOIE[s.genre[src]]) {
          if (p === BRUT === (s.genre[dst] === RAFFINERIE)) this.lier(src, dst, p, t.mode, tr, 1, aretes);
        }
      }
    }
  }
  /** Puits → les raffineries les plus proches du pays : oléoduc, sinon rail ou route, sinon pétrolier. */
  relierPuits(puits) {
    const s = this.res, pays = s.pays[puits], K = PARAMS2.raffineriesParPuits;
    const raff = s.sites(RAFFINERIE, pays).filter((r) => !this.paires.has(this.cle(puits, r, BRUT)));
    if (!raff.length) return;
    let lies = 0;
    const [plon, plat] = inverser(s.x[puits], s.y[puits]);
    for (const tr of this.c.oleoducs) {
      if (lies >= K || distanceTrace(tr, plon, plat) > PARAMS2.kmOleoduc) continue;
      for (const r of raff) {
        if (lies >= K || this.paires.has(this.cle(puits, r, BRUT))) continue;
        const [rlon, rlat] = inverser(s.x[r], s.y[r]);
        if (distanceTrace(tr, rlon, rlat) > PARAMS2.kmOleoduc) continue;
        const i = this.c.oleoducs.indexOf(tr), o = this.d.petrole.oleoducs[i];
        const l = this.lier(puits, r, BRUT, L_OLEODUC, -1, 1, []);
        if (l < 0) continue;
        this.lKm[l] = 1.2 * distanceGlobeKm(plon, plat, rlon, rlat);
        this.lCap[l] = o.kbd * PARAMS.partMilitaire * PARAMS.tonnesHeureParKbd;
        lies++;
      }
    }
    const cand = [];
    const visees = new Set(raff.filter((r) => !this.paires.has(this.cle(puits, r, BRUT))));
    for (const mode of [
      L_RAIL,
      L_ROUTE
    ]) {
      const depart = mode === L_RAIL ? s.noeudRail[puits] : s.noeudRoute[puits];
      if (depart < 0 || lies >= K) continue;
      const cibles = /* @__PURE__ */ new Map();
      for (const r of visees) {
        const n = mode === L_RAIL ? s.noeudRail[r] : s.noeudRoute[r];
        if (n >= 0) cibles.set(n, [
          ...cibles.get(n) ?? [],
          r
        ]);
      }
      if (!cibles.size) continue;
      let vus = 0;
      const a = this.d.reseau.axes, coupees = this.coupees, parcours = this.c.route;
      parcours.lancer([
        depart
      ], PARAMS2.kmMaxPuits, (e) => a.type[e] === mode && !coupees[e], (v) => {
        const l = cibles.get(v);
        if (!l) return false;
        for (const r of l) cand.push({
          r,
          km: parcours.d(v),
          mode,
          ...parcours.chemin(v)
        });
        vus += l.length;
        return vus >= K;
      });
    }
    const meilleur = /* @__PURE__ */ new Map();
    for (const c of cand) {
      const m = meilleur.get(c.r);
      if (!m || (c.mode === L_RAIL ? c.km <= m.km * PARAMS2.facteurRail : c.km * PARAMS2.facteurRail < m.km)) meilleur.set(c.r, c);
    }
    for (const c of [
      ...meilleur.values()
    ].sort((x, y) => x.km - y.km || x.r - y.r)) {
      if (lies >= K) break;
      const tr = this.trajet(`l:${puits}-${c.r}:${c.mode}`, c.mode, c.noeuds, c.km + s.acces(puits, c.mode === L_RAIL) + s.acces(c.r, c.mode === L_RAIL));
      this.lier(puits, c.r, BRUT, c.mode, tr, 1, c.aretes);
      lies++;
    }
    if (lies === 0) {
      const pp = this.portProche(puits), r = raff.map((x) => [
        x,
        this.portProche(x)
      ]).find(([, p]) => p >= 0 && p !== pp);
      if (pp >= 0 && r) this.lierMer(puits, r[0], BRUT, pp, r[1]);
    }
  }
  /** Port du même pays, ouvert sur la mer, le plus proche d'un site (−1 au-delà de `kmPortPetrole`). */
  portProche(site2) {
    const s = this.res, P = this.d.reseau.ports;
    let best = -1, d2 = PARAMS2.kmPortPetrole ** 2;
    for (let i = 0; i < P.n; i++) {
      if (P.mer[i] < 0 || P.pays[i] !== s.pays[site2]) continue;
      const d = (P.x[i] - s.x[site2]) ** 2 + (P.y[i] - s.y[site2]) ** 2;
      if (d < d2) d2 = d, best = i;
    }
    return best;
  }
  /** V2.C.3 : sites rattachés à un noeud de route (les dépôts où les groupes se forment et rentrent). */
  sitesSurNoeud(v) {
    return this.caches().parNoeud[0].get(v) ?? [];
  }
  /** Dijkstra de la mer (tampons partagés, pour le marché). */
  get parcoursMer() {
    return this.caches().mer;
  }
  /** Itinéraire maritime entre deux ports (passages fermés évités) ; null s'il n'y en a pas. */
  itineraireMer(p, q) {
    const P = this.d.reseau.ports, m = this.d.reseau.mer, fermes = this.fermes, parcours = this.c.mer;
    const but = P.mer[q];
    parcours.lancer([
      P.mer[p]
    ], Infinity, (e) => !(m.masque[e] & fermes), (v) => v === but);
    if (!isFinite(parcours.d(but))) return null;
    return {
      km: parcours.d(but) + P.kmMer[p] + P.kmMer[q],
      ...parcours.chemin(but)
    };
  }
  /** Liaison maritime src → dst par les ports p et q (pétrolier ou cargo). */
  lierMer(src, dst, produit, p, q) {
    const it = this.itineraireMer(p, q);
    if (!it) return -1;
    const P = this.d.reseau.ports, s = this.res;
    const km = it.km + Math.hypot(P.x[p] - s.x[src], P.y[p] - s.y[src]) + Math.hypot(P.x[q] - s.x[dst], P.y[q] - s.y[dst]);
    const tr = this.trajets.ajouter(`m:${src}-${dst}:${this.reroutes}`, TRAJET_MER, polyligneMer(this.d.reseau.mer, it.noeuds, [
      s.x[src],
      s.y[src]
    ], [
      s.x[dst],
      s.y[dst]
    ]), km);
    const l = this.lier(src, dst, produit, L_MER, tr, 1, it.aretes);
    if (l < 0) return -1;
    this.lKm[l] = km;
    this.lPorts.set(l, [
      p,
      q
    ]);
    return l;
  }
  /** ports des liaisons maritimes (pour les refaire quand un passage ferme) */
  lPorts = /* @__PURE__ */ new Map();
  trajet(cle5, mode, noeuds, km) {
    const a = this.d.reseau.axes, r = this.d.reseau.adjacence;
    const bit = mode === L_RAIL ? 2 : 1;
    return this.trajets.ajouter(cle5, mode === L_RAIL ? TRAJET_RAIL : TRAJET_ROUTE, polyligneAxes(a, r, noeuds, bit), km);
  }
  cle(src, dst, p) {
    return (src * 1e6 + dst) * 4 + p;
  }
  /** Nouvelle liaison ; rend son numéro. */
  lier(src, dst, produit, mode, trajet, sens, aretes) {
    if (this.paires.has(this.cle(src, dst, produit))) return -1;
    const l = this.nL;
    if (l >= this.lSrc.length) {
      const cap = 2 * this.lSrc.length;
      this.lSrc = agrandir2(this.lSrc, cap), this.lDst = agrandir2(this.lDst, cap), this.lProduit = agrandir2(this.lProduit, cap);
      this.lMode = agrandir2(this.lMode, cap), this.lTrajet = agrandir2(this.lTrajet, cap);
      this.lSens = agrandir2(this.lSens, cap);
      this.lKm = agrandir2(this.lKm, cap), this.lCap = agrandir2(this.lCap, cap), this.lOuverte = agrandir2(this.lOuverte, cap);
      this.lDeb = agrandir2(this.lDeb, cap), this.lFin = agrandir2(this.lFin, cap);
    }
    this.lSrc[l] = src, this.lDst[l] = dst, this.lProduit[l] = produit, this.lMode[l] = mode, this.lTrajet[l] = trajet;
    this.lSens[l] = sens, this.lOuverte[l] = 1;
    this.poserChemin(l, aretes);
    this.lKm[l] = trajet >= 0 ? this.trajets.kmGlobe[trajet] : 0;
    this.lCap[l] = this.debitDe(mode, aretes);
    this.nL++;
    (this.sortantes[src] ??= []).push(l);
    this.paires.add(this.cle(src, dst, produit));
    return l;
  }
  poserChemin(l, aretes) {
    if (this.nChemins + aretes.length > this.chemins.length) {
      this.chemins = agrandir2(this.chemins, Math.max(2 * this.chemins.length, this.nChemins + aretes.length));
    }
    this.chemins.set(aretes, this.nChemins);
    this.lDeb[l] = this.nChemins;
    this.nChemins += aretes.length;
    this.lFin[l] = this.nChemins;
  }
  /** Débit (t/h) selon la plus petite classe d'axe traversée. */
  debitDe(mode, aretes) {
    if (mode === L_MER) return PARAMS2.merTHeure;
    if (mode === L_OLEODUC) return 0;
    const un = (classe) => mode === L_RAIL ? PARAMS2.trainsHeure[classe] * PARAMS2.trainT : PARAMS2.camionsHeure[classe] * PARAMS2.camionT;
    let cap = un(3);
    for (let i = 0; i < aretes.length; i++) {
      const e = aretes[i];
      cap = Math.min(cap, un(this.d.reseau.axes.classe[e] || 1) * this.niveauAxe[e]);
    }
    return cap;
  }
  /**
   * V2.C.2 : plus court chemin d'un noeud à un autre sur les axes d'un mode (route ou rail), coupures évitées, borné en
   * km ; null s'il n'y en a pas.
   */
  cheminAxes(mode, de, vers, maxKm) {
    const a = this.d.reseau.axes, coupees = this.coupees, parcours = this.caches().route;
    parcours.lancer([
      de
    ], maxKm, (e) => a.type[e] === mode && !coupees[e], (v) => v === vers);
    if (!isFinite(parcours.d(vers))) return null;
    return {
      km: parcours.d(vers),
      ...parcours.chemin(vers)
    };
  }
  /** V2.C.2 : double le débit de ces arêtes (route ou rail) ; les liaisons qui les empruntent en profitent aussitôt. */
  doublerAretes(aretes) {
    for (const e of aretes) this.niveauAxe[e] = 2;
    for (let l = 0; l < this.nL; l++) {
      const m = this.lMode[l];
      if (m === L_ROUTE || m === L_RAIL) this.lCap[l] = this.debitDe(m, this.chemins.subarray(this.lDeb[l], this.lFin[l]));
    }
  }
  // ------------------------------------------------------------------ coupures
  /** Coupe (ou rouvre) une arête des axes : pont détruit, ville prise, axe bombardé. */
  couper(arete, coupe = true) {
    if (this.coupees[arete] === 1 === coupe) return;
    this.coupees[arete] = coupe ? 1 : 0;
    this.aRevoir = true;
  }
  /** Coupe toutes les arêtes qui touchent un noeud (ville prise, carrefour détruit). */
  couperNoeud(noeud, coupe = true) {
    const adj = this.d.reseau.adjacence;
    for (let i = adj.debut[noeud]; i < adj.debut[noeud + 1]; i++) this.couper(adj.arete[i], coupe);
  }
  /** Ferme (ou rouvre) un passage maritime de V2.B.1 (« suez », « ormuz »…). */
  fermerPassage(id, ferme = true) {
    const bit = this.d.reseau.mer.fermeture([
      id
    ]);
    const avant = this.fermes;
    this.fermes = ferme ? this.fermes | bit : this.fermes & ~bit;
    if (this.fermes !== avant) this.aRevoir = true;
  }
  bloquee(l) {
    const m = this.lMode[l];
    if (m === L_OLEODUC) return false;
    const masque = this.d.reseau.mer.masque;
    for (let i = this.lDeb[l]; i < this.lFin[l]; i++) {
      const e = this.chemins[i];
      if (m === L_MER ? masque[e] & this.fermes : this.coupees[e]) return true;
    }
    return false;
  }
  /** Après une coupure : chaque liaison touchée prend un autre chemin à portée, sinon se ferme ; les rouvertes repartent. */
  revoir() {
    this.aRevoir = false;
    const s = this.res, a = this.d.reseau.axes;
    const refaits = /* @__PURE__ */ new Map();
    for (let l = 0; l < this.nL; l++) {
      if (!this.bloquee(l)) {
        this.lOuverte[l] = 1;
        continue;
      }
      const src = this.lSrc[l], dst = this.lDst[l], m = this.lMode[l];
      const cle5 = Math.min(src, dst) * 1e6 + Math.max(src, dst);
      const deja = refaits.get(cle5);
      if (deja !== void 0) {
        if (this.lOuverte[deja] && this.lTrajet[deja] >= 0) {
          this.lTrajet[l] = this.lTrajet[deja], this.lSens[l] = this.lSrc[deja] === src ? this.lSens[deja] : -this.lSens[deja];
          this.lDeb[l] = this.lDeb[deja], this.lFin[l] = this.lFin[deja], this.lKm[l] = this.lKm[deja], this.lCap[l] = this.lCap[deja];
          this.lOuverte[l] = 1;
        } else this.lOuverte[l] = 0;
        continue;
      }
      refaits.set(cle5, l);
      this.reroutes++;
      if (m === L_MER) {
        const pq = this.lPorts.get(l);
        const it = pq ? this.itineraireMer(pq[0], pq[1]) : null;
        if (!it) {
          this.lOuverte[l] = 0;
          continue;
        }
        this.lTrajet[l] = this.trajets.ajouter(`m:${src}-${dst}:${this.reroutes}`, TRAJET_MER, polyligneMer(this.d.reseau.mer, it.noeuds, [
          s.x[src],
          s.y[src]
        ], [
          s.x[dst],
          s.y[dst]
        ]), it.km);
        this.lSens[l] = 1, this.lKm[l] = it.km, this.lOuverte[l] = 1;
        this.poserChemin(l, it.aretes);
        continue;
      }
      const rail = m === L_RAIL, de = rail ? s.noeudRail[src] : s.noeudRoute[src], vers = rail ? s.noeudRail[dst] : s.noeudRoute[dst];
      const max = s.genre[src] === PUITS ? PARAMS2.kmMaxPuits : PARAMS2.porteeDepotKm;
      const parcours = this.c.route, coupees = this.coupees;
      parcours.lancer([
        de
      ], max, (e) => a.type[e] === m && !coupees[e], (v) => v === vers);
      if (!isFinite(parcours.d(vers))) {
        this.lOuverte[l] = 0;
        continue;
      }
      const c = parcours.chemin(vers);
      const km = parcours.d(vers) + s.acces(src, rail) + s.acces(dst, rail);
      this.lTrajet[l] = this.trajet(`r:${src}-${dst}:${this.reroutes}`, m, c.noeuds, km);
      this.lSens[l] = 1, this.lKm[l] = km, this.lCap[l] = this.debitDe(m, c.aretes), this.lOuverte[l] = 1;
      this.poserChemin(l, c.aretes);
    }
  }
  // ------------------------------------------------------------------ chaque heure
  heure() {
    if (this.relies < this.res.n) this.relierNouveaux();
    if (this.aRevoir) this.revoir();
    this.avancer();
    this.envoyer();
  }
  /** Partage le stock de chaque site entre ses liaisons ouvertes, au prorata de la place au bout. */
  envoyer() {
    const s = this.res, st = s.stock, cap = s.capacite, er = this.enRoute, P = PARAMS2;
    const parts = [];
    for (let i = 0; i < s.n; i++) {
      const sort = this.sortantes[i];
      if (!sort || !sort.length || !s.actif[i]) continue;
      const depot2 = s.genre[i] === DEPOT;
      for (const p of ENVOIE[s.genre[i]]) {
        const k = 4 * i + p, dispo = st[k];
        if (dispo <= 0) continue;
        const w = poids(p), ratio = depot2 ? dispo / cap[k] : 0;
        let somme = 0;
        parts.length = 0;
        for (const l of sort) {
          let q = 0;
          const d = this.lDst[l], kd = 4 * d + p;
          if (this.lProduit[l] === p && this.lOuverte[l] && s.actif[d]) {
            q = Math.min(cap[kd] - st[kd] - er[kd], this.lCap[l] / w);
            if (depot2 && (s.genre[d] === DEPOT || CONSO[s.genre[d]])) {
              const rd = (st[kd] + er[kd]) / cap[kd];
              q = ratio - rd > P.ecartDepots ? Math.min(q, (ratio - rd) / 2 * cap[kd]) : 0;
            }
            if (!(q > 0)) q = 0;
          }
          parts.push(q);
          somme += q;
        }
        if (somme <= 0) continue;
        const f = Math.min(1, dispo / somme);
        for (let j = 0; j < sort.length; j++) {
          const q = parts[j] * f, l = sort[j];
          if (q <= 0 || q * w < P.minEnvoi[this.lMode[l]]) continue;
          st[k] -= q;
          this.partir(l, q);
        }
      }
    }
  }
  partir(l, q) {
    const d = this.lDst[l], p = this.lProduit[l], m = this.lMode[l];
    if (m === L_OLEODUC) {
      this.res.stock[4 * d + p] += q;
      this.livre[p] += q;
      return;
    }
    const sorte = m === L_ROUTE ? SORTE_CAMION : m === L_RAIL ? SORTE_TRAIN : p === BRUT || p === CARBURANT ? SORTE_PETROLIER : SORTE_CARGO;
    const sens = this.lSens[l];
    this.convoi(l, d, p, q, sorte, this.lTrajet[l], sens > 0 ? 0 : 1, sens * PARAMS2.kmh[Math.min(m, 2)] / Math.max(1, this.lKm[l]));
    this.convoisPartis++;
  }
  /** Un convoi (une bille) : `l` = liaison (−1 : achat au marché), livré à `dst` quand t sort de [0, 1]. */
  convoi(l, dst, p, q, sorte, trajet, t, dt) {
    let c = this.libres.pop();
    if (c === void 0) {
      c = this.nC++;
      if (c >= this.cL.length) {
        const cap = 2 * this.cL.length;
        this.cL = agrandir2(this.cL, cap), this.cDst = agrandir2(this.cDst, cap), this.cTrajet = agrandir2(this.cTrajet, cap);
        this.cT = agrandir2(this.cT, cap), this.cDt = agrandir2(this.cDt, cap), this.cQ = agrandir2(this.cQ, cap);
        this.cSorte = agrandir2(this.cSorte, cap), this.cProduit = agrandir2(this.cProduit, cap), this.cActif = agrandir2(this.cActif, cap);
      }
    }
    this.cL[c] = l, this.cDst[c] = dst, this.cProduit[c] = p, this.cQ[c] = q, this.cSorte[c] = sorte, this.cTrajet[c] = trajet;
    this.cT[c] = t, this.cDt[c] = dt, this.cActif[c] = 1;
    if (this.enRoute.length < 4 * this.res.n) this.enRoute = agrandir2(this.enRoute, Math.max(4 * this.res.n, 2 * this.enRoute.length));
    this.enRoute[4 * dst + p] += q;
    return c;
  }
  /** Avance les convois d'une heure ; ceux d'une liaison fermée attendent où ils sont. */
  avancer() {
    const st = this.res.stock;
    for (let c = 0; c < this.nC; c++) {
      if (!this.cActif[c]) continue;
      const l = this.cL[c];
      if (l >= 0 && !this.lOuverte[l]) continue;
      const dt = this.cDt[c], t = this.cT[c] + dt;
      if (dt > 0 && t >= 1 || dt < 0 && t <= 0) {
        const k = 4 * this.cDst[c] + this.cProduit[c], q = this.cQ[c];
        st[k] += q;
        this.enRoute[k] = Math.max(0, this.enRoute[k] - q);
        this.livre[this.cProduit[c]] += q;
        this.cActif[c] = 0;
        this.libres.push(c);
      } else this.cT[c] = t;
    }
  }
  /** V2.C.5 : un convoi détruit (avions, blocus, bombe) : sa charge est perdue. */
  detruireConvoi(c) {
    if (!this.cActif[c]) return;
    const k = 4 * this.cDst[c] + this.cProduit[c];
    this.enRoute[k] = Math.max(0, this.enRoute[k] - this.cQ[c]);
    this.cActif[c] = 0;
    this.libres.push(c);
  }
  /** Convois en route. */
  enCours() {
    return this.nC - this.libres.length;
  }
  systemes() {
    return [
      {
        nom: "flux",
        periode: HEURE,
        executer: () => this.heure(),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (let c = 0; c < this.nC; c += 5) if (this.cActif[c]) s += this.cT[c] * 1e3 + this.cQ[c];
    h = melanger(h, this.enCours());
    return melanger(h, Math.round(s) | 0);
  }
  rendu(c) {
    const n = this.enCours();
    const tr = new Uint32Array(n), t = new Float32Array(n), dt = new Float32Array(n), genre = new Uint8Array(n);
    let k = 0;
    for (let i = 0; i < this.nC; i++) {
      if (!this.cActif[i]) continue;
      const l = this.cL[i];
      tr[k] = this.cTrajet[i], t[k] = this.cT[i], dt[k] = l >= 0 && !this.lOuverte[l] ? 0 : this.cDt[i];
      genre[k] = this.cSorte[i] | this.cProduit[i] << 2;
      k++;
    }
    c.billes(k, tr, t, dt, genre);
  }
};
function distanceTrace(seg, lon, lat) {
  const kx = 111.32 * Math.cos(lat * Math.PI / 180), ky = 110.57;
  let best = Infinity;
  for (let i = 0; i < seg.length; i += 4) {
    const ax = (seg[i] - lon) * kx, ay = (seg[i + 1] - lat) * ky, bx = (seg[i + 2] - lon) * kx, by = (seg[i + 3] - lat) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const u = l2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
    const d = Math.hypot(ax + u * dx, ay + u * dy);
    if (d < best) best = d;
  }
  return best;
}

// web/src/sim/marche.ts
var PARAMS3 = {
  /** ❓ bornes du rapport demande ÷ offre */
  rapportMin: 0.25,
  rapportMax: 4,
  /** ❓ prix de base des munitions : 1,5 × leur coût à l'usine */
  baseMunitions: 1.5 * PARAMS.argentParTonneMunitions,
  /** ❓ prix de base du brut : 0,7 × celui du carburant (≈ 550 € la tonne de brut pour 800 € la tonne de gazole) */
  partBrut: 0.7,
  /** ❓ cargo de munitions (t) ; le pétrolier : flux.ts `navireT` */
  cargoT: 2e4,
  /** heures entre deux navires d'un même achat */
  ecartNavires: 6,
  /** rang Natural Earth maximal d'un port d'où partent les achats */
  rangHub: 4
};
var Marche = class _Marche {
  /** prix de base par produit (0 : pas de marché) */
  base = new Float64Array(NB_PRODUITS);
  prix = new Float64Array(NB_PRODUITS);
  achatsJour = new Float64Array(NB_PRODUITS);
  /** prix du carburant des 30 derniers jours */
  historique = [];
  /** site PORT de chaque port d'arrivée déjà utilisé (indice de monde-ports) */
  sitePort = /* @__PURE__ */ new Map();
  constructor(res, flux, trajets) {
    for (const [k, v] of [
      [
        "res",
        res
      ],
      [
        "flux",
        flux
      ],
      [
        "trajets",
        trajets
      ]
    ]) {
      Object.defineProperty(this, k, {
        value: v,
        enumerable: false
      });
    }
    this.base[CARBURANT] = res.d.prix.echelle.carburant_jeu_par_tonne;
    this.base[MUNITIONS] = PARAMS3.baseMunitions;
    this.base[BRUT] = PARAMS3.partBrut * this.base[CARBURANT];
    this.prix.set(this.base);
  }
  /** Prix du jour : base × demande ÷ offre (bornés). */
  static prixDuJour(base, demande, offre) {
    const r = offre > 0 ? demande / offre : demande > 0 ? PARAMS3.rapportMax : 1;
    return base * Math.min(PARAMS3.rapportMax, Math.max(PARAMS3.rapportMin, r));
  }
  journee() {
    const r = this.res;
    for (const p of [
      BRUT,
      CARBURANT,
      MUNITIONS
    ]) {
      this.prix[p] = _Marche.prixDuJour(this.base[p], r.consommeJour[p] + this.achatsJour[p], r.capaciteJour(p));
    }
    this.achatsJour.fill(0);
    this.historique.push(Math.round(this.prix[CARBURANT]));
    if (this.historique.length > 30) this.historique.shift();
  }
  /** Port d'arrivée par défaut d'un pays : son plus grand port ouvert sur la mer (rang le plus petit). */
  portDuPays(pays) {
    const P = this.res.d.reseau.ports;
    let best = -1;
    for (let i = 0; i < P.n; i++) {
      if (P.pays[i] !== pays || P.mer[i] < 0) continue;
      if (best < 0 || P.rang[i] < P.rang[best]) best = i;
    }
    return best;
  }
  /**
   * Achète `tonnes` de carburant ou de munitions au prix du jour, livrées au port `port` (indice de monde-ports ; −1 :
   * le grand port du pays). Payé tout de suite ; refusé sans rien payer si l'argent manque ou si aucun navire ne peut
   * venir (pays sans port, mer fermée).
   */
  acheter(pays, produit, tonnes, port = -1) {
    if (produit !== CARBURANT && produit !== MUNITIONS && produit !== BRUT) {
      return {
        ok: false,
        texte: "Seuls le brut, le carburant et les munitions s'ach\xE8tent."
      };
    }
    if (!(tonnes > 0)) return {
      ok: false,
      texte: "Quantit\xE9 nulle."
    };
    const r = this.res, P = r.d.reseau.ports;
    if (port < 0) port = this.portDuPays(pays);
    if (port < 0 || P.pays[port] !== pays || P.mer[port] < 0) return {
      ok: false,
      texte: "Aucun port ouvert sur la mer."
    };
    const cout = this.prix[produit] * tonnes;
    if (r.tresor[pays] < cout) return {
      ok: false,
      texte: "Pas assez d'argent.",
      cout
    };
    const hubs = /* @__PURE__ */ new Map();
    for (let i = 0; i < P.n; i++) if (P.rang[i] <= PARAMS3.rangHub && P.mer[i] >= 0 && P.pays[i] !== pays && !hubs.has(P.mer[i])) hubs.set(P.mer[i], i);
    const m = r.d.reseau.mer, fermes = this.flux.fermes, parcours = this.flux.parcoursMer;
    let hub = -1;
    parcours.lancer([
      P.mer[port]
    ], Infinity, (e) => !(m.masque[e] & fermes), (v) => (hub = hubs.get(v) ?? -1) >= 0);
    const it = hub >= 0 ? this.flux.itineraireMer(hub, port) : null;
    if (!it) return {
      ok: false,
      texte: "Aucun navire ne peut venir : la mer est ferm\xE9e.",
      cout
    };
    r.depenser(pays, cout);
    this.achatsJour[produit] += tonnes;
    const site2 = this.siteDuPort(pays, port);
    const tr = this.trajets.ajouter(`achat:${hub}-${port}:${fermes}`, TRAJET_MER, polyligneMer(m, it.noeuds, [
      P.x[hub],
      P.y[hub]
    ], [
      P.x[port],
      P.y[port]
    ]), it.km);
    const cap = produit === MUNITIONS ? PARAMS3.cargoT : PARAMS2.navireT;
    const sorte = produit === MUNITIONS ? SORTE_CARGO : SORTE_PETROLIER;
    const dt = PARAMS2.kmh[2] / Math.max(1, it.km);
    let n = 0;
    for (let reste = tonnes; reste > 0; reste -= cap, n++) {
      this.flux.convoi(-1, site2, produit, Math.min(cap, reste), sorte, tr, -n * PARAMS3.ecartNavires * dt, dt);
    }
    return {
      ok: true,
      cout,
      navires: n,
      heures: Math.ceil(it.km / PARAMS2.kmh[2]),
      texte: `${n} ${produit === MUNITIONS ? "cargo" : "p\xE9trolier"}${n > 1 ? "s" : ""} en route depuis ${P.noms[hub]}.`
    };
  }
  /** Site PORT d'un port (créé au premier achat, relié aux dépôts à portée au pas suivant). */
  siteDuPort(pays, port) {
    let s = this.sitePort.get(port);
    if (s === void 0) {
      const P = this.res.d.reseau.ports;
      s = this.res.ajouter(PORT, pays, P.x[port], P.y[port], 0, P.noms[port]);
      this.sitePort.set(port, s);
      this.flux.relierNouveaux();
    }
    return s;
  }
  systemes() {
    return [
      {
        nom: "march\xE9",
        periode: JOUR,
        executer: () => this.journee(),
        empreinte: (h) => melanger(h, Math.round(this.prix[CARBURANT] + this.prix[MUNITIONS]) | 0)
      }
    ];
  }
};

// web/src/interface/formats.ts
var ESPACE = "\u202F";
function groupes(entier) {
  return entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE);
}
function nombre(v) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const r = Math.round(Math.abs(v));
  return (v < 0 && r > 0 ? "\u2212" : "") + groupes(String(r));
}
function decimal(v, decimales = 1) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const [e, d] = Math.abs(v).toFixed(decimales).split(".");
  const signe = v < 0 && Number(`${e}.${d ?? 0}`) > 0 ? "\u2212" : "";
  return signe + groupes(e) + (d ? "," + d : "");
}
function euros(v) {
  if (v === null || v === void 0 || !isFinite(v)) return "\u2014";
  const a = Math.abs(v);
  if (a >= 1e12) return `${nombre(v / 1e9)}${ESPACE}milliards${ESPACE}\u20AC`;
  if (a >= 1e9) return `${decimal(v / 1e9, a >= 1e10 ? 0 : 1)}${ESPACE}milliard${a >= 2e9 ? "s" : ""}${ESPACE}\u20AC`;
  if (a >= 1e6) return `${decimal(v / 1e6, a >= 1e7 ? 0 : 1)}${ESPACE}million${a >= 2e6 ? "s" : ""}${ESPACE}\u20AC`;
  return `${nombre(v)}${ESPACE}\u20AC`;
}

// web/src/sim/batiments.ts
var REGLES = [
  {
    genre: PUITS,
    id: "puits",
    nom: "Puits",
    lieu: "champ",
    doublable: true
  },
  {
    genre: RAFFINERIE,
    id: "raffinerie",
    nom: "Raffinerie",
    lieu: "reseau",
    doublable: true
  },
  {
    genre: USINE_MUNITIONS,
    id: "usine_munitions",
    nom: "Usine de munitions",
    lieu: "ville",
    doublable: true
  },
  {
    genre: CASERNE,
    id: "caserne",
    nom: "Caserne",
    lieu: "ville",
    doublable: true
  },
  {
    genre: USINE_CHARS,
    id: "usine_chars",
    nom: "Usine de chars",
    lieu: "ville",
    doublable: true
  },
  {
    genre: USINE_ARTILLERIE,
    id: "usine_artillerie",
    nom: "Usine d'artillerie",
    lieu: "ville",
    doublable: true
  },
  {
    genre: USINE_AVIONS,
    id: "usine_avions",
    nom: "Usine d'avions",
    lieu: "ville",
    doublable: true
  },
  {
    genre: AEROPORT,
    id: "aeroport",
    nom: "A\xE9roport",
    lieu: "reseau",
    doublable: false
  },
  {
    genre: CHANTIER_NAVAL,
    id: "chantier_naval",
    nom: "Chantier naval",
    lieu: "port",
    doublable: true
  },
  {
    genre: DEPOT,
    id: "depot",
    nom: "D\xE9p\xF4t",
    lieu: "axe",
    doublable: false
  },
  {
    genre: DCA,
    id: "dca",
    nom: "DCA",
    lieu: "ville-ou-depot",
    doublable: false
  },
  {
    genre: SILO,
    id: "silo",
    nom: "Silo",
    lieu: "terre",
    doublable: false
  }
];
var PARAMS4 = {
  /** ❓ Carburant d'un chantier : cette part de son prix, convertie au prix de base du carburant (V2.B.2). */
  partCarburant: 0.02,
  /** ❓ Puits : le champ doit être à moins de cette distance du clic. */
  kmChamp: 40,
  /** ❓ Usines et casernes : une ville vivante (5 000 habitants et plus) du pays à moins de cette distance. */
  kmVille: 20,
  /** ❓ « Reliée au réseau » : un noeud de route à moins de cette distance (raffinerie, aéroport construit). */
  kmReseau: 60,
  kmReseauAeroport: 80,
  /** ❓ Chantier naval : un port du pays, ouvert sur la mer, à moins de cette distance. */
  kmPort: 25,
  /** ❓ Dépôt : un noeud de route (le dépôt s'y pose) à moins de cette distance, et pas de dépôt du pays à moins de kmEntreDepots. */
  kmAxe: 25,
  kmEntreDepots: 10,
  /** ❓ DCA : une ville du pays à moins de kmVille, ou un dépôt actif du pays à moins de cette distance. */
  kmDepotDca: 30,
  /** ❓ Territoire : le clic appartient au pays de la ville vivante la plus proche, si elle est à moins de cette distance. */
  kmTerritoire: 300,
  /** ❓ Deux bâtiments du même genre à moins de cette distance : on double le premier au lieu d'en poser un second. */
  kmMemeLieu: 3,
  /** ❓ Un champ qui a déjà son puits actif (ou son chantier) à moins de cette distance de lui est pris. */
  kmPuitsDuChamp: 2,
  /** ❓ Axes : un clic est rattaché au noeud du mode le plus proche à moins de cette distance ; longueur maximale d'un ordre. */
  kmAxeNoeud: 30,
  kmAxeMax: 1500,
  /** ❓ Délai d'un doublement d'axe : le délai de V2.B.2 (1 jour) par tranche de cette longueur. */
  kmAxeParDelai: 100,
  /** ❓ Aéroports de départ par pays (militaires d'abord, puis grands). */
  aeroportsDepart: 3,
  /** ❓ Nombre de chantiers affichés au plus dans une notification de fin. */
  maxChantiersParPays: 200
};
var NEUF = 0;
var DOUBLEMENT = 1;
var AXE = 2;
var indexes = /* @__PURE__ */ new WeakMap();
function indexDe(d) {
  let i = indexes.get(d);
  if (!i) {
    const V = d.villes, xy = new Float32Array(2 * V.n);
    for (let k = 0; k < V.n; k++) xy[2 * k] = V.x[k], xy[2 * k + 1] = V.y[k];
    const cx = new Float32Array(d.petrole.champs.length), cy = new Float32Array(cx.length);
    d.petrole.champs.forEach((c, k) => [cx[k], cy[k]] = projeter(c.lon, c.lat));
    indexes.set(d, i = {
      villes: new IndexNoeuds(xy, () => true),
      champs: {
        x: cx,
        y: cy
      }
    });
  }
  return i;
}
var dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
var Batiments = class {
  joueur;
  nucleaire;
  /** chantiers en cours, dans l'ordre des ordres */
  chantiers;
  prochain;
  /** 1 : site doublé (niveau 2), par site */
  double;
  /** bombe (0 à 4) de chaque silo, par site */
  bombe;
  /** messages de fin de chantier du pays joué, à afficher puis vider (`vider`) */
  fini;
  /** ordres refusés depuis le départ (pour les mesures et les tests) */
  refus;
  constructor(res, flux, joueur, nucleaire) {
    this.joueur = joueur;
    this.nucleaire = nucleaire;
    this.chantiers = [];
    this.prochain = 1;
    this.double = new Uint8Array(1024);
    this.bombe = /* @__PURE__ */ new Map();
    this.fini = [];
    this.refus = 0;
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "flux", {
      value: flux,
      enumerable: false
    });
    Object.defineProperty(this, "d", {
      value: res.d,
      enumerable: false
    });
    Object.defineProperty(this, "idx", {
      value: indexDe(res.d),
      enumerable: false
    });
    Object.defineProperty(res, "niveauSite", {
      value: (s) => this.double[s] ? 2 : 1,
      enumerable: false,
      configurable: true
    });
  }
  // ------------------------------------------------------------------ départ
  /**
   * Aéroports de départ : « existant (OurAirports) ». Par pays, les `aeroportsDepart` premiers, militaires d'abord, puis
   * grands, puis dans l'ordre des données (déterministe). Ils sont ravitaillés par les dépôts à portée.
   */
  poserAeroportsDeDepart() {
    const A = this.d.reseau.aeroports, res = this.res, pris = new Uint8Array(256);
    const ordre = Array.from({
      length: A.n
    }, (_, i) => i).sort((a, b) => A.militaire[b] - A.militaire[a] || A.grand[b] - A.grand[a] || A.civil[b] - A.civil[a] || a - b);
    for (const i of ordre) {
      const p = A.pays[i];
      if (!(res.populationDepart[p] > 0) || pris[p] >= PARAMS4.aeroportsDepart) continue;
      pris[p]++;
      res.ajouter(AEROPORT, p, A.x[i], A.y[i], 0, A.noms[i]);
    }
  }
  // ------------------------------------------------------------------ prix
  /** Prix d'un bâtiment (ou d'un km d'axe si `id` vaut « route » ou « rail ») : argent, carburant en tonnes, heures. */
  cout(id, bombe = -1, km = 1) {
    const t = this.d.prix, b = prixBatiment(t, id);
    if (!b) return null;
    let argent = b.prix * (b.unite_prix === "km" ? km : 1);
    if (bombe >= 0) argent += t.bombes[bombe]?.prix ?? 0;
    return {
      argent,
      carburant: argent * PARAMS4.partCarburant / t.echelle.carburant_jeu_par_tonne,
      heures: Math.round(b.delai_jours * 24 * (b.unite_prix === "km" ? Math.max(1, Math.ceil(km / PARAMS4.kmAxeParDelai)) : 1))
    };
  }
  /** Catalogue pour l'interface (Construire) : un bâtiment par ligne, avec prix, délai et règle de pose. */
  catalogue() {
    return REGLES.map((r) => {
      const c = this.cout(r.id, r.genre === SILO ? 0 : -1);
      return {
        genre: r.genre,
        nom: r.nom,
        lieu: r.lieu,
        doublable: r.doublable,
        argent: c.argent,
        carburant: c.carburant,
        jours: c.heures / 24
      };
    });
  }
  // ------------------------------------------------------------------ territoire et lieux
  /** Pays qui tient l'endroit : celui de la ville vivante la plus proche, à moins de `kmTerritoire` ; −1 sinon. */
  proprietaire(x, y) {
    const [v] = this.idx.villes.proche(x, y, PARAMS4.kmTerritoire);
    return v < 0 ? -1 : this.res.proprietaire[v];
  }
  /** Vérifie que (x, y) est sur un terrain du pays ; rend le motif de refus sinon. */
  chezSoi(pays, x, y) {
    const p = this.proprietaire(x, y);
    if (p < 0) return "Trop loin de toute ville : rien ne peut \xEAtre construit ici.";
    return p === pays ? null : "Ce terrain n'est pas \xE0 toi.";
  }
  /** Un bâtiment du même genre (site actif ou chantier) à moins de `kmMemeLieu` de (x, y) : son numéro de site, ou −1. */
  memeLieu(genre, x, y) {
    const r = this.res;
    for (let i = 0; i < r.n; i++) {
      if (r.genre[i] === genre && r.actif[i] && dist(r.x[i], r.y[i], x, y) <= PARAMS4.kmMemeLieu) return {
        site: i,
        chantier: false
      };
    }
    for (const c of this.chantiers) {
      if (c.kind === NEUF && c.genre === genre && dist(c.x, c.y, x, y) <= PARAMS4.kmMemeLieu) return {
        site: -1,
        chantier: true
      };
    }
    return null;
  }
  /** Règles de pose : où ce bâtiment peut aller. Rend la position réelle (rattachée au champ, au port, au noeud…). */
  verifier(pays, genre, x, y) {
    const regle = REGLES[genre];
    if (!regle) return {
      ok: false,
      texte: "B\xE2timent inconnu."
    };
    if (!(this.res.populationDepart[pays] > 0)) return {
      ok: false,
      texte: "Ce pays n'existe pas."
    };
    if (!isFinite(x) || !isFinite(y)) return {
      ok: false,
      texte: "Position invalide."
    };
    const d = this.d, P = PARAMS4, r = this.res;
    let noeud = -1, debit = 0, nom = regle.nom;
    const refus = (texte) => ({
      ok: false,
      texte
    });
    switch (regle.lieu) {
      case "champ": {
        const { x: cx, y: cy } = this.idx.champs;
        let best = -1, bd = P.kmChamp;
        for (let k = 0; k < cx.length; k++) {
          const dd = dist(cx[k], cy[k], x, y);
          if (dd < bd) bd = dd, best = k;
        }
        if (best < 0) return refus(`Un Puits se pose sur un champ p\xE9trolier r\xE9el : aucun \xE0 moins de ${P.kmChamp} km.`);
        const champ = d.petrole.champs[best];
        x = cx[best], y = cy[best];
        for (let i = 0; i < r.n; i++) {
          if (r.genre[i] === PUITS && r.actif[i] && dist(r.x[i], r.y[i], x, y) <= P.kmPuitsDuChamp) {
            return refus(`Le champ ${champ.nom} a d\xE9j\xE0 son puits : double-le (m\xEAme prix, m\xEAme d\xE9lai).`);
          }
        }
        if (this.chantiers.some((c) => c.kind === NEUF && c.genre === PUITS && dist(c.x, c.y, x, y) <= P.kmPuitsDuChamp)) {
          return refus(`Un puits est d\xE9j\xE0 en chantier sur le champ ${champ.nom}.`);
        }
        const motif = this.chezSoi(pays, x, y);
        if (motif) return refus(`Le champ ${champ.nom} n'est pas sur ton territoire.`);
        debit = champ.kbd * PARAMS.partMilitaire * PARAMS.tonnesHeureParKbd;
        nom = `Puits (${champ.nom})`;
        break;
      }
      case "reseau": {
        const km = genre === AEROPORT ? P.kmReseauAeroport : P.kmReseau;
        const motif = this.chezSoi(pays, x, y);
        if (motif) return refus(motif);
        if (d.route.proche(x, y, km)[0] < 0) return refus(`Il faut \xEAtre reli\xE9 au r\xE9seau : un axe routier \xE0 moins de ${km} km.`);
        break;
      }
      case "ville": {
        const [v, dv] = this.idx.villes.proche(x, y, P.kmVille);
        if (v < 0) return refus(`${regle.nom} : il faut une ville de 5 000 habitants et plus \xE0 moins de ${P.kmVille} km.`);
        if (r.proprietaire[v] !== pays) return refus("Cette ville n'est pas \xE0 toi.");
        void dv;
        break;
      }
      case "terre": {
        const motif = this.chezSoi(pays, x, y);
        if (motif) return refus(motif);
        break;
      }
      case "port": {
        const Pt = d.reseau.ports;
        let best = -1, bd = P.kmPort;
        for (let i = 0; i < Pt.n; i++) {
          if (Pt.mer[i] < 0 || Pt.pays[i] !== pays) continue;
          const dd = dist(Pt.x[i], Pt.y[i], x, y);
          if (dd < bd) bd = dd, best = i;
        }
        if (best < 0) return refus(`Un Chantier naval se pose dans un port de ton pays ouvert sur la mer : aucun \xE0 moins de ${P.kmPort} km.`);
        x = Pt.x[best], y = Pt.y[best];
        nom = `Chantier naval (${Pt.noms[best]})`;
        break;
      }
      case "axe": {
        const [n, dn] = d.route.proche(x, y, P.kmAxe);
        if (n < 0) return refus(`Un D\xE9p\xF4t se pose sur un axe routier : aucun \xE0 moins de ${P.kmAxe} km.`);
        void dn;
        const ax = d.reseau.axes.noeuds;
        x = ax[2 * n], y = ax[2 * n + 1], noeud = n;
        const motif = this.chezSoi(pays, x, y);
        if (motif) return refus(motif);
        for (const s of r.sites(DEPOT, pays)) {
          if (r.actif[s] && dist(r.x[s], r.y[s], x, y) < P.kmEntreDepots) return refus("Il y a d\xE9j\xE0 un d\xE9p\xF4t tout pr\xE8s.");
        }
        break;
      }
      case "ville-ou-depot": {
        const [v] = this.idx.villes.proche(x, y, P.kmVille);
        let ok = v >= 0 && r.proprietaire[v] === pays;
        if (!ok) {
          for (const s of r.sites(DEPOT, pays)) if (r.actif[s] && dist(r.x[s], r.y[s], x, y) <= P.kmDepotDca) ok = true;
        }
        if (!ok) return refus(`Une DCA se pose dans une de tes villes (\xE0 moins de ${P.kmVille} km) ou pr\xE8s d'un de tes d\xE9p\xF4ts (\xE0 moins de ${P.kmDepotDca} km).`);
        break;
      }
    }
    if (regle.doublable && genre !== PUITS) {
      const m = this.memeLieu(genre, x, y);
      if (m) return refus(m.chantier ? `${regle.nom} : un chantier du m\xEAme genre est d\xE9j\xE0 l\xE0.` : `${regle.nom} : il y en a d\xE9j\xE0 un ici, double-le (m\xEAme prix, m\xEAme d\xE9lai).`);
    }
    return {
      ok: true,
      x,
      y,
      noeud,
      debit,
      nom
    };
  }
  // ------------------------------------------------------------------ ordres
  /** Dépôt actif du pays qui a au moins `t` tonnes de carburant, le plus proche de (x, y) ; −1 sinon. */
  depotPour(pays, x, y, t) {
    const r = this.res;
    let best = -1, bd = Infinity;
    for (const s of r.sites(DEPOT, pays)) {
      if (!r.actif[s] || r.stock[4 * s + CARBURANT] < t) continue;
      const dd = dist(r.x[s], r.y[s], x, y);
      if (dd < bd) bd = dd, best = s;
    }
    return best;
  }
  /** Paie un chantier (argent au trésor, carburant à un dépôt), ou rend le motif du refus. */
  payer(pays, c, x, y, nom) {
    const r = this.res;
    if (r.tresor[pays] < c.argent) {
      return `Pas assez d'argent : ${nom} co\xFBte ${euros(c.argent)}, il t'en reste ${euros(r.tresor[pays])}.`;
    }
    const depot2 = this.depotPour(pays, x, y, c.carburant);
    if (depot2 < 0) {
      return `Pas assez de carburant dans tes d\xE9p\xF4ts : ${nom} demande ${nombre(c.carburant)} t dans un seul d\xE9p\xF4t.`;
    }
    return {
      depot: depot2
    };
  }
  ouvrir(pays, c, cout, depot2) {
    const r = this.res;
    r.depenser(pays, cout.argent);
    r.prendre(depot2, CARBURANT, cout.carburant);
    const ch = {
      ...c,
      id: this.prochain++,
      pays,
      total: cout.heures,
      reste: cout.heures,
      argent: cout.argent,
      carburant: cout.carburant
    };
    this.chantiers.push(ch);
    const jours = cout.heures / 24;
    return {
      ok: true,
      chantier: ch.id,
      argent: cout.argent,
      carburant: cout.carburant,
      jours,
      texte: `${c.kind === DOUBLEMENT ? "Doublement" : "Chantier"} lanc\xE9 : ${c.nom}, ${euros(cout.argent)}, pr\xEAt dans ${jours >= 2 ? `${Math.round(jours)} jours` : `${Math.round(jours * 24)} heures`}.`
    };
  }
  refuser(texte) {
    this.refus++;
    return {
      ok: false,
      texte
    };
  }
  /** Pose d'un bâtiment (genre = indice dans BATIMENTS) en (x, y) ; `bombe` (0 à 4) pour un Silo. */
  poser(pays, genre, x, y, bombe) {
    const regle = REGLES[genre];
    if (!regle) return this.refuser("B\xE2timent inconnu.");
    if (this.chantiersDe(pays).length >= PARAMS4.maxChantiersParPays) return this.refuser("Trop de chantiers en cours.");
    if (genre === SILO) {
      if (!this.nucleaire) return this.refuser("Le nucl\xE9aire est d\xE9sactiv\xE9 dans cette partie.");
      if (bombe === void 0 || !(bombe >= 0 && bombe < this.d.prix.bombes.length) || bombe !== Math.floor(bombe)) {
        return this.refuser("Choisis la puissance de la bombe du Silo (de 15 kt \xE0 10 Mt).");
      }
    }
    const v = this.verifier(pays, genre, x, y);
    if (!v.ok) return this.refuser(v.texte);
    const cout = this.cout(regle.id, genre === SILO ? bombe : -1);
    const nom = genre === SILO ? `${regle.nom} (${this.d.prix.bombes[bombe].nom.toLowerCase()})` : v.nom;
    const p = this.payer(pays, cout, v.x, v.y, nom);
    if (typeof p === "string") return this.refuser(p);
    return this.ouvrir(pays, {
      kind: NEUF,
      genre,
      x: v.x,
      y: v.y,
      noeud: v.noeud,
      debit: v.debit,
      site: -1,
      aretes: [],
      mode: 0,
      bombe: genre === SILO ? bombe : -1,
      nom
    }, cout, p.depot);
  }
  /** Double un site du pays (même prix, même délai que la construction). */
  doubler(pays, site2) {
    const r = this.res;
    if (!(site2 >= 0 && site2 < r.n) || r.pays[site2] !== pays) return this.refuser("Ce n'est pas un de tes b\xE2timents.");
    const regle = REGLES[r.genre[site2]];
    if (!regle) return this.refuser("Ce site n'est pas un b\xE2timent.");
    if (!regle.doublable) return this.refuser(`${regle.nom} : un b\xE2timent de ce genre ne se double pas.`);
    if (!r.actif[site2]) return this.refuser(`${regle.nom} : le b\xE2timent est d\xE9truit.`);
    if (this.double[site2]) return this.refuser(`${regle.nom} : d\xE9j\xE0 doubl\xE9 (niveau 2 au plus).`);
    if (this.chantiers.some((c) => c.kind === DOUBLEMENT && c.site === site2)) return this.refuser(`${regle.nom} : un doublement est d\xE9j\xE0 en chantier.`);
    const cout = this.cout(regle.id);
    const nom = `${r.noms[site2] || regle.nom}, niveau 2`;
    const p = this.payer(pays, cout, r.x[site2], r.y[site2], nom);
    if (typeof p === "string") return this.refuser(p);
    return this.ouvrir(pays, {
      kind: DOUBLEMENT,
      genre: r.genre[site2],
      x: r.x[site2],
      y: r.y[site2],
      noeud: -1,
      debit: 0,
      site: site2,
      aretes: [],
      mode: 0,
      bombe: -1,
      nom
    }, cout, p.depot);
  }
  /**
   * Route ou rail (le treizième bâtiment) : double le débit de l'axe existant qui relie (x1, y1) à (x2, y2). `mode` : 0
   * route, 1 rail. Prix et délai au km (V2.B.2). Pas de tracé neuf (DOUTES.md § V2.C.2).
   */
  poserAxe(pays, mode, x1, y1, x2, y2) {
    const d = this.d, P = PARAMS4, nomMode = mode === 1 ? "rail" : "route";
    if (!(this.res.populationDepart[pays] > 0)) return this.refuser("Ce pays n'existe pas.");
    const index = mode === 1 ? d.rail : d.route;
    const [na] = index.proche(x1, y1, P.kmAxeNoeud), [nb] = index.proche(x2, y2, P.kmAxeNoeud);
    if (na < 0 || nb < 0) return this.refuser(`Les deux bouts doivent \xEAtre \xE0 moins de ${P.kmAxeNoeud} km d'un axe de ${nomMode === "rail" ? "voie ferr\xE9e" : "route"}.`);
    if (na === nb) return this.refuser("Les deux bouts sont au m\xEAme endroit.");
    const ax = d.reseau.axes.noeuds;
    for (const n of [
      na,
      nb
    ]) {
      const motif = this.chezSoi(pays, ax[2 * n], ax[2 * n + 1]);
      if (motif) return this.refuser(motif);
    }
    const ch = this.flux.cheminAxes(mode === 1 ? L_RAIL : L_ROUTE, na, nb, P.kmAxeMax);
    if (!ch || !ch.aretes.length) {
      return this.refuser(`Aucun axe existant ne relie ces deux points \xE0 moins de ${nombre(P.kmAxeMax)} km : on ne peut que doubler un axe, pas en tracer un neuf.`);
    }
    if (ch.aretes.every((e) => this.flux.niveauAxe[e] === 2)) return this.refuser("Cet axe est d\xE9j\xE0 doubl\xE9.");
    if (this.chantiers.some((c) => c.kind === AXE && c.mode === mode && c.aretes.some((e) => ch.aretes.includes(e)))) {
      return this.refuser("Un doublement est d\xE9j\xE0 en chantier sur cet axe.");
    }
    const cout = this.cout(nomMode, -1, ch.km);
    const nom = `${nomMode === "rail" ? "Voie ferr\xE9e" : "Route"} doubl\xE9e (${nombre(ch.km)} km)`;
    const mx = (ax[2 * na] + ax[2 * nb]) / 2, my = (ax[2 * na + 1] + ax[2 * nb + 1]) / 2;
    const p = this.payer(pays, cout, mx, my, nom);
    if (typeof p === "string") return this.refuser(p);
    return this.ouvrir(pays, {
      kind: AXE,
      genre: -1,
      x: mx,
      y: my,
      noeud: -1,
      debit: 0,
      site: -1,
      aretes: ch.aretes,
      mode,
      bombe: -1,
      nom
    }, cout, p.depot);
  }
  /** Abandonne un chantier : l'argent non dépensé (part restante) revient, le carburant est perdu. */
  annuler(pays, chantier) {
    const i = this.chantiers.findIndex((c2) => c2.id === chantier);
    if (i < 0 || this.chantiers[i].pays !== pays) return this.refuser("Ce n'est pas un de tes chantiers.");
    const c = this.chantiers[i];
    const rendu = c.argent * (c.reste / c.total);
    this.chantiers.splice(i, 1);
    this.res.tresor[pays] += rendu;
    this.res.depense[pays] -= rendu;
    return {
      ok: true,
      argent: rendu,
      texte: `Chantier abandonn\xE9 : ${c.nom}. ${euros(rendu)} te reviennent.`
    };
  }
  /** Chantiers d'un pays. */
  chantiersDe(pays) {
    return this.chantiers.filter((c) => c.pays === pays);
  }
  /** Niveau d'un site : 2 s'il est doublé, 1 sinon. */
  niveau(site2) {
    return this.double[site2] ? 2 : 1;
  }
  // ------------------------------------------------------------------ chaque heure
  heure() {
    if (!this.chantiers.length) return;
    let fin = false;
    for (const c of this.chantiers) if (--c.reste <= 0) fin = true;
    if (!fin) return;
    const restants = [];
    for (const c of this.chantiers) {
      if (c.reste > 0) restants.push(c);
      else this.terminer(c);
    }
    this.chantiers = restants;
  }
  terminer(c) {
    const r = this.res;
    if (c.kind === NEUF) {
      const i = r.ajouter(c.genre, c.pays, c.x, c.y, c.debit, c.nom, c.noeud);
      if (i >= this.double.length) this.double = agrandir2(this.double, Math.max(2 * this.double.length, i + 1));
      if (c.bombe >= 0) this.bombe.set(i, c.bombe);
    } else if (c.kind === DOUBLEMENT) {
      r.doubler(c.site);
      if (c.site >= this.double.length) this.double = agrandir2(this.double, Math.max(2 * this.double.length, c.site + 1));
      this.double[c.site] = 1;
    } else {
      this.flux.doublerAretes(c.aretes);
    }
    if (c.pays === this.joueur && this.fini.length < 20) this.fini.push(`${c.nom} : termin\xE9.`);
  }
  /** Messages de fin de chantier du pays joué, puis les efface. */
  vider() {
    const f = this.fini;
    this.fini = [];
    return f;
  }
  systemes() {
    return [
      {
        nom: "b\xE2timents",
        periode: HEURE,
        executer: (_m) => this.heure(),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (const c of this.chantiers) s += c.reste * 3 + c.id;
    return melanger(melanger(h, this.chantiers.length), s | 0);
  }
  /** Chantiers à dessiner (un bâtiment neuf, dessin « chantier » à la couleur du camp ; les doublements et les axes ne
   * changent pas la carte avant la fin). */
  rendu(c) {
    for (const ch of this.chantiers) if (ch.kind === NEUF) c.batiment(ch.x, ch.y, ch.genre, this.res.camp[ch.pays], 0);
  }
};

// web/src/sim/unites.ts
var SOLDATS = 0;
var CHARS = 1;
var ARTILLERIE = 2;
var AVIONS = 3;
var NAVIRES = 4;
var NB_TYPES = 5;
var IDS_UNITES = [
  "soldats",
  "chars",
  "artillerie",
  "avions",
  "navires"
];
var NOMS_UNITES = [
  "soldats",
  "chars",
  "canons",
  "avions",
  "navires"
];
var SINGULIERS = [
  "soldat",
  "char",
  "canon",
  "avion",
  "navire"
];
function commandeDe(type, n) {
  if (type === SOLDATS) return `${n} millier${n > 1 ? "s" : ""} de soldats`;
  return `${n} ${n > 1 ? NOMS_UNITES[type] : SINGULIERS[type]}`;
}
var USINE_DE = [
  CASERNE,
  USINE_CHARS,
  USINE_ARTILLERIE,
  USINE_AVIONS,
  CHANTIER_NAVAL
];
var TAILLE = [
  1e3,
  1,
  1,
  1,
  1
];
var PARAMS5 = {
  /** ❓ Carburant en marche, t/h par unité (soldats : par homme). Soldats en camion et canons tractés : les camions ne
   *  consomment pas (CONCEPTION, défaut de V2.C.1) ; un char ≈ 2 kg/km à 40 km/h. */
  carburantMarche: [
    0,
    0.08,
    0,
    0,
    0
  ],
  /** ❓ Munitions au combat, t/h par unité : 0,5 t/h par millier de soldats, 50 kg/h par char, 0,4 t/h par canon. */
  munitionsCombat: [
    5e-4,
    0.05,
    0.4,
    0,
    0
  ],
  /** ❓ Rayon d'un aéroport pour la couverture d'un groupe (km de carte, CONCEPTION « Air ») et d'une zone de navires. */
  rayonAvionsKm: 800,
  rayonNaviresKm: 300
};
var ATTENTE_RIEN = 0;
var ATTENTE_ARGENT = 1;
var ATTENTE_CARBURANT = 2;
var ATTENTE_RECRUES = 3;
var ATTENTE_SANS_LIEU = 4;
var TEXTES_ATTENTE = [
  "",
  "pas assez d'argent",
  "pas assez de carburant dans un d\xE9p\xF4t",
  "pas assez de recrues",
  "aucun a\xE9roport ni port o\xF9 livrer"
];
var Unites = class {
  /** parc par site : [site × 5 + type] (soldats en hommes) */
  parc = new Float64Array(5 * 1024);
  /** navires par port (indice de monde-ports) et pays qui les tient */
  naviresPort;
  paysPort;
  // ---- production, par site (usines seulement)
  /** unités commandées qui restent à faire */
  commande = new Float64Array(1024);
  /** heures de production faites sur l'unité en cours (×2 dans une usine doublée) */
  avancement = new Float32Array(1024);
  /** V2.D.1 : cadence de production par pays (difficulté : × 0,7, × 1 ou × 1,3 pour l'IA, 1 pour le joueur) */
  facteur = new Float32Array(256).fill(1);
  /** 1 : l'unité en cours est payée */
  paye = new Uint8Array(1024);
  /** ATTENTE_* */
  attente = new Uint8Array(1024);
  /** unités finies à acheminer vers un dépôt (groupes.ts) */
  sorties = [];
  /** unités produites depuis le départ, par type (bilan) */
  produites = new Float64Array(NB_TYPES);
  /** unités de départ posées, par type ; perdues faute de lieu (pays sans dépôt, aéroport ou port) */
  depart = new Float64Array(NB_TYPES);
  perduesDepart = new Float64Array(NB_TYPES);
  constructor(res, bat) {
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "bat", {
      value: bat,
      enumerable: false
    });
    const P = res.d.reseau.ports;
    this.naviresPort = new Float64Array(P.n);
    this.paysPort = P.pays.slice();
    this.assurer();
  }
  /** Tableaux par site à la taille des sites de ressources.ts (qui grandissent en jouant). */
  assurer() {
    const n = this.res.n;
    if (n <= this.commande.length) return;
    const cap = Math.max(n, 2 * this.commande.length);
    this.parc = agrandir2(this.parc, 5 * cap);
    this.commande = agrandir2(this.commande, cap), this.avancement = agrandir2(this.avancement, cap);
    this.paye = agrandir2(this.paye, cap), this.attente = agrandir2(this.attente, cap);
  }
  prix(type) {
    return prixUnite(this.res.d.prix, IDS_UNITES[type]);
  }
  /** Heures de production d'une unité (sans le doublement). */
  heuresProduction(type) {
    return this.prix(type).jours_production * 24;
  }
  // ------------------------------------------------------------------ départ
  /** Armées de départ (V2.B.2) : soldats, chars et canons aux dépôts, avions aux aéroports, navires au grand port. */
  poserArmeesDeDepart() {
    const r = this.res, d = r.d, P = d.reseau.ports;
    this.assurer();
    for (const p of d.depart.pays) {
      const id = d.idPays.get(p.iso3);
      if (id === void 0) continue;
      const a = p.armee, nombres = [
        Math.round(a.soldats * 1e3),
        a.chars,
        a.artillerie,
        a.avions,
        a.navires
      ];
      const depots = r.sites(DEPOT, id), aeros = r.sites(AEROPORT, id);
      for (let t = 0; t < NB_TYPES; t++) {
        const n = Math.max(0, Math.round(nombres[t]));
        if (!n) continue;
        if (t === NAVIRES) {
          let best = -1;
          for (let i = 0; i < P.n; i++) if (P.pays[i] === id && P.mer[i] >= 0 && (best < 0 || P.rang[i] < P.rang[best])) best = i;
          if (best < 0) this.perduesDepart[t] += n;
          else this.naviresPort[best] += n, this.paysPort[best] = id, this.depart[t] += n;
          continue;
        }
        const lieux = t === AVIONS ? aeros : depots;
        if (!lieux.length) {
          this.perduesDepart[t] += n;
          continue;
        }
        const part = Math.floor(n / lieux.length), reste = n - part * lieux.length;
        lieux.forEach((s, k) => this.parc[5 * s + t] += part + (k < reste ? 1 : 0));
        this.depart[t] += n;
      }
    }
  }
  // ------------------------------------------------------------------ comptes
  /** Unités d'un type dans les parcs d'un pays (hors groupes). */
  total(pays, type) {
    if (type === NAVIRES) {
      let s2 = 0;
      for (let i = 0; i < this.naviresPort.length; i++) if (this.paysPort[i] === pays) s2 += this.naviresPort[i];
      return s2;
    }
    const r = this.res;
    let s = 0;
    for (let i = 0; i < r.n; i++) if (r.pays[i] === pays) s += this.parc[5 * i + type];
    return s;
  }
  /** Type produit par un site (−1 : ce n'est pas une usine d'unités). */
  typeUsine(site2) {
    return USINE_DE.indexOf(this.res.genre[site2]);
  }
  // ------------------------------------------------------------------ ordres
  /**
   * Commande `nombre` unités à une usine du pays (soldats : en milliers) ; s'ajoute à ce qui reste à faire. 0 : arrête la
   * commande (l'unité en cours, déjà payée, se termine).
   */
  produire(pays, site2, nombre2) {
    const r = this.res;
    this.assurer();
    if (!(site2 >= 0 && site2 < r.n) || r.pays[site2] !== pays) return {
      ok: false,
      texte: "Ce n'est pas une de tes usines."
    };
    const t = this.typeUsine(site2);
    if (t < 0) return {
      ok: false,
      texte: "Ce b\xE2timent ne produit pas d'unit\xE9s."
    };
    if (!r.actif[site2]) return {
      ok: false,
      texte: "Cette usine est d\xE9truite ou en chantier."
    };
    if (!(nombre2 >= 0) || !isFinite(nombre2)) return {
      ok: false,
      texte: "Nombre invalide."
    };
    nombre2 = Math.floor(nombre2);
    if (nombre2 === 0) {
      this.commande[site2] = this.paye[site2] ? 1 : 0;
      return {
        ok: true,
        texte: `Production arr\xEAt\xE9e (${r.noms[site2] || NOMS_UNITES[t]}).`
      };
    }
    this.commande[site2] += nombre2;
    const u = this.prix(t), jours = u.jours_production / (this.doublee(site2) ? 2 : 1);
    return {
      ok: true,
      texte: `Commande : ${commandeDe(t, nombre2)}, ${euros(u.prix)} et ${jours >= 1 ? `${nombre(jours)} jour${jours >= 2 ? "s" : ""}` : `${Math.round(jours * 24)} heures`} par unit\xE9.`
    };
  }
  /** Commande `nombre` unités d'un type, réparties à tour de rôle entre les usines actives du pays. */
  produireType(pays, type, nombre2) {
    const usines = this.res.sites(USINE_DE[type] ?? -1, pays).filter((s) => this.res.actif[s]);
    if (!usines.length) return {
      ok: false,
      texte: `Aucune usine de ${NOMS_UNITES[type] ?? "?"} dans ton pays.`
    };
    nombre2 = Math.floor(nombre2);
    if (!(nombre2 > 0)) return {
      ok: false,
      texte: "Nombre invalide."
    };
    this.assurer();
    usines.sort((a, b) => this.commande[a] - this.commande[b] || a - b);
    for (let k = 0; k < nombre2; k++) this.commande[usines[k % usines.length]]++;
    const ou = Math.min(nombre2, usines.length);
    return {
      ok: true,
      texte: `Commande : ${commandeDe(type, nombre2)}${ou > 1 ? `, r\xE9partie entre ${ou} usines` : ""}.`
    };
  }
  doublee(site2) {
    return site2 < this.bat.double.length && this.bat.double[site2] === 1;
  }
  // ------------------------------------------------------------------ chaque heure
  heure() {
    const r = this.res;
    this.assurer();
    for (let s = 0; s < r.n; s++) {
      if (!(this.commande[s] > 0) || !r.actif[s]) continue;
      const t = this.typeUsine(s);
      if (t < 0) continue;
      if (!this.paye[s]) {
        const code = this.payer(r.pays[s], s, t);
        this.attente[s] = code;
        if (code) continue;
        this.paye[s] = 1;
      }
      this.avancement[s] += (this.doublee(s) ? 2 : 1) * this.facteur[r.pays[s]];
      if (this.avancement[s] + 1e-6 < this.heuresProduction(t)) continue;
      if (!this.livrer(s, t)) {
        this.attente[s] = ATTENTE_SANS_LIEU;
        continue;
      }
      this.avancement[s] = 0, this.paye[s] = 0, this.attente[s] = 0;
      this.commande[s]--;
      this.produites[t]++;
    }
  }
  /** Paie l'unité suivante d'une usine : argent, carburant (un dépôt du pays), recrues (tout le pays). Rend ATTENTE_*. */
  payer(pays, usine, type) {
    const r = this.res, u = this.prix(type);
    if (r.tresor[pays] < u.prix) return ATTENTE_ARGENT;
    let depot2 = -1, bd = Infinity;
    for (const s of r.sites(DEPOT, pays)) {
      if (!r.actif[s] || r.stock[4 * s + CARBURANT] < u.carburant_t) continue;
      const d = Math.hypot(r.x[s] - r.x[usine], r.y[s] - r.y[usine]);
      if (d < bd) bd = d, depot2 = s;
    }
    if (depot2 < 0 && u.carburant_t > 0) return ATTENTE_CARBURANT;
    let sources = [];
    if (u.recrues > 0) {
      sources = [
        ...r.sites(CASERNE, pays),
        ...r.sites(DEPOT, pays)
      ].filter((s) => r.actif[s] && r.stock[4 * s + RECRUES] > 0);
      sources.sort((a, b) => (a === usine ? -1 : b === usine ? 1 : 0) || Math.hypot(r.x[a] - r.x[usine], r.y[a] - r.y[usine]) - Math.hypot(r.x[b] - r.x[usine], r.y[b] - r.y[usine]) || a - b);
      let total = 0;
      for (const s of sources) total += r.stock[4 * s + RECRUES];
      if (total < u.recrues) return ATTENTE_RECRUES;
    }
    r.depenser(pays, u.prix);
    if (depot2 >= 0) r.prendre(depot2, CARBURANT, u.carburant_t);
    let reste = u.recrues;
    for (const s of sources) {
      if (reste <= 0) break;
      reste -= r.prendre(s, RECRUES, reste);
    }
    return ATTENTE_RIEN;
  }
  /** Une unité finie : avion à l'aéroport le plus proche, navire au port de l'usine, le reste vers un dépôt (groupes.ts). */
  livrer(usine, type) {
    const r = this.res, pays = r.pays[usine];
    if (type === AVIONS) {
      let best = -1, bd = Infinity;
      for (const s of r.sites(AEROPORT, pays)) {
        if (!r.actif[s]) continue;
        const d = Math.hypot(r.x[s] - r.x[usine], r.y[s] - r.y[usine]);
        if (d < bd) bd = d, best = s;
      }
      if (best < 0) return false;
      this.parc[5 * best + AVIONS]++;
      return true;
    }
    if (type === NAVIRES) {
      const P = r.d.reseau.ports;
      let best = -1, bd = Infinity;
      for (let i = 0; i < P.n; i++) {
        if (P.mer[i] < 0 || P.pays[i] !== pays) continue;
        const d = Math.hypot(P.x[i] - r.x[usine], P.y[i] - r.y[usine]);
        if (d < bd) bd = d, best = i;
      }
      if (best < 0) return false;
      this.naviresPort[best]++, this.paysPort[best] = pays;
      return true;
    }
    this.sorties.push({
      pays,
      site: usine,
      type,
      n: TAILLE[type]
    });
    return true;
  }
  systemes() {
    return [
      {
        nom: "unit\xE9s : production",
        periode: HEURE,
        executer: (_m) => this.heure(),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    const r = this.res;
    for (let i = 0; i < r.n; i++) s += this.commande[i] * 7 + this.avancement[i] * 3 + (this.parc[5 * i] * 1e-3 + this.parc[5 * i + 1] + this.parc[5 * i + 3]);
    return melanger(h, Math.round(s) | 0);
  }
  /** Navires aux ports : des tours à rayon (V2.A.2) ; les avions aux aéroports et les flottes en mer sont dans air-mer.ts. */
  dessiner(c, camp) {
    const P = this.res.d.reseau.ports;
    for (let i = 0; i < P.n; i++) {
      const n = this.naviresPort[i];
      if (n > 0) c.tour(1e6 + i, P.x[i], P.y[i], 0, TOUR_NAVIRES, camp(this.paysPort[i]), n);
    }
  }
};
function texteUnites(n) {
  const l = [];
  for (let t = 0; t < n.length; t++) if (n[t] > 0) l.push(`${nombre(n[t])} ${NOMS_UNITES[t]}`);
  return l.join(", ") || "rien";
}

// web/src/sim/combat.ts
var PLAINE = 0;
var VILLE = 2;
var NOMS_TERRAINS = [
  "plaine",
  "for\xEAt",
  "ville",
  "montagne"
];
var ASSAUT = 0;
var RENCONTRE = 1;
var POSITION = 2;
var BOMBARDEMENT = 3;
var NOMS_MODES = [
  "assaut",
  "rencontre",
  "face-\xE0-face",
  "bombardement"
];
var SEPARES = 2;
var PARAMS6 = {
  /**
   * ❓ Valeur d'une unité en équivalents soldats, par terrain du combat : [terrain][type][type d'en face] (soldats par
   * homme). Un char vaut 10 soldats en plaine, 3 en ville, en forêt et en montagne (CONCEPTION) ; un canon 15 au contact
   * (poids de la V1, C.8) quand des troupes le couvrent. Les lignes ne dépendent pas encore du type d'en face.
   */
  valeur: [
    [
      [
        1,
        1,
        1
      ],
      [
        10,
        10,
        10
      ],
      [
        15,
        15,
        15
      ]
    ],
    [
      [
        1,
        1,
        1
      ],
      [
        3,
        3,
        3
      ],
      [
        15,
        15,
        15
      ]
    ],
    [
      [
        1,
        1,
        1
      ],
      [
        3,
        3,
        3
      ],
      [
        15,
        15,
        15
      ]
    ],
    [
      [
        1,
        1,
        1
      ],
      [
        3,
        3,
        3
      ],
      [
        15,
        15,
        15
      ]
    ]
  ],
  /** ❓ Un canon sans soldats ni chars devant lui : « sans défense au contact ». */
  canonSeul: 1,
  /** Terrain côté défenseur, valeurs de la V1 (Dupuy) : plaine, forêt, ville, montagne. */
  terrainDefense: [
    1,
    1.3,
    1.4,
    1.5
  ],
  /** ❓ Retranchement passif du défenseur immobile : +25 % après 24 h, +50 % après 7 jours. */
  retranchement: [
    [
      24,
      1.25
    ],
    [
      168,
      1.5
    ]
  ],
  /** Couverture aérienne d'un groupe (CONCEPTION). */
  couverture: 1.3,
  /** ❓ Sans munitions : groupe affaibli (V1, C.7). */
  sansMunitions: 0.2,
  /** Pertes par jour (V1, calage CDB90) : défenseur k × R^e, attaquant k × R^e. */
  kDef: 0.0254,
  eDef: 0.864,
  kAtt: 0.0184,
  eAtt: -0.52,
  /** ❓ Face-à-face (personne n'avance) : × 0,2 (mode « position » de la V1) ; bombardement : × 0,3 (V1). */
  intensitePosition: 0.2,
  intensiteBombardement: 0.3,
  /** Seuils de rupture (CDB90, V1) : défenseur 9 %, attaquant 4 % (rencontre : 4 % pour les deux). */
  seuilDef: 0.09,
  seuilAtt: 0.04,
  /** ❓ Part des pertes qui sont des tués (V1 : 1 tué pour 3 blessés) ; les blessés ne sont pas suivis. */
  partTues: 0.25,
  /** ❓ Portée de l'artillerie (km de carte, CONCEPTION). */
  porteeArtillerieKm: 30,
  /** Combats terminés gardés pour le menu de guerre. */
  gardesTermines: 200,
  /** ❓ Ponts : un groupe avec au moins un canon à moins de cette distance, qui y brûle ces munitions (t). */
  kmPont: 30,
  munitionsPont: 20,
  /** ❓ Reconstruire un pont : le prix de 5 km de route (V2.B.2), 2 jours. */
  kmRouteReparation: 5,
  joursReparation: 2,
  /** Un noeud de route à moins de cette distance d'une ville vivante (km) compte comme ville. */
  kmVille: 5
};
async function chargerDonneesCombat(lire2, nAretes) {
  const o = new Uint8Array(await decompresser(await lire2("monde-combat.bin.z")));
  const v = new DataView(o.buffer, o.byteOffset, o.byteLength);
  if (String.fromCharCode(...o.subarray(0, 4)) !== "CBT1") throw new Error("monde-combat.bin.z : format inconnu");
  const nN = v.getUint32(4, true), nP = v.getUint32(8, true);
  const terrainNoeud = o.slice(12, 12 + nN);
  const pontArete = new Uint32Array(nP), pontFleuve = new Uint16Array(nP), pontDe = new Int32Array(nAretes).fill(-1);
  for (let i = 0, p = 12 + nN; i < nP; i++, p += 6) {
    pontArete[i] = v.getUint32(p, true), pontFleuve[i] = v.getUint16(p + 4, true);
    pontDe[pontArete[i]] = i;
  }
  const info = JSON.parse(new TextDecoder().decode(await lire2("monde-combat.json")));
  return {
    terrainNoeud,
    pontArete,
    pontFleuve,
    fleuves: info.fleuves,
    pontDe
  };
}
var CASE = 50;
var cle = (cx, cy) => (cx + 5e3) * 1e4 + (cy + 5e3);
var Combat = class {
  joueur;
  combats;
  termines;
  prochain;
  /** tués par pays depuis le départ */
  tuesParPays;
  /** ponts détruits (1) */
  detruits;
  reparations;
  /** messages pour le joueur, à afficher puis vider */
  alertes;
  // ---- bilans
  heuresDeCombat;
  groupesDetruits;
  constructor(res, flux, grp, bat, d, joueur) {
    this.joueur = joueur;
    this.combats = [];
    this.termines = [];
    this.prochain = 1;
    this.tuesParPays = new Float64Array(256);
    this.reparations = [];
    this.alertes = [];
    this.heuresDeCombat = 0;
    this.groupesDetruits = 0;
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "flux", {
      value: flux,
      enumerable: false
    });
    Object.defineProperty(this, "grp", {
      value: grp,
      enumerable: false
    });
    Object.defineProperty(this, "bat", {
      value: bat,
      enumerable: false
    });
    Object.defineProperty(this, "d", {
      value: d,
      enumerable: false
    });
    const v = res.d.reseau.vivantes, vn = new Uint8Array(res.d.reseau.axes.nNoeuds);
    for (let i = 0; i < v.n; i++) if (v.kmRoute[i] <= PARAMS6.kmVille) vn[v.noeudRoute[i]] = 1;
    Object.defineProperty(this, "villeNoeud", {
      value: vn,
      enumerable: false
    });
    Object.defineProperty(this, "membre", {
      value: /* @__PURE__ */ new Map(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, "journal", {
      value: [],
      enumerable: false,
      writable: true
    });
    this.detruits = new Uint8Array(d.pontArete.length);
  }
  apresRestauration() {
    this.membre = /* @__PURE__ */ new Map();
    for (const c of this.combats) for (const s of c.cotes) for (const id of s.groupes) this.membre.set(id, c);
  }
  // ------------------------------------------------------------------ terrain et puissance
  /** Terrain de combat d'un noeud de route. */
  terrainNoeud(n) {
    if (this.villeNoeud[n]) return VILLE;
    return this.d.terrainNoeud[n] ?? PLAINE;
  }
  /** Masse d'un groupe (équivalents soldats en plaine) : la base des seuils de rupture. */
  masse(g) {
    const V = PARAMS6.valeur[PLAINE];
    return g.n[SOLDATS] * V[0][0] + g.n[CHARS] * V[1][1] + g.n[ARTILLERIE] * V[2][2];
  }
  /** Bonus du retranchement passif d'un groupe immobile (heures sur place). */
  retranchement(g) {
    let f = 1;
    for (const [h, b] of PARAMS6.retranchement) if (g.surPlace >= h) f = b;
    return f;
  }
  /**
   * Puissance d'un groupe dans un combat sur `terrain` contre une composition d'en face `face` (soldats, chars, canons),
   * en défense ou non.
   */
  puissance(g, terrain, face, defend) {
    const V = PARAMS6.valeur[terrain], P = PARAMS6;
    const VP = P.valeur[PLAINE], m = [
      face[0] * VP[0][0],
      face[1] * VP[1][1],
      face[2] * VP[2][2]
    ];
    const tot = m[0] + m[1] + m[2];
    const parts = tot > 0 ? m.map((x) => x / tot) : [
      1,
      0,
      0
    ];
    let p = 0;
    for (let t = 0; t < 3; t++) {
      if (g.n[t] <= 0) continue;
      let v = 0;
      for (let u = 0; u < 3; u++) v += parts[u] * V[t][u];
      if (t === ARTILLERIE && g.n[SOLDATS] + g.n[CHARS] <= 0) v = P.canonSeul;
      p += g.n[t] * v;
    }
    p *= g.munitions > 1e-9 ? 1 : P.sansMunitions;
    if (g.avions > 0) p *= P.couverture;
    if (defend) p *= P.terrainDefense[terrain] * this.retranchement(g);
    return p;
  }
  /** Puissance de frappe d'un groupe d'artillerie à portée (sans terrain : il tire de loin). */
  appui(g) {
    return g.munitions > 1e-9 ? g.n[ARTILLERIE] * PARAMS6.valeur[PLAINE][2][2] : 0;
  }
  // ------------------------------------------------------------------ chaque heure
  heure(m) {
    this.reparer(m.heure);
    const g = this.grp;
    const vivant = (id) => {
      const x = g.trouver(id);
      return x && !x.fini ? x : null;
    };
    const parent = /* @__PURE__ */ new Map();
    const trouver = (a) => {
      let r = a;
      while (parent.get(r) !== r) r = parent.get(r);
      while (parent.get(a) !== r) {
        const n = parent.get(a);
        parent.set(a, r), a = n;
      }
      return r;
    };
    const voisins = /* @__PURE__ */ new Map();
    const c = g.contacts;
    for (let i = 0; i + 1 < c.length; i += 2) {
      const a = c[i], b = c[i + 1];
      if (!vivant(a) || !vivant(b)) continue;
      for (const x of [
        a,
        b
      ]) if (!parent.has(x)) parent.set(x, x), voisins.set(x, []);
      voisins.get(a).push(b), voisins.get(b).push(a);
      const ra = trouver(a), rb = trouver(b);
      if (ra !== rb) parent.set(Math.max(ra, rb), Math.min(ra, rb));
    }
    const composantes = /* @__PURE__ */ new Map();
    for (const id of [
      ...parent.keys()
    ].sort((x, y) => x - y)) {
      const r = trouver(id), l = composantes.get(r);
      if (l) l.push(id);
      else composantes.set(r, [
        id
      ]);
    }
    const touches = /* @__PURE__ */ new Set();
    for (const ids of composantes.values()) {
      let cb = null;
      for (const id of ids) {
        const x = this.membre.get(id);
        if (x && x.issue < 0 && (!cb || x.id < cb.id)) cb = x;
      }
      const ancien = cb;
      const cote = /* @__PURE__ */ new Map();
      if (ancien) {
        for (const k of [
          0,
          1
        ]) for (const id of ancien.cotes[k].groupes) if (ids.includes(id)) cote.set(id, k);
      }
      const file = [];
      if (cote.size) file.push(...cote.keys());
      else {
        const a = ids.find((id) => {
          const x = vivant(id);
          return x.ordre === ENVOYER && x.offensive;
        }) ?? ids[0];
        cote.set(a, 0), file.push(a);
      }
      while (file.length) {
        const a = file.shift();
        for (const b of voisins.get(a) ?? []) if (!cote.has(b)) cote.set(b, 1 - cote.get(a)), file.push(b);
        if (!file.length) {
          const reste = ids.find((id) => !cote.has(id));
          if (reste !== void 0) cote.set(reste, 0), file.push(reste);
        }
      }
      if (!cb) cb = this.nouveau(m.heure);
      for (const id of ids) {
        const x = this.membre.get(id);
        if (x && x !== cb && x.issue < 0) this.fondre(x, cb);
      }
      const camps = [
        [],
        []
      ];
      for (const id of ids) camps[cote.get(id)].push(id);
      for (const k of [
        0,
        1
      ]) {
        const s = cb.cotes[k];
        for (const id of s.groupes) if (!ids.includes(id) && this.membre.get(id) === cb) this.membre.delete(id);
        for (const id of camps[k]) {
          if (!s.groupes.includes(id)) s.base += this.masse(vivant(id));
          this.membre.set(id, cb);
        }
        s.groupes = camps[k];
      }
      touches.add(cb);
    }
    for (const cb of this.combats) {
      if (cb.issue < 0 && cb.mode !== BOMBARDEMENT && !touches.has(cb)) this.terminer(cb, m.heure, this.vainqueurSansContact(cb));
    }
    this.combats = this.combats.filter((cb) => cb.issue < 0);
    for (const cb of this.combats) cb.cotes[0].appuis = [], cb.cotes[1].appuis = [];
    this.artillerie(m.heure, touches);
    for (const cb of [
      ...this.combats
    ]) {
      if (cb.issue >= 0) continue;
      if (!touches.has(cb)) {
        this.terminer(cb, m.heure, this.vainqueurSansContact(cb));
        continue;
      }
      this.resoudre(cb, m.heure);
    }
    this.combats = this.combats.filter((cb) => cb.issue < 0);
  }
  nouveau(heure) {
    const cote = () => ({
      groupes: [],
      appuis: [],
      pays: [],
      base: 0,
      perdu: 0,
      puissance: 0,
      effectifs: [
        0,
        0,
        0
      ],
      pertes: [
        0,
        0,
        0
      ],
      tues: 0
    });
    const cb = {
      id: this.prochain++,
      mode: ASSAUT,
      attaquant: 0,
      debut: heure,
      fin: -1,
      x: 0,
      y: 0,
      terrain: PLAINE,
      cotes: [
        cote(),
        cote()
      ],
      issue: -1
    };
    this.combats.push(cb);
    return cb;
  }
  /** `x` se fond dans `cb` : ses pertes passent du côté où est le même pays (sinon au camp 0). */
  fondre(x, cb) {
    for (const s of x.cotes) {
      const k = s.pays.some((p) => cb.cotes[1].pays.includes(p)) ? 1 : 0, t = cb.cotes[k];
      t.base += s.base, t.perdu += s.perdu, t.tues += s.tues;
      for (let i = 0; i < 3; i++) t.pertes[i] += s.pertes[i];
      for (const id of s.groupes) if (this.membre.get(id) === x) this.membre.delete(id);
    }
    x.issue = SEPARES, x.fin = cb.debut;
    this.combats = this.combats.filter((c) => c !== x);
  }
  /** Groupes d'artillerie hors contact : le groupe ennemi le plus proche à portée. */
  artillerie(heure, touches) {
    const g = this.grp, P = PARAMS6;
    const grille = /* @__PURE__ */ new Map();
    let tireurs = false;
    for (const x of g.groupes) {
      if (x.fini) continue;
      const k = cle(Math.floor(x.x / CASE), Math.floor(x.y / CASE)), l = grille.get(k);
      if (l) l.push(x);
      else grille.set(k, [
        x
      ]);
      if (x.n[ARTILLERIE] > 0 && x.munitions > 1e-9 && x.contact < 0 && x.ordre !== LIVRER) tireurs = true;
    }
    if (!tireurs) return;
    for (const a of g.groupes) {
      if (a.fini || a.n[ARTILLERIE] <= 0 || a.munitions <= 1e-9 || a.contact >= 0 || a.ordre === LIVRER) continue;
      const cx = Math.floor(a.x / CASE), cy = Math.floor(a.y / CASE);
      let cible = null, bd = P.porteeArtillerieKm;
      for (let i = cx - 1; i <= cx + 1; i++) {
        for (let j = cy - 1; j <= cy + 1; j++) {
          for (const o of grille.get(cle(i, j)) ?? []) {
            if (o === a || !g.enGuerre(a.pays, o.pays)) continue;
            const d = Math.hypot(o.x - a.x, o.y - a.y);
            if (d <= bd) bd = d, cible = o;
          }
        }
      }
      if (!cible) continue;
      let cb = this.membre.get(cible.id);
      if (!cb || cb.issue >= 0) {
        cb = this.nouveau(heure);
        cb.mode = BOMBARDEMENT;
        cb.cotes[1].groupes = [
          cible.id
        ];
        cb.cotes[1].base = this.masse(cible);
        this.membre.set(cible.id, cb);
      }
      const k = cb.cotes[0].groupes.includes(cible.id) ? 1 : 0;
      cb.cotes[k].appuis.push(a.id);
      touches.add(cb);
      a.munitions = Math.max(0, a.munitions - a.n[ARTILLERIE] * PARAMS5.munitionsCombat[ARTILLERIE]);
    }
  }
  /** Une heure d'un combat : mode, puissances, pertes, rupture. */
  resoudre(cb, heure) {
    const g = this.grp, P = PARAMS6;
    const gs = cb.cotes.map((s) => s.groupes.map((id) => g.trouver(id)).filter((x) => x && !x.fini));
    const ap = cb.cotes.map((s) => s.appuis.map((id) => g.trouver(id)).filter((x) => x && !x.fini));
    cb.cotes[0].groupes = gs[0].map((x) => x.id), cb.cotes[1].groupes = gs[1].map((x) => x.id);
    const bomb = gs[0].length === 0 || gs[1].length === 0;
    if (bomb && !(ap[0].length && gs[1].length) && !(ap[1].length && gs[0].length)) {
      this.terminer(cb, heure, gs[0].length ? 0 : gs[1].length ? 1 : SEPARES);
      return;
    }
    const avance = gs.map((l) => l.some((x) => x.ordre === ENVOYER && x.offensive));
    if (bomb) cb.mode = BOMBARDEMENT, cb.attaquant = gs[0].length ? 1 : 0;
    else if (avance[0] && avance[1]) cb.mode = RENCONTRE, cb.attaquant = -1;
    else if (!avance[0] && !avance[1]) cb.mode = POSITION, cb.attaquant = -1;
    else cb.mode = ASSAUT, cb.attaquant = avance[0] ? 0 : 1;
    const def = cb.attaquant === 0 ? 1 : cb.attaquant === 1 ? 0 : 1;
    const lieu2 = gs[def][0] ?? gs[1 - def][0];
    cb.terrain = this.terrainNoeud(g.noeudProche(lieu2));
    let sx = 0, sy = 0, nb = 0;
    for (const l of gs) for (const x of l) sx += x.x, sy += x.y, nb++;
    cb.x = sx / nb, cb.y = sy / nb;
    const compo = gs.map((l) => {
      const n = [
        0,
        0,
        0
      ];
      for (const x of l) for (let t = 0; t < 3; t++) n[t] += x.n[t];
      return n;
    });
    const enDefense = (k) => cb.mode === POSITION || cb.mode !== RENCONTRE && k !== cb.attaquant;
    const pg = gs.map((l, k) => l.map((x) => this.puissance(x, cb.terrain, compo[1 - k], enDefense(k))));
    const pk = [
      0,
      1
    ].map((k) => pg[k].reduce((a, b) => a + b, 0) + ap[k].reduce((a, x) => a + this.appui(x), 0));
    for (const k of [
      0,
      1
    ]) {
      const s = cb.cotes[k];
      s.puissance = pk[k], s.effectifs = compo[k];
      for (const x of gs[k]) for (const p of [
        x.pays
      ]) if (!s.pays.includes(p)) s.pays.push(p);
    }
    const f = [
      0,
      0
    ];
    if (cb.mode === BOMBARDEMENT) {
      const a = cb.attaquant, d = 1 - a;
      f[d] = pk[d] > 0 ? P.kDef * (pk[a] / pk[d]) ** P.eDef * P.intensiteBombardement / 24 : 1;
    } else if (cb.mode === ASSAUT) {
      const a = cb.attaquant, d = 1 - a;
      if (pk[d] <= 0) f[d] = 1;
      else if (pk[a] <= 0) f[a] = 1;
      else {
        const R = pk[a] / pk[d];
        f[d] = P.kDef * R ** P.eDef / 24, f[a] = P.kAtt * R ** P.eAtt / 24;
      }
    } else {
      const intens = cb.mode === POSITION ? P.intensitePosition : 1, perte = P.kAtt * Math.min(pk[0], pk[1]) * intens / 24;
      for (const k of [
        0,
        1
      ]) f[k] = pk[k] > 0 ? perte / pk[k] : 1;
    }
    for (const k of [
      0,
      1
    ]) this.appliquer(cb.cotes[k], gs[k], Math.min(1, f[k]));
    this.heuresDeCombat++;
    if (cb.mode === BOMBARDEMENT) {
      const d = 1 - cb.attaquant;
      if (gs[d].every((x) => x.fini)) this.terminer(cb, heure, cb.attaquant);
      return;
    }
    const prog = [
      0,
      1
    ].map((k) => this.progres(cb, k));
    const casse = [
      0,
      1
    ].filter((k) => prog[k] >= 1 || gs[k].every((x) => x.fini));
    if (casse.length) {
      const perdant = casse.length === 2 ? prog[0] >= prog[1] ? 0 : 1 : casse[0];
      this.detruire(cb, perdant, gs[perdant]);
      this.terminer(cb, heure, 1 - perdant);
    }
  }
  /** Seuil de rupture du camp k cette heure. */
  seuil(cb, k) {
    return cb.mode === ASSAUT && k !== cb.attaquant ? PARAMS6.seuilDef : cb.mode === POSITION ? PARAMS6.seuilDef : PARAMS6.seuilAtt;
  }
  /** Part du seuil de rupture atteinte (0 à 1 et plus). */
  progres(cb, k) {
    const s = cb.cotes[k];
    return s.base > 0 ? s.perdu / s.base / this.seuil(cb, k) : 0;
  }
  /** Chaque groupe du camp perd la part `f` de chaque type ; les tués quittent la population. */
  appliquer(s, gs, f) {
    if (!(f > 0)) return;
    for (const x of gs) {
      const avant = this.masse(x);
      for (let t = 0; t < 3; t++) {
        const q = x.n[t] * f;
        x.n[t] -= q, s.pertes[t] += q;
        if (t === SOLDATS) {
          const tues = q * PARAMS6.partTues;
          s.tues += tues;
          this.tuesParPays[x.pays] += tues;
          this.res.tues(x.pays, tues);
        }
      }
      s.perdu += avant - this.masse(x);
      if (x.n[SOLDATS] < 1 && x.n[CHARS] < 0.5 && x.n[ARTILLERIE] < 0.5) this.supprimer(x);
    }
  }
  supprimer(x) {
    if (x.fini) return;
    this.grp.supprimer(x.id);
    this.groupesDetruits++;
    this.noter(EV_DETRUIT, x.x, x.y, x.pays);
  }
  /** 25/10 : un événement pour le rendu (au plus 400 en attente : à ×100, les plus anciens tombent). */
  noter(genre, x, y, pays) {
    const j = this.journal;
    if (j.length >= 4 * 400) j.splice(0, 4 * 100);
    j.push(genre, x, y, pays);
  }
  /** Le camp cède : ses groupes engagés sont détruits (les restants dispersés, le matériel perdu). */
  detruire(cb, k, gs) {
    const s = cb.cotes[k];
    for (const x of gs) {
      if (x.fini) continue;
      for (let t = 0; t < 3; t++) s.pertes[t] += x.n[t];
      s.perdu += this.masse(x);
      if (x.pays === this.joueur && this.alertes.length < 20) this.alertes.push(`${x.nom} est d\xE9truit.`);
      this.supprimer(x);
    }
  }
  /** Plus de contact : le camp qui a encore des groupes l'emporte si l'autre a disparu, sinon séparés. */
  vainqueurSansContact(cb) {
    const vivants = cb.cotes.map((s) => s.groupes.some((id) => {
      const x = this.grp.trouver(id);
      return x && !x.fini;
    }));
    return vivants[0] && !vivants[1] ? 0 : vivants[1] && !vivants[0] ? 1 : SEPARES;
  }
  terminer(cb, heure, issue) {
    cb.issue = issue, cb.fin = heure;
    if ((issue === 0 || issue === 1) && cb.mode !== BOMBARDEMENT && cb.cotes[issue].pays.length) {
      this.noter(EV_FIN_COMBAT, cb.x, cb.y, cb.cotes[issue].pays[0]);
    }
    for (const s of cb.cotes) for (const id of s.groupes) if (this.membre.get(id) === cb) this.membre.delete(id);
    if (cb.mode === BOMBARDEMENT && cb.cotes[0].perdu + cb.cotes[1].perdu <= 0) return;
    const j = this.coteDuJoueur(cb);
    if (j >= 0 && issue !== SEPARES && cb.mode !== BOMBARDEMENT && this.alertes.length < 20) {
      this.alertes.push(`Combat ${issue === j ? "gagn\xE9" : "perdu"} en ${NOMS_TERRAINS[cb.terrain]} (${nombre(cb.cotes[j].tues)} tu\xE9s de ton c\xF4t\xE9).`);
    }
    this.termines.push(cb);
    if (this.termines.length > PARAMS6.gardesTermines) this.termines.splice(0, this.termines.length - PARAMS6.gardesTermines);
  }
  coteDuJoueur(cb) {
    for (const k of [
      0,
      1
    ]) if (cb.cotes[k].pays.includes(this.joueur)) return k;
    return -1;
  }
  // ------------------------------------------------------------------ ponts
  /** Milieu d'un pont (km de carte) : le point du milieu de son tracé. */
  positionPont(i) {
    const a = this.res.d.reseau.axes, e = this.d.pontArete[i];
    const o0 = a.offsets[e], o1 = a.offsets[e + 1];
    if (o1 > o0) {
      const k = o0 + o1 >> 1;
      return [
        a.pts[2 * k],
        a.pts[2 * k + 1]
      ];
    }
    const n = a.noeuds;
    return [
      (n[2 * a.a[e]] + n[2 * a.b[e]]) / 2,
      (n[2 * a.a[e] + 1] + n[2 * a.b[e] + 1]) / 2
    ];
  }
  nomPont(i) {
    return `pont sur ${this.d.fleuves[this.d.pontFleuve[i]] ?? "le fleuve"}`;
  }
  /** Ponts à moins de `km` de (x, y), les plus proches d'abord. */
  pontsPres(x, y, km) {
    const l = [];
    for (let i = 0; i < this.d.pontArete.length; i++) {
      const [px, py] = this.positionPont(i), d = Math.hypot(px - x, py - y);
      if (d <= km) l.push([
        d,
        i
      ]);
    }
    return l.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  }
  /** Détruit un pont (artillerie à portée, ou avions de V2.C.5 avec `par = null`). */
  detruirePont(pays, i, par = "artillerie") {
    if (!(i >= 0 && i < this.d.pontArete.length)) return {
      ok: false,
      texte: "Ce n'est pas un pont."
    };
    if (this.detruits[i]) return {
      ok: false,
      texte: `Le ${this.nomPont(i)} est d\xE9j\xE0 d\xE9truit.`
    };
    const [px, py] = this.positionPont(i), P = PARAMS6;
    if (par === "artillerie") {
      const a = this.grp.groupesDe(pays).find((g) => g.n[ARTILLERIE] >= 1 && g.munitions >= P.munitionsPont && g.ordre !== LIVRER && Math.hypot(g.x - px, g.y - py) <= P.kmPont);
      if (!a) return {
        ok: false,
        texte: `Il faut un groupe avec des canons et ${P.munitionsPont} t de munitions \xE0 moins de ${P.kmPont} km du pont.`
      };
      a.munitions -= P.munitionsPont;
    }
    this.detruits[i] = 1;
    this.flux.couper(this.d.pontArete[i]);
    this.reparations = this.reparations.filter((r) => r.pont !== i);
    return {
      ok: true,
      texte: `${this.nomPont(i)[0].toUpperCase()}${this.nomPont(i).slice(1)} d\xE9truit : la route est coup\xE9e.`
    };
  }
  /** Coût de la reconstruction d'un pont. */
  prixReparation() {
    return (prixBatiment(this.res.d.prix, "route")?.prix ?? 0) * PARAMS6.kmRouteReparation;
  }
  /** Reconstruit un pont détruit, sur son territoire : payé tout de suite, rouvert après le délai. */
  reparerPont(pays, i, heure) {
    if (!(i >= 0 && i < this.d.pontArete.length) || !this.detruits[i]) return {
      ok: false,
      texte: "Ce pont n'est pas d\xE9truit."
    };
    if (this.reparations.some((r) => r.pont === i)) return {
      ok: false,
      texte: "Ce pont est d\xE9j\xE0 en reconstruction."
    };
    const [px, py] = this.positionPont(i);
    if (this.bat.proprietaire(px, py) !== pays) return {
      ok: false,
      texte: "Ce pont n'est pas sur ton territoire."
    };
    const prix = this.prixReparation();
    if (!this.res.depenser(pays, prix)) return {
      ok: false,
      texte: `Pas assez d'argent : il faut ${nombre(prix)}.`
    };
    this.reparations.push({
      pont: i,
      pays,
      fin: heure + 24 * PARAMS6.joursReparation
    });
    return {
      ok: true,
      texte: `Reconstruction du ${this.nomPont(i)} : ${PARAMS6.joursReparation} jours.`
    };
  }
  reparer(heure) {
    if (!this.reparations.length) return;
    this.reparations = this.reparations.filter((r) => {
      if (heure < r.fin) return true;
      this.detruits[r.pont] = 0;
      this.flux.couper(this.d.pontArete[r.pont], false);
      if (r.pays === this.joueur && this.alertes.length < 20) this.alertes.push(`Le ${this.nomPont(r.pont)} est reconstruit.`);
      return false;
    });
  }
  // ------------------------------------------------------------------ pour l'interface et les autres modules
  /** Combat où est engagé un groupe (null : aucun). */
  combatDe(groupe2) {
    const c = this.membre.get(groupe2);
    return c && c.issue < 0 ? c : null;
  }
  fiche(cb) {
    const s = cb.cotes;
    return {
      id: cb.id,
      enCours: cb.issue < 0,
      mode: NOMS_MODES[cb.mode],
      terrain: NOMS_TERRAINS[cb.terrain],
      x: cb.x,
      y: cb.y,
      debut: cb.debut,
      fin: cb.fin,
      pays: [
        s[0].pays.slice(),
        s[1].pays.slice()
      ],
      puissance: [
        s[0].puissance,
        s[1].puissance
      ],
      effectifs: [
        s[0].effectifs.map(Math.round),
        s[1].effectifs.map(Math.round)
      ],
      pertes: [
        s[0].pertes.map(Math.round),
        s[1].pertes.map(Math.round)
      ],
      progres: [
        Math.min(1, this.progres(cb, 0)),
        Math.min(1, this.progres(cb, 1))
      ],
      issue: cb.issue,
      joueur: this.coteDuJoueur(cb)
    };
  }
  /**
   * Panneau « Combats en cours » et menu de guerre : les combats en cours (ceux du joueur d'abord, au plus `max`) et les
   * derniers terminés où le joueur ou un de ses alliés était.
   */
  fiches(max = 40) {
    const g = this.grp, j = this.joueur;
    const touche = (cb) => cb.cotes.some((s) => s.pays.some((p) => g.ami(j, p)));
    const en = this.combats.filter((cb) => cb.mode !== BOMBARDEMENT || touche(cb));
    en.sort((a, b) => Number(touche(b)) - Number(touche(a)) || a.id - b.id);
    const fin = this.termines.filter(touche).slice(-max).reverse();
    return {
      enCours: en.slice(0, max).map((cb) => this.fiche(cb)),
      termines: fin.map((cb) => this.fiche(cb)),
      total: this.combats.length
    };
  }
  vider() {
    const a = this.alertes;
    this.alertes = [];
    return a;
  }
  /**
   * 25/10 (motion design de la guerre) : les combats en cours (centre, mode, camps, rapport des forces, membres) et les
   * combats gagnés et groupes détruits depuis le dernier envoi, pour les dessiner sur le terrain.
   */
  rendu(c) {
    const g = this.grp;
    for (const cb of this.combats) {
      if (cb.issue >= 0) continue;
      const membres = [], roles = [], camps = [
        CAMP_NEUTRE,
        CAMP_NEUTRE
      ];
      for (const k of [
        0,
        1
      ]) {
        const s = cb.cotes[k];
        for (const id of s.groupes) membres.push(id), roles.push(k);
        for (const id of s.appuis) membres.push(id), roles.push(k | MEMBRE_APPUI);
        const p = s.pays[0] ?? g.trouver(s.groupes[0] ?? s.appuis[0] ?? -1)?.pays;
        if (p !== void 0) camps[k] = g.camp(p);
      }
      if (!membres.length) continue;
      const [a, b] = cb.cotes, total = a.puissance + b.puissance;
      const masse = a.effectifs[0] + a.effectifs[1] + a.effectifs[2] + b.effectifs[0] + b.effectifs[1] + b.effectifs[2];
      c.combat(cb.id, cb.x, cb.y, cb.mode, camps[0], camps[1], total > 0 ? a.puissance / total : 0.5, masse, membres, roles);
    }
    const j = this.journal;
    for (let i = 0; i < j.length; i += 4) c.evenement(j[i], j[i + 1], j[i + 2], g.camp(j[i + 3]), j[i + 3]);
    this.journal = [];
  }
  systemes() {
    return [
      {
        nom: "combat",
        periode: HEURE,
        executer: (m) => this.heure(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (const cb of this.combats) s += cb.id * 3 + cb.cotes[0].perdu + cb.cotes[1].perdu * 2 + cb.mode;
    for (let p = 0; p < 256; p += 5) s += this.tuesParPays[p] * 0.01;
    h = melanger(h, this.combats.length);
    h = melanger(h, this.termines.length);
    return melanger(h, Math.round(s) | 0);
  }
};

// web/src/sim/air-mer.ts
var PARAMS7 = {
  rayonAvionsKm: 800,
  rayonDcaKm: 60,
  rayonNaviresKm: 300,
  /** ❓ Sorties par avion et par jour en patrouille ; carburant et munitions d'une sortie (t). */
  sortiesParJour: 2,
  carburantSortie: 5,
  munitionsSortie: 1,
  /** ❓ Ce qu'une sortie détruit : équivalents soldats en plaine (groupe, parc d'un dépôt), tonnes de stock d'un dépôt,
   *  convois, navires. */
  degatsSortie: 4,
  tonnesSortie: 50,
  convoisParSortie: 0.25,
  naviresParSortie: 0.01,
  /** Part maximale d'un groupe ou d'une flotte perdue en une heure (air, mer). */
  pertesMaxHeure: 0.5,
  /** ❓ Combat aérien : avions perdus par heure par avion ennemi en patrouille dont la base est dans le rayon. */
  kAir: 2e-3,
  /** ❓ DCA : avions abattus par heure, munitions brûlées par heure de tir (t). Navire visé : avions abattus par navire. */
  dcaAvionsHeure: 0.5,
  dcaMunitionsHeure: 5,
  dcaNavire: 0.02,
  /** Navires (CONCEPTION) : 50 km/h ; ❓ consommation par navire (t/h), réserve embarquée (heures), dépôt à portée du port. */
  kmhNavires: 50,
  carburantNavireHeure: 2,
  munitionsNavireHeure: 0.5,
  reserveNaviresHeures: 360,
  porteePortKm: 300,
  /** ❓ Combat naval : navires perdus par heure par navire ennemi à portée. */
  kMer: 0.03,
  /** ❓ Blocus : probabilité par heure et par navire de couler un cargo dans la zone (plafond). */
  blocusParNavire: 0.05,
  blocusMax: 0.9,
  /** ❓ Côte : à moins de cette distance d'un port. Bombardement par navire et par heure : équivalents soldats, tonnes de
   *  stock, tués dans une ville. */
  kmCote: 30,
  degatsNavire: 10,
  tonnesNavire: 20,
  tuesNavire: 5,
  /** ❓ Débarquement : un navire par tant d'équivalents soldats ; port d'embarquement à moins de, port visé à moins de. */
  masseParNavire: 1e4,
  kmEmbarquement: 30,
  kmPortVise: 100,
  /** Zone visée : le noeud de mer le plus proche du clic à moins de (km de carte). */
  kmZone: 500,
  /** Cargos vers une tête de pont : vitesse (km/h, comme flux.ts), toutes les n heures, sous ce remplissage. */
  kmhCargo: 28,
  periodeRavitaillement: 6,
  seuilRavitaillement: 2 / 3
};
var C = CIRCONFERENCE_KM;
function distanceSol(ax, ay, bx, by) {
  let dx = bx - ax;
  dx -= C * Math.round(dx / C);
  return Math.hypot(dx, by - ay) / Math.cosh((ay + by) / 2 / R_KM);
}
var rayonCarte = (km, y) => km * Math.cosh(y / R_KM);
var hasard = (a, b, c) => melanger(melanger(melanger(2654435769, a), b), c) / 4294967296;
var ZONE = 0;
var RENTRER = 1;
var TRANSPORT = 2;
var NOMS_ORDRES_FLOTTE = [
  "tient la mer",
  "rentre au port",
  "transporte un groupe"
];
var C_GROUPE = 0;
var C_PORT = 1;
var C_FLOTTE = 2;
var C_CONVOI = 3;
var C_DEPOT = 4;
var caches = /* @__PURE__ */ new WeakMap();
var SORTIE2 = new Float32Array(3);
var AirMer = class {
  joueur;
  /** 1 : avions de l'aéroport au repos (0 : en patrouille), par site */
  repos;
  /** dernière heure de tir de chaque DCA (une salve par heure) */
  tirDca;
  /** reliquats de convois et navires à détruire (sorties fractionnaires), par aéroport */
  reliquat;
  flottes;
  prochain;
  tetes;
  cargos;
  heure;
  alertes;
  // ---- bilans
  sorties;
  avionsPerdus;
  naviresPerdus;
  cargosCoules;
  convoisDetruits;
  constructor(res, flux, unites, grp, combat, trajets, joueur) {
    this.joueur = joueur;
    this.repos = new Uint8Array(1024);
    this.tirDca = new Int32Array(1024).fill(-1);
    this.reliquat = new Float32Array(1024);
    this.flottes = [];
    this.prochain = 1;
    this.tetes = [];
    this.cargos = [];
    this.heure = 0;
    this.alertes = [];
    this.sorties = 0;
    this.avionsPerdus = new Float64Array(256);
    this.naviresPerdus = new Float64Array(256);
    this.cargosCoules = 0;
    this.convoisDetruits = 0;
    for (const [k, v] of Object.entries({
      res,
      flux,
      unites,
      grp,
      combat,
      trajets
    })) Object.defineProperty(this, k, {
      value: v,
      enumerable: false
    });
    Object.defineProperty(this, "c", {
      value: cachesDe(res),
      enumerable: false
    });
    Object.defineProperty(this, "pos", {
      value: new PositionsTrajets(),
      enumerable: false,
      writable: true
    });
    this.assurer();
  }
  apresRestauration() {
    this.pos = new PositionsTrajets();
  }
  assurer() {
    const n = this.res.n;
    if (n <= this.repos.length) return;
    const cap = Math.max(n, 2 * this.repos.length);
    this.repos = agrandir2(this.repos, cap), this.reliquat = agrandir2(this.reliquat, cap);
    const t = new Int32Array(cap).fill(-1);
    t.set(this.tirDca);
    this.tirDca = t;
  }
  /** Position (x, y) sur un trajet du registre à l'abscisse t. */
  surTrajet(trajet, t) {
    if (this.pos.n < this.trajets.n) this.pos.recevoir(this.trajets.depuis(this.pos.n));
    this.pos.position(trajet, t, SORTIE2, 0);
    return [
      SORTIE2[0],
      SORTIE2[1]
    ];
  }
  nomPays(p) {
    return this.grp.nomPays(p);
  }
  alerter(texte, ...pays) {
    if (pays.includes(this.joueur) && this.alertes.length < 20) this.alertes.push(texte);
  }
  // ------------------------------------------------------------------ ordres
  /** Avions d'un aéroport du pays : en patrouille ou au repos. */
  aviation(pays, site2, patrouille) {
    const r = this.res;
    this.assurer();
    if (!(site2 >= 0 && site2 < r.n) || r.genre[site2] !== AEROPORT || r.pays[site2] !== pays) return {
      ok: false,
      texte: "Ce n'est pas un de tes a\xE9roports."
    };
    this.repos[site2] = patrouille ? 0 : 1;
    const n = this.unites.parc[5 * site2 + AVIONS];
    return {
      ok: true,
      texte: `${r.noms[site2] || "A\xE9roport"} : ${nombre(n)} avions ${patrouille ? `en patrouille (rayon ${PARAMS7.rayonAvionsKm} km)` : "au repos"}.`
    };
  }
  /** Noeud de mer le plus proche d'un point (−1 : trop loin de la mer). */
  noeudMer(x, y) {
    return this.c.merIndex.proche(x, y, PARAMS7.kmZone)[0];
  }
  /** Itinéraire de mer entre deux noeuds (passages fermés évités) ; null s'il n'y en a pas. */
  routeMer(de, vers) {
    const m = this.res.d.reseau.mer, fermes = this.flux.fermes, p = this.flux.parcoursMer;
    p.lancer([
      de
    ], Infinity, (e) => !(m.masque[e] & fermes), (v) => v === vers);
    if (!isFinite(p.d(vers))) return null;
    return {
      km: p.d(vers),
      noeuds: p.chemin(vers).noeuds
    };
  }
  /** Lance une flotte de (x, y) vers le noeud `vers` (arrivée en (ax, ay) si donné). false : pas de route. */
  naviguer(f, vers, arrivee) {
    const de = this.noeudMer(f.x, f.y);
    if (de < 0) return false;
    const it = de === vers ? {
      km: 0,
      noeuds: [
        vers
      ]
    } : this.routeMer(de, vers);
    if (!it) return false;
    const m = this.res.d.reseau.mer, km = it.km + distanceSol(f.x, f.y, this.c.merXY[2 * de], this.c.merXY[2 * de + 1]);
    f.trajet = this.trajets.ajouter(null, TRAJET_MER, polyligneMer(m, it.noeuds, [
      f.x,
      f.y
    ], arrivee), km);
    f.t = 0, f.dt = km > 1 ? PARAMS7.kmhNavires / km : 1, f.noeud = vers;
    return true;
  }
  /** Dépôt actif du pays le plus proche d'un port, à portée (−1 : aucun). */
  depotDuPort(pays, port) {
    const r = this.res, P = r.d.reseau.ports;
    let best = -1, bd = PARAMS7.porteePortKm;
    for (const s of r.sites(DEPOT, pays)) {
      if (!r.actif[s]) continue;
      const d = distanceSol(r.x[s], r.y[s], P.x[port], P.y[port]);
      if (d <= bd) bd = d, best = s;
    }
    return best;
  }
  /** Crée une flotte de `n` navires au port (même pays), réserve prise au dépôt le plus proche du port. */
  armer(pays, port, n, ordre) {
    const P = this.res.d.reseau.ports, u = this.unites, r = this.res;
    if (!(port >= 0 && port < P.n) || u.paysPort[port] !== pays || P.mer[port] < 0) return "Ce n'est pas un de tes ports ouverts sur la mer.";
    n = Math.floor(n);
    if (!(n >= 1)) return "Il faut au moins un navire.";
    if (u.naviresPort[port] < n) return `Le port n'a que ${nombre(u.naviresPort[port])} navires.`;
    const depot2 = this.depotDuPort(pays, port);
    if (depot2 < 0) return `Aucun d\xE9p\xF4t de ton pays \xE0 moins de ${PARAMS7.porteePortKm} km du port pour le carburant.`;
    const H = PARAMS7.reserveNaviresHeures;
    const carb = r.prendre(depot2, CARBURANT, n * PARAMS7.carburantNavireHeure * H);
    if (carb <= 0) return "Le d\xE9p\xF4t du port n'a plus de carburant.";
    const mun = r.prendre(depot2, MUNITIONS, n * PARAMS7.munitionsNavireHeure * H);
    u.naviresPort[port] -= n;
    const f = {
      id: this.prochain++,
      pays,
      port,
      n,
      ordre,
      trajet: -1,
      t: 1,
      dt: 0,
      noeud: P.mer[port],
      x: P.x[port],
      y: P.y[port],
      carburant: carb,
      munitions: mun,
      groupe: null,
      portVise: -1
    };
    this.flottes.push(f);
    return f;
  }
  /** Une flotte part du port tenir la zone de mer visée (x, y). */
  flotte(pays, port, n, x, y) {
    const v = isFinite(x) && isFinite(y) ? this.noeudMer(x, y) : -1;
    if (v < 0) return {
      ok: false,
      texte: `Aucune mer \xE0 moins de ${PARAMS7.kmZone} km de ce point.`
    };
    const f = this.armer(pays, port, n, ZONE);
    if (typeof f === "string") return {
      ok: false,
      texte: f
    };
    if (!this.naviguer(f, v)) {
      this.unites.naviresPort[port] += f.n;
      this.flottes.pop();
      return {
        ok: false,
        texte: "Aucune route de mer ne m\xE8ne l\xE0 depuis ce port."
      };
    }
    const km = this.trajets.kmGlobe[f.trajet];
    return {
      ok: true,
      texte: `Flotte ${f.id} : ${nombre(f.n)} navires vers la zone (${nombre(km)} km, ${Math.max(1, Math.round(km / PARAMS7.kmhNavires))} h).`,
      flotte: f.id
    };
  }
  /** Ordres d'une flotte : tenir une autre zone, ou rentrer au port. */
  ordreFlotte(pays, id, ordre, x = NaN, y = NaN) {
    const f = this.flottes.find((k) => k.id === id);
    if (!f || f.pays !== pays) return {
      ok: false,
      texte: "Ce n'est pas une de tes flottes."
    };
    if (f.ordre === TRANSPORT) return {
      ok: false,
      texte: "Cette flotte transporte un groupe : elle le d\xE9barque d'abord."
    };
    if (ordre === "rentrer") return this.rentrer(f) ? {
      ok: true,
      texte: `Flotte ${f.id} : retour au port.`
    } : {
      ok: false,
      texte: "Aucune route vers un port de ton pays."
    };
    const v = isFinite(x) && isFinite(y) ? this.noeudMer(x, y) : -1;
    if (v < 0) return {
      ok: false,
      texte: `Aucune mer \xE0 moins de ${PARAMS7.kmZone} km de ce point.`
    };
    if (!this.naviguer(f, v)) return {
      ok: false,
      texte: "Aucune route de mer ne m\xE8ne l\xE0."
    };
    f.ordre = ZONE;
    return {
      ok: true,
      texte: `Flotte ${f.id} : vers la nouvelle zone (${nombre(this.trajets.kmGlobe[f.trajet])} km).`
    };
  }
  /** Retour au port d'attache, ou au port ouvert du pays le plus proche s'il est perdu. */
  rentrer(f) {
    const P = this.res.d.reseau.ports, u = this.unites;
    let port = f.port;
    if (u.paysPort[port] !== f.pays) {
      port = -1;
      let bd = Infinity;
      for (let i = 0; i < P.n; i++) {
        if (P.mer[i] < 0 || u.paysPort[i] !== f.pays) continue;
        const d = distanceSol(P.x[i], P.y[i], f.x, f.y);
        if (d < bd) bd = d, port = i;
      }
      if (port < 0) return false;
    }
    if (!this.naviguer(f, P.mer[port], [
      P.x[port],
      P.y[port]
    ])) return false;
    f.port = port, f.ordre = RENTRER;
    return true;
  }
  /** Port ouvert sur la mer le plus proche de (x, y) à moins de `km` au sol, tenu par `pays` (−1 : n'importe qui). */
  portPres(x, y, km, pays = -1) {
    const P = this.res.d.reseau.ports, u = this.unites;
    let best = -1, bd = km;
    for (let i = 0; i < P.n; i++) {
      if (P.mer[i] < 0 || pays >= 0 && u.paysPort[i] !== pays) continue;
      const d = distanceSol(P.x[i], P.y[i], x, y);
      if (d <= bd) bd = d, best = i;
    }
    return best;
  }
  /** Débarquement : le groupe embarque au port de son pays où il est, avec les navires qu'il faut, vers le port visé. */
  debarquer(pays, id, x, y) {
    const g = this.grp.trouver(id), P = this.res.d.reseau.ports;
    if (!g || g.fini || g.pays !== pays || g.ordre === LIVRER) return {
      ok: false,
      texte: "Ce n'est pas un de tes groupes."
    };
    if (g.contact >= 0) return {
      ok: false,
      texte: `${g.nom} est au combat.`
    };
    const depart = this.portPres(g.x, g.y, PARAMS7.kmEmbarquement, pays);
    if (depart < 0) return {
      ok: false,
      texte: `${g.nom} doit \xEAtre dans un port de ton pays (\xE0 moins de ${PARAMS7.kmEmbarquement} km).`
    };
    const vise = isFinite(x) && isFinite(y) ? this.portPres(x, y, PARAMS7.kmPortVise) : -1;
    if (vise < 0 || vise === depart) return {
      ok: false,
      texte: `Aucun autre port ouvert sur la mer \xE0 moins de ${PARAMS7.kmPortVise} km du point vis\xE9.`
    };
    const q = this.unites.paysPort[vise];
    if (q !== pays && !this.grp.ami(pays, q) && !this.grp.enGuerre(pays, q)) {
      return {
        ok: false,
        texte: `${this.nomPays(q)} n'est pas en guerre avec toi : d\xE9clare-lui la guerre d'abord.`
      };
    }
    const besoin = Math.max(1, Math.ceil(this.combat.masse(g) / PARAMS7.masseParNavire));
    const f = this.armer(pays, depart, besoin, TRANSPORT);
    if (typeof f === "string") return {
      ok: false,
      texte: `${f} Il faut ${nombre(besoin)} navires pour ${g.nom}.`
    };
    if (!this.naviguer(f, P.mer[vise], [
      P.x[vise],
      P.y[vise]
    ])) {
      this.unites.naviresPort[depart] += f.n;
      this.flottes.pop();
      return {
        ok: false,
        texte: "Aucune route de mer ne m\xE8ne \xE0 ce port."
      };
    }
    this.grp.embarquer(g.id);
    f.groupe = g, f.portVise = vise;
    const km = this.trajets.kmGlobe[f.trajet];
    return {
      ok: true,
      texte: `${g.nom} embarque sur ${nombre(besoin)} navires vers ${P.noms[vise]} (${nombre(km)} km, ${Math.max(1, Math.round(km / PARAMS7.kmhNavires))} h).`
    };
  }
  /** V2.C.4 : un pont bombardé par les avions d'un aéroport du pays en patrouille à portée (4 sorties). */
  bombarderPont(pays, pont) {
    const cb = this.combat, r = this.res, u = this.unites, P = PARAMS7;
    if (!(pont >= 0 && pont < cb.d.pontArete.length)) return {
      ok: false,
      texte: "Ce n'est pas un pont."
    };
    const [px, py] = cb.positionPont(pont), k = 4;
    const s = r.sites(AEROPORT, pays).find((a) => r.actif[a] && !this.repos[a] && u.parc[5 * a + AVIONS] >= k && r.stock[4 * a + CARBURANT] >= k * P.carburantSortie && r.stock[4 * a + MUNITIONS] >= k * P.munitionsSortie && distanceSol(r.x[a], r.y[a], px, py) <= P.rayonAvionsKm);
    if (s === void 0) return {
      ok: false,
      texte: `Il faut un a\xE9roport en patrouille \xE0 moins de ${P.rayonAvionsKm} km avec ${k} avions, du carburant et des munitions.`
    };
    r.prendre(s, CARBURANT, k * P.carburantSortie), r.prendre(s, MUNITIONS, k * P.munitionsSortie);
    this.sorties += k;
    const abattus = this.dca(pays, px, py, k);
    if (abattus >= k) {
      this.perdreAvions(s, abattus);
      return {
        ok: false,
        texte: "Les avions ont \xE9t\xE9 abattus par la DCA avant d'atteindre le pont."
      };
    }
    this.perdreAvions(s, abattus);
    return cb.detruirePont(pays, pont, null);
  }
  // ------------------------------------------------------------------ pertes
  /** Le groupe perd la part f[t] de chaque type ; `partTues` des soldats perdus sont tués (population). */
  blesser(g, f, partTues = PARAMS6.partTues) {
    for (let t = 0; t < 3; t++) {
      const q = g.n[t] * Math.min(1, Math.max(0, f[t]));
      g.n[t] -= q;
      if (t === SOLDATS && q > 0) this.tuer(g.pays, q * partTues);
    }
    if (g.n[SOLDATS] < 1 && g.n[CHARS] < 0.5 && g.n[ARTILLERIE] < 0.5 && !g.fini) {
      this.grp.supprimer(g.id);
      this.alerter(`${g.nom} est d\xE9truit.`, g.pays);
    }
  }
  /** Soldats tués (comptés avec ceux du combat au sol). */
  tuer(pays, n) {
    this.res.tues(pays, n);
    this.combat.tuesParPays[pays] += n;
  }
  /** Une masse (équivalents soldats en plaine) retirée d'un groupe, au prorata de ses types. */
  frapperGroupe(g, masse) {
    const m = this.combat.masse(g);
    if (m <= 0) return;
    const f = Math.min(PARAMS7.pertesMaxHeure, masse / m);
    this.blesser(g, [
      f,
      f,
      f
    ]);
  }
  /** Une masse retirée du parc d'un dépôt, des tonnes de son stock. */
  frapperDepot(s, masse, tonnes) {
    const r = this.res, u = this.unites, V = PARAMS6.valeur[PLAINE];
    const m = u.parc[5 * s] * V[0][0] + u.parc[5 * s + 1] * V[1][1] + u.parc[5 * s + 2] * V[2][2];
    if (m > 0) {
      const f = Math.min(PARAMS7.pertesMaxHeure, masse / m);
      this.tuer(r.pays[s], u.parc[5 * s] * f * PARAMS6.partTues);
      for (let t = 0; t < 3; t++) u.parc[5 * s + t] *= 1 - f;
    }
    const c = r.stock[4 * s + CARBURANT], mu = r.stock[4 * s + MUNITIONS];
    if (c + mu > 0) {
      const f = Math.min(1, tonnes / (c + mu));
      r.stock[4 * s + CARBURANT] -= c * f, r.stock[4 * s + MUNITIONS] -= mu * f;
    }
  }
  perdreAvions(site2, n) {
    if (!(n > 0)) return;
    const u = this.unites, q = Math.min(n, u.parc[5 * site2 + AVIONS]);
    u.parc[5 * site2 + AVIONS] -= q;
    this.avionsPerdus[this.res.pays[site2]] += q;
  }
  /** Une flotte perd `q` navires ; son groupe embarqué perd la même part. */
  perdreNavires(f, q) {
    q = Math.min(f.n, q);
    if (!(q > 0)) return;
    if (f.groupe) {
      const p = q / f.n;
      this.blesser(f.groupe, [
        p,
        p,
        p
      ], 0.5);
      if (f.groupe.fini) f.groupe = null;
    }
    f.n -= q;
    this.naviresPerdus[f.pays] += q;
    if (f.n < 0.5) {
      f.n = 0;
      this.alerter(`Flotte ${f.id} coul\xE9e.`, f.pays);
    }
  }
  /** DCA ennemie de `pays` à portée de (x, y) : avions abattus parmi `n` (une salve par DCA et par heure). */
  dca(pays, x, y, n) {
    const r = this.res, P = PARAMS7;
    let abattus = 0;
    for (const s of r.sites(DCA)) {
      if (abattus >= n) break;
      if (!r.actif[s] || this.tirDca[s] === this.heure || !this.grp.enGuerre(pays, r.pays[s])) continue;
      if (r.stock[4 * s + MUNITIONS] < P.dcaMunitionsHeure || distanceSol(r.x[s], r.y[s], x, y) > P.rayonDcaKm) continue;
      r.prendre(s, MUNITIONS, P.dcaMunitionsHeure);
      this.tirDca[s] = this.heure;
      abattus += Math.min(P.dcaAvionsHeure, n - abattus);
    }
    return abattus;
  }
  /** Convois détruits : de flux.ts, de ravitaillement des groupes, cargos des têtes de pont. */
  detruireConvois(l) {
    const perdus = /* @__PURE__ */ new Set();
    for (const v of l) {
      if (v.sorte === 0) this.flux.detruireConvoi(v.i);
      else perdus.add(v.ref);
      this.convoisDetruits++;
    }
    if (!perdus.size) return;
    for (const v of [
      ...this.grp.convois,
      ...this.cargos
    ]) {
      if (!perdus.has(v)) continue;
      const g = this.grp.trouver(v.groupe);
      if (g) g.ravitaille = false;
    }
    this.grp.convois = this.grp.convois.filter((v) => !perdus.has(v));
    this.cargos = this.cargos.filter((v) => !perdus.has(v));
  }
  /** Détruit des convois et les retire de la liste de l'heure. */
  retirerVus(tous2, l) {
    this.detruireConvois(l);
    const s = new Set(l);
    for (let i = tous2.length - 1; i >= 0; i--) if (s.has(tous2[i])) tous2.splice(i, 1);
  }
  /** Convois des pays en guerre (positions de l'heure) ; `null` : ceux de tous les pays (bombe). */
  convoisVus(enGuerre) {
    const f = this.flux, r = this.res, l = [];
    for (let c = 0; c < f.nC; c++) {
      if (!f.cActif[c]) continue;
      const p = r.pays[f.cDst[c]];
      if (enGuerre && !enGuerre[p]) continue;
      const [x, y] = this.surTrajet(f.cTrajet[c], f.cT[c]);
      l.push({
        sorte: 0,
        i: c,
        ref: null,
        pays: p,
        x,
        y,
        mer: f.cSorte[c] === SORTE_CARGO || f.cSorte[c] === SORTE_PETROLIER
      });
    }
    for (const v of this.grp.convois) {
      const g = this.grp.trouver(v.groupe);
      if (!g || v.trajet < 0 || enGuerre && !enGuerre[g.pays]) continue;
      const [x, y] = this.surTrajet(v.trajet, v.t);
      l.push({
        sorte: 1,
        i: -1,
        ref: v,
        pays: g.pays,
        x,
        y,
        mer: false
      });
    }
    for (const v of this.cargos) {
      if (enGuerre && !enGuerre[v.pays]) continue;
      const [x, y] = this.surTrajet(v.trajet, v.t);
      l.push({
        sorte: 2,
        i: -1,
        ref: v,
        pays: v.pays,
        x,
        y,
        mer: true
      });
    }
    return l;
  }
  // ------------------------------------------------------------------ chaque heure
  tour(m) {
    this.heure = m.heure;
    this.assurer();
    const g = this.grp, enGuerre = new Uint8Array(256);
    let guerre2 = false;
    for (let k = 0; k < 65536; k++) if (g.guerre[k]) enGuerre[k >> 8] = 1, guerre2 = true;
    this.couverture(enGuerre);
    let convois = null;
    const vus = () => convois ??= this.convoisVus(enGuerre);
    if (guerre2) this.patrouilles(enGuerre, vus);
    if (this.flottes.length) this.marine(enGuerre, guerre2 ? vus : () => []);
    if (m.heure % PARAMS7.periodeRavitaillement === 0 && this.tetes.length) this.ravitaillerTetes();
    this.avancerCargos();
  }
  /** Avions en couverture : bonus tant que le groupe est dans le rayon de leur base, sinon retour ; la DCA les vise. */
  couverture(enGuerre) {
    const r = this.res, u = this.unites;
    for (const g of this.grp.groupes) {
      if (g.fini || !(g.avions > 0)) continue;
      const a = g.aeroport;
      const base = a >= 0 && r.actif[a] && r.pays[a] === g.pays;
      if (!base || distanceSol(r.x[a], r.y[a], g.x, g.y) > PARAMS7.rayonAvionsKm) {
        if (base) u.parc[5 * a + AVIONS] += g.avions;
        this.alerter(`${g.nom} sort du rayon de ses avions : ils rentrent${base ? " \xE0 leur base" : ""}.`, g.pays);
        g.avions = 0, g.aeroport = -1;
        continue;
      }
      if (!enGuerre[g.pays]) continue;
      const abattus = this.dca(g.pays, g.x, g.y, g.avions);
      if (abattus > 0) g.avions -= abattus, this.avionsPerdus[g.pays] += abattus;
    }
  }
  /** Patrouilles : combat aérien, puis une cible par aéroport et par heure. */
  patrouilles(enGuerre, vus) {
    const r = this.res, u = this.unites, g = this.grp, P = PARAMS7;
    const bases = r.sites(AEROPORT).filter((s) => r.actif[s] && !this.repos[s] && enGuerre[r.pays[s]] && u.parc[5 * s + AVIONS] >= 1);
    if (!bases.length) return;
    const pertes = /* @__PURE__ */ new Map();
    for (let i = 0; i < bases.length; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        const a = bases[i], b = bases[j];
        if (!g.enGuerre(r.pays[a], r.pays[b]) || distanceSol(r.x[a], r.y[a], r.x[b], r.y[b]) > P.rayonAvionsKm) continue;
        pertes.set(a, (pertes.get(a) ?? 0) + P.kAir * u.parc[5 * b + AVIONS]);
        pertes.set(b, (pertes.get(b) ?? 0) + P.kAir * u.parc[5 * a + AVIONS]);
      }
    }
    for (const [s, q] of pertes) this.perdreAvions(s, Math.min(q, P.pertesMaxHeure * u.parc[5 * s + AVIONS]));
    const Pt = r.d.reseau.ports, depots = r.sites(DEPOT).filter((s) => r.actif[s] && enGuerre[r.pays[s]]);
    for (const s of bases) {
      const n = u.parc[5 * s + AVIONS], p = r.pays[s];
      let sorties = Math.min(n * P.sortiesParJour / 24, r.stock[4 * s + CARBURANT] / P.carburantSortie, r.stock[4 * s + MUNITIONS] / P.munitionsSortie);
      if (!(sorties >= 0.05)) continue;
      const cible = this.cible(s, p, depots, vus);
      if (!cible) continue;
      r.prendre(s, CARBURANT, sorties * P.carburantSortie), r.prendre(s, MUNITIONS, sorties * P.munitionsSortie);
      this.sorties += sorties;
      let abattus = this.dca(p, cible.x, cible.y, sorties);
      if (cible.genre === C_PORT || cible.genre === C_FLOTTE) {
        const nav = cible.genre === C_PORT ? u.naviresPort[cible.i] : this.flottes[cible.i].n;
        abattus += Math.min(sorties - abattus, P.dcaNavire * nav);
      }
      this.perdreAvions(s, abattus);
      sorties -= abattus;
      if (!(sorties > 0)) continue;
      if (cible.genre === C_GROUPE) this.frapperGroupe(g.groupes[cible.i], sorties * P.degatsSortie);
      else if (cible.genre === C_DEPOT) this.frapperDepot(cible.i, sorties * P.degatsSortie, sorties * P.tonnesSortie);
      else if (cible.genre === C_CONVOI) {
        const q = sorties * P.convoisParSortie + this.reliquat[s], k = Math.floor(q);
        this.reliquat[s] = q - k;
        if (k > 0) {
          const l = vus().filter((v) => g.enGuerre(p, v.pays) && distanceSol(v.x, v.y, r.x[s], r.y[s]) <= P.rayonAvionsKm);
          l.sort((a, b) => distanceSol(a.x, a.y, cible.x, cible.y) - distanceSol(b.x, b.y, cible.x, cible.y));
          this.retirerVus(vus(), l.slice(0, k));
        }
      } else {
        const q = sorties * P.naviresParSortie;
        if (cible.genre === C_PORT) {
          const k = Math.min(q, u.naviresPort[cible.i]);
          u.naviresPort[cible.i] -= k, this.naviresPerdus[u.paysPort[cible.i]] += k;
          this.alerter(`Navires bombard\xE9s au port de ${Pt.noms[cible.i]}.`, u.paysPort[cible.i]);
        } else this.perdreNavires(this.flottes[cible.i], q);
      }
    }
    this.flottes = this.flottes.filter((f) => f.n > 0);
  }
  /** Cible d'un aéroport : la plus proche de la base dans le rayon, par ordre de priorité. */
  cible(s, p, depots, vus) {
    const r = this.res, g = this.grp, u = this.unites, bx = r.x[s], by = r.y[s], R = PARAMS7.rayonAvionsKm;
    const Pt = r.d.reseau.ports;
    let best = null;
    const essayer = (genre, i, x, y, q) => {
      if (!g.enGuerre(p, q)) return;
      const d = distanceSol(bx, by, x, y);
      if (d <= R && (!best || genre < best.genre || genre === best.genre && d < best.d)) best = {
        genre,
        i,
        x,
        y,
        pays: q,
        d
      };
    };
    g.groupes.forEach((o, i) => o.fini || essayer(C_GROUPE, i, o.x, o.y, o.pays));
    if (best) return best;
    for (let i = 0; i < Pt.n; i++) if (u.naviresPort[i] >= 0.5) essayer(C_PORT, i, Pt.x[i], Pt.y[i], u.paysPort[i]);
    this.flottes.forEach((f, i) => f.n > 0 && essayer(C_FLOTTE, i, f.x, f.y, f.pays));
    if (best) return best;
    vus().forEach((v, i) => essayer(C_CONVOI, i, v.x, v.y, v.pays));
    if (best) return best;
    for (const d of depots) essayer(C_DEPOT, d, r.x[d], r.y[d], r.pays[d]);
    return best;
  }
  /** Flottes : marche, arrivée, combat naval, blocus, bombardement de la côte. */
  marine(enGuerre, vus) {
    const P = PARAMS7;
    for (const f of this.flottes) {
      if (f.n <= 0) continue;
      if (f.t < 1) {
        f.t = Math.min(1, f.t + f.dt);
        [f.x, f.y] = this.surTrajet(f.trajet, f.t);
        if (f.t >= 1) this.arriver(f);
      }
      if (f.n <= 0 || this.flottes.indexOf(f) < 0) continue;
      f.carburant = Math.max(0, f.carburant - f.n * P.carburantNavireHeure);
      if (f.carburant <= 0 && f.ordre === ZONE) {
        this.alerter(`Flotte ${f.id} \xE0 sec de carburant : elle rentre au port.`, f.pays);
        if (!this.rentrer(f)) f.ordre = RENTRER;
      }
    }
    const tenant = this.flottes.filter((f) => f.n > 0 && f.ordre === ZONE && f.t >= 1 && enGuerre[f.pays] && f.munitions > 0);
    if (tenant.length) this.tenirLaMer(tenant, vus);
    this.flottes = this.flottes.filter((f) => f.n > 0);
  }
  arriver(f) {
    const P = this.res.d.reseau.ports, u = this.unites;
    if (f.ordre === RENTRER) {
      if (u.paysPort[f.port] === f.pays) {
        u.naviresPort[f.port] += f.n;
        f.n = 0;
      } else if (!this.rentrer(f)) {
        this.alerter(`Flotte ${f.id} : plus aucun port o\xF9 rentrer, elle est perdue.`, f.pays);
        this.naviresPerdus[f.pays] += f.n, f.n = 0;
      }
      return;
    }
    if (f.ordre === TRANSPORT && f.groupe) {
      const g = f.groupe, port = f.portVise;
      this.grp.debarquer(g, P.noeudRoute[port]);
      this.grp.envoyer(g.pays, g.id, P.x[port], P.y[port]);
      this.tetes.push({
        groupe: g.id,
        pays: g.pays,
        port,
        depart: f.port
      });
      this.alerter(`${g.nom} d\xE9barque \xE0 ${P.noms[port]}.`, g.pays, u.paysPort[port]);
      f.groupe = null, f.ordre = ZONE;
    }
  }
  /** Flottes qui tiennent la mer (arrivées, avec des munitions, pays en guerre). */
  tenirLaMer(tenant, vus) {
    const P = PARAMS7, g = this.grp, u = this.unites, r = this.res, Pt = r.d.reseau.ports, R = P.rayonNaviresKm;
    const tire = /* @__PURE__ */ new Set();
    const pertes = /* @__PURE__ */ new Map();
    const toutes = this.flottes.filter((f) => f.n > 0);
    for (const a of tenant) {
      for (const b of toutes) {
        if (a === b || !g.enGuerre(a.pays, b.pays) || distanceSol(a.x, a.y, b.x, b.y) > R) continue;
        pertes.set(b, (pertes.get(b) ?? 0) + P.kMer * a.n);
        tire.add(a);
      }
      for (let i = 0; i < Pt.n; i++) {
        const n = u.naviresPort[i];
        if (n < 0.5 || !g.enGuerre(a.pays, u.paysPort[i]) || distanceSol(a.x, a.y, Pt.x[i], Pt.y[i]) > R) continue;
        const k = Math.min(n, P.kMer * a.n);
        u.naviresPort[i] -= k, this.naviresPerdus[u.paysPort[i]] += k;
        pertes.set(a, (pertes.get(a) ?? 0) + P.kMer * n);
        tire.add(a);
      }
    }
    for (const [f, q] of pertes) this.perdreNavires(f, Math.min(q, P.pertesMaxHeure * f.n));
    const coules = [];
    vus().forEach((v, k) => {
      if (!v.mer) return;
      let nE = 0, nA = 0;
      for (const f of toutes) {
        if (f.n <= 0 || distanceSol(f.x, f.y, v.x, v.y) > R) continue;
        if (f.pays === v.pays) nA += f.n;
        else if (tenant.includes(f) && g.enGuerre(f.pays, v.pays)) nE += f.n, tire.add(f);
      }
      if (nE <= 0) return;
      const p = Math.min(P.blocusMax, P.blocusParNavire * nE) * nE / (nE + nA);
      if (hasard(this.heure, k, v.i * 4 + v.sorte) < p) coules.push(v);
    });
    if (coules.length) {
      this.cargosCoules += coules.length;
      for (const v of coules) this.alerter(`Un cargo est coul\xE9 par le blocus de ${this.nomPays(tenant.find((f) => g.enGuerre(f.pays, v.pays))?.pays ?? 0)}.`, v.pays);
      this.retirerVus(vus(), coules);
    }
    for (const f of tenant) {
      if (f.n <= 0) continue;
      const cote = (x, y) => this.c.ports.proche(x, y, rayonCarte(P.kmCote, y))[0] >= 0;
      let fait = false;
      let best = null, bd = R;
      for (const o of g.groupes) {
        if (o.fini || !g.enGuerre(f.pays, o.pays)) continue;
        const d = distanceSol(f.x, f.y, o.x, o.y);
        if (d < bd && cote(o.x, o.y)) bd = d, best = o;
      }
      if (best) this.frapperGroupe(best, f.n * P.degatsNavire), fait = true;
      if (!fait) {
        let s = -1;
        bd = R;
        for (const d of r.sites(DEPOT)) {
          if (!r.actif[d] || !g.enGuerre(f.pays, r.pays[d])) continue;
          const k = distanceSol(f.x, f.y, r.x[d], r.y[d]);
          if (k < bd && cote(r.x[d], r.y[d])) bd = k, s = d;
        }
        if (s >= 0) this.frapperDepot(s, f.n * P.degatsNavire, f.n * P.tonnesNavire), fait = true;
      }
      if (!fait) {
        const V = r.d.villes;
        let v = -1;
        bd = R;
        for (const i of this.c.villesCote) {
          if (!g.enGuerre(f.pays, r.proprietaire[i])) continue;
          const k = distanceSol(f.x, f.y, V.x[i], V.y[i]);
          if (k < bd) bd = k, v = i;
        }
        if (v >= 0) this.res.tues(V.pays[v], f.n * P.tuesNavire), fait = true;
      }
      if (fait) tire.add(f);
    }
    for (const f of tire) f.munitions = Math.max(0, f.munitions - f.n * P.munitionsNavireHeure);
  }
  /** Toutes les 6 h : un cargo vers chaque groupe débarqué sous les deux tiers, si une flotte de son pays tient la mer. */
  ravitaillerTetes() {
    const P = PARAMS7, r = this.res, Pt = r.d.reseau.ports;
    this.tetes = this.tetes.filter((t) => {
      const g = this.grp.trouver(t.groupe);
      return !!g && !g.fini;
    });
    for (const t of this.tetes) {
      const g = this.grp.trouver(t.groupe);
      if (g.ravitaille) continue;
      const [mc, mm] = this.grp.reserveMax(g);
      if (!(g.carburant < P.seuilRavitaillement * mc || g.munitions < P.seuilRavitaillement * mm)) continue;
      const tenue = this.flottes.some((f) => f.pays === t.pays && f.ordre === ZONE && f.t >= 1 && f.n > 0 && distanceSol(f.x, f.y, Pt.x[t.port], Pt.y[t.port]) <= P.rayonNaviresKm);
      if (!tenue) continue;
      const depot2 = this.depotDuPort(t.pays, t.depart);
      if (depot2 < 0) continue;
      const it = this.flux.itineraireMer(t.depart, t.port);
      if (!it) continue;
      const qc = r.prendre(depot2, CARBURANT, Math.max(0, mc - g.carburant)), qm = r.prendre(depot2, MUNITIONS, Math.max(0, mm - g.munitions));
      if (qc + qm <= 0) continue;
      const tr = this.trajets.ajouter(`tp:${t.depart}>${t.port}`, TRAJET_MER, polyligneMer(r.d.reseau.mer, it.noeuds, [
        Pt.x[t.depart],
        Pt.y[t.depart]
      ], [
        Pt.x[t.port],
        Pt.y[t.port]
      ]), it.km);
      this.cargos.push({
        groupe: g.id,
        pays: t.pays,
        carburant: qc,
        munitions: qm,
        trajet: tr,
        t: 0,
        dt: P.kmhCargo / Math.max(1, it.km)
      });
      g.ravitaille = true;
    }
  }
  avancerCargos() {
    if (!this.cargos.length) return;
    this.cargos = this.cargos.filter((v) => {
      v.t += v.dt;
      if (v.t < 1) return true;
      const g = this.grp.trouver(v.groupe);
      if (g && !g.fini) {
        const [mc, mm] = this.grp.reserveMax(g);
        g.carburant = Math.min(Math.max(mc, g.carburant), g.carburant + v.carburant);
        g.munitions = Math.min(Math.max(mm, g.munitions), g.munitions + v.munitions);
        g.ravitaille = false;
      }
      return false;
    });
  }
  // ------------------------------------------------------------------ pour l'interface et les autres modules
  /** Aéroports, flottes et bilans d'un pays (V2.E.1 : page Armée). */
  fiche(pays) {
    const r = this.res, u = this.unites;
    return {
      aeroports: r.sites(AEROPORT, pays).filter((s) => r.actif[s]).map((s) => ({
        site: s,
        nom: r.noms[s],
        x: r.x[s],
        y: r.y[s],
        avions: Math.round(u.parc[5 * s + AVIONS]),
        patrouille: !this.repos[s],
        carburant: Math.round(r.stock[4 * s + CARBURANT]),
        munitions: Math.round(r.stock[4 * s + MUNITIONS])
      })),
      flottes: this.flottes.filter((f) => f.pays === pays).map((f) => ({
        id: f.id,
        x: f.x,
        y: f.y,
        navires: Math.round(f.n),
        ordre: NOMS_ORDRES_FLOTTE[f.ordre],
        enRoute: f.t < 1,
        carburant: Math.round(f.carburant),
        munitions: Math.round(f.munitions),
        groupe: f.groupe?.id ?? -1
      })),
      avionsPerdus: Math.round(this.avionsPerdus[pays]),
      naviresPerdus: Math.round(this.naviresPerdus[pays])
    };
  }
  vider() {
    const a = this.alertes;
    this.alertes = [];
    return a;
  }
  systemes() {
    return [
      {
        nom: "air et mer",
        periode: HEURE,
        executer: (m) => this.tour(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = this.sorties * 10 + this.cargosCoules * 7 + this.convoisDetruits;
    for (const f of this.flottes) s += f.id * 3 + f.n * 11 + f.t * 1e3 + f.carburant;
    for (let p = 0; p < 256; p += 3) s += this.avionsPerdus[p] + this.naviresPerdus[p];
    h = melanger(h, this.flottes.length);
    h = melanger(h, this.cargos.length);
    return melanger(h, Math.round(s) | 0);
  }
  /** Avions aux aéroports (rayon s'ils patrouillent), DCA, flottes en mer et leur groupe embarqué, cargos des têtes de pont. */
  rendu(c) {
    const r = this.res, u = this.unites, camp = (p) => this.grp.camp(p);
    this.assurer();
    for (const s of r.sites(AEROPORT)) {
      const n2 = u.parc[5 * s + AVIONS];
      if (n2 > 0 && r.actif[s]) c.tour(s, r.x[s], r.y[s], this.repos[s] ? 0 : PARAMS7.rayonAvionsKm, TOUR_AVIONS, camp(r.pays[s]), n2);
    }
    for (const s of r.sites(DCA)) {
      if (r.actif[s]) c.tour(3e6 + s, r.x[s], r.y[s], PARAMS7.rayonDcaKm, TOUR_DCA, camp(r.pays[s]), r.stock[4 * s + MUNITIONS]);
    }
    for (const f of this.flottes) {
      if (f.n <= 0) continue;
      c.tour(2e6 + f.id, f.x, f.y, f.ordre === ZONE ? PARAMS7.rayonNaviresKm : 0, TOUR_NAVIRES, camp(f.pays), f.n);
      const g = f.groupe;
      if (g) {
        const [s, ch, a] = g.n;
        const type = ch >= s / 100 && ch >= a ? GROUPE_CHARS : a > s / 100 && a > ch ? GROUPE_ARTILLERIE : GROUPE_SOLDATS;
        c.groupe(g.id, f.x, f.y, -1, 0, 0, type, camp(g.pays), s + ch + a, g.n);
      }
    }
    const n = this.cargos.length;
    if (n) {
      c.billes(n, this.cargos.map((v) => v.trajet), this.cargos.map((v) => v.t), this.cargos.map((v) => v.dt), this.cargos.map(() => SORTE_CARGO | PRODUIT_CARBURANT << 2));
    }
  }
};
function cachesDe(res) {
  const d = res.d;
  let c = caches.get(d);
  if (!c) {
    const m = d.reseau.mer, P = d.reseau.ports, V = d.villes;
    const merXY = new Float32Array(2 * m.n);
    for (let i = 0; i < m.n; i++) [merXY[2 * i], merXY[2 * i + 1]] = projeter(m.lon[i], m.lat[i]);
    const pxy = new Float32Array(2 * P.n);
    for (let i = 0; i < P.n; i++) pxy[2 * i] = P.x[i], pxy[2 * i + 1] = P.y[i];
    const ports = new IndexNoeuds(pxy, (i) => P.mer[i] >= 0);
    const villesCote = [];
    for (let i = 0; i < V.n; i++) if (ports.proche(V.x[i], V.y[i], rayonCarte(PARAMS7.kmCote, V.y[i]))[0] >= 0) villesCote.push(i);
    c = {
      merXY,
      merIndex: new IndexNoeuds(merXY, () => true),
      ports,
      villesCote
    };
    caches.set(d, c);
  }
  return c;
}

// web/src/sim/groupes.ts
var PARAMS8 = {
  /** ❓ Vitesse du plus lent (CONCEPTION) : avec des chars, sans. */
  kmhChars: 40,
  kmhSansChars: 90,
  /** ❓ Réserve embarquée : heures de marche et de combat (3 jours). */
  reserveHeures: 72,
  /** ❓ Deux groupes ennemis se touchent à moins de cette distance ; la marche avance par pas de cette longueur. */
  kmContact: 15,
  /** ❓ Un clic vise la ville vivante à moins de cette distance, sinon le noeud de route à moins de kmCibleNoeud. */
  kmCibleVille: 30,
  kmCibleNoeud: 50,
  /** Longueur maximale d'un itinéraire (ordre) ; progression : la ville ennemie suivante à moins de cette distance. */
  kmMaxOrdre: 8e3,
  kmProgression: 600,
  /** ❓ Ravitaillement : dépôt à portée (comme V2.C.1), toutes les n heures, sous ce remplissage, camions à cette vitesse. */
  porteeRavitaillementKm: 300,
  periodeRavitaillement: 6,
  seuilRavitaillement: 2 / 3,
  kmhCamion: 80,
  /** ❓ Deux groupes à moins de cette distance peuvent fusionner. */
  kmFusion: 5,
  /** Un point appartient au pays de la ville vivante la plus proche à moins de cette distance (comme V2.C.2). */
  kmTerritoire: 300
};
var ATTENDRE = 0;
var ENVOYER = 1;
var ARRETER = 2;
var RETIRER = 3;
var LIVRER = 4;
var NOMS_ORDRES = [
  "attend",
  "en marche",
  "tient sur place",
  "se retire",
  "rejoint son d\xE9p\xF4t"
];
var SEC_CARBURANT = 1;
var SEC_MUNITIONS = 2;
var caches2 = /* @__PURE__ */ new WeakMap();
function cachesDe2(d) {
  let c = caches2.get(d);
  if (!c) {
    const r = d.reseau, a = r.axes, V = d.villes, xy = new Float32Array(2 * V.n);
    for (let k = 0; k < V.n; k++) xy[2 * k] = V.x[k], xy[2 * k + 1] = V.y[k];
    const villesParNoeud = /* @__PURE__ */ new Map();
    for (let v = 0; v < r.vivantes.n; v++) {
      const n = r.vivantes.noeudRoute[v], l = villesParNoeud.get(n);
      if (l) l.push(v);
      else villesParNoeud.set(n, [
        v
      ]);
    }
    c = {
      parcours: new Parcours({
        n: a.nNoeuds,
        a: a.a,
        b: a.b,
        km: a.km,
        debut: r.adjacence.debut,
        arete: r.adjacence.arete
      }),
      villes: new IndexNoeuds(xy, () => true),
      villesParNoeud,
      allies: new Int8Array(65536).fill(-1)
    };
    caches2.set(d, c);
  }
  return c;
}
var CASE2 = 50;
var cle2 = (cx, cy) => (cx + 5e3) * 1e4 + (cy + 5e3);
var Groupes = class {
  joueur;
  groupes;
  prochain;
  convois;
  /** paires de groupes accrochés cette heure : [id, id, id, id…] (le plus petit d'abord) — pour V2.C.4 */
  contacts;
  /** 1 : les deux pays sont en guerre ([a × 256 + b], symétrique) — V2.D.1 reprendra la diplomatie */
  guerre;
  /** messages pour le joueur (groupe à sec, ville prise ou perdue), à afficher puis vider */
  alertes;
  /** V2.E.1 : lieu de chaque alerte (x, y en km de carte ; NaN sans lieu), pour le bouton « Voir » des notifications */
  alertesXY;
  // ---- bilans
  villesPrises;
  arrivees;
  ravitaillements;
  constructor(res, flux, unites, trajets, joueur) {
    this.joueur = joueur;
    this.groupes = [];
    this.prochain = 1;
    this.convois = [];
    this.contacts = [];
    this.guerre = new Uint8Array(65536);
    this.alertes = [];
    this.alertesXY = [];
    this.villesPrises = 0;
    this.arrivees = 0;
    this.ravitaillements = 0;
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "flux", {
      value: flux,
      enumerable: false
    });
    Object.defineProperty(this, "unites", {
      value: unites,
      enumerable: false
    });
    Object.defineProperty(this, "trajets", {
      value: trajets,
      enumerable: false
    });
    Object.defineProperty(this, "c", {
      value: cachesDe2(res.d),
      enumerable: false
    });
    Object.defineProperty(this, "grille", {
      value: /* @__PURE__ */ new Map(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, "parId", {
      value: /* @__PURE__ */ new Map(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, "guerreAuto", {
      value: null,
      enumerable: false,
      writable: true
    });
  }
  /** Après un rechargement : l'index des groupes pointe vers les objets restaurés. */
  apresRestauration() {
    this.parId = new Map(this.groupes.map((g) => [
      g.id,
      g
    ]));
  }
  // ------------------------------------------------------------------ pays
  nomPays(p) {
    const d = this.res.d;
    return d.depart.pays_(d.iso3[p])?.nom ?? d.iso3[p] ?? `pays ${p}`;
  }
  /** Même pays ou allié de départ (blocs de défense, V2.B.2). */
  ami(a, b) {
    if (a === b) return true;
    const k = a * 256 + b, c = this.c.allies;
    if (c[k] < 0) {
      const d = this.res.d, v = d.iso3[a] && d.iso3[b] && d.depart.allies(d.iso3[a], d.iso3[b]) ? 1 : 0;
      c[k] = c[b * 256 + a] = v;
    }
    return c[k] === 1;
  }
  enGuerre(a, b) {
    return this.guerre[a * 256 + b] === 1;
  }
  /** Guerre (ou paix) entre deux pays ; le camp vu du joueur suit (bâtiments et groupes en rouge). */
  declarerGuerre(a, b, oui = true) {
    if (a === b) return;
    this.guerre[a * 256 + b] = this.guerre[b * 256 + a] = oui ? 1 : 0;
    for (const [p, q] of [
      [
        a,
        b
      ],
      [
        b,
        a
      ]
    ]) {
      if (p === this.joueur) this.res.camp[q] = oui ? CAMP_ENNEMI : this.ami(p, q) ? CAMP_ALLIE : CAMP_NEUTRE;
    }
  }
  camp(p) {
    if (p === this.joueur) return CAMP_JOUEUR;
    if (this.enGuerre(this.joueur, p)) return CAMP_ENNEMI;
    return this.ami(this.joueur, p) ? CAMP_ALLIE : CAMP_NEUTRE;
  }
  // ------------------------------------------------------------------ groupes
  trouver(id) {
    return this.parId.get(id);
  }
  groupesDe(pays) {
    return this.groupes.filter((g) => g.pays === pays && !g.fini);
  }
  /** Réserve pleine d'un groupe : `reserveHeures` de marche (carburant) et de combat (munitions). */
  reserveMax(g) {
    let c = 0, m = 0;
    for (let t = 0; t < 3; t++) c += g.n[t] * PARAMS5.carburantMarche[t], m += g.n[t] * PARAMS5.munitionsCombat[t];
    return [
      c * PARAMS8.reserveHeures,
      m * PARAMS8.reserveHeures
    ];
  }
  /** Facteur de la réserve au combat (CONCEPTION « Combat ») : 1 avec des munitions, 0 sans. */
  facteurReserve(g) {
    return g.munitions > 1e-9 ? 1 : 0;
  }
  vitesse(g) {
    return g.n[CHARS] > 0 ? PARAMS8.kmhChars : PARAMS8.kmhSansChars;
  }
  /** Groupe neuf, immobile sur un noeud de route. */
  nouveau(pays, noeud, n, depot2, nom, ordre = ATTENDRE) {
    const ax = this.res.d.reseau.axes.noeuds, id = this.prochain++;
    const g = {
      id,
      pays,
      nom: nom || `Groupe ${id}`,
      n: n.slice(0, 3),
      avions: 0,
      aeroport: -1,
      depot: depot2,
      ordre,
      ville: -1,
      but: noeud,
      offensive: false,
      noeuds: [
        noeud
      ],
      aretes: [],
      cum: [
        0
      ],
      km: 0,
      seg: 0,
      trajet: -1,
      x: ax[2 * noeud],
      y: ax[2 * noeud + 1],
      carburant: 0,
      munitions: 0,
      contact: -1,
      aSec: 0,
      surPlace: 0,
      ravitaille: false,
      fini: false
    };
    this.groupes.push(g);
    this.parId.set(id, g);
    return g;
  }
  // ------------------------------------------------------------------ itinéraires
  /** Noeud sur lequel le groupe se trouve (−1 : au milieu d'une arête). */
  surNoeud(g) {
    if (g.km - g.cum[g.seg] < 1e-6) return g.noeuds[g.seg];
    if (g.seg + 1 < g.noeuds.length && g.cum[g.seg + 1] - g.km < 1e-6) return g.noeuds[g.seg + 1];
    return -1;
  }
  /** Noeud le plus proche du groupe sur son itinéraire. */
  noeudProche(g) {
    if (g.seg + 1 >= g.noeuds.length) return g.noeuds[g.seg];
    return g.km - g.cum[g.seg] <= g.cum[g.seg + 1] - g.km ? g.noeuds[g.seg] : g.noeuds[g.seg + 1];
  }
  /** Dernier noeud de l'itinéraire. */
  dernier(g) {
    return g.noeuds[g.noeuds.length - 1];
  }
  auBout(g) {
    return g.km >= g.cum[g.cum.length - 1] - 1e-6;
  }
  /** Plus court chemin par la route depuis un noeud jusqu'au premier noeud où `but` est vrai (coupures évitées). */
  depuis(n, but, maxKm) {
    const a = this.res.d.reseau.axes, coupees = this.flux.coupees, p = this.c.parcours;
    const fixes = p.lancer([
      n
    ], maxKm, (e) => a.type[e] === 0 && !coupees[e], (v2) => but(v2));
    const v = fixes[fixes.length - 1];
    if (v === void 0 || !but(v)) return null;
    return {
      km: p.d(v),
      ...p.chemin(v)
    };
  }
  /**
   * Itinéraire du groupe, de là où il est (un noeud, ou le milieu d'une arête : il repart par le bout le plus avantageux)
   * jusqu'au premier noeud où `but` est vrai. Rend false (sans rien changer) s'il n'y en a pas.
   */
  chercher(g, but, maxKm) {
    const ici = this.surNoeud(g);
    if (ici >= 0) {
      const c = this.depuis(ici, but, maxKm);
      if (!c) return false;
      this.poserChemin(g, c.noeuds, c.aretes, 0);
      return true;
    }
    const u = g.noeuds[g.seg], w = g.noeuds[g.seg + 1], e = g.aretes[g.seg];
    const fait = g.km - g.cum[g.seg], reste = g.cum[g.seg + 1] - g.km;
    const av = this.depuis(w, but, maxKm), ar = this.depuis(u, but, maxKm);
    if (!av && !ar) return false;
    if (av && (!ar || av.km + reste <= ar.km + fait)) this.poserChemin(g, [
      u,
      ...av.noeuds
    ], [
      e,
      ...av.aretes
    ], fait);
    else this.poserChemin(g, [
      w,
      ...ar.noeuds
    ], [
      e,
      ...ar.aretes
    ], reste);
    return true;
  }
  poserChemin(g, noeuds, aretes, km) {
    const a = this.res.d.reseau;
    const cum = [
      0
    ];
    for (const e of aretes) cum.push(cum[cum.length - 1] + a.axes.km[e]);
    g.noeuds = noeuds, g.aretes = aretes, g.cum = cum, g.km = km, g.seg = 0;
    while (g.seg + 1 < noeuds.length - 1 && cum[g.seg + 1] <= km) g.seg++;
    const total = cum[cum.length - 1];
    g.trajet = noeuds.length > 1 ? this.trajets.ajouter(`g:${noeuds[0]}>${noeuds[noeuds.length - 1]}:${noeuds.length}:${Math.round(total * 10)}`, TRAJET_ROUTE, polyligneAxes(a.axes, a.adjacence, noeuds, 1), total) : -1;
    this.placer(g);
  }
  /** x, y du groupe d'après sa position sur l'itinéraire. */
  placer(g) {
    const ax = this.res.d.reseau.axes.noeuds, u = g.noeuds[g.seg];
    if (g.seg + 1 >= g.noeuds.length) {
      g.x = ax[2 * u], g.y = ax[2 * u + 1];
      return;
    }
    const w = g.noeuds[g.seg + 1], l = g.cum[g.seg + 1] - g.cum[g.seg];
    const f = l > 0 ? Math.min(1, Math.max(0, (g.km - g.cum[g.seg]) / l)) : 0;
    g.x = ax[2 * u] + (ax[2 * w] - ax[2 * u]) * f, g.y = ax[2 * u + 1] + (ax[2 * w + 1] - ax[2 * u + 1]) * f;
  }
  /** Dépôts actifs du pays sur un noeud. */
  depotSur(v, pays, avecStock = false) {
    const r = this.res;
    for (const s of this.flux.sitesSurNoeud(v)) {
      if (r.genre[s] !== DEPOT || r.pays[s] !== pays || !r.actif[s]) continue;
      if (avecStock && r.stock[4 * s + CARBURANT] <= 0 && r.stock[4 * s + MUNITIONS] <= 0) continue;
      return s;
    }
    return -1;
  }
  /** Ville vivante d'un pays en guerre avec `pays` sur ce noeud (−1 : aucune). */
  villeEnnemieSur(v, pays) {
    for (const i of this.c.villesParNoeud.get(v) ?? []) if (this.enGuerre(pays, this.res.proprietaire[i])) return i;
    return -1;
  }
  // ------------------------------------------------------------------ ordres
  refus(texte) {
    return {
      ok: false,
      texte
    };
  }
  duJoueur(pays, id) {
    const g = this.trouver(id);
    if (!g || g.fini || g.pays !== pays) return "Ce n'est pas un de tes groupes.";
    if (g.ordre === LIVRER) return "Ces unit\xE9s rejoignent leur d\xE9p\xF4t : compose un groupe une fois qu'elles y sont.";
    return g;
  }
  /** La ville (ou le point) visée par un clic : noeud de route, pays qui la tient (−1 : personne). */
  cible(x, y) {
    const r = this.res, P = PARAMS8;
    const [v] = this.c.villes.proche(x, y, P.kmCibleVille);
    if (v >= 0) return {
      ville: v,
      noeud: r.d.reseau.vivantes.noeudRoute[v],
      pays: r.proprietaire[v]
    };
    const [n] = r.d.route.proche(x, y, P.kmCibleNoeud);
    if (n < 0) return `Rien \xE0 viser ici : aucune ville ni route \xE0 moins de ${P.kmCibleNoeud} km.`;
    const [w] = this.c.villes.proche(x, y, P.kmTerritoire);
    return {
      ville: -1,
      noeud: n,
      pays: w >= 0 ? r.proprietaire[w] : -1
    };
  }
  /**
   * Envoyer : nouvel objectif (ville ou point) ; ami → il y va et attend ; ennemi → il y va, prend, puis progresse ;
   * neutre → c'est une attaque : la guerre est déclarée par le geste (R.2), puis comme un ennemi. Un allié est refusé.
   */
  envoyer(pays, id, x, y) {
    const g = this.duJoueur(pays, id);
    if (typeof g === "string") return this.refus(g);
    if (!isFinite(x) || !isFinite(y)) return this.refus("Objectif invalide.");
    const c = this.cible(x, y);
    if (typeof c === "string") return this.refus(c);
    let offensive = c.pays >= 0 && this.enGuerre(pays, c.pays), declaration = "";
    if (c.pays >= 0 && !offensive && !this.ami(pays, c.pays)) {
      if (!this.chercher(g, (v) => v === c.noeud, PARAMS8.kmMaxOrdre)) return this.refus("Aucune route ne m\xE8ne l\xE0 depuis ce groupe.");
      const defenseurs = this.guerreAuto ? this.guerreAuto(pays, c.pays) : (this.declarerGuerre(pays, c.pays, true), []);
      offensive = true;
      declaration = `Guerre d\xE9clar\xE9e \xE0 ${this.nomPays(c.pays)}${defenseurs.length ? ` (ses alli\xE9s entrent en guerre contre toi : ${defenseurs.map((p) => this.nomPays(p)).join(", ")})` : ""}. `;
    } else if (c.pays >= 0 && !offensive && c.pays !== pays && this.ami(pays, c.pays) && g.pays === this.joueur) {
      declaration = `${this.nomPays(c.pays)} est ton alli\xE9 : ${g.nom} s'y rend sans combattre. `;
    }
    if (!this.chercher(g, (v) => v === c.noeud, PARAMS8.kmMaxOrdre)) return this.refus("Aucune route ne m\xE8ne l\xE0 depuis ce groupe.");
    g.ordre = ENVOYER, g.ville = c.ville, g.but = c.noeud, g.offensive = offensive, g.surPlace = 0;
    const km = g.cum[g.cum.length - 1] - g.km, h = km / this.vitesse(g);
    return {
      ok: true,
      texte: `${declaration}${g.nom} en route${offensive ? ` contre ${this.nomPays(c.pays)}` : ""} : ${nombre(km)} km, ${h < 48 ? `${Math.max(1, Math.round(h))} h` : `${Math.round(h / 24)} jours`}.`
    };
  }
  /** S'arrêter : tenir sur place. */
  arreter(pays, id) {
    const g = this.duJoueur(pays, id);
    if (typeof g === "string") return this.refus(g);
    g.ordre = ARRETER;
    return {
      ok: true,
      texte: `${g.nom} tient sur place.`
    };
  }
  /** Se retirer : retour au dépôt du pays le plus proche par la route ; il y rend ses unités et sa réserve. */
  retirer(pays, id) {
    const g = this.duJoueur(pays, id);
    if (typeof g === "string") return this.refus(g);
    if (!this.chercher(g, (v) => this.depotSur(v, pays) >= 0, PARAMS8.kmMaxOrdre)) {
      return this.refus(`${g.nom} : aucun d\xE9p\xF4t de ton pays n'est joignable par la route.`);
    }
    const depot2 = this.depotSur(this.dernier(g), pays);
    g.ordre = RETIRER, g.depot = depot2, g.surPlace = 0;
    return {
      ok: true,
      texte: `${g.nom} se retire vers ${this.res.noms[depot2] || "un d\xE9p\xF4t"} (${nombre(g.cum[g.cum.length - 1] - g.km)} km).`
    };
  }
  /**
   * Table de mixage : compose un groupe au dépôt `depot` (−1 : le premier dépôt actif du pays, celui de la capitale) avec
   * `n` = [soldats (hommes), chars, canons] pris dans le parc du dépôt et `avions` en couverture pris à l'aéroport du pays
   * le plus proche à portée ; la réserve vient du stock du dépôt. Avec (x, y), l'envoie aussitôt.
   */
  composer(pays, depot2, n, avions = 0, nom = "", x, y) {
    const r = this.res, u = this.unites;
    u.assurer();
    if (depot2 < 0) depot2 = r.sites(DEPOT, pays).find((s) => r.actif[s]) ?? -1;
    if (!(depot2 >= 0 && depot2 < r.n) || r.genre[depot2] !== DEPOT || r.pays[depot2] !== pays) return this.refus("Ce n'est pas un de tes d\xE9p\xF4ts.");
    if (!r.actif[depot2]) return this.refus("Ce d\xE9p\xF4t est d\xE9truit.");
    const q = [
      0,
      1,
      2
    ].map((t) => Math.max(0, Math.floor(n[t] ?? 0)));
    if (q[0] + q[1] + q[2] <= 0) return this.refus("Un groupe a besoin d'au moins une unit\xE9 au sol.");
    for (let t = 0; t < 3; t++) {
      const dispo = u.parc[5 * depot2 + t];
      if (q[t] > dispo) return this.refus(`Le d\xE9p\xF4t n'a que ${nombre(dispo)} ${[
        "soldats",
        "chars",
        "canons"
      ][t]}.`);
    }
    avions = Math.max(0, Math.floor(avions));
    let aero = -1;
    if (avions > 0) {
      let bd = PARAMS5.rayonAvionsKm;
      for (const s of r.sites(AEROPORT, pays)) {
        if (!r.actif[s] || u.parc[5 * s + AVIONS] < avions) continue;
        const d = distanceSol(r.x[s], r.y[s], r.x[depot2], r.y[depot2]);
        if (d <= bd) bd = d, aero = s;
      }
      if (aero < 0) return this.refus(`Aucun a\xE9roport de ton pays \xE0 moins de ${nombre(PARAMS5.rayonAvionsKm)} km n'a ${nombre(avions)} avions.`);
    }
    for (let t = 0; t < 3; t++) u.parc[5 * depot2 + t] -= q[t];
    const g = this.nouveau(pays, r.noeudRoute[depot2], q, depot2, nom);
    if (aero >= 0) u.parc[5 * aero + AVIONS] -= avions, g.avions = avions, g.aeroport = aero;
    const [mc, mm] = this.reserveMax(g);
    g.carburant = r.prendre(depot2, CARBURANT, mc);
    g.munitions = r.prendre(depot2, MUNITIONS, mm);
    const reserve = mc + mm > 0 ? Math.round(100 * (g.carburant + g.munitions) / (mc + mm)) : 100;
    let texte = `${g.nom} form\xE9 : ${texteUnites(q)}${avions ? `, ${nombre(avions)} avions en couverture` : ""} ; r\xE9serve \xE0 ${reserve} %.`;
    if (x !== void 0 && y !== void 0) {
      const e = this.envoyer(pays, g.id, x, y);
      texte += ` ${e.texte}`;
    }
    return {
      ok: true,
      texte,
      groupe: g.id
    };
  }
  /** Fusion : `b` rejoint `a` (même pays, à moins de kmFusion) ; `a` garde son ordre. */
  fusionner(pays, a, b) {
    const ga = this.duJoueur(pays, a), gb = this.duJoueur(pays, b);
    if (typeof ga === "string") return this.refus(ga);
    if (typeof gb === "string") return this.refus(gb);
    if (ga === gb) return this.refus("C'est le m\xEAme groupe.");
    if (Math.hypot(ga.x - gb.x, ga.y - gb.y) > PARAMS8.kmFusion) return this.refus("Les deux groupes doivent \xEAtre au m\xEAme endroit.");
    for (let t = 0; t < 3; t++) ga.n[t] += gb.n[t];
    ga.carburant += gb.carburant, ga.munitions += gb.munitions;
    if (gb.avions) {
      if (ga.aeroport < 0 || ga.aeroport === gb.aeroport) ga.avions += gb.avions, ga.aeroport = gb.aeroport;
      else this.unites.parc[5 * gb.aeroport + AVIONS] += gb.avions;
    }
    gb.fini = true;
    this.nettoyer();
    return {
      ok: true,
      texte: `${gb.nom} a rejoint ${ga.nom}.`
    };
  }
  /** Rend les unités et la réserve d'un groupe au dépôt (place libre seulement) ; le groupe disparaît. */
  dissoudre(g, depot2) {
    const r = this.res, u = this.unites;
    for (let t = 0; t < 3; t++) u.parc[5 * depot2 + t] += g.n[t];
    if (g.avions && g.aeroport >= 0) u.parc[5 * g.aeroport + AVIONS] += g.avions;
    for (const [p, q] of [
      [
        CARBURANT,
        g.carburant
      ],
      [
        MUNITIONS,
        g.munitions
      ]
    ]) {
      const k = 4 * depot2 + p;
      r.stock[k] += Math.max(0, Math.min(q, r.capacite[k] - r.stock[k]));
    }
    g.fini = true;
  }
  /** V2.C.4 : retire un groupe détruit (rien n'est rendu). */
  supprimer(id) {
    const g = this.trouver(id);
    if (g) g.fini = true;
  }
  /** V2.C.5 : le groupe quitte la carte pour un transport par mer (il garde ses unités et sa réserve ; ses avions rentrent). */
  embarquer(id) {
    const g = this.trouver(id);
    if (!g || g.fini) return null;
    if (g.avions && g.aeroport >= 0) this.unites.parc[5 * g.aeroport + AVIONS] += g.avions;
    g.avions = 0, g.aeroport = -1, g.contact = -1, g.ravitaille = false;
    this.groupes = this.groupes.filter((x) => x !== g);
    this.parId.delete(id);
    return g;
  }
  /** V2.C.5 : un groupe débarqué revient sur la carte, immobile sur le noeud de route `noeud`. */
  debarquer(g, noeud) {
    g.fini = false, g.ordre = ATTENDRE, g.surPlace = 0, g.contact = -1;
    this.poserChemin(g, [
      noeud
    ], [], 0);
    this.groupes.push(g);
    this.groupes.sort((a, b) => a.id - b.id);
    this.parId.set(g.id, g);
  }
  nettoyer() {
    if (!this.groupes.some((g) => g.fini)) return;
    this.groupes = this.groupes.filter((g) => !g.fini);
    this.parId = new Map(this.groupes.map((g) => [
      g.id,
      g
    ]));
  }
  // ------------------------------------------------------------------ chaque heure
  heure(m) {
    this.unites.assurer();
    this.livraisons();
    this.indexer();
    this.accrocher();
    for (const g of this.groupes) if (!g.fini) this.agir(g);
    if (m.heure % PARAMS8.periodeRavitaillement === 0) this.ravitailler();
    this.avancerConvois();
    this.nettoyer();
  }
  /** Unités sorties d'usine (unites.ts) : un groupe de livraison vers le dépôt du pays le plus proche par la route. */
  livraisons() {
    const u = this.unites, r = this.res;
    if (!u.sorties.length) return;
    for (const s of u.sorties) {
      const n = [
        0,
        0,
        0
      ];
      n[s.type] = s.n;
      const g = this.nouveau(s.pays, r.noeudRoute[s.site], n, -1, `Renforts (${r.noms[s.site] || "usine"})`, LIVRER);
      if (this.chercher(g, (v) => this.depotSur(v, s.pays) >= 0, PARAMS8.kmMaxOrdre)) {
        g.depot = this.depotSur(this.dernier(g), s.pays);
        if (this.auBout(g)) this.dissoudre(g, g.depot);
        continue;
      }
      let best = -1, bd = Infinity;
      for (const d of r.sites(DEPOT, s.pays)) {
        const dd = Math.hypot(r.x[d] - r.x[s.site], r.y[d] - r.y[s.site]);
        if (r.actif[d] && dd < bd) bd = dd, best = d;
      }
      this.dissoudre(g, best >= 0 ? best : s.site);
    }
    u.sorties = [];
    this.nettoyer();
  }
  /** Grille de 50 km des groupes (positions du début de l'heure). */
  indexer() {
    const gr = /* @__PURE__ */ new Map();
    this.groupes.forEach((g, i) => {
      const k = cle2(Math.floor(g.x / CASE2), Math.floor(g.y / CASE2)), l = gr.get(k);
      if (l) l.push(i);
      else gr.set(k, [
        i
      ]);
    });
    this.grille = gr;
  }
  /** Le groupe ennemi de `pays` le plus proche de (x, y) à moins de kmContact (−1 : aucun). */
  ennemiPres(pays, x, y, sauf = null) {
    const K = PARAMS8.kmContact, cx = Math.floor(x / CASE2), cy = Math.floor(y / CASE2);
    let best = null, bd = K;
    for (let i = cx - 1; i <= cx + 1; i++) {
      for (let j = cy - 1; j <= cy + 1; j++) {
        for (const k of this.grille.get(cle2(i, j)) ?? []) {
          const o = this.groupes[k];
          if (o === sauf || o.fini || !this.enGuerre(pays, o.pays)) continue;
          const d = Math.hypot(o.x - x, o.y - y);
          if (d <= bd) bd = d, best = o;
        }
      }
    }
    return best;
  }
  /** Accroches de l'heure : chaque groupe et l'ennemi le plus proche à moins de kmContact. */
  accrocher() {
    this.contacts = [];
    for (const g of this.groupes) {
      const o = this.ennemiPres(g.pays, g.x, g.y, g);
      g.contact = o ? o.id : -1;
      if (o && g.id < o.id) this.contacts.push(g.id, o.id);
    }
  }
  /** Marche, arrivée, consommation et état de la réserve d'un groupe pour une heure. */
  agir(g) {
    const bouge = g.ordre === ENVOYER && g.contact < 0 || g.ordre === RETIRER || g.ordre === LIVRER;
    if (bouge && !this.auBout(g)) this.marcher(g);
    else g.surPlace++;
    if (!g.fini && this.auBout(g)) this.arriver(g);
    if (g.contact >= 0) {
      let m = 0;
      for (let t = 0; t < 3; t++) m += g.n[t] * PARAMS5.munitionsCombat[t];
      g.munitions = Math.max(0, g.munitions - m);
    }
    const avant = g.aSec;
    g.aSec = g.ordre === LIVRER ? 0 : (g.n[CHARS] > 0 && g.carburant <= 1e-9 ? SEC_CARBURANT : 0) | (g.munitions <= 1e-9 ? SEC_MUNITIONS : 0);
    if (g.pays === this.joueur && g.aSec & ~avant && this.alertes.length < 20 && g.ordre !== LIVRER) {
      this.alertes.push(`${g.nom} est \xE0 sec de ${g.aSec & ~avant & SEC_CARBURANT ? "carburant" : "munitions"}.`);
      this.alertesXY.push(g.x, g.y);
    }
  }
  /** Une heure de marche, par pas de kmContact : prend les villes ennemies traversées, s'arrête au contact. */
  marcher(g) {
    let dist2 = this.vitesse(g);
    const besoin = g.ordre === LIVRER ? 0 : g.n[CHARS] * PARAMS5.carburantMarche[CHARS];
    if (besoin > 0) {
      if (g.carburant <= 1e-9) return;
      const f = Math.min(1, g.carburant / besoin);
      g.carburant = Math.max(0, g.carburant - besoin * f);
      dist2 *= f;
    }
    const total = g.cum[g.cum.length - 1], coupees = this.flux.coupees;
    while (dist2 > 1e-9 && g.km < total - 1e-6) {
      const pas = Math.min(PARAMS8.kmContact, dist2, total - g.km);
      g.km += pas, dist2 -= pas;
      let reroute = false;
      while (g.seg + 1 < g.noeuds.length - 1 && g.cum[g.seg + 1] <= g.km + 1e-9) {
        g.seg++;
        if (g.ordre === ENVOYER) this.prendreVilles(g, g.noeuds[g.seg]);
        if (coupees[g.aretes[g.seg]]) {
          g.km = g.cum[g.seg];
          const vise = g.but, depot2 = g.depot, pays = g.pays;
          const ok = g.ordre === ENVOYER ? this.chercher(g, (v) => v === vise, PARAMS8.kmMaxOrdre) : this.chercher(g, (v) => this.depotSur(v, pays) === depot2, PARAMS8.kmMaxOrdre);
          if (!ok) this.poserChemin(g, [
            g.noeuds[g.seg]
          ], [], 0), g.ordre = ATTENDRE;
          reroute = true;
          break;
        }
      }
      this.placer(g);
      if (reroute) break;
      if (g.ordre === ENVOYER) {
        const o = this.ennemiPres(g.pays, g.x, g.y, g);
        if (o) {
          g.contact = o.id;
          if (o.contact < 0) o.contact = g.id;
          this.contacts.push(Math.min(g.id, o.id), Math.max(g.id, o.id));
          break;
        }
      }
    }
    g.surPlace = 0;
  }
  /** Les villes ennemies rattachées à ce noeud passent au groupe si aucun groupe ennemi n'est là (V2.C.4 précisera). */
  prendreVilles(g, v) {
    const villes = this.c.villesParNoeud.get(v);
    if (!villes) return;
    const ax = this.res.d.reseau.axes.noeuds;
    let libre = null;
    for (const i of villes) {
      const o = this.res.proprietaire[i];
      if (!this.enGuerre(g.pays, o)) continue;
      libre ??= !this.ennemiPres(g.pays, ax[2 * v], ax[2 * v + 1], g);
      if (!libre) return;
      this.res.prendreVille(i, g.pays);
      this.villesPrises++;
      if ((o === this.joueur || g.pays === this.joueur) && this.alertes.length < 20) {
        this.alertes.push(o === this.joueur ? `Une de tes villes est prise par ${this.nomPays(g.pays)}.` : `${g.nom} prend une ville de ${this.nomPays(o)}.`);
        this.alertesXY.push(g.x, g.y);
      }
    }
  }
  /** Au bout de l'itinéraire. */
  arriver(g) {
    if (g.ordre === LIVRER || g.ordre === RETIRER) {
      const r = this.res;
      if (g.depot >= 0 && r.actif[g.depot] && r.pays[g.depot] === g.pays && this.depotSur(g.noeuds[g.noeuds.length - 1], g.pays) === g.depot) {
        this.dissoudre(g, g.depot);
        this.arrivees++;
        return;
      }
      if (this.chercher(g, (v) => this.depotSur(v, g.pays) >= 0, PARAMS8.kmMaxOrdre)) g.depot = this.depotSur(this.dernier(g), g.pays);
      else g.ordre = ATTENDRE;
      return;
    }
    if (g.ordre !== ENVOYER) return;
    const ici = g.noeuds[g.noeuds.length - 1];
    if (g.contact < 0) this.prendreVilles(g, ici);
    if (!g.offensive) {
      g.ordre = ATTENDRE;
      this.arrivees++;
      return;
    }
    if (g.contact >= 0 || this.villeEnnemieSur(ici, g.pays) >= 0) return;
    const pays = g.pays;
    if (this.chercher(g, (v) => this.villeEnnemieSur(v, pays) >= 0, PARAMS8.kmProgression)) {
      g.but = this.dernier(g), g.ville = this.villeEnnemieSur(g.but, pays);
    } else {
      g.ordre = ATTENDRE;
      this.arrivees++;
    }
  }
  /** Toutes les 6 h : un camion part du dépôt du pays le plus proche à portée vers chaque groupe sous les deux tiers. */
  ravitailler() {
    const r = this.res, P = PARAMS8;
    for (const g of this.groupes) {
      if (g.fini || g.ravitaille || g.ordre === LIVRER) continue;
      const [mc, mm] = this.reserveMax(g);
      if (!(g.carburant < P.seuilRavitaillement * mc || g.munitions < P.seuilRavitaillement * mm)) continue;
      let depot2 = -1;
      const c = this.depuis(this.noeudProche(g), (v) => (depot2 = this.depotSur(v, g.pays, true)) >= 0, P.porteeRavitaillementKm);
      if (!c) continue;
      const qc = r.prendre(depot2, CARBURANT, Math.max(0, mc - g.carburant));
      const qm = r.prendre(depot2, MUNITIONS, Math.max(0, mm - g.munitions));
      if (qc + qm <= 0) continue;
      const noeuds = c.noeuds.slice().reverse(), a = r.d.reseau;
      const trajet = noeuds.length > 1 ? this.trajets.ajouter(`rv:${noeuds[0]}>${noeuds[noeuds.length - 1]}:${noeuds.length}:${Math.round(c.km * 10)}`, TRAJET_ROUTE, polyligneAxes(a.axes, a.adjacence, noeuds, 1), c.km) : -1;
      this.convois.push({
        groupe: g.id,
        carburant: qc,
        munitions: qm,
        trajet,
        t: 0,
        dt: c.km > 1 ? P.kmhCamion / c.km : 1
      });
      g.ravitaille = true;
      this.ravitaillements++;
    }
  }
  avancerConvois() {
    if (!this.convois.length) return;
    const restants = [];
    for (const v of this.convois) {
      v.t += v.dt;
      if (v.t < 1 - 1e-9) {
        restants.push(v);
        continue;
      }
      const g = this.trouver(v.groupe);
      if (!g || g.fini) continue;
      const [mc, mm] = this.reserveMax(g);
      g.carburant = Math.min(Math.max(mc, g.carburant), g.carburant + v.carburant);
      g.munitions = Math.min(Math.max(mm, g.munitions), g.munitions + v.munitions);
      g.ravitaille = false;
    }
    this.convois = restants;
  }
  // ------------------------------------------------------------------ pour les autres modules et l'interface
  /** Unités d'un type dans les groupes d'un pays. */
  enGroupes(pays, type) {
    let s = 0;
    for (const g of this.groupes) {
      if (g.pays !== pays || g.fini) continue;
      s += type === AVIONS ? g.avions : type < 3 ? g.n[type] : 0;
    }
    return s;
  }
  /** Groupes à moins de `km` de (x, y). */
  groupesPres(x, y, km) {
    return this.groupes.filter((g) => !g.fini && Math.hypot(g.x - x, g.y - y) <= km);
  }
  /** Panneau du Dépôt (V2.E.1) : par type, présents et en route ; réserve du dépôt ; groupes sur place. */
  tableDepot(site2) {
    const r = this.res, u = this.unites, enRoute = [
      0,
      0,
      0
    ];
    for (const g of this.groupes) {
      if (g.depot === site2 && (g.ordre === LIVRER || g.ordre === RETIRER)) for (let t = 0; t < 3; t++) enRoute[t] += g.n[t];
    }
    const ici = r.noeudRoute[site2];
    return {
      presents: [
        0,
        1,
        2
      ].map((t) => u.parc[5 * site2 + t]),
      enRoute,
      carburant: r.stock[4 * site2 + CARBURANT],
      munitions: r.stock[4 * site2 + MUNITIONS],
      groupes: this.groupes.filter((g) => !g.fini && this.auBout(g) && g.noeuds[g.noeuds.length - 1] === ici).map((g) => g.id)
    };
  }
  /** Panneau d'un groupe (V2.E.1). */
  infoGroupe(id) {
    const g = this.trouver(id);
    if (!g) return null;
    const [mc, mm] = this.reserveMax(g);
    return {
      id: g.id,
      nom: g.nom,
      pays: g.pays,
      n: g.n.slice(),
      avions: g.avions,
      ordre: NOMS_ORDRES[g.ordre],
      x: g.x,
      y: g.y,
      carburant: g.carburant,
      munitions: g.munitions,
      carburantMax: mc,
      munitionsMax: mm,
      aSec: g.aSec,
      contact: g.contact,
      kmRestants: g.cum[g.cum.length - 1] - g.km,
      vitesse: this.vitesse(g),
      surPlace: g.surPlace
    };
  }
  /** Messages du joueur, puis les efface. */
  vider() {
    const a = this.alertes;
    this.alertes = [], this.alertesXY = [];
    return a;
  }
  systemes() {
    return [
      {
        nom: "groupes",
        periode: HEURE,
        executer: (m) => this.heure(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (const g of this.groupes) s += g.id * 7 + g.km * 10 + g.n[0] * 1e-3 + g.n[1] + g.carburant + g.munitions + g.ordre;
    h = melanger(h, this.groupes.length);
    h = melanger(h, this.convois.length);
    return melanger(h, Math.round(s) | 0);
  }
  /** Groupes (sur leur trajet s'ils marchent), camions de ravitaillement, avions et navires (tours). */
  rendu(c) {
    for (const g of this.groupes) {
      if (g.fini) continue;
      const [s, ch, a] = g.n;
      const type = ch >= s / 100 && ch >= a ? GROUPE_CHARS : a > s / 100 && a > ch ? GROUPE_ARTILLERIE : GROUPE_SOLDATS;
      const total = g.cum[g.cum.length - 1];
      const bouge = !this.auBout(g) && !(g.aSec & SEC_CARBURANT) && (g.ordre === ENVOYER && g.contact < 0 || g.ordre === RETIRER || g.ordre === LIVRER);
      const sur = g.trajet >= 0 && total > 0;
      c.groupe(g.id, g.x, g.y, sur ? g.trajet : -1, sur ? g.km / total : 0, sur && bouge ? this.vitesse(g) / total : 0, type, this.camp(g.pays), s + ch + a, g.n, g.ordre === LIVRER ? GROUPE_RENFORTS : 0);
    }
    const paires = [], G = this.guerre;
    for (let a = 0; a < 256; a++) for (let b = a + 1; b < 256; b++) if (G[a * 256 + b]) paires.push(a << 8 | b);
    c.guerres(paires);
    const n = this.convois.filter((v) => v.trajet >= 0);
    c.billes(n.length, n.map((v) => v.trajet), n.map((v) => v.t), n.map((v) => v.dt), n.map((v) => SORTE_CAMION | (v.munitions > v.carburant ? PRODUIT_MUNITIONS : PRODUIT_CARBURANT) << 2));
    this.unites.dessiner(c, (p) => this.camp(p));
  }
};

// web/src/sim/territoire.ts
var PARAMS9 = {
  /** Côté d'une case de l'occupation (km de carte) ; la même grille que le rendu (protocole.ts). */
  caseKm: CASE_TERRITOIRE_KM,
  /** ❓ Rayon autour d'une ville prise où ses cases sont cherchées (km) ; une ville tient au plus ce rayon. 25/10 : 60 → 150
   *  (au-delà de 60 km d'une ville, les grandes régions peu peuplées gardaient la couleur du vaincu). */
  rayonKm: 150,
  /** Un site ou un port dépend de la ville vivante la plus proche à moins de cette distance (comme V2.C.2). */
  kmTerritoire: 300,
  /** Villes prises gardées pour le menu de guerre. */
  gardesPrises: 200,
  /** ❓ R.1 : le front d'une ville prise s'étale de tant de km par heure autour d'elle (60 km en 6 h). */
  kmFrontHeure: 10,
  /** ❓ R.1 : demi-largeur du couloir peint autour d'un groupe qui avance en pays ennemi (km de carte). */
  kmCouloir: 15,
  /** 25/10 : au-delà de ce saut en une heure (débarquement), pas de couloir entre l'avant et l'après (km de carte). */
  kmSautMax: 250
};
var cle3 = (cx, cy) => (cx + 5e4) * 1e5 + (cy + 5e4);
var Territoire = class {
  joueur;
  /** propriétaire de chaque ville au dernier passage */
  connu;
  vu;
  /** villes tenues par pays, et au départ */
  tenues;
  depart;
  /** pays tombés, dans l'ordre */
  tombes;
  /** cases occupées (hors du pays d'origine de leur ville) : case → occupant */
  zones;
  /** R.1 : fronts en cours d'étalement (une entrée par ville changée) */
  fronts;
  /** 25/10 : position de chaque groupe à l'heure précédente (x, y, km parcourus, trajet) : le couloir suit le chemin de l'heure */
  avant;
  prises;
  alertes;
  sitesPerdus;
  // ---- bilans R.1
  casesCouloir;
  casesFront;
  constructor(res, grp, unites, joueur) {
    this.joueur = joueur;
    this.vu = 0;
    this.tenues = new Int32Array(256);
    this.depart = new Int32Array(256);
    this.tombes = [];
    this.zones = /* @__PURE__ */ new Map();
    this.fronts = [];
    this.avant = /* @__PURE__ */ new Map();
    this.prises = [];
    this.alertes = [];
    this.sitesPerdus = 0;
    this.casesCouloir = 0;
    this.casesFront = 0;
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "grp", {
      value: grp,
      enumerable: false
    });
    Object.defineProperty(this, "unites", {
      value: unites,
      enumerable: false
    });
    Object.defineProperty(this, "journal", {
      value: /* @__PURE__ */ new Map(),
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, "chemins", {
      value: [],
      enumerable: false,
      writable: true
    });
    Object.defineProperty(this, "plantees", {
      value: [],
      enumerable: false,
      writable: true
    });
    const V = res.d.villes, xy = new Float32Array(2 * V.n);
    for (let k = 0; k < V.n; k++) xy[2 * k] = V.x[k], xy[2 * k + 1] = V.y[k];
    Object.defineProperty(this, "villes", {
      value: new IndexNoeuds(xy, () => true),
      enumerable: false
    });
    Object.defineProperty(this, "villeSite", {
      value: new Int32Array(0),
      enumerable: false,
      writable: true
    });
    const P = res.d.reseau.ports, vp = new Int32Array(P.n);
    for (let i = 0; i < P.n; i++) vp[i] = this.villes.proche(P.x[i], P.y[i], PARAMS9.kmTerritoire)[0];
    Object.defineProperty(this, "villePort", {
      value: vp,
      enumerable: false
    });
    this.connu = res.proprietaire.slice();
    this.vu = res.villesChangees;
    for (let i = 0; i < V.n; i++) this.tenues[this.connu[i]]++;
    this.depart.set(this.tenues);
  }
  /** Ville vivante dont dépend un site (la plus proche à moins de kmTerritoire, −1 : aucune). */
  villeDuSite(s) {
    if (this.villeSite.length < this.res.n) {
      const t = new Int32Array(Math.max(this.res.n, 2 * this.villeSite.length)).fill(-2);
      t.set(this.villeSite);
      this.villeSite = t;
    }
    if (this.villeSite[s] === -2) this.villeSite[s] = this.villes.proche(this.res.x[s], this.res.y[s], PARAMS9.kmTerritoire)[0];
    return this.villeSite[s];
  }
  // ------------------------------------------------------------------ chaque heure
  heure(m) {
    this.couloirs();
    this.avancerFronts();
    const r = this.res;
    if (r.villesChangees === this.vu) return;
    this.vu = r.villesChangees;
    const pr = r.proprietaire, c = this.connu, changees = [];
    for (let i = 0; i < c.length; i++) if (pr[i] !== c[i]) changees.push(i);
    if (!changees.length) return;
    const parVille = /* @__PURE__ */ new Map();
    for (const i of changees) parVille.set(i, c[i]);
    for (let s = 0; s < r.n; s++) {
      if (!r.actif[s]) continue;
      const v = this.villeDuSite(s), de = v >= 0 ? parVille.get(v) : void 0;
      if (de === void 0 || r.pays[s] !== de || pr[v] === de) continue;
      this.perdreSite(s);
    }
    const P = r.d.reseau.ports, u = this.unites;
    for (let i = 0; i < P.n; i++) {
      const v = this.villePort[i];
      if (v < 0 || !parVille.has(v) || u.paysPort[i] !== parVille.get(v)) continue;
      u.naviresPort[i] = 0, u.paysPort[i] = pr[v];
    }
    for (const i of changees) {
      const de = c[i], a = pr[i];
      this.tenues[de]--, this.tenues[a]++;
      c[i] = a;
      this.prises.push({
        ville: i,
        de,
        a,
        heure: m.heure
      });
      const quand = this.ouvrirFront(i);
      if (this.plantees.length < 3 * 300) this.plantees.push(i, a, Math.round(255 * quand));
    }
    if (this.prises.length > PARAMS9.gardesPrises) this.prises.splice(0, this.prises.length - PARAMS9.gardesPrises);
    for (const de of new Set(changees.map((i) => parVille.get(i)))) {
      if (this.tenues[de] <= 0 && this.depart[de] > 0 && !this.tombes.includes(de)) this.tomber(de, pr[changees.find((i) => parVille.get(i) === de)]);
    }
  }
  /** Un bâtiment pris : arrêté, son parc perdu. */
  perdreSite(s) {
    this.res.activer(s, false);
    for (let t = 0; t < 5; t++) this.unites.parc[5 * s + t] = 0;
    this.unites.commande[s] = 0;
    this.sitesPerdus++;
  }
  // ------------------------------------------------------------------ R.1 : la couleur avance
  /** Pays d'origine d'une case (celui de la ville vivante la plus proche à moins de kmTerritoire ; −1 : aucune). */
  origine(x, y) {
    const [w] = this.villes.proche(x, y, PARAMS9.kmTerritoire);
    return w < 0 ? -1 : this.res.d.villes.pays[w];
  }
  /** Pays qui tient une case : son occupant, sinon le pays qui tient sa ville la plus proche (−1 : aucune). */
  tenant(cx, cy) {
    const o = this.zones.get(cle3(cx, cy));
    if (o !== void 0) return o;
    const C2 = PARAMS9.caseKm, [w] = this.villes.proche((cx + 0.5) * C2, (cy + 0.5) * C2, PARAMS9.kmTerritoire);
    return w < 0 ? -1 : this.res.proprietaire[w];
  }
  /**
   * La case passe à `pays` : gardée en creux (effacée si c'est son pays d'origine), notée pour le rendu si elle change,
   * avec le moment de l'heure où elle change (0 à 1).
   */
  marquer(cx, cy, pays, quand = 0) {
    const k = cle3(cx, cy), C2 = PARAMS9.caseKm, avant = this.zones.get(k);
    const origine = this.origine((cx + 0.5) * C2, (cy + 0.5) * C2);
    const moment = Math.round(255 * Math.min(1, Math.max(0, quand))) << 8;
    if (pays === origine) {
      if (avant === void 0) return false;
      this.zones.delete(k);
      this.journal.set(k, moment);
      return true;
    }
    if (avant === pays) return false;
    this.zones.set(k, pays);
    this.journal.set(k, pays | moment);
    return true;
  }
  /**
   * Les groupes en marche peignent leur couloir : les cases à moins de kmCouloir du chemin de l'heure tenues par un pays en
   * guerre avec eux, chacune au moment où la tête du groupe y passe. Le chemin est l'itinéraire du groupe entre ses deux
   * positions (même trajet qu'à l'heure d'avant), sinon la ligne droite entre elles.
   */
  couloirs() {
    const g = this.grp, C2 = PARAMS9.caseKm, K = PARAMS9.kmCouloir, vus = /* @__PURE__ */ new Map(), chemins = [];
    const ax = this.res.d.reseau.axes.noeuds, pas = K / 3, ennemi = (p, t) => t >= 0 && t !== p && g.enGuerre(p, t);
    for (const x of g.groupes) {
      if (x.fini) continue;
      const a = this.avant.get(x.id);
      vus.set(x.id, [
        x.x,
        x.y,
        x.km,
        x.trajet
      ]);
      if (x.ordre !== ENVOYER || x.surPlace > 0) continue;
      let x0 = a ? a[0] : x.x, y0 = a ? a[1] : x.y;
      if (Math.hypot(x.x - x0, x.y - y0) > PARAMS9.kmSautMax) x0 = x.x, y0 = x.y;
      chemins.push(x.pays, x0, y0, x.x, x.y);
      const pts = [];
      if (a && a[3] === x.trajet && x.trajet >= 0 && a[2] < x.km && x.cum.length > 1) {
        const km0 = a[2], n = Math.max(1, Math.ceil((x.km - km0) / pas));
        let seg = 0;
        for (let i = 0; i <= n; i++) {
          const km = km0 + (x.km - km0) * i / n;
          while (seg + 1 < x.cum.length - 1 && x.cum[seg + 1] < km) seg++;
          const u = x.noeuds[seg], w = x.noeuds[Math.min(seg + 1, x.noeuds.length - 1)], l = x.cum[seg + 1] - x.cum[seg];
          const f = l > 0 ? Math.min(1, Math.max(0, (km - x.cum[seg]) / l)) : 0;
          pts.push(ax[2 * u] + (ax[2 * w] - ax[2 * u]) * f, ax[2 * u + 1] + (ax[2 * w + 1] - ax[2 * u + 1]) * f, i / n);
        }
      } else {
        const n = Math.max(1, Math.ceil(Math.hypot(x.x - x0, x.y - y0) / pas));
        for (let i = 0; i <= n; i++) pts.push(x0 + (x.x - x0) * i / n, y0 + (x.y - y0) * i / n, i / n);
      }
      const vues = /* @__PURE__ */ new Set();
      for (let i = 0; i < pts.length; i += 3) {
        const px = pts[i], py = pts[i + 1];
        for (let cx = Math.floor((px - K) / C2); cx <= Math.floor((px + K) / C2); cx++) {
          for (let cy = Math.floor((py - K) / C2); cy <= Math.floor((py + K) / C2); cy++) {
            const k = cle3(cx, cy);
            if (vues.has(k) || Math.hypot((cx + 0.5) * C2 - px, (cy + 0.5) * C2 - py) > K) continue;
            vues.add(k);
            if (!ennemi(x.pays, this.tenant(cx, cy))) continue;
            if (this.marquer(cx, cy, x.pays, pts[i + 2])) this.casesCouloir++;
          }
        }
      }
    }
    this.avant = vus;
    this.chemins = chemins;
  }
  /** Moment de l'heure (0 à 1) où un groupe de `pays` en marche est passé au plus près de (x, y) ; 0 si aucun n'y est passé. */
  passage(pays, x, y) {
    const c = this.chemins;
    let mieux = PARAMS9.kmCouloir * 2, quand = 0;
    for (let i = 0; i < c.length; i += 5) {
      if (c[i] !== pays) continue;
      const x0 = c[i + 1], y0 = c[i + 2], dx = c[i + 3] - x0, dy = c[i + 4] - y0, l2 = dx * dx + dy * dy;
      const u = l2 > 0 ? Math.min(1, Math.max(0, ((x - x0) * dx + (y - y0) * dy) / l2)) : 0;
      const d = Math.hypot(x - x0 - u * dx, y - y0 - u * dy);
      if (d < mieux) mieux = d, quand = u;
    }
    return quand;
  }
  /**
   * Une ville a changé de mains : son front s'ouvre (la ville elle-même change de couleur au passage de ses preneurs,
   * dans l'heure). Rend ce moment (0 à 1).
   */
  ouvrirFront(v) {
    this.fronts = this.fronts.filter((f2) => f2.ville !== v);
    const f = {
      ville: v,
      rayon: 0
    }, V = this.res.d.villes;
    const quand = this.passage(this.res.proprietaire[v], V.x[v], V.y[v]);
    this.fronts.push(f);
    this.peindreAnneau(f, 0, PARAMS9.caseKm, quand);
    f.rayon = PARAMS9.caseKm;
    return quand;
  }
  /**
   * Chaque heure, chaque front gagne un anneau de kmFrontHeure ; fini quand il atteint rayonKm, ou dès qu'un anneau ne
   * touche plus aucune case de sa ville (la zone d'une ville, la plus proche de chaque point, est d'un seul tenant : au-delà
   * il n'y a plus rien à elle — en Europe, c'est fini en quelques heures).
   */
  avancerFronts() {
    if (!this.fronts.length) return;
    const R = PARAMS9.rayonKm, restants = [];
    for (const f of this.fronts) {
      const r1 = Math.min(R, f.rayon + PARAMS9.kmFrontHeure);
      const a = this.peindreAnneau(f, f.rayon, r1);
      f.rayon = r1;
      if (r1 < R && a > 0) restants.push(f);
    }
    this.fronts = restants;
  }
  /**
   * Cases de 10 km dont la ville du front est la plus proche, à une distance de (r0, r1] : au maître actuel de la ville,
   * chacune au moment de l'heure où l'anneau l'atteint (`quand` pour la ville elle-même, au premier anneau). Rend le nombre
   * de cases de la ville dans l'anneau (déjà peintes comprises).
   */
  peindreAnneau(f, r0, r1, quand) {
    const r = this.res, V = r.d.villes, C2 = PARAMS9.caseKm, R = PARAMS9.rayonKm, v = f.ville, maitre = r.proprietaire[v];
    let a = 0;
    const cx0 = Math.floor((V.x[v] - r1) / C2), cx1 = Math.floor((V.x[v] + r1) / C2);
    const cy0 = Math.floor((V.y[v] - r1) / C2), cy1 = Math.floor((V.y[v] + r1) / C2);
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        const x = (cx + 0.5) * C2, y = (cy + 0.5) * C2, d = Math.hypot(x - V.x[v], y - V.y[v]);
        if (d > r1 || d <= r0 && r0 > 0) continue;
        const [w] = this.villes.proche(x, y, R);
        if (w !== v) continue;
        a++;
        if (this.marquer(cx, cy, maitre, quand ?? (r1 > r0 ? (d - r0) / (r1 - r0) : 0))) this.casesFront++;
      }
    }
    return a;
  }
  /** Cases changées depuis le dernier appel, pour le rendu (null : aucune). */
  renduChangements() {
    const j = this.journal;
    if (!j.size) return null;
    const n = j.size, cx = new Int32Array(n), cy = new Int32Array(n), occ = new Uint8Array(n), retard = new Uint8Array(n);
    let i = 0;
    for (const [k, v] of j) cx[i] = Math.floor(k / 1e5) - 5e4, cy[i] = k % 1e5 - 5e4, occ[i] = v & 255, retard[i] = v >> 8, i++;
    this.journal = /* @__PURE__ */ new Map();
    return {
      tout: false,
      n,
      cx,
      cy,
      occupant: occ,
      retard
    };
  }
  /** Toutes les cases occupées (nouvelle partie, rechargement), sans délai. */
  renduComplet() {
    this.journal = /* @__PURE__ */ new Map();
    const n = this.zones.size, cx = new Int32Array(n), cy = new Int32Array(n), occ = new Uint8Array(n);
    let i = 0;
    for (const [k, p] of this.zones) cx[i] = Math.floor(k / 1e5) - 5e4, cy[i] = k % 1e5 - 5e4, occ[i] = p, i++;
    return {
      tout: true,
      n,
      cx,
      cy,
      occupant: occ,
      retard: new Uint8Array(n)
    };
  }
  /** 25/10 : les villes prises depuis le dernier envoi (drapeau planté, au moment où la ville change de couleur). */
  rendu(c) {
    const p = this.plantees, V = this.res.d.villes;
    for (let i = 0; i < p.length; i += 3) c.evenement(EV_PRISE, V.x[p[i]], V.y[p[i]], this.grp.camp(p[i + 1]), p[i + 1], p[i + 2] / 255);
    this.plantees = [];
  }
  /** Le pays ne tient plus aucune ville : ses groupes disparaissent, ses bâtiments s'arrêtent, ses guerres prennent fin. */
  tomber(p, vainqueur) {
    const r = this.res, g = this.grp, u = this.unites;
    for (const x of g.groupesDe(p)) g.supprimer(x.id);
    for (let s = 0; s < r.n; s++) if (r.pays[s] === p && r.actif[s]) this.perdreSite(s);
    for (let i = 0; i < u.naviresPort.length; i++) if (u.paysPort[i] === p) u.naviresPort[i] = 0;
    for (let q = 0; q < 256; q++) if (q !== p && g.enGuerre(p, q)) g.declarerGuerre(p, q, false);
    this.tombes.push(p);
    const nom = g.nomPays(p);
    if (this.alertes.length < 20) {
      this.alertes.push(p === this.joueur ? `Ton pays est tomb\xE9 : ${g.nomPays(vainqueur)} tient ta derni\xE8re ville.` : `${nom} est tomb\xE9 (derni\xE8re ville prise par ${g.nomPays(vainqueur)}).`);
    }
  }
  // ------------------------------------------------------------------ pour les autres modules et l'interface
  /** Pays qui tient (x, y) : l'occupant de sa case s'il y en a un, sinon celui de la ville vivante la plus proche (−1 : trop loin). */
  controleur(x, y) {
    const C2 = PARAMS9.caseKm;
    return this.tenant(Math.floor(x / C2), Math.floor(y / C2));
  }
  /** Part de la population d'origine d'un pays que d'autres tiennent (0 à 1). */
  partConquise(p) {
    const r = this.res, V = r.d.villes;
    let tot = 0, pris = 0;
    for (let i = 0; i < V.n; i++) {
      if (V.pays[i] !== p) continue;
      tot += r.poids[i];
      if (r.proprietaire[i] !== p) pris += r.poids[i];
    }
    return tot > 0 ? pris / tot : 0;
  }
  /** Pays qui ont perdu ou gagné des villes : part conquise de chacun, villes tenues (menu de guerre, V2.E.1). */
  fiche() {
    const vus = /* @__PURE__ */ new Set();
    for (const p of this.prises) vus.add(p.de), vus.add(p.a);
    return [
      ...vus
    ].sort((a, b) => a - b).map((p) => ({
      pays: p,
      partConquise: this.partConquise(p),
      villes: this.tenues[p],
      villesDepart: this.depart[p],
      tombe: this.tombes.includes(p)
    }));
  }
  /** Cases occupées pour la carte : x, y du centre (km de carte) et occupant. */
  zonesOccupees() {
    const n = this.zones.size, x = new Float32Array(n), y = new Float32Array(n), o = new Uint8Array(n), C2 = PARAMS9.caseKm;
    let i = 0;
    for (const [k, p] of this.zones) {
      const cx = Math.floor(k / 1e5) - 5e4, cy = k % 1e5 - 5e4;
      x[i] = (cx + 0.5) * C2, y[i] = (cy + 0.5) * C2, o[i] = p, i++;
    }
    return {
      x,
      y,
      occupant: o
    };
  }
  vider() {
    const a = this.alertes;
    this.alertes = [];
    return a;
  }
  systemes() {
    return [
      {
        nom: "territoire",
        periode: HEURE,
        executer: (m) => this.heure(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    h = melanger(h, this.prises.length);
    h = melanger(h, this.zones.size);
    h = melanger(h, this.fronts.length * 7 + this.casesCouloir);
    return melanger(h, this.tombes.length * 1e3 + this.sitesPerdus);
  }
};

// web/src/sim/nucleaire.ts
var PARAMS10 = {
  /** puissance des cinq bombes (kt), dans l'ordre de prix.json */
  kt: [
    15,
    50,
    200,
    1e3,
    1e4
  ],
  /** puissance de référence des cercles : moyenne géométrique d'Hiroshima (15 kt) et de Nagasaki (21 kt) */
  ktReference: Math.sqrt(15 * 21),
  /** bord extérieur des trois cercles à la puissance de référence, km */
  rayonsReference: [
    1,
    2.6,
    5
  ],
  /** parts tuées et blessées dans chaque cercle (Hiroshima et Nagasaki additionnées) */
  morts: [
    0.87,
    0.285,
    0.015
  ],
  blesses: [
    0.079,
    0.354,
    0.159
  ],
  /** habitants par km² d'une ville (Hiroshima : 176 000 sur 21 km²) ; rayon minimal d'une ville, km */
  densiteVille: 8e3,
  rayonVilleMin: 0.3,
  /** ❓ part des pertes subie à l'abri : soldats, chars, canons (V1 : char 0,3, blindé 0,5) */
  protection: [
    1,
    0.3,
    0.5
  ],
  /** vol à Mach 5 (V1), km/h */
  kmh: 5 * 1235,
  /** ❓ jours pour refaire une bombe au Silo ; heures où l'impact reste dessiné ; impacts gardés */
  joursArmement: 30,
  heuresAffichage: 72,
  gardesImpacts: 50
};
function rayons(kt) {
  const f = Math.cbrt(Math.max(0, kt) / PARAMS10.ktReference), [a, b, c] = PARAMS10.rayonsReference;
  return [
    a * f,
    b * f,
    c * f
  ];
}
function surfaceCommune(R, r, d) {
  if (R <= 0 || r <= 0 || d >= R + r) return 0;
  if (d <= Math.abs(R - r)) return Math.PI * Math.min(R, r) ** 2;
  const a = Math.acos(Math.max(-1, Math.min(1, (d * d + r * r - R * R) / (2 * d * r))));
  const b = Math.acos(Math.max(-1, Math.min(1, (d * d + R * R - r * r) / (2 * d * R))));
  const k = Math.max(0, (-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R));
  return r * r * a + R * R * b - 0.5 * Math.sqrt(k);
}
function tuesVille(habitants, d, R) {
  if (!(habitants > 0)) return 0;
  const P = PARAMS10, rv = Math.max(P.rayonVilleMin, Math.sqrt(habitants / (P.densiteVille * Math.PI)));
  const aire = Math.PI * rv * rv;
  let avant = 0, t = 0;
  for (let k = 0; k < 3; k++) {
    const s = surfaceCommune(R[k], rv, d);
    t += (s - avant) / aire * P.morts[k];
    avant = s;
  }
  return habitants * t;
}
var Nucleaire = class {
  joueur;
  /** part des habitants encore là, par ville vivante */
  restant;
  vols;
  impacts;
  armements;
  prochain;
  heure;
  /** tués par les bombes, par pays d'origine */
  tues;
  alertes;
  constructor(res, flux, bat, unites, grp, combat, terr, air, joueur) {
    this.joueur = joueur;
    this.vols = [];
    this.impacts = [];
    this.armements = [];
    this.prochain = 1;
    this.heure = 0;
    this.tues = new Float64Array(256);
    this.alertes = [];
    for (const [k, v] of Object.entries({
      res,
      flux,
      bat,
      unites,
      grp,
      combat,
      terr,
      air
    })) Object.defineProperty(this, k, {
      value: v,
      enumerable: false
    });
    this.restant = new Float32Array(res.d.villes.n).fill(1);
  }
  get autorise() {
    return this.bat.nucleaire;
  }
  nomBombe(b) {
    return this.res.d.prix.bombes[b]?.nom ?? "Bombe";
  }
  /** « bombe H de 10 Mt » (dans une phrase). */
  bombeDe(b) {
    const n = this.nomBombe(b);
    return n[0].toLowerCase() + n.slice(1);
  }
  /** Silos actifs et armés d'un pays : [site, bombe], la plus grosse bombe d'abord. */
  silos(pays) {
    const r = this.res, l = [];
    for (const s of r.sites(SILO, pays)) {
      const b = this.bat.bombe.get(s);
      if (r.actif[s] && b !== void 0 && b >= 0) l.push([
        s,
        b
      ]);
    }
    return l.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  }
  alerter(texte, ...pays) {
    if (pays.includes(this.joueur) && this.alertes.length < 20) this.alertes.push(texte);
  }
  // ------------------------------------------------------------------ ordres
  /** Tir sur (x, y) depuis un silo du pays (`silo` −1 : celui qui porte `bombe`, sinon la plus grosse). */
  tirer(pays, x, y, bombe = -1, silo = -1) {
    if (!this.autorise) return {
      ok: false,
      texte: "Le nucl\xE9aire est d\xE9sactiv\xE9 dans cette partie."
    };
    if (!isFinite(x) || !isFinite(y)) return {
      ok: false,
      texte: "Cible invalide."
    };
    const l = this.silos(pays);
    const choix = silo >= 0 ? l.find(([s]) => s === silo) : bombe >= 0 ? l.find(([, b]) => b === bombe) : l[0];
    if (!choix) {
      return {
        ok: false,
        texte: silo >= 0 || bombe >= 0 ? "Aucun de tes silos n'est arm\xE9 de cette bombe." : "Aucun de tes silos n'est arm\xE9."
      };
    }
    const q = this.terr.controleur(x, y);
    if (q === pays) return {
      ok: false,
      texte: "C'est ton propre territoire."
    };
    if (q >= 0 && !this.grp.enGuerre(pays, q)) return {
      ok: false,
      texte: `${this.grp.nomPays(q)} n'est pas en guerre avec toi.`
    };
    const v = this.lancer(pays, choix[0], x, y, q, false);
    let texte = `${this.nomBombe(choix[1])} lanc\xE9e${q >= 0 ? ` sur ${this.grp.nomPays(q)}` : ""} : impact dans ${v.arrivee - this.heure} h.`;
    const rip = q >= 0 ? this.silos(q)[0] : void 0;
    const ville = rip ? this.villeLaPlusPeuplee(pays) : -1;
    if (rip && ville >= 0) {
      const V = this.res.d.villes;
      this.lancer(q, rip[0], V.x[ville], V.y[ville], pays, true);
      texte += ` Riposte de ${this.grp.nomPays(q)} : ${this.bombeDe(rip[1])} en route.`;
      this.alerter(`${this.grp.nomPays(q)} riposte : une ${this.bombeDe(rip[1])} vole vers une de tes villes.`, pays);
    }
    this.alerter(`Alerte : ${this.grp.nomPays(pays)} lance une ${this.bombeDe(choix[1])} sur ton pays.`, q);
    return {
      ok: true,
      texte
    };
  }
  /** La ville vivante tenue par `pays` qui a le plus d'habitants encore là (−1 : aucune). */
  villeLaPlusPeuplee(pays) {
    const r = this.res, V = r.d.villes;
    let best = -1, bp = 0;
    for (let i = 0; i < V.n; i++) {
      if (r.proprietaire[i] !== pays) continue;
      const h = V.pop[i] * this.restant[i];
      if (h > bp) bp = h, best = i;
    }
    return best;
  }
  lancer(pays, silo, x, y, cible, riposte) {
    const r = this.res, b = this.bat.bombe.get(silo);
    this.bat.bombe.delete(silo);
    const d = distanceSol(r.x[silo], r.y[silo], x, y);
    const v = {
      n: this.prochain++,
      tireur: pays,
      cible,
      bombe: b,
      x0: r.x[silo],
      y0: r.y[silo],
      x,
      y,
      depart: this.heure,
      arrivee: this.heure + Math.max(1, Math.ceil(d / PARAMS10.kmh)),
      riposte
    };
    this.vols.push(v);
    return v;
  }
  /** Refait une bombe au Silo (vide) : prix de la bombe, ❓ 30 jours. */
  armer(pays, silo, bombe) {
    const r = this.res, B = r.d.prix.bombes;
    if (!this.autorise) return {
      ok: false,
      texte: "Le nucl\xE9aire est d\xE9sactiv\xE9 dans cette partie."
    };
    if (!(silo >= 0 && silo < r.n) || r.genre[silo] !== SILO || r.pays[silo] !== pays || !r.actif[silo]) return {
      ok: false,
      texte: "Ce n'est pas un de tes silos."
    };
    if (!(bombe >= 0 && bombe < B.length) || bombe !== Math.floor(bombe)) return {
      ok: false,
      texte: "Choisis la puissance de la bombe (de 15 kt \xE0 10 Mt)."
    };
    if (this.bat.bombe.has(silo) || this.armements.some((a) => a.silo === silo)) return {
      ok: false,
      texte: "Ce silo est d\xE9j\xE0 arm\xE9 ou en cours d'armement."
    };
    if (!r.depenser(pays, B[bombe].prix)) return {
      ok: false,
      texte: `Pas assez d'argent : il faut ${nombre(B[bombe].prix)}.`
    };
    this.armements.push({
      silo,
      pays,
      bombe,
      fin: this.heure + 24 * PARAMS10.joursArmement
    });
    return {
      ok: true,
      texte: `${B[bombe].nom} en fabrication : ${PARAMS10.joursArmement} jours.`
    };
  }
  // ------------------------------------------------------------------ chaque heure
  tour(m) {
    this.heure = m.heure;
    if (this.armements.length) {
      this.armements = this.armements.filter((a) => {
        if (a.fin > m.heure) return true;
        if (this.res.actif[a.silo] && this.res.pays[a.silo] === a.pays) {
          this.bat.bombe.set(a.silo, a.bombe);
          this.alerter(`${this.nomBombe(a.bombe)} pr\xEAte au silo.`, a.pays);
        }
        return false;
      });
    }
    if (!this.vols.length) return;
    const tombent = this.vols.filter((v) => v.arrivee <= m.heure);
    if (!tombent.length) return;
    this.vols = this.vols.filter((v) => v.arrivee > m.heure);
    for (const v of tombent) this.impact(v);
  }
  /** Une bombe tombe : population, bâtiments, ports, ponts, flottes, convois et groupes dans les cercles. */
  impact(v) {
    const r = this.res, V = r.d.villes, P = PARAMS10, kt = P.kt[v.bombe], R = rayons(kt);
    const x = v.x, y = v.y, Rc = rayonCarte(R[2] + 15, y);
    let tues = 0;
    for (let i = 0; i < V.n; i++) {
      if (Math.abs(V.y[i] - y) > Rc) continue;
      const d = distanceSol(x, y, V.x[i], V.y[i]);
      if (d > R[2] + 15) continue;
      const h = V.pop[i] * this.restant[i], t = tuesVille(h, d, R);
      if (!(t > 0)) continue;
      this.restant[i] = Math.max(0, this.restant[i] - t / V.pop[i]);
      r.tues(V.pays[i], t);
      this.tues[V.pays[i]] += t;
      tues += t;
    }
    const u = this.unites, dans = (px, py) => distanceSol(x, y, px, py) <= R[1];
    let batiments = 0;
    for (let s = 0; s < r.n; s++) {
      if (!r.actif[s] || r.genre[s] === PORT || !dans(r.x[s], r.y[s])) continue;
      r.activer(s, false);
      for (let k = 0; k < 4; k++) r.stock[4 * s + k] = 0;
      for (let t = 0; t < 5; t++) u.parc[5 * s + t] = 0;
      if (s < u.commande.length) u.commande[s] = 0;
      this.bat.bombe.delete(s);
      this.armements = this.armements.filter((a) => a.silo !== s);
      batiments++;
    }
    const Pt = r.d.reseau.ports;
    for (let i = 0; i < Pt.n; i++) if (u.naviresPort[i] > 0 && dans(Pt.x[i], Pt.y[i])) u.naviresPort[i] = 0;
    for (const f of this.air.flottes) {
      if (f.n > 0 && dans(f.x, f.y)) {
        if (f.groupe) this.grp.supprimer(f.groupe.id), f.groupe = null;
        f.n = 0;
      }
    }
    this.air.flottes = this.air.flottes.filter((f) => f.n > 0);
    for (const i of this.combat.pontsPres(x, y, rayonCarte(R[1], y))) if (!this.combat.detruits[i]) this.combat.detruirePont(v.tireur, i, null);
    this.air.detruireConvois(this.air.convoisVus(null).filter((c) => dans(c.x, c.y)));
    let soldats = 0;
    for (const g of this.grp.groupesPres(x, y, rayonCarte(R[2], y))) {
      const d = distanceSol(x, y, g.x, g.y), k = d < R[0] ? 0 : d < R[1] ? 1 : d < R[2] ? 2 : -1;
      if (k < 0) continue;
      const pertes = P.morts[k] + P.blesses[k], avant = g.n[0];
      this.air.blesser(g, P.protection.map((p) => pertes * p), P.morts[k] / pertes);
      soldats += avant - g.n[0];
    }
    const im = {
      n: v.n,
      tireur: v.tireur,
      cible: v.cible,
      bombe: v.bombe,
      kt,
      x,
      y,
      heure: this.heure,
      rayons: R,
      tues,
      soldats,
      batiments,
      riposte: v.riposte
    };
    this.impacts.push(im);
    if (this.impacts.length > P.gardesImpacts) this.impacts.splice(0, this.impacts.length - P.gardesImpacts);
    const ou = v.cible >= 0 ? this.grp.nomPays(v.cible) : "la cible";
    this.alerter(`${this.nomBombe(v.bombe)} sur ${ou} : ${nombre(tues)} tu\xE9s, ${nombre(batiments)} b\xE2timents d\xE9truits.`, v.tireur, v.cible);
  }
  // ------------------------------------------------------------------ pour l'interface
  fiche(pays) {
    const r = this.res;
    return {
      autorise: this.autorise,
      silos: r.sites(SILO, pays).filter((s) => r.actif[s]).map((s) => {
        const a = this.armements.find((k) => k.silo === s);
        return {
          site: s,
          x: r.x[s],
          y: r.y[s],
          bombe: this.bat.bombe.get(s) ?? -1,
          enFabrication: a ? a.fin - this.heure : 0
        };
      }),
      vols: this.vols.map((v) => ({
        n: v.n,
        tireur: v.tireur,
        cible: v.cible,
        kt: PARAMS10.kt[v.bombe],
        x: v.x,
        y: v.y,
        arrivee: v.arrivee
      })),
      impacts: this.impacts.slice(-10).map((i) => ({
        ...i,
        rayons: i.rayons.slice()
      })),
      tues: Math.round(this.tues[pays])
    };
  }
  vider() {
    const a = this.alertes;
    this.alertes = [];
    return a;
  }
  systemes() {
    return [
      {
        nom: "nucl\xE9aire",
        periode: HEURE,
        executer: (m) => this.tour(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (const v of this.vols) s += v.n * 7 + v.arrivee;
    for (const i of this.impacts) s += i.n * 3 + i.tues * 1e-3;
    h = melanger(h, this.vols.length);
    h = melanger(h, this.armements.length);
    return melanger(h, Math.round(s) | 0);
  }
  /** Bombes en vol (ligne droite du silo à la cible) et cercles des impacts récents (rayon : cercle endommagé). */
  rendu(c) {
    const camp = (p) => this.grp.camp(p);
    for (const v of this.vols) {
      const f = Math.min(1, (this.heure - v.depart) / Math.max(1, v.arrivee - v.depart));
      c.tour(4e6 + v.n, v.x0 + (v.x - v.x0) * f, v.y0 + (v.y - v.y0) * f, 0, TOUR_BOMBE, camp(v.tireur), PARAMS10.kt[v.bombe]);
    }
    for (const i of this.impacts) {
      if (this.heure - i.heure <= PARAMS10.heuresAffichage) c.tour(5e6 + i.n, i.x, i.y, i.rayons[2], TOUR_IMPACT, camp(i.cible >= 0 ? i.cible : i.tireur), i.kt);
    }
  }
};

// web/src/sim/diplomatie.ts
var PARAMS11 = {
  joursFige: 30,
  /** une proposition faite au joueur reste ouverte ce nombre de jours */
  joursProposition: 7,
  /** l'IA propose le cessez-le-feu quand l'autre lui a pris ce nombre de villes de plus qu'elle… */
  ecartCessez: 5,
  /** … et qu'elle a perdu cette part de sa population d'origine */
  partCessez: 0.2,
  victoireCarte: 0.95
};
var ALLIE = 0;
var NEUTRE = 1;
var ENNEMI = 2;
var cle4 = (a, b) => a < b ? a * 256 + b : b * 256 + a;
var Diplomatie = class {
  joueur;
  victoire;
  guerres;
  /** cessez-le-feu en cours : clé → heure du début */
  cessez;
  /** propositions faites au joueur */
  propositions;
  alertes;
  fin;
  progres;
  continent;
  heure;
  // ---- bilans
  declarees;
  defenses;
  paix;
  cessezLeFeu;
  refusees;
  constructor(res, grp, terr, joueur, victoire) {
    this.joueur = joueur;
    this.victoire = victoire;
    this.guerres = /* @__PURE__ */ new Map();
    this.cessez = /* @__PURE__ */ new Map();
    this.propositions = [];
    this.alertes = [];
    this.fin = null;
    this.progres = 0;
    this.continent = "";
    this.heure = 0;
    this.declarees = 0;
    this.defenses = 0;
    this.paix = 0;
    this.cessezLeFeu = 0;
    this.refusees = 0;
    Object.defineProperty(this, "res", {
      value: res,
      enumerable: false
    });
    Object.defineProperty(this, "grp", {
      value: grp,
      enumerable: false
    });
    Object.defineProperty(this, "terr", {
      value: terr,
      enumerable: false
    });
    grp.guerreAuto = (a, b) => this.declarer(a, b, -1);
  }
  // ------------------------------------------------------------------ états
  vivant(p) {
    return this.res.populationDepart[p] > 0 && !this.terr.tombes.includes(p);
  }
  etat(a, b) {
    if (this.grp.enGuerre(a, b) || this.cessez.has(cle4(a, b))) return ENNEMI;
    return this.grp.ami(a, b) ? ALLIE : NEUTRE;
  }
  guerre(a, b) {
    return this.guerres.get(cle4(a, b));
  }
  /** Villes prises dans cette guerre : [par a, par b]. */
  prisesDe(a, b) {
    const g = this.guerre(a, b);
    if (!g) return [
      0,
      0
    ];
    return g.a === a ? [
      g.prises[0],
      g.prises[1]
    ] : [
      g.prises[1],
      g.prises[0]
    ];
  }
  joursFiges(a, b) {
    const k = cle4(a, b), g = this.guerres.get(k), c = this.cessez.get(k);
    return g ? (this.heure - g.derniere) / JOUR : c !== void 0 ? (this.heure - c) / JOUR : 0;
  }
  alerter(texte, ...pays) {
    if (pays.includes(this.joueur) && this.alertes.length < 20) this.alertes.push(texte);
  }
  // ------------------------------------------------------------------ décrets
  /** Décret de `pays` envers `cible` : le même pour le joueur (message `decret`) et pour l'IA. */
  decret(pays, cible, d) {
    const g = this.grp, nom = g.nomPays(cible);
    if (pays === cible || !this.vivant(cible)) return {
      ok: false,
      texte: "Pays invalide."
    };
    if (!this.vivant(pays)) return {
      ok: false,
      texte: "Ton pays est tomb\xE9."
    };
    const k = cle4(pays, cible), enGuerre = g.enGuerre(pays, cible), cessez = this.cessez.has(k);
    if (d === "refuser") {
      const i2 = this.propositions.findIndex((p) => p.de === cible);
      if (pays !== this.joueur || i2 < 0) return {
        ok: false,
        texte: `${nom} ne t'a rien propos\xE9.`
      };
      this.propositions.splice(i2, 1);
      return {
        ok: true,
        texte: `Proposition de ${nom} refus\xE9e.`
      };
    }
    if (d === "guerre") {
      if (enGuerre) return {
        ok: false,
        texte: `Tu es d\xE9j\xE0 en guerre avec ${nom}.`
      };
      const defenseurs = this.declarer(pays, cible, -1);
      return {
        ok: true,
        texte: `Guerre d\xE9clar\xE9e \xE0 ${nom}.${defenseurs.length ? ` Ses alli\xE9s entrent en guerre contre toi : ${defenseurs.map((p) => g.nomPays(p)).join(", ")}.` : ""}`
      };
    }
    if (d === "cessez-le-feu" && !enGuerre) return {
      ok: false,
      texte: `Tu n'es pas en guerre avec ${nom}.`
    };
    if (d === "paix" && !enGuerre && !cessez) return {
      ok: false,
      texte: `Tu n'es pas en guerre avec ${nom}.`
    };
    const i = pays === this.joueur ? this.propositions.findIndex((p) => p.de === cible && p.decret === d) : -1;
    if (i >= 0) this.propositions.splice(i, 1);
    else if (cible === this.joueur) {
      if (this.propositions.some((p) => p.de === pays)) return {
        ok: false,
        texte: "Proposition d\xE9j\xE0 faite."
      };
      this.propositions.push({
        de: pays,
        decret: d,
        heure: this.heure
      });
      this.alerter(`${g.nomPays(pays)} propose ${d === "paix" ? "la paix" : "un cessez-le-feu"}.`, cible);
      return {
        ok: true,
        texte: "Proposition faite."
      };
    } else if (!this.accepte(cible, pays, d)) {
      this.refusees++;
      return {
        ok: false,
        texte: `${nom} refuse ${d === "paix" ? "la paix" : "le cessez-le-feu"} : ${nom} gagne cette guerre.`
      };
    }
    if (d === "paix") this.faireLaPaix(pays, cible);
    else this.cesser(pays, cible);
    return {
      ok: true,
      texte: d === "paix" ? `Paix avec ${nom}.` : `Cessez-le-feu avec ${nom} : les combats cessent.`
    };
  }
  /** L'IA `juge` accepte-t-elle le décret de `autre` ? Front figé 30 jours, ou elle ne gagne pas cette guerre. */
  accepte(juge, autre, d) {
    if (d === "paix" && this.cessez.has(cle4(juge, autre))) return true;
    if (!this.guerre(juge, autre)) return d === "paix";
    if (this.joursFiges(juge, autre) >= PARAMS11.joursFige) return true;
    const [mien, sien] = this.prisesDe(juge, autre);
    return mien <= sien;
  }
  /** Guerre de `a` à `b` ; si c'est une agression, les alliés de `b` la déclarent à `a`. Rend ces défenseurs. */
  declarer(a, b, cause) {
    const g = this.grp, k = cle4(a, b);
    this.cessez.delete(k);
    this.propositions = this.propositions.filter((p) => p.de !== a && p.de !== b);
    if (!g.enGuerre(a, b)) {
      g.declarerGuerre(a, b, true);
      this.guerres.set(k, {
        a: Math.min(a, b),
        b: Math.max(a, b),
        debut: this.heure,
        derniere: this.heure,
        cause,
        prises: [
          0,
          0
        ]
      });
    }
    if (cause < 0) this.declarees++;
    else this.defenses++;
    if (b === this.joueur) this.alerter(`${g.nomPays(a)} te d\xE9clare la guerre${cause >= 0 ? " pour d\xE9fendre son alli\xE9" : ""}.`, b);
    else if (a === this.joueur && cause >= 0) this.alerter(`Ton alli\xE9 est attaqu\xE9 : tu entres en guerre contre ${g.nomPays(b)}.`, a);
    if (cause >= 0) return [];
    const defenseurs = [];
    for (let c = 0; c < 256; c++) {
      if (c === a || c === b || !this.vivant(c) || !g.ami(c, b) || g.enGuerre(c, a)) continue;
      this.declarer(c, a, k);
      defenseurs.push(c);
    }
    if (defenseurs.length && g.ami(this.joueur, b) && b !== this.joueur && a !== this.joueur) {
      this.alerter(`${g.nomPays(a)} attaque ${g.nomPays(b)}, ton alli\xE9.`, this.joueur);
    }
    return defenseurs;
  }
  /** Cessez-le-feu : plus de combat, on reste ennemis ; les villes restent à qui les tient. */
  cesser(a, b) {
    const k = cle4(a, b);
    this.grp.declarerGuerre(a, b, false);
    this.guerres.delete(k);
    this.cessez.set(k, this.heure);
    for (const [p, q] of [
      [
        a,
        b
      ],
      [
        b,
        a
      ]
    ]) if (p === this.joueur) this.res.camp[q] = CAMP_ENNEMI;
    this.propositions = this.propositions.filter((p) => !((p.de === a || p.de === b) && p.decret === "cessez-le-feu"));
    this.cessezLeFeu++;
  }
  /** Paix : neutres (ou alliés) ; les guerres de défense qu'elle avait appelées finissent avec elle. */
  faireLaPaix(a, b) {
    const k = cle4(a, b);
    this.grp.declarerGuerre(a, b, false);
    this.guerres.delete(k);
    this.cessez.delete(k);
    this.propositions = this.propositions.filter((p) => p.de !== a && p.de !== b);
    this.paix++;
    if (a === this.joueur || b === this.joueur) this.alerter(`Paix avec ${this.grp.nomPays(a === this.joueur ? b : a)}.`, this.joueur);
    for (const [kk, g] of [
      ...this.guerres
    ]) if (g.cause === k && this.guerres.has(kk)) this.faireLaPaix(g.a, g.b);
  }
  // ------------------------------------------------------------------ chaque heure, chaque jour
  chaqueHeure(m) {
    this.heure = m.heure;
    const pr = this.terr.prises;
    for (let i = pr.length - 1; i >= 0 && pr[i].heure === m.heure; i--) {
      const g = this.guerre(pr[i].de, pr[i].a);
      if (!g) continue;
      g.derniere = m.heure;
      g.prises[pr[i].a === g.a ? 0 : 1]++;
    }
    if (m.heure % JOUR === 0) this.chaqueJour();
  }
  chaqueJour() {
    const g = this.grp, h = this.heure, J = this.joueur;
    this.propositions = this.propositions.filter((p) => h - p.heure < PARAMS11.joursProposition * JOUR && this.etat(p.de, J) === ENNEMI);
    for (const [k, x] of [
      ...this.guerres
    ]) {
      if (!this.guerres.has(k)) continue;
      if (!g.enGuerre(x.a, x.b)) {
        this.guerres.delete(k);
        continue;
      }
      const fige = (h - x.derniere) / JOUR >= PARAMS11.joursFige;
      if (x.a !== J && x.b !== J) {
        if (fige) this.faireLaPaix(x.a, x.b);
        continue;
      }
      const ia = x.a === J ? x.b : x.a, [mien, sien] = this.prisesDe(ia, J);
      if (fige) this.decret(ia, J, "paix");
      else if (sien - mien >= PARAMS11.ecartCessez && this.terr.partConquise(ia) >= PARAMS11.partCessez) this.decret(ia, J, "cessez-le-feu");
    }
    for (const [k, debut] of this.cessez) {
      const ia = k >> 8 === J ? k & 255 : k >> 8;
      if ((h - debut) / JOUR >= PARAMS11.joursFige) this.decret(ia, J, "paix");
    }
    this.verifierFin();
  }
  /** Victoire (95 % des villes, ou un continent entier) et défaite (pays tombé). */
  verifierFin() {
    if (this.fin) return;
    const r = this.res, J = this.joueur, V = r.d.villes, C2 = r.d.reseau.continents;
    if (this.terr.tombes.includes(J)) {
      this.fin = {
        issue: "defaite",
        texte: "D\xE9faite : toutes les villes de ton pays sont prises.",
        heure: this.heure
      };
      this.alertes.push(this.fin.texte);
      return;
    }
    if (this.victoire === "bac-a-sable") return;
    if (this.victoire === "carte") {
      this.progres = this.terr.tenues[J] / V.n;
      if (this.progres >= PARAMS11.victoireCarte) this.fin = {
        issue: "victoire",
        texte: `Victoire : tu tiens ${Math.round(100 * this.progres)} % des villes du monde.`,
        heure: this.heure
      };
    } else {
      const tot = new Float64Array(C2.noms.length), tenu = new Float64Array(C2.noms.length);
      for (let i = 0; i < V.n; i++) {
        const c = C2.dePays[V.pays[i]];
        if (c < 0) continue;
        tot[c]++;
        if (r.proprietaire[i] === J) tenu[c]++;
      }
      let best = 0;
      for (let c = 1; c < tot.length; c++) if (tot[c] && tenu[c] / tot[c] > tenu[best] / (tot[best] || 1)) best = c;
      this.progres = tot[best] ? tenu[best] / tot[best] : 0, this.continent = C2.noms[best];
      if (this.progres >= 1) this.fin = {
        issue: "victoire",
        texte: `Victoire : tu tiens tout le continent (${this.continent}).`,
        heure: this.heure
      };
    }
    if (this.fin) this.alertes.push(this.fin.texte);
  }
  // ------------------------------------------------------------------ pour l'interface
  fiche() {
    const J = this.joueur, g = this.grp, monde2 = [], guerres = [];
    for (const x of this.guerres.values()) {
      if (monde2.length < 60) monde2.push([
        x.a,
        x.b
      ]);
      if (x.a !== J && x.b !== J) continue;
      const o = x.a === J ? x.b : x.a, defense = x.cause >= 0;
      guerres.push({
        pays: o,
        debut: x.debut,
        figeJours: Math.floor(this.joursFiges(J, o)),
        prises: this.prisesDe(J, o),
        defense
      });
    }
    const cessez = [];
    for (const [k, debut] of this.cessez) if (k >> 8 === J || (k & 255) === J) cessez.push({
      pays: k >> 8 === J ? k & 255 : k >> 8,
      debut
    });
    const allies = [];
    for (let p = 0; p < 256; p++) if (p !== J && this.res.populationDepart[p] > 0 && g.ami(J, p)) allies.push(p);
    return {
      guerres,
      cessez,
      propositions: this.propositions.map((p) => ({
        pays: p.de,
        decret: p.decret,
        heure: p.heure
      })),
      allies,
      monde: monde2,
      nGuerres: this.guerres.size,
      victoire: this.victoire,
      progres: this.progres,
      continent: this.continent,
      fin: this.fin
    };
  }
  vider() {
    const a = this.alertes;
    this.alertes = [];
    return a;
  }
  systemes() {
    return [
      {
        nom: "diplomatie",
        periode: HEURE,
        executer: (m) => this.chaqueHeure(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    let s = 0;
    for (const [k, g] of this.guerres) s += k + g.prises[0] * 3 + g.prises[1] * 7 + g.derniere;
    h = melanger(h, this.guerres.size * 1e3 + this.cessez.size * 10 + this.propositions.length);
    return melanger(h, s);
  }
};

// web/src/sim/ia.ts
var PARAMS12 = {
  domination: 1.5,
  /** chance par jour qu'un pays qui domine un voisin l'attaque */
  agressionJour: 1 / 365,
  /** jours pendant lesquels aucune IA n'attaque le joueur */
  graceJoueurJours: 30,
  /** jours de recettes jamais dépensés en bâtiments ; prix × marge pour lancer un chantier */
  joursReserve: 3,
  margeConstruction: 1.2,
  /** part du trésor (moins la réserve) mise en production chaque jour à menace 1 (à la guerre, au plus 1) ; en paix menacée */
  partBudget: 0.2,
  menacePaix: 0.1,
  /** part du budget par type : soldats, chars, canons, avions */
  parts: [
    0.25,
    0.45,
    0.2,
    0.1
  ],
  /** groupes : au plus, part du parc d'un dépôt prise, taille minimale (équivalents soldats), avions en couverture */
  maxGroupes: 6,
  partDepot: 0.6,
  minGroupe: 2e3,
  avionsCouverture: 0.3,
  kmDefense: 50,
  heuresDefense: 6,
  /** un groupe à sec plus loin que ça d'un dépôt : l'IA en pose un près de lui */
  kmDepotGroupe: 200,
  kmCible: 1500,
  essaisCible: 3,
  joursSansCible: 5,
  /** achat quand le stock des dépôts tombe sous cette part de leur capacité */
  partStockAchat: 0.2,
  tonnesAchat: 5e3,
  naviresFlotte: 3,
  kmFlotte: 3e3,
  joursFlotte: 10,
  /** bombe : part de la population perdue, jours entre deux tirs */
  partNucleaire: 0.5,
  joursNucleaire: 10,
  kmVoisin: 100
};
var FACTEURS = {
  facile: 0.7,
  normal: 1,
  difficile: 1.3
};
var POIDS = [
  1,
  10,
  5,
  20,
  50
];
var tous = (n) => Array.from({
  length: n
}, () => []);
function tirage(a, b, c) {
  let h = Math.imul(a ^ 2654435769, 2246822507) ^ Math.imul(b + 2135587861, 3266489909) ^ Math.imul(c + 374761393, 668265263);
  h ^= h >>> 16, h = Math.imul(h, 2246822507), h ^= h >>> 13, h = Math.imul(h, 3266489909), h ^= h >>> 16;
  return (h >>> 0) / 2 ** 32;
}
var IA = class {
  joueur;
  facteur;
  nucleaire;
  graine;
  heure;
  /** heure du dernier tir et de la dernière flotte, par pays */
  dernierTir;
  derniereFlotte;
  derniereDefense;
  /** groupe sans cible atteignable → heure du prochain essai */
  sansCible;
  /** force estimée de chaque pays (équivalents soldats), refaite le premier pas de chaque jour */
  force;
  jourForce;
  // ---- bilans
  constructions;
  commandes;
  groupes;
  envois;
  defenses;
  retraits;
  achats;
  flottes;
  tirs;
  guerres;
  constructor(m, joueur, facteur, nucleaire, graine) {
    this.joueur = joueur;
    this.facteur = facteur;
    this.nucleaire = nucleaire;
    this.graine = graine;
    this.heure = 0;
    this.dernierTir = new Int32Array(256).fill(-1e6);
    this.derniereFlotte = new Int32Array(256).fill(-1e6);
    this.derniereDefense = new Int32Array(256).fill(-1e6);
    this.sansCible = /* @__PURE__ */ new Map();
    this.force = new Float64Array(256);
    this.jourForce = -1;
    this.constructions = 0;
    this.commandes = 0;
    this.groupes = 0;
    this.envois = 0;
    this.defenses = 0;
    this.retraits = 0;
    this.achats = 0;
    this.flottes = 0;
    this.tirs = 0;
    this.guerres = 0;
    for (const [k, v] of Object.entries(m)) Object.defineProperty(this, k, {
      value: v,
      enumerable: false
    });
    Object.defineProperty(this, "j", {
      value: {
        jour: -1
      },
      enumerable: true,
      writable: true
    });
    const prix = [];
    for (const c of m.bat.catalogue()) prix[c.genre] = c.argent;
    Object.defineProperty(this, "prix", {
      value: prix,
      enumerable: false
    });
    const ch = m.res.d.petrole.champs, xy = new Float32Array(2 * ch.length);
    ch.forEach((c, k) => [xy[2 * k], xy[2 * k + 1]] = projeter(c.lon, c.lat));
    Object.defineProperty(this, "champsXY", {
      value: xy,
      enumerable: false
    });
    for (let p = 0; p < 256; p++) if (p !== joueur) m.unites.facteur[p] = facteur;
  }
  // ------------------------------------------------------------------ ce que l'IA sait du jour
  connaitre(jour) {
    if (this.jourForce !== jour) {
      const r = this.res, u = this.unites, force = this.force.fill(0);
      for (let s = 0; s < r.n; s++) {
        if (!r.actif[s]) continue;
        for (let t = 0; t < 4; t++) force[r.pays[s]] += u.parc[5 * s + t] * POIDS[t];
      }
      for (let i = 0; i < u.naviresPort.length; i++) force[u.paysPort[i]] += u.naviresPort[i] * POIDS[NAVIRES];
      for (const g of this.grp.groupes) if (!g.fini) force[g.pays] += g.n[0] + g.n[1] * POIDS[1] + g.n[2] * POIDS[2] + g.avions * POIDS[3];
      this.jourForce = jour;
      for (const id of [
        ...this.sansCible.keys()
      ]) if (!this.grp.trouver(id)) this.sansCible.delete(id);
    }
    const j = this.j.jour >= 0 && this.j.vu === this.res.villesChangees ? this.j : this.territoire();
    this.j = {
      ...j,
      jour,
      force: this.force
    };
  }
  territoire() {
    const r = this.res, V = r.d.villes, pr = r.proprietaire, C2 = PARAMS12.kmVoisin;
    const villes = tous(256), centre = new Int32Array(256).fill(-1), cases = /* @__PURE__ */ new Map();
    for (let i = 0; i < V.n; i++) {
      const p = pr[i];
      villes[p].push(i);
      if (centre[p] < 0 || V.pop[i] > V.pop[centre[p]]) centre[p] = i;
      const k = (Math.floor(V.x[i] / C2) + 2e3) * 4e3 + Math.floor(V.y[i] / C2) + 2e3, l = cases.get(k);
      if (!l) cases.set(k, [
        p
      ]);
      else if (!l.includes(p)) l.push(p);
    }
    const voisins = new Uint8Array(65536);
    for (const [k, l] of cases) {
      for (const d of [
        0,
        1,
        4e3,
        3999,
        4001
      ]) {
        const m = d ? cases.get(k + d) : l;
        if (m) {
          for (const a of l) for (const b of m) if (a !== b) voisins[a * 256 + b] = voisins[b * 256 + a] = 1;
        }
      }
    }
    const champs = tous(256), xy = this.champsXY;
    for (let k = 0; k < xy.length / 2; k++) {
      const p = this.bat.proprietaire(xy[2 * k], xy[2 * k + 1]);
      if (p >= 0) champs[p].push(k);
    }
    return {
      jour: -1,
      vu: r.villesChangees,
      force: new Float64Array(256),
      villes,
      centre,
      voisins,
      champs
    };
  }
  // ------------------------------------------------------------------ chaque heure
  chaqueHeure(m) {
    this.heure = m.heure;
    const jour = Math.floor(m.heure / JOUR);
    if (this.j.jour !== jour) this.connaitre(jour);
    for (let p = m.heure % JOUR; p < 256; p += JOUR) this.decider(p);
    this.intercepter();
  }
  /** Les décisions d'un pays pour la journée. */
  decider(p) {
    if (p === this.joueur || !this.dip.vivant(p) || !this.j.villes[p].length) return;
    const ennemis = [];
    for (let q = 0; q < 256; q++) if (this.grp.enGuerre(p, q)) ennemis.push(q);
    this.construire(p, ennemis);
    this.produire(p, ennemis);
    if (!ennemis.length) {
      this.rentrer(p);
      this.agresser(p);
      return;
    }
    this.acheter(p);
    this.attaquer(p, ennemis);
    this.aviation(p, ennemis);
    this.flotte(p, ennemis);
    this.bombe(p);
  }
  // ------------------------------------------------------------------ outils
  plusProche(liste, x, y) {
    const V = this.res.d.villes;
    let best = -1, bd = Infinity;
    for (const i of liste) {
      const d = Math.hypot(V.x[i] - x, V.y[i] - y);
      if (d < bd) bd = d, best = i;
    }
    return best;
  }
  /** Villes ennemies les plus proches de (x, y), à moins de kmCible, de la plus proche à la plus lointaine (au plus n). */
  cibles(ennemis, x, y, n = 1) {
    const V = this.res.d.villes, l = [];
    for (const q of ennemis) {
      for (const i of this.j.villes[q]) {
        const d = Math.hypot(V.x[i] - x, V.y[i] - y);
        if (d > PARAMS12.kmCible || l.length >= n && d >= l[n - 1][0]) continue;
        l.push([
          d,
          i
        ]), l.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        if (l.length > n) l.pop();
      }
    }
    return l.map((e) => e[1]);
  }
  /** Ville du pays la plus proche du principal ennemi (sa plus grande ville). */
  front(p, ennemis) {
    const V = this.res.d.villes;
    let q = ennemis[0];
    for (const e of ennemis) if (this.j.force[e] > this.j.force[q]) q = e;
    const c = this.j.centre[q];
    return c < 0 ? -1 : this.plusProche(this.j.villes[p], V.x[c], V.y[c]);
  }
  actifs(genre, p) {
    return this.res.sites(genre, p).filter((s) => this.res.actif[s]);
  }
  pres(genre, p, x, y, km) {
    return this.actifs(genre, p).some((s) => Math.hypot(this.res.x[s] - x, this.res.y[s] - y) <= km) || this.bat.chantiersDe(p).some((c) => c.genre === genre && Math.hypot(c.x - x, c.y - y) <= km);
  }
  /** Table de mixage au dépôt le mieux garni (ou le plus proche de (x, y)), envoyé à (x, y). */
  composer(p, x, y, nom, prochain) {
    const r = this.res, u = this.unites, P = PARAMS12;
    let depot2 = -1, score = -Infinity;
    for (const s of this.actifs(DEPOT, p)) {
      const eq = u.parc[5 * s] + u.parc[5 * s + 1] * POIDS[1] + u.parc[5 * s + 2] * POIDS[2];
      if (eq * P.partDepot < P.minGroupe) continue;
      const sc = prochain ? -Math.hypot(r.x[s] - x, r.y[s] - y) : eq;
      if (sc > score) score = sc, depot2 = s;
    }
    if (depot2 < 0) return false;
    const n = [
      0,
      1,
      2
    ].map((t) => Math.floor(u.parc[5 * depot2 + t] * P.partDepot));
    if (r.stock[4 * depot2 + CARBURANT] < n[1] * PARAMS5.carburantMarche[1] * PARAMS8.reserveHeures) n[1] = 0;
    if (n[0] + n[1] * POIDS[1] + n[2] * POIDS[2] < P.minGroupe) return false;
    let avions = 0;
    for (const s of this.actifs(AEROPORT, p)) {
      if (distanceSol(r.x[s], r.y[s], r.x[depot2], r.y[depot2]) <= 800) avions = Math.max(avions, Math.floor(u.parc[5 * s + AVIONS] * P.avionsCouverture));
    }
    if (prochain === false) {
      const [c] = this.cibles(this.ennemisDe(p), r.x[depot2], r.y[depot2]);
      if (c === void 0) return false;
      x = r.d.villes.x[c], y = r.d.villes.y[c];
    }
    let a = this.grp.composer(p, depot2, n, avions, `${nom} ${this.groupes + 1}`, x, y);
    if (!a.ok && avions) a = this.grp.composer(p, depot2, n, 0, `${nom} ${this.groupes + 1}`, x, y);
    if (a.ok) this.groupes++;
    return a.ok;
  }
  ennemisDe(p) {
    const l = [];
    for (let q = 0; q < 256; q++) if (this.grp.enGuerre(p, q)) l.push(q);
    return l;
  }
  // ------------------------------------------------------------------ décisions
  construire(p, ennemis) {
    if (this.bat.chantiersDe(p).length) return;
    const r = this.res, V = r.d.villes, dispo = r.tresor[p] - r.recettes[p] * JOUR * PARAMS12.joursReserve;
    const essayer = (genre, x, y) => {
      if (dispo < this.prix[genre] * PARAMS12.margeConstruction || !this.bat.verifier(p, genre, x, y).ok) return false;
      const o = this.bat.poser(p, genre, x, y);
      if (o.ok) this.constructions++;
      return o.ok;
    };
    if (ennemis.length) {
      for (const x of this.grp.groupesDe(p)) {
        if (x.aSec & SEC_CARBURANT && !this.pres(DEPOT, p, x.x, x.y, PARAMS12.kmDepotGroupe) && essayer(DEPOT, x.x, x.y)) return;
      }
      const f = this.front(p, ennemis);
      if (f >= 0 && !this.pres(DCA, p, V.x[f], V.y[f], 60) && essayer(DCA, V.x[f], V.y[f])) return;
      if (f >= 0 && !this.pres(DEPOT, p, V.x[f], V.y[f], 100) && essayer(DEPOT, V.x[f], V.y[f])) return;
    }
    const xy = this.champsXY;
    for (const k of this.j.champs[p]) if (!this.pres(PUITS, p, xy[2 * k], xy[2 * k + 1], 3) && essayer(PUITS, xy[2 * k], xy[2 * k + 1])) return;
    const c = this.j.centre[p], cx = V.x[c], cy = V.y[c];
    if (this.actifs(PUITS, p).length && !this.actifs(RAFFINERIE, p).length && essayer(RAFFINERIE, cx, cy)) return;
    for (const g of [
      USINE_MUNITIONS,
      CASERNE,
      USINE_CHARS,
      USINE_ARTILLERIE
    ]) if (!this.actifs(g, p).length && essayer(g, cx, cy)) return;
  }
  produire(p, ennemis) {
    const r = this.res, u = this.unites, j = this.j, P = PARAMS12;
    let menace = 0;
    if (ennemis.length) {
      let fe = 0;
      for (const q of ennemis) fe += j.force[q];
      menace = Math.min(2, Math.max(0.25, fe / Math.max(1, j.force[p])));
    } else {
      for (let q = 0; q < 256 && !menace; q++) {
        if (j.voisins[p * 256 + q] && !this.grp.ami(p, q) && j.force[q] > P.domination * j.force[p]) menace = P.menacePaix;
      }
    }
    if (!menace) return;
    const libre = r.tresor[p] - r.recettes[p] * JOUR * P.joursReserve;
    const budget = Math.max(0, libre) * Math.min(1, P.partBudget * menace * this.facteur), enCours = [
      0,
      0,
      0,
      0
    ];
    for (let s = 0; s < r.n; s++) {
      if (r.pays[s] !== p || !(u.commande[s] > 0)) continue;
      const t = u.typeUsine(s);
      if (t >= 0 && t < 4) enCours[t] += u.commande[s];
    }
    for (let t = 0; t < 4; t++) {
      if (enCours[t] > 0 || t === AVIONS && !ennemis.length) continue;
      const prix = u.prix(t).prix;
      let n = Math.floor(budget * P.parts[t] / prix);
      if (n < 1 && ennemis.length && libre >= 2 * prix) n = 1;
      if (n >= 1 && u.produireType(p, t, n).ok) this.commandes++;
    }
  }
  acheter(p) {
    const r = this.res;
    for (const prod of [
      CARBURANT,
      MUNITIONS
    ]) {
      let stock = 0, cap = 0;
      for (const s of this.actifs(DEPOT, p)) stock += r.stock[4 * s + prod], cap += r.capacite[4 * s + prod];
      if (cap > 0 && stock < PARAMS12.partStockAchat * cap && this.marche.acheter(p, prod, PARAMS12.tonnesAchat).ok) this.achats++;
    }
  }
  /**
   * Chaque heure, pour tous les pays de l'IA : un groupe ennemi sur leur territoire reçoit un groupe « Défense » envoyé à sa
   * position, depuis le dépôt garni le plus proche (une fois toutes les 6 h par pays, s'il n'a pas déjà un groupe tout près).
   */
  intercepter() {
    const g = this.grp, h = this.heure;
    for (const e of g.groupes) {
      if (e.fini || e.ordre === LIVRER) continue;
      const q = this.terr.controleur(e.x, e.y);
      if (q < 0 || q === e.pays || q === this.joueur || h - this.derniereDefense[q] < PARAMS12.heuresDefense || !g.enGuerre(q, e.pays)) continue;
      if (g.groupes.some((x) => !x.fini && x.pays === q && Math.hypot(x.x - e.x, x.y - e.y) < PARAMS12.kmDefense)) continue;
      if (g.groupesDe(q).filter((x) => x.nom.startsWith("D\xE9fense")).length >= PARAMS12.maxGroupes) continue;
      this.derniereDefense[q] = h;
      if (this.composer(q, e.x, e.y, "D\xE9fense", true)) this.defenses++;
    }
  }
  /** Groupes au repos renvoyés vers la ville ennemie la plus proche ; un groupe de plus par jour. */
  attaquer(p, ennemis) {
    const g = this.grp, V = this.res.d.villes, mes = g.groupesDe(p).filter((x) => x.ordre !== LIVRER);
    for (const x of mes) {
      if (x.ordre !== ATTENDRE && x.ordre !== ARRETER || x.contact >= 0 || x.aSec || x.nom.startsWith("D\xE9fense")) continue;
      if ((this.sansCible.get(x.id) ?? -1) > this.heure) continue;
      let ok = false;
      for (const c of this.cibles(ennemis, x.x, x.y, PARAMS12.essaisCible)) if (ok = g.envoyer(p, x.id, V.x[c], V.y[c]).ok) break;
      if (ok) this.envois++, this.sansCible.delete(x.id);
      else this.sansCible.set(x.id, this.heure + PARAMS12.joursSansCible * JOUR);
    }
    if (mes.length < PARAMS12.maxGroupes) this.composer(p, 0, 0, "Groupe", false);
  }
  /** Patrouille pour les aéroports à portée d'un dépôt ou de la plus grande ville ennemie, repos pour les autres. */
  aviation(p, ennemis) {
    const r = this.res, V = r.d.villes, pts = [];
    for (const q of ennemis) {
      const c = this.j.centre[q];
      if (c >= 0) pts.push(V.x[c], V.y[c]);
      for (const s of this.actifs(DEPOT, q)) pts.push(r.x[s], r.y[s]);
    }
    for (const s of this.actifs(AEROPORT, p)) {
      let pres2 = false;
      for (let k = 0; k < pts.length && !pres2; k += 2) pres2 = distanceSol(r.x[s], r.y[s], pts[k], pts[k + 1]) <= 800;
      if ((this.air.repos[s] ?? 0) === (pres2 ? 1 : 0)) this.air.aviation(p, s, pres2);
    }
  }
  /** Une flotte devant le port ennemi le plus proche (une tous les dix jours, une seule en mer). */
  flotte(p, ennemis) {
    if (this.heure - this.derniereFlotte[p] < PARAMS12.joursFlotte * JOUR || this.air.flottes.some((f) => f.pays === p)) return;
    const u = this.unites, Pt = this.res.d.reseau.ports;
    let port = -1;
    for (let i = 0; i < Pt.n; i++) {
      if (u.paysPort[i] === p && Pt.mer[i] >= 0 && u.naviresPort[i] >= PARAMS12.naviresFlotte && (port < 0 || u.naviresPort[i] > u.naviresPort[port])) port = i;
    }
    if (port < 0) return;
    let but = -1, bd = PARAMS12.kmFlotte;
    for (let i = 0; i < Pt.n; i++) {
      if (Pt.mer[i] < 0 || !ennemis.includes(this.terr.controleur(Pt.x[i], Pt.y[i]))) continue;
      const d = Math.hypot(Pt.x[i] - Pt.x[port], Pt.y[i] - Pt.y[port]);
      if (d < bd) bd = d, but = i;
    }
    this.derniereFlotte[p] = this.heure;
    if (but >= 0 && this.air.flotte(p, port, Math.floor(u.naviresPort[port] * 0.7), Pt.x[but], Pt.y[but]).ok) this.flottes++;
  }
  /** Avec retenue : seulement quand la moitié du pays est perdue, sur le plus gros groupe ennemi chez lui. */
  bombe(p) {
    if (!this.nucleaire || this.heure - this.dernierTir[p] < PARAMS12.joursNucleaire * JOUR || !this.res.sites(SILO, p).length) return;
    if (!this.nuc.silos(p).length || this.terr.partConquise(p) < PARAMS12.partNucleaire) return;
    let best = null, bn = 0;
    for (const e of this.grp.groupes) {
      const n = e.n[0] + e.n[1] * POIDS[1] + e.n[2] * POIDS[2];
      if (!e.fini && this.grp.enGuerre(p, e.pays) && n > bn && this.terr.controleur(e.x, e.y) === p) bn = n, best = e;
    }
    this.dernierTir[p] = this.heure;
    if (best && this.nuc.tirer(p, best.x, best.y).ok) this.tirs++;
  }
  /** En paix, les groupes au repos rentrent au dépôt (leurs unités reviennent au parc). */
  rentrer(p) {
    for (const x of this.grp.groupesDe(p)) {
      if ((x.ordre === ATTENDRE || x.ordre === ARRETER) && this.grp.retirer(p, x.id).ok) this.retraits++;
    }
  }
  /** Le voisin le plus faible, quand le pays domine sa coalition ; rarement. */
  agresser(p) {
    const j = this.j, g = this.grp, jour = j.jour;
    if (tirage(this.graine, p, jour) >= PARAMS12.agressionJour) return;
    let best = -1, bf = Infinity;
    for (let q = 0; q < 256; q++) {
      if (!j.voisins[p * 256 + q] || g.ami(p, q) || !this.dip.vivant(q) || this.dip.etat(p, q) !== NEUTRE) continue;
      if (q === this.joueur && jour < PARAMS12.graceJoueurJours) continue;
      let coalition = j.force[q];
      for (let c = 0; c < 256; c++) if (c !== q && c !== p && j.force[c] > 0 && g.ami(c, q)) coalition += j.force[c];
      if (j.force[p] >= PARAMS12.domination * coalition && coalition < bf) bf = coalition, best = q;
    }
    if (best >= 0 && this.dip.decret(p, best, "guerre").ok) this.guerres++;
  }
  // ------------------------------------------------------------------
  systemes() {
    return [
      {
        nom: "ia",
        periode: HEURE,
        executer: (m) => this.chaqueHeure(m),
        empreinte: (h) => this.empreinte(h)
      }
    ];
  }
  empreinte(h) {
    h = melanger(h, this.constructions * 7 + this.commandes * 11 + this.groupes * 13 + this.envois);
    return melanger(h, this.achats * 3 + this.flottes * 5 + this.tirs * 17 + this.guerres * 19 + this.defenses + this.retraits);
  }
};

// web/src/sim/registre.ts
function partieDe(o, aujourdhui = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
  return {
    pays: o?.pays ?? 0,
    dateDepart: o?.dateDepart && /^\d{4}-\d{2}-\d{2}$/.test(o.dateDepart) ? o.dateDepart : aujourdhui,
    difficulte: o?.difficulte ?? "normal",
    nucleaire: o?.nucleaire ?? true,
    victoire: o?.victoire ?? "bac-a-sable",
    essai: o?.essai ?? false,
    ia: o?.ia ?? true
  };
}
var donnees = /* @__PURE__ */ new WeakMap();
function donneesRessources(lire2) {
  let d = donnees.get(lire2);
  if (!d) {
    d = (async () => {
      const [reseau, depart, petrole, prix] = await Promise.all([
        chargerReseauMonde(lire2),
        chargerDepart(lire2),
        chargerPetrole(lire2),
        chargerPrix(lire2)
      ]);
      return chargerDonneesRessources(lire2, reseau, depart, petrole, prix);
    })();
    d.catch(() => donnees.delete(lire2));
    donnees.set(lire2, d);
  }
  return d;
}
var MODULES = [
  {
    nom: "rendu",
    creer: () => Promise.resolve({
      etat: new Trajets()
    })
  },
  {
    nom: "essai-rendu",
    besoins: [
      "rendu"
    ],
    creer: async (c) => {
      if (!c.partie.essai) return {
        etat: {}
      };
      const e = await EssaiRendu.creer(c.lire, c.modules.rendu, c.monde.alea);
      return {
        etat: e,
        systemes: e.systemes()
      };
    }
  },
  // V2.C.1 : ressources (argent, recrues, brut, carburant, munitions), flux (billes, dépôts), marché mondial
  {
    nom: "ressources",
    creer: async (c) => {
      const r = new Ressources(await donneesRessources(c.lire), c.partie.pays);
      r.poserSitesDeDepart();
      return {
        etat: r,
        systemes: r.systemes()
      };
    }
  },
  {
    nom: "flux",
    besoins: [
      "ressources",
      "rendu"
    ],
    creer: (c) => {
      const f = new Flux(c.modules.ressources, c.modules.rendu);
      f.poserDepotsDeDepart();
      f.relierNouveaux();
      return Promise.resolve({
        etat: f,
        systemes: f.systemes()
      });
    }
  },
  {
    nom: "marche",
    besoins: [
      "flux"
    ],
    creer: (c) => {
      const r = c.modules.ressources;
      const m = new Marche(r, c.modules.flux, c.modules.rendu);
      return Promise.resolve({
        etat: m,
        systemes: [
          ...m.systemes(),
          r.systemeFinJournee()
        ]
      });
    }
  },
  // V2.C.2 : les treize bâtiments (pose, chantier, effet, doublement) et les aéroports de départ
  {
    nom: "batiments",
    besoins: [
      "ressources",
      "flux"
    ],
    creer: (c) => {
      const b = new Batiments(c.modules.ressources, c.modules.flux, c.partie.pays, c.partie.nucleaire);
      b.poserAeroportsDeDepart();
      c.modules.flux.relierNouveaux();
      return Promise.resolve({
        etat: b,
        systemes: b.systemes()
      });
    }
  },
  // V2.C.3 : unités (parcs, production en usine, armées de départ) et groupes de troupes (table de mixage, trois ordres,
  // marche de ville en ville, réserve et ravitaillement, accroche)
  {
    nom: "unites",
    besoins: [
      "batiments"
    ],
    creer: (c) => {
      const u = new Unites(c.modules.ressources, c.modules.batiments);
      u.poserArmeesDeDepart();
      return Promise.resolve({
        etat: u,
        systemes: u.systemes()
      });
    }
  },
  {
    nom: "groupes",
    besoins: [
      "unites",
      "flux",
      "rendu"
    ],
    creer: (c) => {
      const g = new Groupes(c.modules.ressources, c.modules.flux, c.modules.unites, c.modules.rendu, c.partie.pays);
      return Promise.resolve({
        etat: g,
        systemes: g.systemes()
      });
    }
  },
  // V2.C.4 : combat automatique au contact (type contre type, terrain, retranchement, réserve, artillerie, ponts) et
  // contrôle du territoire (villes prises, bâtiments perdus, pays tombé)
  {
    nom: "combat",
    besoins: [
      "groupes",
      "batiments"
    ],
    creer: async (c) => {
      const r = c.modules.ressources;
      const d = await chargerDonneesCombat(c.lire, r.d.reseau.axes.nAretes);
      const cb = new Combat(r, c.modules.flux, c.modules.groupes, c.modules.batiments, d, c.partie.pays);
      return {
        etat: cb,
        systemes: cb.systemes()
      };
    }
  },
  {
    nom: "territoire",
    besoins: [
      "combat"
    ],
    creer: (c) => {
      const t = new Territoire(c.modules.ressources, c.modules.groupes, c.modules.unites, c.partie.pays);
      return Promise.resolve({
        etat: t,
        systemes: t.systemes()
      });
    }
  },
  // V2.C.5 : avions et navires en tours à rayon (patrouilles, DCA, flottes, blocus, débarquement), puis nucléaire (cinq
  // bombes au Silo, cercles, riposte)
  {
    nom: "air-mer",
    besoins: [
      "combat"
    ],
    creer: (c) => {
      const a = new AirMer(c.modules.ressources, c.modules.flux, c.modules.unites, c.modules.groupes, c.modules.combat, c.modules.rendu, c.partie.pays);
      return Promise.resolve({
        etat: a,
        systemes: a.systemes()
      });
    }
  },
  {
    nom: "nucleaire",
    besoins: [
      "air-mer",
      "territoire"
    ],
    creer: (c) => {
      const n = new Nucleaire(c.modules.ressources, c.modules.flux, c.modules.batiments, c.modules.unites, c.modules.groupes, c.modules.combat, c.modules.territoire, c.modules["air-mer"], c.partie.pays);
      return Promise.resolve({
        etat: n,
        systemes: n.systemes()
      });
    }
  },
  // V2.D.1 : diplomatie (trois états, allié défendu, trois décrets, paix après 30 jours de front figé, victoire), puis
  // l'IA des autres pays (mêmes ordres que le joueur ; absente avec l'option `ia: false`)
  {
    nom: "diplomatie",
    besoins: [
      "territoire"
    ],
    creer: (c) => {
      const d = new Diplomatie(c.modules.ressources, c.modules.groupes, c.modules.territoire, c.partie.pays, c.partie.victoire);
      return Promise.resolve({
        etat: d,
        systemes: d.systemes()
      });
    }
  },
  {
    nom: "ia",
    besoins: [
      "diplomatie",
      "nucleaire",
      "marche"
    ],
    creer: (c) => {
      if (!c.partie.ia) return Promise.resolve({
        etat: {}
      });
      const m = c.modules, ia = new IA({
        res: m.ressources,
        marche: m.marche,
        bat: m.batiments,
        unites: m.unites,
        grp: m.groupes,
        terr: m.territoire,
        air: m["air-mer"],
        nuc: m.nucleaire,
        dip: m.diplomatie
      }, c.partie.pays, FACTEURS[c.partie.difficulte], c.partie.nucleaire, c.monde.graine);
      return Promise.resolve({
        etat: ia,
        systemes: ia.systemes()
      });
    }
  }
];
async function monterPartie(graine, partie2, lire2, modules = MODULES) {
  const monde2 = new Monde(graine);
  const etats = {};
  for (const m of modules) {
    for (const b of m.besoins ?? []) if (!(b in etats)) throw new Error(`module \xAB ${m.nom} \xBB : \xAB ${b} \xBB doit \xEAtre cr\xE9\xE9 avant`);
    if (m.nom in etats || m.nom === "monde" || m.nom === "partie") throw new Error(`module \xAB ${m.nom} \xBB : nom d\xE9j\xE0 pris`);
    const { etat, systemes = [] } = await m.creer({
      monde: monde2,
      lire: lire2,
      partie: partie2,
      modules: etats
    });
    etats[m.nom] = etat;
    for (const s of systemes) monde2.ajouter(s);
  }
  return {
    monde: monde2,
    partie: partie2,
    ...etats
  };
}

// web/src/sim/sauvegarde.ts
var VERSION = 1;
var MAGIE = 843993427;
var references = /* @__PURE__ */ new WeakMap();
var empreintesDepart = /* @__PURE__ */ new WeakMap();
function reperer(racines2) {
  if (racines2.monde.heure !== 0) throw new Error("reperer : la partie a d\xE9j\xE0 avanc\xE9 (\xE0 appeler avant le premier pas)");
  empreintesDepart.set(racines2.monde, empreinteDepart(racines2, true));
}
function empreinteDepart(racines2, noter) {
  const hs = [];
  parcourirTypes(racines2, (t) => {
    const h2 = empreinteOctets(t);
    if (noter) references.set(t, h2);
    hs.push(h2);
  });
  hs.sort((a, b) => a - b);
  let h = 2166136261;
  for (const x of hs) h = Math.imul(h ^ x, 16777619) >>> 0;
  return Math.imul(h ^ hs.length, 16777619) >>> 0;
}
function parcourirTypes(racine, f) {
  const vus = /* @__PURE__ */ new Set();
  const pile = [
    racine
  ];
  while (pile.length) {
    const v = pile.pop();
    if (v === null || typeof v !== "object" || vus.has(v)) continue;
    vus.add(v);
    if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer) {
      f(v);
      continue;
    }
    if (garder(v)) continue;
    if (Array.isArray(v)) for (const x of v) pile.push(x);
    else if (v instanceof Map) for (const [k, x] of v) pile.push(k, x);
    else if (v instanceof Set) for (const x of v) pile.push(x);
    else for (const k of Object.keys(v)) pile.push(v[k]);
  }
}
function garder(v) {
  if (Array.isArray(v) || v instanceof Map || v instanceof Set || v instanceof Date) return false;
  return Object.prototype.toString.call(v) !== "[object Object]";
}
function octetsDe(t) {
  return t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
function empreinteOctets(t) {
  const o = octetsDe(t);
  let h = 2166136261 ^ o.length;
  let i = 0;
  if (o.byteOffset % 4 === 0) {
    const n = o.length >> 2, m = new Int32Array(o.buffer, o.byteOffset, n);
    for (let k = 0; k < n; k++) {
      h = Math.imul(h ^ m[k], 16777619);
      h ^= h >>> 15;
    }
    i = n << 2;
  }
  for (; i < o.length; i++) h = Math.imul(h ^ o[i], 16777619);
  return h >>> 0;
}
var MESURES = /* @__PURE__ */ new Set([
  "couts"
]);
var TYPES = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array,
  DataView
];
var Ecrivain = class {
  o = new Uint8Array(1 << 20);
  n = 0;
  dv = new DataView(this.o.buffer);
  chaines = /* @__PURE__ */ new Map();
  protos = /* @__PURE__ */ new Map();
  enc = new TextEncoder();
  place(k) {
    if (this.n + k <= this.o.length) return;
    let t = this.o.length * 2;
    while (t < this.n + k) t *= 2;
    const o = new Uint8Array(t);
    o.set(this.o.subarray(0, this.n));
    this.o = o, this.dv = new DataView(o.buffer);
  }
  u8(v) {
    this.place(1);
    this.o[this.n++] = v;
  }
  /** entier ≥ 0 jusqu'à 2⁵³ */
  nat(v) {
    this.place(8);
    while (v >= 128) {
      this.o[this.n++] = v % 128 | 128;
      v = Math.floor(v / 128);
    }
    this.o[this.n++] = v;
  }
  reel(v) {
    this.place(8);
    this.dv.setFloat64(this.n, v, true);
    this.n += 8;
  }
  u32(v) {
    this.place(4);
    this.dv.setUint32(this.n, v >>> 0, true);
    this.n += 4;
  }
  octets(b) {
    this.place(b.length);
    this.o.set(b, this.n);
    this.n += b.length;
  }
  /** chaîne : indice + 1 si déjà vue, sinon 0 puis ses octets */
  chaine(s) {
    const i = this.chaines.get(s);
    if (i !== void 0) return this.nat(i + 1);
    this.chaines.set(s, this.chaines.size);
    this.nat(0);
    const b = this.enc.encode(s);
    this.nat(b.length);
    this.octets(b);
  }
  proto(p) {
    const i = this.protos.get(p);
    if (i !== void 0) return this.nat(i + 1);
    this.protos.set(p, this.protos.size);
    this.nat(0);
    this.chaine(nomProto(p));
  }
};
function nomProto(p) {
  if (p === null) return "";
  const c = p.constructor;
  return p === Object.prototype ? "Object" : c?.name || "?";
}
function encoder(racines2, empreinte) {
  const e = new Ecrivain();
  const ids = /* @__PURE__ */ new Map();
  const valeur = (v) => {
    switch (typeof v) {
      case "undefined":
        return e.u8(0);
      case "boolean":
        return e.u8(v ? 3 : 2);
      case "number":
        if (Number.isInteger(v) && Math.abs(v) <= 2 ** 52 && !Object.is(v, -0)) {
          e.u8(4);
          return e.nat(v < 0 ? -2 * v - 1 : 2 * v);
        }
        e.u8(5);
        return e.reel(v);
      case "string":
        e.u8(6);
        return e.chaine(v);
      case "bigint":
        e.u8(18);
        return e.chaine(v.toString());
      case "function":
        return e.u8(19);
      case "symbol":
        return e.u8(8);
    }
    if (v === null) return e.u8(1);
    const o = v;
    const id = ids.get(o);
    if (id !== void 0) {
      e.u8(7);
      return e.nat(id);
    }
    ids.set(o, ids.size);
    if (ArrayBuffer.isView(o) || o instanceof ArrayBuffer) {
      const tampon = o instanceof ArrayBuffer;
      const k = tampon ? -1 : TYPES.findIndex((C2) => o instanceof C2);
      if (!tampon && k < 0) throw new Error(`sauvegarde : tableau typ\xE9 inconnu (${nomProto(Object.getPrototypeOf(o))})`);
      const b = octetsDe(o), longueur = tampon ? o.byteLength : o.length ?? b.length;
      const ref = references.get(o);
      const h = empreinte || ref !== void 0 ? empreinteOctets(o) : 0;
      if (empreinte || ref !== void 0 && ref === h) {
        e.u8(tampon ? 16 : 14);
        if (!tampon) e.u8(k);
        e.nat(longueur);
        return e.u32(h);
      }
      e.u8(tampon ? 15 : 13);
      if (!tampon) e.u8(k);
      e.nat(longueur);
      e.nat(b.length);
      return e.octets(b);
    }
    if (garder(o)) return e.u8(8);
    if (Array.isArray(o)) {
      e.u8(10);
      e.nat(o.length);
      for (let i = 0; i < o.length; i++) valeur(o[i]);
      return;
    }
    if (o instanceof Map) {
      e.u8(11);
      e.nat(o.size);
      for (const [k, x] of o) valeur(k), valeur(x);
      return;
    }
    if (o instanceof Set) {
      e.u8(12);
      e.nat(o.size);
      for (const x of o) valeur(x);
      return;
    }
    if (o instanceof Date) {
      e.u8(17);
      return e.reel(o.getTime());
    }
    e.u8(9);
    e.proto(Object.getPrototypeOf(o));
    const cles = empreinte ? Object.keys(o).filter((c) => !MESURES.has(c)) : Object.keys(o);
    e.nat(cles.length);
    for (const c of cles) {
      e.chaine(c);
      valeur(o[c]);
    }
  };
  valeur(racines2);
  return e;
}
var Lecteur = class {
  o;
  i;
  dv;
  chaines;
  protos;
  dec;
  constructor(o) {
    this.o = o;
    this.i = 0;
    this.chaines = [];
    this.protos = [];
    this.dec = new TextDecoder();
    this.dv = new DataView(o.buffer, o.byteOffset, o.byteLength);
  }
  u8() {
    if (this.i >= this.o.length) throw new Error("sauvegarde tronqu\xE9e");
    return this.o[this.i++];
  }
  nat() {
    let v = 0, m = 1, b;
    do {
      b = this.u8();
      v += (b & 127) * m;
      m *= 128;
    } while (b & 128);
    return v;
  }
  reel() {
    const v = this.dv.getFloat64(this.i, true);
    this.i += 8;
    return v;
  }
  u32() {
    const v = this.dv.getUint32(this.i, true);
    this.i += 4;
    return v;
  }
  octets(n) {
    if (this.i + n > this.o.length) throw new Error("sauvegarde tronqu\xE9e");
    const b = this.o.subarray(this.i, this.i + n);
    this.i += n;
    return b;
  }
  chaine() {
    const i = this.nat();
    if (i > 0) return this.chaines[i - 1];
    const s = this.dec.decode(this.octets(this.nat()));
    this.chaines.push(s);
    return s;
  }
  proto() {
    const i = this.nat();
    if (i > 0) return this.protos[i - 1];
    const s = this.chaine();
    this.protos.push(s);
    return s;
  }
};
function decoder(corps, racines2, protos, essai = false) {
  const l = new Lecteur(corps);
  const perdues = [];
  const crochets = [];
  const objets = [];
  const pris = /* @__PURE__ */ new Set();
  const libre = (c) => c !== null && typeof c === "object" && !pris.has(c);
  const prendre = (o) => (pris.add(o), objets.push(o), o);
  const valeur = (cible) => {
    const t = l.u8();
    switch (t) {
      case 0:
        return void 0;
      case 1:
        return null;
      case 2:
        return false;
      case 3:
        return true;
      case 4: {
        const z = l.nat();
        return z % 2 ? -(z + 1) / 2 : z / 2;
      }
      case 5:
        return l.reel();
      case 6:
        return l.chaine();
      case 18:
        return BigInt(l.chaine());
      case 8:
        return cible;
      case 19:
        return typeof cible === "function" ? cible : PERDUE;
      case 7: {
        const id = l.nat();
        if (id >= objets.length) throw new Error("sauvegarde ab\xEEm\xE9e (r\xE9f\xE9rence)");
        return objets[id];
      }
      case 17:
        return prendre(new Date(l.reel()));
      case 13:
      case 14: {
        const C2 = TYPES[l.u8()];
        if (!C2) throw new Error("sauvegarde ab\xEEm\xE9e (type)");
        const longueur = l.nat();
        const memeForme = libre(cible) && cible instanceof C2 && (C2 === DataView ? cible.byteLength === longueur : cible.length === longueur);
        if (t === 14) {
          l.u32();
          if (!memeForme) throw new Error("sauvegarde : un tableau des donn\xE9es fixes a chang\xE9 de forme");
          return prendre(cible);
        }
        const b = l.octets(l.nat());
        if (memeForme) {
          if (!essai) octetsDe(cible).set(b);
          return prendre(cible);
        }
        if (essai) return prendre({});
        const buf = b.slice().buffer;
        return prendre(C2 === DataView ? new DataView(buf) : new C2(buf));
      }
      case 15:
      case 16: {
        const longueur = l.nat();
        const memeForme = libre(cible) && cible instanceof ArrayBuffer && cible.byteLength === longueur;
        if (t === 16) {
          l.u32();
          if (!memeForme) throw new Error("sauvegarde : un tampon des donn\xE9es fixes a chang\xE9 de forme");
          return prendre(cible);
        }
        const b = l.octets(l.nat());
        if (memeForme) {
          if (!essai) new Uint8Array(cible).set(b);
          return prendre(cible);
        }
        return prendre(essai ? {} : b.slice().buffer);
      }
      case 10: {
        const n = l.nat();
        const a = prendre(libre(cible) && Array.isArray(cible) ? cible : []);
        if (essai) {
          for (let i = 0; i < n; i++) valeur(a[i]);
          return a;
        }
        if (a.length !== n) a.length = n;
        for (let i = 0; i < n; i++) {
          const v = valeur(a[i]);
          if (a[i] !== v) a[i] = v;
        }
        return a;
      }
      case 11: {
        const n = l.nat();
        const m = prendre(libre(cible) && cible instanceof Map ? cible : /* @__PURE__ */ new Map());
        const ancien = new Map(m);
        if (!essai) m.clear();
        for (let i = 0; i < n; i++) {
          const k = valeur(void 0), v = valeur(ancien.get(k));
          if (!essai) m.set(k, v);
        }
        return m;
      }
      case 12: {
        const n = l.nat();
        const s = prendre(libre(cible) && cible instanceof Set ? cible : /* @__PURE__ */ new Set());
        if (!essai) s.clear();
        for (let i = 0; i < n; i++) {
          const v = valeur(void 0);
          if (!essai) s.add(v);
        }
        return s;
      }
      case 9: {
        const nom = l.proto();
        const reprendre = libre(cible) && !Array.isArray(cible) && nomProto(Object.getPrototypeOf(cible)) === nom;
        if (!reprendre && !protos.has(nom)) throw new Error(`sauvegarde : classe \xAB ${nom} \xBB absente du monde neuf`);
        const o = prendre(reprendre ? cible : Object.create(protos.get(nom)));
        const n = l.nat();
        const cles = new Array(n);
        for (let i = 0; i < n; i++) {
          const c = cles[i] = l.chaine();
          let v = valeur(o[c]);
          if (v === PERDUE) perdues.push([
            o,
            c
          ]), v = void 0;
          if (!essai && o[c] !== v) o[c] = v;
        }
        if (essai) return o;
        if (typeof o.apresRestauration === "function") crochets.push(o);
        const ici = Object.keys(o);
        if (ici.length !== n || ici.some((c, i) => c !== cles[i])) {
          const garde = new Set(cles);
          for (const c of ici) if (!garde.has(c)) delete o[c];
          for (const c of cles) {
            const v = o[c];
            delete o[c];
            o[c] = v;
          }
        }
        return o;
      }
    }
    throw new Error(`sauvegarde ab\xEEm\xE9e (marque ${t})`);
  };
  valeur(racines2);
  if (l.i !== corps.length) throw new Error("sauvegarde ab\xEEm\xE9e (octets en trop)");
  return {
    perdues,
    crochets
  };
}
var PERDUE = Symbol("fonction perdue");
function parcourirObjets(racine, f) {
  const vus = /* @__PURE__ */ new Set();
  const pile = [
    racine
  ];
  while (pile.length) {
    const v = pile.pop();
    if (v === null || typeof v !== "object" || vus.has(v)) continue;
    vus.add(v);
    if (ArrayBuffer.isView(v) || v instanceof ArrayBuffer || garder(v)) continue;
    if (Array.isArray(v)) for (const x of v) pile.push(x);
    else if (v instanceof Map) for (const [k, x] of v) pile.push(k, x);
    else if (v instanceof Set) for (const x of v) pile.push(x);
    else {
      f(v);
      for (const k of Object.keys(v)) pile.push(v[k]);
    }
  }
}
function classesDe(racine) {
  const m = /* @__PURE__ */ new Map([
    [
      "Object",
      Object.prototype
    ],
    [
      "",
      null
    ]
  ]);
  const ambigus = /* @__PURE__ */ new Set();
  parcourirObjets(racine, (v) => {
    const p = Object.getPrototypeOf(v), nom = nomProto(p);
    if (m.has(nom) && m.get(nom) !== p) ambigus.add(nom);
    else m.set(nom, p);
  });
  for (const nom of ambigus) m.delete(nom);
  return m;
}
async function passer(o, flux) {
  const r = new Blob([
    o
  ]).stream().pipeThrough(flux);
  return new Uint8Array(await new Response(r).arrayBuffer());
}
var systemesDe = (m) => m.systemes;
function racinesTriees(r) {
  return Object.keys(r).map((k) => [
    k,
    r[k] !== null && r[k] !== void 0
  ]);
}
async function sauvegarder(racines2, opt = {}) {
  const compresse = opt.compresser ?? true;
  const e = encoder(racines2, false);
  const brut = e.o.subarray(0, e.n);
  const corps = compresse ? await passer(brut, new CompressionStream("deflate")) : brut;
  const entete = {
    version: VERSION,
    heure: racines2.monde.heure,
    graine: racines2.monde.graine,
    depart: departPartie(),
    racines: racinesTriees(racines2),
    systemes: systemesDe(racines2.monde).map((s) => s.nom),
    donnees: empreintesDepart.get(racines2.monde) ?? null,
    controle: empreinteOctets(brut),
    octets: brut.length,
    compresse,
    extra: opt.extra
  };
  const j = new TextEncoder().encode(JSON.stringify(entete));
  const sortie = new Uint8Array(12 + j.length + corps.length);
  const dv = new DataView(sortie.buffer);
  dv.setUint32(0, MAGIE, true);
  dv.setUint16(4, VERSION, true);
  dv.setUint32(8, j.length, true);
  sortie.set(j, 12);
  sortie.set(corps, 12 + j.length);
  return sortie;
}
function lireEntete(octets) {
  if (octets.length < 12) throw new Error("Ce fichier n'est pas une sauvegarde de Squid Nations V2.");
  const dv = new DataView(octets.buffer, octets.byteOffset, octets.byteLength);
  if (dv.getUint32(0, true) !== MAGIE) throw new Error("Ce fichier n'est pas une sauvegarde de Squid Nations V2.");
  const v = dv.getUint16(4, true);
  if (v !== VERSION) throw new Error(`Sauvegarde d'une autre version du format (${v}, attendue ${VERSION}).`);
  const n = dv.getUint32(8, true);
  if (12 + n > octets.length) throw new Error("Sauvegarde tronqu\xE9e.");
  try {
    return JSON.parse(new TextDecoder().decode(octets.subarray(12, 12 + n)));
  } catch {
    throw new Error("Sauvegarde ab\xEEm\xE9e (en-t\xEAte illisible).");
  }
}
async function verifierFichier(octets) {
  const en = lireEntete(octets);
  const debut = 12 + new DataView(octets.buffer, octets.byteOffset).getUint32(8, true);
  const corps = en.compresse ? await passer(octets.subarray(debut), new DecompressionStream("deflate")).catch(() => {
    throw new Error("Sauvegarde ab\xEEm\xE9e (corps illisible).");
  }) : octets.subarray(debut);
  if (corps.length !== en.octets || empreinteOctets(corps) !== en.controle) throw new Error("Sauvegarde ab\xEEm\xE9e ou tronqu\xE9e.");
  return {
    entete: en,
    corps
  };
}
async function restaurer(octets, racines2) {
  const { entete: en, corps } = await verifierFichier(octets);
  const ici = racinesTriees(racines2);
  for (const [nom, present] of en.racines) {
    const r = ici.find((x) => x[0] === nom);
    if (!r || r[1] !== present) {
      throw new Error(`Rechargement : \xAB ${nom} \xBB ${present ? "absent" : "en trop"} dans la partie (pas encore charg\xE9 ?).`);
    }
  }
  if (ici.length !== en.racines.length) throw new Error("Rechargement : la partie n'a pas les m\xEAmes syst\xE8mes.");
  const m = racines2.monde;
  if (m.heure !== 0) throw new Error("Rechargement : le monde doit \xEAtre neuf (pas encore avanc\xE9).");
  if (m.graine !== en.graine) throw new Error(`Rechargement : graine ${m.graine} au lieu de ${en.graine}.`);
  const S = systemesDe(m);
  const restants = [
    ...S
  ], ordre = [];
  for (const nom of en.systemes) {
    const i = restants.findIndex((s) => s.nom === nom);
    if (i < 0) throw new Error(`Rechargement : syst\xE8me \xAB ${nom} \xBB absent de la partie (pas encore charg\xE9 ?).`);
    ordre.push(restants.splice(i, 1)[0]);
  }
  if (restants.length) throw new Error(`Rechargement : syst\xE8me \xAB ${restants[0].nom} \xBB en trop dans la partie.`);
  const donnees2 = empreinteDepart(racines2, true);
  if (en.donnees !== null && donnees2 !== en.donnees) {
    throw new Error("Sauvegarde faite avec d'autres donn\xE9es du jeu (carte ou tables chang\xE9es depuis).");
  }
  empreintesDepart.set(m, donnees2);
  const protos = classesDe(racines2);
  decoder(corps, racines2, protos, true);
  S.splice(0, S.length, ...ordre);
  fixerDepart(en.depart);
  const { perdues, crochets } = decoder(corps, racines2, protos);
  for (const o of crochets) o.apresRestauration();
  if (perdues.length) {
    const [o, c] = perdues[0];
    throw new Error(`Rechargement incomplet : ${perdues.length} fonction(s) cr\xE9\xE9e(s) en jouant non refaite(s) (\xAB ${c} \xBB d'un objet ${nomProto(Object.getPrototypeOf(o))}). Il faut une m\xE9thode apresRestauration dans le syst\xE8me concern\xE9.`);
  }
  return en;
}
function empreinteEtat(racines2) {
  const e = encoder(racines2, true);
  return empreinteOctets(e.o.subarray(0, e.n));
}

// web/src/sim/fiches.ts
var REGLES_EN_CLAIR = {
  champ: "sur un champ p\xE9trolier de ton pays qui n'a pas encore de puits",
  reseau: "n'importe o\xF9 chez toi, pr\xE8s d'un grand axe",
  ville: "dans une ville de ton pays (5 000 habitants et plus)",
  terre: "n'importe o\xF9 sur ton territoire",
  port: "dans un port de ton pays ouvert sur la mer",
  axe: "sur un grand axe routier, \xE0 10 km au moins d'un autre d\xE9p\xF4t",
  "ville-ou-depot": "dans une ville de ton pays ou pr\xE8s d'un de tes d\xE9p\xF4ts"
};
var MAX_EMPLACEMENTS = 400;
var texteSec = (a) => a & SEC_CARBURANT ? "carburant" : a & SEC_MUNITIONS ? "munitions" : "";
function catalogue(r) {
  const b = r.batiments, u = r.unites, n = r.nucleaire;
  if (!b || !u) return null;
  const t = b.res.d.prix;
  return {
    batiments: b.catalogue().map((c) => ({
      ...c,
      id: REGLES[c.genre].id
    })),
    axes: [
      "route",
      "rail"
    ].map((mode) => {
      const c = b.cout(mode, -1, 1);
      return {
        mode,
        nom: mode === "route" ? "Route" : "Rail",
        argentKm: c.argent,
        jours: c.heures / 24,
        kmParDelai: PARAMS4.kmAxeParDelai,
        kmMax: PARAMS4.kmAxeMax
      };
    }),
    unites: IDS_UNITES.map((id, k) => {
      const p = u.prix(k);
      return {
        id,
        nom: NOMS_UNITES[k],
        prix: p.prix,
        carburant: p.carburant_t,
        recrues: p.recrues,
        jours: p.jours_production,
        taille: TAILLE[k]
      };
    }),
    bombes: t.bombes.map((x, k) => ({
      nom: x.nom,
      prix: x.prix,
      kt: PARAMS10.kt[k]
    })),
    porteeDepotKm: PARAMS2.porteeDepotKm,
    rayons: {
      avions: PARAMS7.rayonAvionsKm,
      dca: PARAMS7.rayonDcaKm,
      navires: PARAMS7.rayonNaviresKm
    },
    nucleaire: !!n?.autorise
  };
}
function fiche(r, joueur, d) {
  const res = r.ressources, g = r.groupes, u = r.unites, b = r.batiments;
  if (!res || !g || !u || !b) return null;
  switch (d.sujet) {
    case "lieu":
      return lieu(r, joueur, d.x, d.y, d.km);
    case "depot":
      return depot(r, d.site);
    case "groupe":
      return groupe(r, joueur, d.id);
    case "site":
      return site(r, d.site);
    case "armee":
      return armee(r, joueur);
    case "pose": {
      const v = b.verifier(joueur, d.genre, d.x, d.y);
      return v.ok ? {
        sujet: "pose",
        genre: d.genre,
        ok: true,
        texte: "",
        x: v.x,
        y: v.y,
        nom: v.nom
      } : {
        sujet: "pose",
        genre: d.genre,
        ok: false,
        texte: v.texte,
        x: d.x,
        y: d.y,
        nom: ""
      };
    }
    case "emplacements":
      return emplacements(r, joueur, d.genre);
    case "depots": {
      u.assurer();
      const usines = [];
      for (let s = 0; s < res.n; s++) {
        const t = u.typeUsine(s);
        if (t >= 0 && res.pays[s] === joueur && res.actif[s]) usines.push({
          site: s,
          x: res.x[s],
          y: res.y[s],
          type: t
        });
      }
      return {
        sujet: "depots",
        porteeKm: PARAMS2.porteeDepotKm,
        depots: res.sites(DEPOT, joueur).filter((s) => res.actif[s]).map((s) => ({
          site: s,
          x: res.x[s],
          y: res.y[s],
          carburant: res.stock[4 * s + CARBURANT],
          munitions: res.stock[4 * s + MUNITIONS],
          cap: res.capacite[4 * s + CARBURANT] + res.capacite[4 * s + MUNITIONS],
          presents: [
            0,
            1,
            2
          ].map((t) => u.parc[5 * s + t])
        })),
        usines
      };
    }
  }
}
function lieu(r, joueur, x, y, km) {
  const res = r.ressources, g = r.groupes, t = r.territoire;
  const cb = r.combat, nuc = r.nucleaire;
  const pays = t ? t.controleur(x, y) : -1;
  const out = {
    sujet: "lieu",
    x,
    y,
    pays,
    camp: pays >= 0 ? g.camp(pays) : CAMP_NEUTRE,
    groupe: null,
    site: null,
    pont: null,
    ville: null,
    bombe: nuc?.silos(joueur)[0]?.[1] ?? -1
  };
  let bd = km;
  for (const x2 of g.groupesPres(x, y, km)) {
    const dd = Math.hypot(x2.x - x, x2.y - y);
    if (dd <= bd) bd = dd, out.groupe = {
      id: x2.id,
      pays: x2.pays,
      nom: x2.nom,
      camp: g.camp(x2.pays)
    };
  }
  bd = km;
  for (let s = 0; s < res.n; s++) {
    if (!res.actif[s]) continue;
    const dd = Math.hypot(res.x[s] - x, res.y[s] - y);
    if (dd < bd || dd === bd && res.pays[s] === joueur && out.site?.pays !== joueur) {
      bd = dd, out.site = {
        site: s,
        genre: res.genre[s],
        pays: res.pays[s],
        nom: res.noms[s] ?? "",
        camp: g.camp(res.pays[s])
      };
    }
  }
  if (cb) {
    const [p] = cb.pontsPres(x, y, km);
    if (p !== void 0) out.pont = {
      i: p,
      nom: cb.nomPont(p),
      detruit: !!cb.detruits[p]
    };
  }
  const V = res.d.villes;
  bd = km;
  for (let i = 0; i < V.n; i++) {
    const dx = V.x[i] - x;
    if (dx > bd || dx < -bd) continue;
    const dd = Math.hypot(dx, V.y[i] - y);
    if (dd <= bd) bd = dd, out.ville = {
      i,
      nom: "",
      pays: res.proprietaire[i]
    };
  }
  return out;
}
function depot(r, s) {
  const res = r.ressources, g = r.groupes, u = r.unites;
  if (!(s >= 0 && s < res.n) || res.genre[s] !== DEPOT) return null;
  const t = g.tableDepot(s);
  let avions = 0, aeroport = "";
  for (const a of res.sites(AEROPORT, res.pays[s])) {
    if (!res.actif[a] || distanceSol(res.x[a], res.y[a], res.x[s], res.y[s]) > PARAMS5.rayonAvionsKm) continue;
    const n = u.parc[5 * a + AVIONS];
    if (n > avions) avions = n, aeroport = res.noms[a] ?? "";
  }
  return {
    sujet: "depot",
    site: s,
    nom: res.noms[s] ?? "",
    pays: res.pays[s],
    x: res.x[s],
    y: res.y[s],
    actif: !!res.actif[s],
    presents: t.presents,
    enRoute: t.enRoute,
    carburant: t.carburant,
    munitions: t.munitions,
    capCarburant: res.capacite[4 * s + CARBURANT],
    capMunitions: res.capacite[4 * s + MUNITIONS],
    groupes: t.groupes.map((id) => g.trouver(id)).map((x) => ({
      id: x.id,
      nom: x.nom,
      n: x.n.slice(),
      ordre: NOMS_ORDRES[x.ordre]
    })),
    avions: Math.floor(avions),
    aeroport,
    reserveHeures: PARAMS8.reserveHeures
  };
}
function groupe(r, joueur, id) {
  const g = r.groupes, cb = r.combat, res = r.ressources;
  const i = g.infoGroupe(id), x = g.trouver(id);
  if (!i || !x) return null;
  const voisins = i.pays === joueur ? g.groupesPres(i.x, i.y, PARAMS8.kmFusion).filter((v) => v.id !== id && v.pays === joueur).map((v) => ({
    id: v.id,
    nom: v.nom
  })) : [];
  const P = res.d.reseau.ports;
  let port = false;
  for (let k = 0; k < P.n && !port; k++) port = P.pays[k] === joueur && P.mer[k] >= 0 && Math.hypot(P.x[k] - i.x, P.y[k] - i.y) <= 25;
  return {
    sujet: "groupe",
    id,
    nom: i.nom,
    pays: i.pays,
    camp: g.camp(i.pays),
    n: i.n,
    avions: i.avions,
    ordre: i.ordre,
    x: i.x,
    y: i.y,
    carburant: i.carburant,
    munitions: i.munitions,
    carburantMax: i.carburantMax,
    munitionsMax: i.munitionsMax,
    aSec: texteSec(i.aSec),
    combat: cb?.combatDe(id)?.id ?? -1,
    kmRestants: Math.max(0, i.kmRestants),
    vitesse: i.vitesse,
    surPlace: i.surPlace,
    voisins,
    port
  };
}
function site(r, s) {
  const res = r.ressources, u = r.unites, b = r.batiments, g = r.groupes;
  const am = r["air-mer"], nuc = r.nucleaire;
  if (!(s >= 0 && s < res.n)) return null;
  u.assurer();
  const genre = res.genre[s], t = u.typeUsine(s);
  const regle = REGLES[genre];
  const armement = nuc?.armements.find((a) => a.silo === s);
  return {
    sujet: "site",
    site: s,
    genre,
    nom: res.noms[s] ?? regle?.nom ?? "",
    pays: res.pays[s],
    camp: g.camp(res.pays[s]),
    x: res.x[s],
    y: res.y[s],
    actif: !!res.actif[s],
    niveau: b.niveau(s),
    doublable: !!regle?.doublable,
    stock: [
      0,
      1,
      2,
      3
    ].map((p) => res.stock[4 * s + p]),
    capacite: [
      0,
      1,
      2,
      3
    ].map((p) => res.capacite[4 * s + p]),
    debit: res.debit[s],
    usine: t < 0 ? null : {
      type: t,
      commande: u.commande[s],
      avancement: Math.min(1, u.avancement[s] / Math.max(1, u.heuresProduction(t))),
      attente: TEXTES_ATTENTE[u.attente[s]] ?? "",
      joursUnite: u.heuresProduction(t) / 24 / b.niveau(s)
    },
    aeroport: genre === AEROPORT ? {
      avions: Math.round(u.parc[5 * s + AVIONS]),
      patrouille: !am?.repos[s]
    } : null,
    silo: genre === SILO ? {
      bombe: b.bombe.get(s) ?? -1,
      enFabrication: armement ? armement.fin - nuc.heure : 0
    } : null
  };
}
function armee(r, joueur) {
  const res = r.ressources, u = r.unites, g = r.groupes, b = r.batiments;
  const am = r["air-mer"], cb = r.combat;
  u.assurer();
  const forces = am?.fiche(joueur);
  const depots = res.sites(DEPOT, joueur).filter((s) => res.actif[s]).map((s) => {
    const t = g.tableDepot(s);
    return {
      site: s,
      nom: res.noms[s] ?? "",
      x: res.x[s],
      y: res.y[s],
      presents: t.presents,
      enRoute: t.enRoute,
      carburant: t.carburant,
      munitions: t.munitions,
      groupes: t.groupes.length
    };
  });
  const P = res.d.reseau.ports, ports = [];
  for (let k = 0; k < P.n; k++) {
    if (u.paysPort[k] === joueur && u.naviresPort[k] > 0) ports.push({
      port: k,
      nom: P.noms[k],
      x: P.x[k],
      y: P.y[k],
      navires: Math.round(u.naviresPort[k])
    });
  }
  const usines = [];
  for (let s = 0; s < res.n; s++) {
    const t = u.typeUsine(s);
    if (t < 0 || res.pays[s] !== joueur || !res.actif[s]) continue;
    usines.push({
      site: s,
      nom: res.noms[s] ?? "",
      type: t,
      commande: u.commande[s],
      double: b.niveau(s) === 2,
      x: res.x[s],
      y: res.y[s],
      avancement: Math.min(1, u.avancement[s] / Math.max(1, u.heuresProduction(t))),
      attente: TEXTES_ATTENTE[u.attente[s]] ?? ""
    });
  }
  const groupes2 = g.groupesDe(joueur).map((x) => {
    const [mc, mm] = g.reserveMax(x);
    return {
      id: x.id,
      nom: x.nom,
      n: x.n.slice(),
      avions: x.avions,
      ordre: NOMS_ORDRES[x.ordre],
      aSec: texteSec(x.aSec),
      x: x.x,
      y: x.y,
      reserve: mc + mm > 0 ? (x.carburant + x.munitions) / (mc + mm) : 1,
      combat: !!cb?.combatDe(x.id)
    };
  });
  const totaux = [];
  for (let t = 0; t < NB_TYPES; t++) totaux.push(u.total(joueur, t) + g.enGroupes(joueur, t));
  return {
    sujet: "armee",
    depots,
    aeroports: forces?.aeroports ?? [],
    ports,
    flottes: forces?.flottes ?? [],
    usines,
    groupes: groupes2,
    totaux
  };
}
function emplacements(r, joueur, genre) {
  const res = r.ressources, b = r.batiments;
  const regle = REGLES[genre];
  const xy = [], noms = [];
  const texte = regle ? REGLES_EN_CLAIR[regle.lieu] ?? "" : "";
  if (!regle) return {
    sujet: "emplacements",
    genre,
    xy,
    noms,
    regle: texte
  };
  if (regle.lieu === "champ") {
    for (const c of res.d.petrole.champs) {
      if (res.d.idPays.get(c.iso3) === void 0) continue;
      const v = b.verifier(joueur, PUITS, ...projeter(c.lon, c.lat));
      if (v.ok) xy.push(v.x, v.y), noms.push(v.nom);
    }
  } else if (regle.lieu === "ville" || regle.lieu === "ville-ou-depot") {
    const V = res.d.villes;
    for (let i = 0; i < V.n && xy.length < 2 * MAX_EMPLACEMENTS; i++) if (res.proprietaire[i] === joueur) xy.push(V.x[i], V.y[i]), noms.push("");
    if (regle.lieu === "ville-ou-depot") {
      for (const s of res.sites(DEPOT, joueur)) if (res.actif[s]) xy.push(res.x[s], res.y[s]), noms.push(res.noms[s] ?? "");
    }
  } else if (regle.lieu === "port") {
    const P = res.d.reseau.ports;
    for (let k = 0; k < P.n; k++) {
      if (P.mer[k] < 0 || b.proprietaire(P.x[k], P.y[k]) !== joueur) continue;
      const v = b.verifier(joueur, genre, P.x[k], P.y[k]);
      if (v.ok) xy.push(v.x, v.y), noms.push(P.noms[k]);
    }
  }
  return {
    sujet: "emplacements",
    genre,
    xy,
    noms,
    regle: texte
  };
}

// web/src/sim/travailleur.ts
var BUDGET_MS = 40;
var portee = self;
var lire = async (nom) => {
  const r = await fetch(`donnees/${nom}`);
  if (!r.ok) throw new Error(`${nom} : ${r.status}`);
  return await r.arrayBuffer();
};
var horloge = new Horloge();
var monde = new Monde(1);
var partie = partieDe(void 0);
var racines = null;
var generation = 0;
var pret = false;
var chargement = "";
var avis = null;
var sauvegardeEnCours = false;
var chargementEnCours = false;
var aRestaurer = null;
var secours = null;
var msParPas = 0;
var heureRendu = -1;
var trajetsEnvoyes = 0;
var msRendu = 0;
var catalogueGen = -1;
var alertes = [];
var combatsVus = /* @__PURE__ */ new Set();
function demarrer(graine, options) {
  const gen = ++generation;
  combatsVus.clear();
  partie = partieDe(options);
  fixerDepart(departDe(partie.dateDepart));
  monde = new Monde(graine);
  racines = null;
  pret = false;
  horloge.heure = 0;
  if (options?.vitesse !== void 0) horloge.regler(options.vitesse);
  chargement = aRestaurer ? "Chargement de la partie\u2026" : "Pr\xE9paration de la partie\u2026";
  monterPartie(graine, partie, lire).then(async (r) => {
    if (gen !== generation) return;
    monde = r.monde;
    racines = r;
    const octets = aRestaurer;
    aRestaurer = null;
    if (octets) {
      try {
        await restaurer(octets, r);
        horloge.heure = monde.heure;
        avis = {
          ok: true,
          texte: "Partie charg\xE9e."
        };
        secours = null;
      } catch (x) {
        if (gen !== generation) return;
        const texte = x instanceof Error ? x.message : String(x);
        if (secours) {
          const s = secours;
          secours = null;
          avis = {
            ok: false,
            texte: `Sauvegarde non charg\xE9e : ${texte} La partie en cours est reprise (en pause).`
          };
          horloge.enPause = true;
          return relancer(s);
        }
        avis = {
          ok: false,
          texte: `Sauvegarde non charg\xE9e : ${texte} Nouvelle partie.`
        };
        reperer(r);
      }
    } else reperer(r);
    chargement = "";
    heureRendu = -1, trajetsEnvoyes = 0;
    pret = true;
  }).catch((x) => {
    if (gen !== generation) return;
    chargement = `Partie impossible \xE0 pr\xE9parer : ${x instanceof Error ? x.message : x}`;
  });
}
function relancer(octets) {
  const en = lireEntete(octets);
  const ex = en.extra;
  aRestaurer = octets;
  demarrer(en.graine, {
    ...ex?.partie
  });
}
function chargerSauvegarde(octets) {
  if (chargementEnCours || aRestaurer) {
    avis = {
      ok: false,
      texte: "Un chargement est d\xE9j\xE0 en cours."
    };
    return;
  }
  chargementEnCours = true;
  const gen = generation;
  verifierFichier(octets).then(async () => {
    if (gen !== generation) return;
    const copie = pret && racines ? await sauvegarder(racines, {
      compresser: false,
      extra: {
        partie
      }
    }) : null;
    if (gen !== generation) return;
    secours = copie;
    horloge.enPause = true;
    relancer(octets);
  }).catch((x) => {
    avis = {
      ok: false,
      texte: `Sauvegarde non charg\xE9e : ${x instanceof Error ? x.message : x} La partie en cours continue.`
    };
  }).finally(() => chargementEnCours = false);
}
function lancerSauvegarde(nom) {
  if (!pret || !racines) return {
    ok: false,
    texte: "La partie n'est pas encore pr\xEAte."
  };
  if (sauvegardeEnCours) return {
    ok: false,
    texte: "Une sauvegarde est d\xE9j\xE0 en cours."
  };
  sauvegardeEnCours = true;
  const gen = generation, heure = monde.heure, n = nom || `Partie \xE0 l'heure ${heure}`;
  sauvegarder(racines, {
    extra: {
      partie: {
        ...partie
      },
      nom: n
    }
  }).then((octets) => {
    if (gen !== generation) return;
    portee.postMessage({
      type: "sauvegarde",
      octets,
      nom: n,
      heure
    }, [
      octets.buffer
    ]);
  }).catch((x) => avis = {
    ok: false,
    texte: `Sauvegarde impossible : ${x instanceof Error ? x.message : x}`
  }).finally(() => sauvegardeEnCours = false);
  return {
    ok: true,
    texte: "Sauvegarde en cours\u2026"
  };
}
function unPas() {
  const t0 = performance.now();
  monde.pas(true);
  const dt = performance.now() - t0;
  msParPas = msParPas === 0 ? dt : msParPas * 0.95 + dt * 0.05;
}
portee.onmessage = (e) => {
  const m = e.data;
  switch (m.type) {
    case "demarrer":
      aRestaurer = null, secours = null;
      demarrer(m.graine, m.options);
      break;
    case "pause":
      horloge.basculerPause();
      break;
    case "vitesse":
      horloge.regler(m.vitesse);
      break;
    case "sauvegarder":
      avis = lancerSauvegarde(m.nom);
      break;
    case "charger":
      chargerSauvegarde(m.octets);
      break;
    case "avancer": {
      if (!pret) {
        avis = {
          ok: false,
          texte: "La partie n'est pas encore pr\xEAte."
        };
        break;
      }
      const t0 = performance.now();
      for (let i = 0; i < m.heures; i++) unPas();
      const ms = performance.now() - t0;
      horloge.heure = monde.heure;
      portee.postMessage({
        type: "mesure",
        heure: monde.heure,
        heures: m.heures,
        ms,
        msParPas: m.heures ? ms / m.heures : 0,
        empreinte: monde.empreinte(),
        empreinteEtat: 0
      });
      break;
    }
    case "acheter": {
      const m2 = racines?.marche;
      if (!pret || !m2) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else avis = m2.acheter(partie.pays, m.produit, m.tonnes, m.port);
      break;
    }
    case "construire":
    case "doubler":
    case "construire-axe":
    case "annuler": {
      const b = racines?.batiments;
      if (!pret || !b) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else if (m.type === "construire") avis = b.poser(partie.pays, m.genre, m.x, m.y, m.bombe);
      else if (m.type === "doubler") avis = b.doubler(partie.pays, m.site);
      else if (m.type === "annuler") avis = b.annuler(partie.pays, m.chantier);
      else avis = b.poserAxe(partie.pays, m.mode === "rail" ? 1 : 0, m.x1, m.y1, m.x2, m.y2);
      break;
    }
    case "produire":
    case "composer":
    case "ordre-groupe":
    case "fusionner": {
      const u = racines?.unites, g = racines?.groupes, p = partie.pays;
      if (!pret || !u || !g) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else if (m.type === "produire") {
        const t = IDS_UNITES.indexOf(m.unite);
        avis = m.site === void 0 ? u.produireType(p, t, m.nombre) : u.produire(p, m.site, m.nombre);
      } else if (m.type === "composer") {
        avis = g.composer(p, m.depot, [
          m.soldats,
          m.chars,
          m.artillerie
        ], m.avions, m.nom, m.x, m.y);
      } else if (m.type === "fusionner") avis = g.fusionner(p, m.a, m.b);
      else if (m.ordre === "envoyer") avis = g.envoyer(p, m.groupe, m.x ?? NaN, m.y ?? NaN);
      else avis = m.ordre === "arreter" ? g.arreter(p, m.groupe) : g.retirer(p, m.groupe);
      break;
    }
    case "pont": {
      const cb = racines?.combat;
      if (!pret || !cb) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else if (m.ordre === "bombarder") avis = (racines?.["air-mer"]).bombarderPont(partie.pays, m.pont);
      else avis = m.ordre === "detruire" ? cb.detruirePont(partie.pays, m.pont) : cb.reparerPont(partie.pays, m.pont, monde.heure);
      break;
    }
    case "aviation":
    case "flotte":
    case "ordre-flotte":
    case "debarquer": {
      const a = racines?.["air-mer"], p = partie.pays;
      if (!pret || !a) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else if (m.type === "aviation") avis = a.aviation(p, m.aeroport, m.ordre === "patrouille");
      else if (m.type === "flotte") avis = a.flotte(p, m.port, m.navires, m.x, m.y);
      else if (m.type === "ordre-flotte") avis = a.ordreFlotte(p, m.flotte, m.ordre, m.x, m.y);
      else avis = a.debarquer(p, m.groupe, m.x, m.y);
      break;
    }
    case "nucleaire": {
      const n = racines?.nucleaire;
      if (!pret || !n) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else avis = m.ordre === "tirer" ? n.tirer(partie.pays, m.x, m.y, m.bombe, m.silo) : n.armer(partie.pays, m.silo, m.bombe);
      break;
    }
    case "decret": {
      const d = racines?.diplomatie;
      if (!pret || !d) avis = {
        ok: false,
        texte: "La partie n'est pas encore pr\xEAte."
      };
      else avis = d.decret(partie.pays, m.pays, m.decret), diploHeure = -1;
      break;
    }
    case "fiche":
      portee.postMessage({
        type: "fiche",
        n: m.n,
        fiche: pret && racines ? fiche(racines, partie.pays, m.demande) : null
      });
      return;
    case "empreinte":
      portee.postMessage({
        type: "mesure",
        heure: monde.heure,
        heures: 0,
        ms: 0,
        msParPas,
        empreinte: monde.empreinte(),
        empreinteEtat: racines ? empreinteEtat(racines) : 0
      });
      break;
  }
  envoyer(performance.now(), true);
};
var precedent = performance.now();
var dernierEnvoi = 0;
var debutFenetre = precedent;
var pasFenetre = 0;
var occupeFenetre = 0;
var pasParSeconde = 0;
var occupation = 0;
function envoyerRendu() {
  if (!pret || !racines || monde.heure === heureRendu) return;
  const t0 = performance.now();
  const c = new CollecteRendu();
  for (const [nom, v] of Object.entries(racines)) {
    if (nom === "monde" || nom === "partie") continue;
    const m = v;
    if (typeof m?.rendu === "function") m.rendu(c);
  }
  const reg = racines.rendu;
  const nouveaux = reg && reg.n > trajetsEnvoyes ? reg.depuis(trajetsEnvoyes) : null;
  if (reg) trajetsEnvoyes = reg.n;
  const terr = racines.territoire;
  const territoire = terr ? heureRendu < 0 ? terr.renduComplet() : terr.renduChangements() : null;
  const r = c.fin(monde.heure, nouveaux, territoire);
  heureRendu = monde.heure;
  portee.postMessage(r, transferts(r));
  const dt = performance.now() - t0;
  msRendu = msRendu === 0 ? dt : msRendu * 0.9 + dt * 0.1;
}
function chiffres() {
  const r = racines?.ressources, f = racines?.flux, m = racines?.marche;
  if (!pret || !r || !f || !m) return null;
  const p = partie.pays, u = racines?.unites, g = racines?.groupes;
  const unites = [];
  for (let t = 0; t < NB_TYPES; t++) unites.push((u?.total(p, t) ?? 0) + (g?.enGroupes(p, t) ?? 0));
  return {
    argent: r.tresor[p],
    gainHeure: r.recettes[p],
    recrues: r.total(p, RECRUES),
    carburant: r.total(p, CARBURANT, DEPOT),
    munitions: r.total(p, MUNITIONS, DEPOT),
    prixCarburant: m.prix[CARBURANT],
    prixMunitions: m.prix[MUNITIONS],
    convois: f.enCours(),
    chantiers: racines?.batiments?.chantiersDe(p).length ?? 0,
    unites,
    groupes: g?.groupesDe(p).length ?? 0
  };
}
var guerreHeure = -1;
var guerreFiche = null;
function guerre() {
  const cb = racines?.combat, t = racines?.territoire;
  if (!pret || !cb || !t) return null;
  if (guerreHeure !== monde.heure || !guerreFiche) {
    const f = cb.fiches(), a = racines?.["air-mer"], n = racines?.nucleaire;
    guerreFiche = {
      ...f,
      pays: t.fiche(),
      tues: cb.tuesParPays[partie.pays],
      zones: t.zones.size
    };
    if (a && n) guerreFiche.forces = {
      ...a.fiche(partie.pays),
      nucleaire: n.fiche(partie.pays)
    };
    guerreHeure = monde.heure;
  }
  return guerreFiche;
}
var diploHeure = -1;
var diploFiche = null;
function diplomatie() {
  const d = racines?.diplomatie;
  if (!pret || !d) return null;
  if (diploHeure !== monde.heure || !diploFiche) diploFiche = d.fiche(), diploHeure = monde.heure;
  return diploFiche;
}
function relever() {
  if (!racines || alertes.length > 60) return;
  const bat = racines.batiments;
  if (bat?.fini.length) for (const texte of bat.vider()) alertes.push({
    module: "batiments",
    texte,
    x: NaN,
    y: NaN
  });
  const grp = racines.groupes;
  if (grp?.alertes.length) {
    const xy = grp.alertesXY;
    grp.vider().forEach((texte, i) => alertes.push({
      module: "groupes",
      texte,
      x: xy[2 * i] ?? NaN,
      y: xy[2 * i + 1] ?? NaN
    }));
  }
  for (const nom of [
    "combat",
    "territoire",
    "air-mer",
    "nucleaire",
    "diplomatie"
  ]) {
    const x = racines[nom];
    if (x?.alertes.length) for (const texte of x.vider()) alertes.push({
      module: nom,
      texte,
      x: NaN,
      y: NaN
    });
  }
}
function envoyer(t, force) {
  envoyerRendu();
  relever();
  if (!force && t - dernierEnvoi < ENVOI_MS) return;
  dernierEnvoi = t;
  const g = guerre();
  if (g) {
    for (const c of g.enCours) {
      if (c.joueur < 0 || combatsVus.has(c.id)) continue;
      combatsVus.add(c.id);
      const eux = c.pays[1 - c.joueur].map((p) => (racines?.groupes).nomPays(p)).join(", ");
      alertes.push({
        module: "combat",
        texte: `Combat engag\xE9 en ${c.terrain} contre ${eux}.`,
        x: c.x,
        y: c.y
      });
    }
  }
  const cat = pret && racines && catalogueGen !== generation ? catalogue(racines) : null;
  if (cat) catalogueGen = generation;
  const etat = {
    type: "etat",
    heure: monde.heure,
    fraction: pret ? horloge.fraction() : 0,
    vitesse: horloge.vitesse,
    enPause: horloge.enPause,
    pret,
    graine: monde.graine,
    pasParSeconde,
    occupation,
    msParPas,
    msRendu,
    couts: [
      ...monde.couts.values()
    ],
    avis,
    chargement,
    ressources: chiffres(),
    guerre: g,
    diplomatie: diplomatie(),
    catalogue: cat,
    alertes,
    partie: pret ? {
      pays: partie.pays,
      nucleaire: partie.nucleaire,
      victoire: partie.victoire,
      difficulte: partie.difficulte
    } : null
  };
  avis = null, alertes = [];
  portee.postMessage(etat);
}
function tour() {
  const debut = performance.now();
  const dus = pret ? horloge.pasDus(debut - precedent) : 0;
  precedent = debut;
  let faits = 0;
  while (faits < dus && performance.now() - debut < BUDGET_MS) {
    unPas();
    faits++;
  }
  horloge.rendre(dus, faits);
  if (horloge.verifierRetard()) portee.postMessage({
    type: "retard",
    vitesse: horloge.vitesse
  });
  const fin = performance.now();
  pasFenetre += faits;
  occupeFenetre += fin - debut;
  if (fin - debutFenetre >= 1e3) {
    pasParSeconde = pasFenetre * 1e3 / (fin - debutFenetre);
    occupation = occupeFenetre / (fin - debutFenetre);
    debutFenetre = fin, pasFenetre = 0, occupeFenetre = 0;
  }
  envoyer(fin, false);
  setTimeout(tour, 8);
}
tour();
