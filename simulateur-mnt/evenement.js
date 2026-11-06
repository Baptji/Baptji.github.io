/* Événement de pluie, sur le modèle du simulateur (rien de nouveau dans le calcul) :
 *  - pendant l'averse (durée du bloc Précipitations), chaque dépression reçoit le débit de pointe de son bassin,
 *    Q = C × i × aire drainée (méthode rationnelle, celle du « Remplie en … » de la lecture au curseur) ;
 *    son volume monte jusqu'au volume de débordement, puis elle déborde : V(t) = min(V plein, Q × t) ;
 *  - le niveau d'une dépression est celui dont le volume sous le niveau vaut V(t) (cellules du remplissage à plat) ;
 *  - les écoulements calculés coulent pendant la pluie et s'arrêtent avec elle (pas de décrue dans le modèle) :
 *    des traits blancs les parcourent dans le sens des directions D8, plus vite là où le débit est fort,
 *    et s'arrêtent à l'eau d'une dépression qui n'est pas encore pleine.
 * La page dessine la nappe des dépressions, les traits et les jauges ; le temps avance, ou se règle à la main. */

const NIVEAUX = 40;              // points de la courbe hauteur-volume de chaque dépression
const CELLULES_EAU = 250000;     // grille de la nappe : au plus 250 000 cellules (moyenne par blocs)
const TRAINE = 9;

export class Evenement {
  constructor(vue, { surImage }) {
    this.vue = vue;
    this.surImage = surImage;   // (etat) à chaque image : temps, bilan, facteur des écoulements
    this.pret = null;           // les tableaux du terrain et de la pluie (signature)
    this.actif = false;         // la nappe est montrée
    this.enMarche = false;
    this.t = 0;
    this.vitesse = 120;         // secondes d'événement par seconde
  }

