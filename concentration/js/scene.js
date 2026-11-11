// La scène du fond (#scene) : couleurs du ciel et de la mer, soleil, lune, un point par minute, ondes de la fin.
// Économe : tout le décor avance au pas d'une seule horloge à 12 images par seconde (les animations CSS sans fin sont
// suspendues et recalées à chaque pas), rien ne bouge quand la page est cachée, et les couleurs ne sont repeintes que
// toutes les 2 secondes (elles changent trop lentement pour qu'on voie les marches). Seuls les passages jour ↔ nuit,
// quelques secondes, sont animés à pleine cadence.
import { geometrie, pointCourse, hauteurSoleil, reperes, palette, melange, NUIT, eclat } from './modele.js?v=20261111153017';
import { Aube } from './aube.js?v=20261111153017';

const NS = 'http://www.w3.org/2000/svg';
const IMAGES_PAR_SECONDE = 12;
const VARIABLES = { haut: '--c-haut', milieu: '--c-milieu', horizon: '--c-horizon', soleil: '--c-soleil', halo: '--c-halo',
  merHaut: '--c-mer-haut', merBas: '--c-mer-bas', nuage: '--c-nuage' };

export class Scene {
  constructor(racine) {
    this.r = racine;
    this.course = racine.querySelector('.course');
    this.ciel = racine.querySelector('.etoiles');
    this.p = 0;
    this.actif = false;
    this.pal = NUIT;
    this.anim = 0;
    this.prochaineTeinte = 0;
    this.progression = () => null;
    this.debuts = new WeakMap();
    // le fond « Aube » : h est la part du jour, qui suit la progression puis redescend à la nuit
    this.aube = new Aube(racine.querySelector('.aube'));
    this.fond = 'mer';
    this.h = 0;
    this.animJour = 0;
    this.calme = matchMedia('(prefers-reduced-motion: reduce)');
    this.horloge = 0;
    this.dernierPas = performance.now();
    this.appliquer(NUIT);
    this.mesurer();
    addEventListener('resize', () => {
      clearTimeout(this.attente);
      this.attente = setTimeout(() => this.mesurer(), 150);
    });
    this.recaler = typeof racine.getAnimations === 'function';
    if (this.recaler) racine.classList.add('au-pas');
    setInterval(() => this.pas(), 1000 / IMAGES_PAR_SECONDE);
  }

  /// Le fond : « mer » (la journée sur la mer) ou « aube » (le jour qui monte).
  choisirFond(nom, sansFondu) {
    this.fond = nom === 'aube' ? 'aube' : 'mer';
    if (sansFondu) this.r.classList.add('fige');
    this.r.classList.toggle('fond-aube', this.fond === 'aube');
    if (this.fond === 'aube') this.peindreAube();
    if (sansFondu) requestAnimationFrame(() => requestAnimationFrame(() => this.r.classList.remove('fige')));
  }

  peindreAube() {
    if (this.fond === 'aube' && !document.hidden) this.aube.dessiner(this.h, this.horloge);
  }

