// La scène du fond (#scene) : l'aube. Pendant le minuteur, le jour gagne l'écran par le bas ; à la fin, trois ondes
// partent de la coche et la nuit retombe. Économe : la toile est repeinte à 12 images par seconde, rien quand la page
// est cachée, et à pleine cadence seulement pendant les quelques secondes du retour à la nuit.
import { Aube } from './aube.js?v=20261111153509';

const IMAGES_PAR_SECONDE = 12;

export class Scene {
  constructor(racine) {
    this.r = racine;
    this.aube = new Aube(racine.querySelector('.aube'));
    this.actif = false;
    this.h = 0;            // la part du jour : 0 la nuit, 1 le plein jour
    this.anim = 0;
    this.horloge = 0;
    this.dernierPas = performance.now();
    this.calme = matchMedia('(prefers-reduced-motion: reduce)');
    this.progression = () => null;
    this.mesurer();
    addEventListener('resize', () => {
      clearTimeout(this.attente);
      this.attente = setTimeout(() => this.mesurer(), 150);
    });
    setInterval(() => this.pas(), 1000 / IMAGES_PAR_SECONDE);
  }

  mesurer() {
    this.aube.mesurer(innerWidth, innerHeight);
    this.peindre();
  }

  pas() {
    if (document.hidden) { this.dernierPas = performance.now(); return; }
    const p = this.progression();
    if (p !== null && this.actif && !this.anim) this.h = p;
    if (!this.anim) { this.avancerHorloge(); this.peindre(); }
  }

  peindre() {
    if (!document.hidden) this.aube.dessiner(this.h, this.horloge);
  }

  avancerHorloge() {
    const t = performance.now();
    if (!this.calme.matches) this.horloge += Math.min(0.5, (t - this.dernierPas) / 1000);
    this.dernierPas = t;
  }

  /// Retour animé de la part du jour vers la nuit, à pleine cadence.
  vers(cible, duree) {
    cancelAnimationFrame(this.anim);
    const de = this.h, t0 = performance.now();
    const pas = (t) => {
      const k = Math.min(1, (t - t0) / duree), e = k < 0.5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;
      this.h = de + (cible - de) * e;
      this.avancerHorloge();
      this.peindre();
      this.anim = k < 1 || this.aube.ondesEnCours ? requestAnimationFrame(pas) : 0;
    };
    this.anim = requestAnimationFrame(pas);
  }

  /// Un minuteur commence : il fait nuit, le jour va monter avec la progression.
  demarrer() {
    cancelAnimationFrame(this.anim);
    this.anim = 0;
    this.actif = true;
    this.h = 0;
    this.peindre();
  }

  /// Fin naturelle : trois ondes partent de la coche, la nuit retombe.
  finir() {
    this.actif = false;
    const coche = document.querySelector('#fin .coche')?.getBoundingClientRect();
    if (coche && coche.width) this.aube.lancerOndes(coche.left + coche.width / 2, coche.top + coche.height / 2);
    else this.aube.lancerOndes(innerWidth / 2, innerHeight * 0.4);
    this.vers(0, 4200);
  }

  /// Arrêt en cours de route : la nuit revient plus vite.
  arreter() {
    this.actif = false;
    this.vers(0, 2200);
  }

  repos() {}
}
