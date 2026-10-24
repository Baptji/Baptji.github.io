// Réponse en fréquence au micro : par défaut les graves (20–300 Hz), chaque enceinte et leur
// somme ; « Tout le spectre » ajoute le niveau moyen des rayons. Un clic choisit la fréquence.
// En dB relatifs : 0 dB = niveau moyen de la somme sur la bande affichée (une réponse plate
// suivrait le 0) ; au-delà de ±12 dB, couplage trop fort ou annulation.

import { etat, abonner, reglage, gravesAutomatiques } from './etat.js?v=20261024222224';
import { fmaxOndes } from './calcul.js?v=20261024222224';
import { entrees } from './etat.js?v=20261024222224';

export const FMIN = 20, FMAX = 16000;
const TEINTES = ['#fb8c00', '#43a047', '#e91e63', '#8e24aa', '#fdd835', '#26a69a', '#00897b', '#795548'];

export class Courbe {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement('canvas');
    conteneur.append(this.canvas);
    new ResizeObserver(() => this.redimensionner()).observe(conteneur);
    this.redimensionner();
    abonner(() => this.dessiner());
    const choisir = (ev) => {
      const r = this.canvas.getBoundingClientRect(), x = ev.clientX - r.left, R = this.zone();
      if (x < R.x - 4 || x > R.x + R.w + 4) return;
      const [a, b] = this.bornes(), f = a * Math.pow(b / a, (x - R.x) / R.w);
      reglage('frequence', Math.round(Math.min(Math.max(f, a), b) * 10) / 10);
    };
    this.canvas.addEventListener('pointerdown', (ev) => { this.canvas.setPointerCapture(ev.pointerId); choisir(ev); });
    this.canvas.addEventListener('pointermove', (ev) => { if (ev.buttons) choisir(ev); });
  }

  redimensionner() {
    const r = this.conteneur.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    this.taille = [r.width, r.height];
    this.canvas.width = Math.max(1, Math.round(r.width * dpr)); this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.dessiner();
  }

  bornes() { return etat.courbeGraves ? [20, 300] : [FMIN, FMAX]; }
  zone() { return { x: 52, y: 8, w: Math.max(this.taille[0] - 70, 10), h: Math.max(this.taille[1] - 28, 10) }; }

  dessiner() {
    if (!etat.scene) return;
    const ctx = this.canvas.getContext('2d'), dpr = window.devicePixelRatio || 1, R = this.zone(), [fa, fb] = this.bornes();
    const css = getComputedStyle(document.documentElement);
    const doux = css.getPropertyValue('--texte-doux').trim() || '#888', texte = css.getPropertyValue('--texte').trim() || '#222', accent = css.getPropertyValue('--accent').trim() || '#3e9bfe';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.taille[0], this.taille[1]);
    const x = (f) => R.x + Math.log(f / fa) / Math.log(fb / fa) * R.w;
    const dans = (q) => q.f >= fa * 0.98 && q.f <= fb * 1.02;
    const visibles = etat.courbe.filter((q) => dans(q) && (!etat.courbeGraves || q.ondes));
    const sources = etat.courbesSources.map((c) => [c, c.points.filter(dans)]);
    // Référence : moyenne (en énergie) de la somme sur la bande affichée.
    const ref = visibles.length ? 10 * Math.log10(visibles.reduce((a, q) => a + Math.pow(10, q.db / 10), 0) / visibles.length) : 0;
    const hi = 18, lo = -24;
    const y = (v) => R.y + R.h - (Math.min(Math.max(v - ref, lo), hi) - lo) / (hi - lo) * R.h;
    // Bandes hors de ±12 dB.
    ctx.fillStyle = 'rgba(229,57,53,0.08)'; ctx.fillRect(R.x, R.y, R.w, y(ref + 12) - R.y);
    ctx.fillStyle = 'rgba(41,84,184,0.10)'; ctx.fillRect(R.x, y(ref - 12), R.w, R.y + R.h - y(ref - 12));
    ctx.font = '10px -apple-system, system-ui, sans-serif';
    const fo = fmaxOndes(entrees());
    if (!etat.courbeGraves && fo > 0 && fo < fb) {
      const x0 = x(Math.max(fo, fa));
      ctx.fillStyle = 'rgba(251,140,0,0.07)'; ctx.fillRect(x0, R.y, R.x + R.w - x0, R.h);
      ctx.fillStyle = 'rgba(251,140,0,0.9)'; ctx.textAlign = 'center'; ctx.fillText('niveau moyen (rayons), sans les interférences', (x0 + R.x + R.w) / 2, R.y + 10);
    }
    const reperes = etat.courbeGraves ? [20, 30, 40, 50, 60, 80, 100, 150, 200, 300] : [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
    ctx.lineWidth = 0.5; ctx.textBaseline = 'top';
    for (const g of reperes) {
      ctx.strokeStyle = 'rgba(128,128,128,0.25)'; ctx.beginPath(); ctx.moveTo(x(g), R.y); ctx.lineTo(x(g), R.y + R.h); ctx.stroke();
      ctx.fillStyle = doux; ctx.textAlign = 'center'; ctx.fillText(g >= 1000 ? `${g / 1000} k` : `${g}`, x(g), R.y + R.h + 4);
    }
    ctx.textAlign = 'right'; ctx.fillText('Hz', R.x - 8, R.y + R.h + 4);
    ctx.textBaseline = 'middle';
    for (let v = lo; v <= hi; v += 6) {
      ctx.strokeStyle = `rgba(128,128,128,${v === 0 ? 0.7 : Math.abs(v) === 12 ? 0.45 : 0.15})`; ctx.lineWidth = v === 0 ? 1 : 0.5;
      ctx.beginPath(); ctx.moveTo(R.x, y(ref + v)); ctx.lineTo(R.x + R.w, y(ref + v)); ctx.stroke();
      if (v % 12 === 0) { ctx.fillStyle = doux; ctx.fillText(v > 0 ? `+${v} dB` : v < 0 ? `−${-v} dB` : '0 dB', R.x - 5, y(ref + v)); }
    }
    ctx.lineWidth = 0.5;
    const trace = (pts, teinte, ep) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      let dedans = false;
      for (const q of pts) {
        if (q.db - ref < lo) { dedans = false; continue; }
        if (dedans) ctx.lineTo(x(q.f), y(q.db)); else ctx.moveTo(x(q.f), y(q.db));
        dedans = true;
      }
      ctx.strokeStyle = teinte; ctx.lineWidth = ep; ctx.lineJoin = 'round'; ctx.stroke();
    };
    sources.forEach(([, pts], k) => { ctx.globalAlpha = 0.8; trace(pts, TEINTES[k % TEINTES.length], 1); ctx.globalAlpha = 1; });
    trace(visibles.filter((q) => q.ondes), accent, 2);
    const rayons = visibles.filter((q) => !q.ondes);
    trace(rayons, '#fb8c00', 1.3);
    ctx.fillStyle = '#fb8c00';
    for (const q of rayons) { ctx.beginPath(); ctx.arc(x(q.f), y(q.db), 2, 0, 2 * Math.PI); ctx.fill(); }
    if (sources.length) {
      let ly = R.y + 10;
      [['Somme', accent]].concat(sources.map(([c], k) => [c.nom, TEINTES[k % TEINTES.length]])).forEach(([nom, t]) => {
        ctx.strokeStyle = t; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(R.x + R.w - 130, ly); ctx.lineTo(R.x + R.w - 114, ly); ctx.stroke();
        ctx.fillStyle = texte; ctx.textAlign = 'left'; ctx.fillText(nom, R.x + R.w - 108, ly); ly += 13;
      });
    }
    if (etat.courbeGraves && !visibles.some((q) => q.ondes)) {
      const t = etat.enCours ? `Calcul des graves… ${Math.round(etat.progression * 100)} %`
        : (etat.webgpu === false ? 'Graves indisponibles : ce navigateur n’a pas WebGPU (Chrome, Edge ou Safari récents)'
          : (gravesAutomatiques() ? 'Calcul des graves dans un instant…' : 'Graves à calculer : bouton « Calculer les graves » en haut'));
      ctx.fillStyle = doux; ctx.font = '13px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(t, R.x + R.w / 2, R.y + R.h / 2);
    }
    if (etat.mode !== 'global' && etat.frequence >= fa && etat.frequence <= fb) {
      ctx.strokeStyle = 'rgba(229,57,53,0.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x(etat.frequence), R.y); ctx.lineTo(x(etat.frequence), R.y + R.h); ctx.stroke();
    }
  }
}