  /// Retour animé de la part du jour vers une valeur (la nuit à la fin), à pleine cadence.
  glisserJour(vers, duree) {
    cancelAnimationFrame(this.animJour);
    const de = this.h, t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / duree), e = k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;
      this.h = de + (vers - de) * e;
      this.avancerHorloge();
      this.peindreAube();
      this.animJour = k < 1 || this.aube.ondesEnCours ? requestAnimationFrame(pas) : 0;
    };
    this.animJour = requestAnimationFrame(pas);
  }

  avancerHorloge() {
    const t = performance.now();
    if (!this.calme.matches) this.horloge += Math.min(0.5, (t - this.dernierPas) / 1000);
    this.dernierPas = t;
  }

  /// Un pas de l'horloge : les animations sans fin du décor sont recalées sur le temps de la page, le soleil avance.
  pas() {
    if (document.hidden) { this.dernierPas = performance.now(); return; }
    const p = this.progression();
    if (p !== null && this.actif) this.avancer(p);
    if (this.fond === 'aube') {
      if (!this.animJour) { this.avancerHorloge(); this.peindreAube(); }
      return;   // le décor de la mer est caché : rien à recaler
    }
    if (!this.recaler) return;
    const t = document.timeline.currentTime;
    for (const a of this.r.getAnimations({ subtree: true })) {
      if (!a.effect || a.effect.getTiming().iterations !== Infinity) continue;
      if (!this.debuts.has(a)) this.debuts.set(a, t);   // chaque animation part de son début (les ondes, par exemple)
      a.currentTime = t - this.debuts.get(a);
    }
  }

  /// Tout ce qui dépend de la taille de l'écran.
  mesurer() {
    const L = innerWidth, H = innerHeight, g = geometrie(L, H);
    this.g = g;
    document.documentElement.style.setProperty('--yh', g.horizon + 'px');
    const s = this.r.style;
    s.setProperty('--r', g.rayon + 'px');
    s.setProperty('--lx', Math.round(L * (L < 600 ? 0.8 : 0.78)) + 'px');
    s.setProperty('--ly', Math.round(Math.max(g.horizon * 0.3, 96 + g.rayon)) + 'px');
    s.setProperty('--fx', Math.round(pointCourse(g, 1).x) + 'px');
    this.aube.mesurer(L, H);
    this.peindreAube();
    this.dessinerEtoiles();
    this.placerReperes();
    this.placer(true);
  }

  /// Deux couches d'étoiles, qui scintillent chacune à son rythme ; plus rares vers l'horizon.
  dessinerEtoiles() {
    const L = this.g.L, H = this.g.horizon, d = Math.min(1.5, devicePixelRatio || 1);
    const toiles = this.ciel.querySelectorAll('canvas');
    let graine = 20261030;
    const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
    const ctx = [...toiles].map((c) => {
      c.width = Math.round(L * d); c.height = Math.round(H * d);
      c.style.width = L + 'px'; c.style.height = H + 'px';
      const x = c.getContext('2d');
      x.scale(d, d);
      return x;
    });
    const n = Math.round((L * H) / 2600);
    for (let i = 0; i < n; i++) {
      const x = hasard() * L, y = Math.pow(hasard(), 1.4) * H;
      const r = 0.45 + Math.pow(hasard(), 4) * 1.4, a = (0.3 + hasard() * 0.7) * (1 - (y / H) * 0.75);
      const c = ctx[i % 2];
      if (r > 1.35) {
        c.fillStyle = `rgba(210,205,255,${(a * 0.18).toFixed(3)})`;
        c.beginPath(); c.arc(x, y, r * 3.2, 0, Math.PI * 2); c.fill();
      }
      c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
  }

  appliquer(pal) {
    this.pal = pal;
    for (const [cle, v] of Object.entries(VARIABLES)) this.r.style.setProperty(v, pal[cle]);
    this.ciel.style.opacity = pal.etoiles.toFixed(3);
  }

  /// Passage animé d'une palette à l'autre (aube, crépuscule, nuit).
  teinter(vers, duree) {
    cancelAnimationFrame(this.anim);
    const de = this.pal, t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / duree), e = k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;
      this.appliquer(melange(de, typeof vers === 'function' ? vers() : vers, e));
      this.anim = k < 1 ? requestAnimationFrame(pas) : 0;
    };
    this.anim = requestAnimationFrame(pas);
    this.prochaineTeinte = performance.now() + duree + 50;
  }

  /// Soleil, halo et reflet à la progression courante.
  placer(sansTransition) {
    const g = this.g, pt = pointCourse(g, this.p), h = hauteurSoleil(g, this.p), s = this.r.style;
    if (sansTransition) this.r.classList.add('fige');
    s.setProperty('--sx', pt.x.toFixed(1) + 'px');
    s.setProperty('--sy', pt.y.toFixed(1) + 'px');
    s.setProperty('--eclat', this.actif ? eclat(h).toFixed(3) : '0');
    // le chemin de lumière sur l'eau est plus fort quand le soleil est bas
    const bas = 0.55 + 0.45 * (1 - Math.sin(Math.PI * this.p));
    s.setProperty('--eclat-reflet', this.actif ? (eclat(h - 0.8) * bas).toFixed(3) : '0');
    if (sansTransition) requestAnimationFrame(() => requestAnimationFrame(() => this.r.classList.remove('fige')));
  }

  creerReperes(minutes) {
    const ps = reperes(minutes), r = Math.max(1.6, Math.min(3.2, this.g.rayon * 0.075));
    const pas = Math.min(32, 1400 / ps.length);
    this.course.replaceChildren(...ps.map((p, k) => {
      const c = document.createElementNS(NS, 'circle');
      c.dataset.p = p;
      c.setAttribute('r', r.toFixed(2));
      c.style.setProperty('--retard', `${Math.round(400 + k * pas)}ms`);
      return c;
    }));
    this.course.classList.remove('efface');
    this.placerReperes();
  }

  placerReperes() {
    const { L, H } = this.g;
    this.course.setAttribute('viewBox', `0 0 ${L} ${H}`);
    this.course.setAttribute('width', L);
    this.course.setAttribute('height', H);
    for (const c of this.course.children) {
      const pt = pointCourse(this.g, Number(c.dataset.p));
      c.setAttribute('cx', pt.x.toFixed(1));
      c.setAttribute('cy', pt.y.toFixed(1));
    }
  }

  /// Un minuteur commence : la lune se couche, l'aube point, les points des minutes se posent sur la course.
  demarrer(minutes) {
    this.actif = true;
    this.p = 0;
    cancelAnimationFrame(this.animJour);
    this.animJour = 0;
    this.h = 0;
    this.r.classList.remove('ondes-actives');
    this.r.classList.add('lune-couchee', 'actif');
    this.creerReperes(minutes);
    this.placer(true);
    this.teinter(() => palette(this.p), 2600);
  }

  avancer(p) {
    this.p = p;
    if (!this.animJour) this.h = p;
    this.placer(false);
    for (const c of this.course.children) if (!c.classList.contains('passe') && Number(c.dataset.p) <= p + 1e-9) c.classList.add('passe');
    const t = performance.now();
    if (!this.anim && t >= this.prochaineTeinte) {
      this.prochaineTeinte = t + 2000;
      this.appliquer(palette(p));
    }
  }

  /// Fin naturelle : le soleil est couché, des ondes partent sur l'eau, la nuit tombe, la lune revient.
  finir() {
    this.p = 1;
    this.actif = false;
    this.placer(false);
    this.r.classList.remove('actif');
    this.r.classList.add('ondes-actives');
    this.course.classList.add('efface');
    this.teinter(NUIT, 4200);
    const coche = document.querySelector('#fin .coche')?.getBoundingClientRect();
    if (coche && coche.width) this.aube.lancerOndes(coche.left + coche.width / 2, coche.top + coche.height / 2);
    else this.aube.lancerOndes(this.g.L / 2, this.g.horizon / 2);
    this.glisserJour(0, 4200);
    clearTimeout(this.lever);
    this.lever = setTimeout(() => this.r.classList.remove('lune-couchee'), 1800);
  }

  /// Arrêt en cours de route : le soleil s'efface, la nuit revient plus vite.
  arreter() {
    this.actif = false;
    this.r.classList.remove('actif');
    this.placer(false);
    this.course.classList.add('efface');
    this.teinter(NUIT, 2200);
    this.glisserJour(0, 2200);
    clearTimeout(this.lever);
    this.lever = setTimeout(() => this.r.classList.remove('lune-couchee'), 500);
  }

  /// Retour à l'accueil après la fin.
  repos() {
    this.r.classList.remove('ondes-actives');
  }
}