  /** p = { g, r, signature, intensite (mm/h), dureeS, debitDepression(d) (m³/s), debitCellule(i) (m³/s), seuil (m³/s) } */
  preparer(p) {
    if (this.pret && this.pret.signature === p.signature) return;
    const { g, r } = p, n = g.lignes * g.colonnes, C = g.colonnes, A = g.pas * g.pas, et = r.etiquettes, deps = r.depressions;
    // Cellules des dépressions et leur courbe hauteur-volume.
    let nb = 0;
    for (let i = 0; i < n; i++) if (et[i] > 0) nb++;
    const f = Math.max(1, Math.ceil(Math.sqrt(n / CELLULES_EAU)));
    const w = Math.ceil(C / f), h = Math.ceil(g.lignes / f);
    const cel = new Int32Array(nb), dep = new Int32Array(nb), zc = new Float32Array(nb), rc = new Float32Array(nb), blc = new Int32Array(nb);
    const bas = new Float64Array(deps.length).fill(Infinity), haut = new Float64Array(deps.length).fill(-Infinity);
    for (let i = 0, k = 0; i < n; i++) {
      const e = et[i];
      if (e <= 0) continue;
      const l = (i / C) | 0, c = i - l * C;
      cel[k] = i; dep[k] = e - 1; zc[k] = g.z[i]; rc[k] = r.rempli[i]; blc[k] = ((l / f) | 0) * w + ((c / f) | 0);
      if (g.z[i] < bas[e - 1]) bas[e - 1] = g.z[i];
      if (r.rempli[i] > haut[e - 1]) haut[e - 1] = r.rempli[i];
      k++;
    }
    const L = new Float64Array(deps.length * NIVEAUX), V = new Float64Array(deps.length * NIVEAUX);
    for (let d = 0; d < deps.length; d++) for (let q = 0; q < NIVEAUX; q++) L[d * NIVEAUX + q] = bas[d] + (haut[d] - bas[d]) * q / (NIVEAUX - 1);
    for (let k = 0; k < nb; k++) {
      const d = dep[k], o = d * NIVEAUX, z = zc[k], r2 = rc[k];
      for (let q = 1; q < NIVEAUX; q++) { const x = Math.min(L[o + q], r2) - z; if (x > 0) V[o + q] += x * A; }
    }
    const volume = new Float64Array(deps.length), debit = new Float64Array(deps.length);
    for (let d = 0; d < deps.length; d++) { volume[d] = V[d * NIVEAUX + NIVEAUX - 1]; debit[d] = Math.max(0, p.debitDepression(deps[d])); }
    // Réseau parcouru par les traits : le débit affiché, en 255 crans (0 : hors réseau).
    const reseau = new Uint8Array(n), liste = [];
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(g.z[i]) || r.dir[i] < 0) continue;
      const q = p.debitCellule(i);
      if (!(q >= p.seuil)) continue;
      reseau[i] = 1 + Math.min(254, Math.round(254 * Math.log10(q / p.seuil) / 3));
      liste.push(i);
    }
    this.pret = { ...p, n, C, A, f, w, h, cel, dep, zc, rc, blc, L, V, volume, debit, niveau: new Float64Array(deps.length),
                  pleine: new Uint8Array(deps.length), reseau, liste: Int32Array.from(liste),
                  nappe: new Float32Array(w * h), echelle: [C / (f * w), g.lignes / (f * h)] };
    const nbt = Math.max(400, Math.min(3000, Math.round(liste.length / 8)));
    this.nb = nbt;
    this.pos = new Float32Array(nbt * 2); this.vie = new Float32Array(nbt); this.eclat = new Float32Array(nbt);
    this.traine = new Float32Array(nbt * TRAINE * 2);
    this.rubans = null;   // créés à la première image (vue.creerTraits)
    this.pasMaxi = Math.max(0.6, Math.max(C, g.lignes) / 260);
  }

  /** Fin de l'affichage (onglet quitté, terrain modifié, ↺) : la nappe et les traits disparaissent. */
  oublier() { this.arreter(); this.pret = null; }

  get duree() { return this.pret ? this.pret.dureeS : 0; }
  /** Au-delà de la pluie, un temps pour voir les écoulements s'arrêter. */
  get fin() { return this.duree * 1.2; }

  lancer() {
    if (!this.pret) return;
    if (this.t >= this.fin) this.t = 0;
    this.actif = true; this.enMarche = true;
    this.horloge = performance.now();
    cancelAnimationFrame(this.image);
    this.image = requestAnimationFrame(() => this.boucle());
  }
  pause() { this.enMarche = false; cancelAnimationFrame(this.image); this.image = 0; }
  arreter() {
    this.pause();
    if (this.actif) { this.vue.eau(null); this.vue.traits(null); }
    this.rubans = null;
    this.actif = false; this.t = 0;
  }
  /** Temps choisi à la main (barre de temps). */
  aller(t) {
    if (!this.pret) return;
    this.t = Math.max(0, Math.min(this.fin, t));
    this.actif = true;
    this.horloge = performance.now();
    this.dessiner(true);
  }

  boucle() {
    this.image = 0;
    if (!this.enMarche || !this.pret) return;
    const maintenant = performance.now();
    this.t = Math.min(this.fin, this.t + this.vitesse * Math.min(0.1, (maintenant - this.horloge) / 1000));
    this.horloge = maintenant;
    this.dessiner(true);
    if (this.t >= this.fin) { this.enMarche = false; this.surImage(this.etat()); return; }
    this.image = requestAnimationFrame(() => this.boucle());
  }

  /** Niveau (m NGF) de la dépression d au temps t, et si elle est pleine. */
  niveauA(d, t) {
    const P = this.pret, o = d * NIVEAUX;
    const v = Math.min(P.volume[d], P.debit[d] * Math.min(t, P.dureeS));
    if (v >= P.volume[d] * 0.9999) return [P.L[o + NIVEAUX - 1], true];
    let q = 1;
    while (q < NIVEAUX - 1 && P.V[o + q] < v) q++;
    const v0 = P.V[o + q - 1], v1 = P.V[o + q], f = v1 > v0 ? (v - v0) / (v1 - v0) : 0;
    return [P.L[o + q - 1] + f * (P.L[o + q] - P.L[o + q - 1]), false];
  }

  /** Hauteur d'eau (m) dans la cellule i au temps t (0 hors des dépressions). */
  profondeur(i, t) {
    const P = this.pret;
    if (!P) return 0;
    const e = P.r.etiquettes[i];
    if (e <= 0) return 0;
    const [niv] = this.niveauA(e - 1, t);
    return Math.max(0, Math.min(niv, P.r.rempli[i]) - P.g.z[i]);
  }

  /** Débit qui passe dans la cellule i au temps t (m³/s) : celui du modèle pendant la pluie, nul après. */
  debitEn(i, t) { return this.pret && t < this.pret.dureeS ? this.pret.debitCellule(i) : 0; }

  /** Facteur des écoulements : 1 pendant la pluie, puis ils s'éteignent en 10 % de sa durée. */
  facteur(t = this.t) { const T = this.duree; return t <= T ? 1 : Math.max(0, 1 - (t - T) / (0.1 * T)); }

  etat() {
    const P = this.pret, t = this.t;
    let pleines = 0, retenu = 0;
    let comptees = 0;
    for (let d = 0; d < P.volume.length; d++) {
      const v = Math.min(P.volume[d], P.debit[d] * Math.min(t, P.dureeS));
      retenu += v;
      if (P.r.depressions[d].profondeur < (P.profondeurMini || 0)) continue;   // comme l'affichage des dépressions
      comptees++;
      if (P.volume[d] > 0 && v >= P.volume[d] * 0.9999) pleines++;
    }
    return { t, duree: P.dureeS, fin: this.fin, pluieMm: P.intensite * Math.min(t, P.dureeS) / 3600, pleines, depressions: comptees,
             retenu, facteur: this.facteur(), enMarche: this.enMarche };
  }

  dessiner(avancer) {
    const P = this.pret, t = this.t;
    if (!P) return;
    // Niveaux des dépressions, puis la nappe (moyenne des hauteurs par bloc de la grille de l'eau).
    for (let d = 0; d < P.volume.length; d++) { const [niv, pleine] = this.niveauA(d, t); P.niveau[d] = niv; P.pleine[d] = pleine ? 1 : 0; }
    const nappe = P.nappe, part = 1 / (P.f * P.f);
    nappe.fill(0);
    for (let k = 0; k < P.cel.length; k++) {
      const x = Math.min(P.niveau[P.dep[k]], P.rc[k]) - P.zc[k];
      if (x > 0) nappe[P.blc[k]] += x * part;
    }
    this.vue.eau({ w: P.w, h: P.h, hauteur: nappe, echelle: P.echelle });
    if (!this.rubans || !this.vue.lignes) this.rubans = this.vue.creerTraits(this.nb * (TRAINE - 1));
    this.deplacerTraits(avancer);
    this.vue.traits(true);
    this.surImage(this.etat());
  }

  naitre(k) {
    const P = this.pret, L = P.liste;
    if (!L.length) return false;
    for (let essai = 0; essai < 10; essai++) {
      const i = L[(Math.random() * L.length) | 0];
      if (Math.random() * 255 > 40 + P.reseau[i]) continue;   // plus de traits là où le débit est fort
      const e = P.r.etiquettes[i];
      if (e > 0 && !P.pleine[e - 1]) continue;                 // eau d'une dépression qui se remplit : immobile
      const l = (i / P.C) | 0, x = i - l * P.C + Math.random(), y = l + Math.random();
      this.pos[2 * k] = x; this.pos[2 * k + 1] = y;
      this.vie[k] = 25 + Math.random() * 55;
      for (let q = 0; q < TRAINE; q++) { this.traine[(k * TRAINE + q) * 2] = x; this.traine[(k * TRAINE + q) * 2 + 1] = y; }
      return true;
    }
    return false;
  }

  deplacerTraits(avancer) {
    const P = this.pret, g = P.g, C = P.C, dir = P.r.dir, DL = Noyau.DL, DC = Noyau.DC;
    const fac = this.facteur(), monte = Math.max(0.15, 0.4 * g.pas) * this.vue.reglages.exageration;
    const D = this.rubans.debut, F = this.rubans.fin, Al = this.rubans.alpha, pt = [[0, 0, 0], [0, 0, 0]];
    for (let k = 0; k < this.nb; k++) {
      if (avancer) {
        let x = this.pos[2 * k], y = this.pos[2 * k + 1];
        const c = Math.floor(x), l = Math.floor(y), i = l * C + c;
        const dehors = c < 0 || l < 0 || c >= C || l >= g.lignes;
        const e = dehors ? 0 : P.r.etiquettes[i];
        if (this.vie[k] <= 0 || dehors || !P.reseau[i] || dir[i] < 0 || (e > 0 && !P.pleine[e - 1])) {
          if (fac <= 0 || Math.random() > fac || !this.naitre(k)) { this.vie[k] = 0; this.effacer(k); continue; }
          x = this.pos[2 * k]; y = this.pos[2 * k + 1];
        } else {
          // Vers le centre de la cellule aval, en lissant le coude ; plus vite où le débit est fort.
          const dk = dir[i], cx = c + 0.5 + DC[dk], cy = l + 0.5 + DL[dk];
          const vx = cx - x, vy = cy - y, nrm = Math.hypot(vx, vy) || 1;
          const pas = this.pasMaxi * (0.3 + 0.7 * P.reseau[i] / 255);
          x += vx / nrm * pas; y += vy / nrm * pas;
          this.pos[2 * k] = x; this.pos[2 * k + 1] = y;
          this.vie[k] -= 1;
          this.eclat[k] = 0.35 + 0.65 * P.reseau[i] / 255;
        }
        const T = this.traine, o = k * TRAINE * 2;
        T.copyWithin(o + 2, o, o + (TRAINE - 1) * 2);
        T[o] = x; T[o + 1] = y;
      }
      if (this.vie[k] <= 0) { this.effacer(k); continue; }
      const T = this.traine, o = k * TRAINE * 2, a = this.eclat[k] * fac;
      for (let q = 0; q < TRAINE - 1; q++) {
        for (let s = 0; s < 2; s++) {
          const px = T[o + (q + s) * 2], py = T[o + (q + s) * 2 + 1];
          const c = Math.max(0, Math.min(C - 1, Math.floor(px))), l = Math.max(0, Math.min(g.lignes - 1, Math.floor(py))), i = l * C + c;
          let z = g.z[i];
          if (Number.isNaN(z)) z = P.r.rempli[i];
          const e = P.r.etiquettes[i];
          if (e > 0) z = Math.max(z, Math.min(P.niveau[e - 1], P.r.rempli[i]));
          const m = this.vue.versMonde(px, py, z);
          pt[s][0] = m[0]; pt[s][1] = m[1] + monte; pt[s][2] = m[2];
        }
        // Ruban du segment : 4 sommets, la tête opaque, la queue qui s'efface.
        const v = (k * (TRAINE - 1) + q) * 4, aa = a * 0.95 * (1 - q / (TRAINE - 1)), ab = a * 0.95 * (1 - (q + 1) / (TRAINE - 1));
        for (let u = 0; u < 4; u++) {
          D[3 * (v + u)] = pt[0][0]; D[3 * (v + u) + 1] = pt[0][1]; D[3 * (v + u) + 2] = pt[0][2];
          F[3 * (v + u)] = pt[1][0]; F[3 * (v + u) + 1] = pt[1][1]; F[3 * (v + u) + 2] = pt[1][2];
        }
        Al[v] = Al[v + 1] = aa; Al[v + 2] = Al[v + 3] = ab;
      }
    }
  }

  effacer(k) {
    this.rubans.alpha.fill(0, k * (TRAINE - 1) * 4, (k + 1) * (TRAINE - 1) * 4);
  }
}
