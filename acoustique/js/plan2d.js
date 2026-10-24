// Carte 2D : plan à la hauteur d'écoute ou coupe passant par le micro ; murs, toit, volumes,
// enceintes, micro, règles, cotes ; édition de la pièce dessinée. Traduction de Toile.swift.

import { v2, turbo, divergente, cssMateriau, dansPolygone } from './base.js';
import { polyedre, axe, estOuvert, dansContour } from './modele.js';
import { coinsPlan, murDuPlan, normalePlan, toit, origine, cotes, contacts, couper, idMur, EPAISSEUR, poigneesBloc } from './plan.js';
import { etat, abonner, modifier, deplacerCoin, insererCoin, supprimerCoin, pousserMur, finirEditionPlan, deplacerObjet, tournerObjet, etirerBloc,
  hautEchelle, notifier } from './etat.js';
import { flechePoignee } from './vue3d.js';
import { valeurRaster } from './calcul.js';

export class Plan2D {
  constructor(conteneur) {
    this.conteneur = conteneur;
    this.canvas = document.createElement('canvas');
    conteneur.append(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.image = document.createElement('canvas');
    this.cible = null; this.survol = null; this.dernierCoin = null;
    new ResizeObserver(() => this.redimensionner()).observe(conteneur);
    this.redimensionner();
    abonner(() => { this.besoin = true; });
    this.souris();
    const boucle = () => {
      const anime = (etat.animer && etat.raster && etat.raster.phaseurs) || etat.enCours;
      if ((this.besoin || anime) && this.conteneur.offsetParent) { this.besoin = false; this.dessiner(); }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  }

  redimensionner() {
    const r = this.conteneur.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    this.taille = [r.width, r.height];
    this.canvas.width = Math.max(1, Math.round(r.width * dpr)); this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.besoin = true;
  }

  get vue() { return etat.affichage === 'coupe' ? 'coupe' : 'plan'; }
  get scene() { return etat.scene; }
  get hauteurMonde() { return this.vue === 'plan' ? this.scene.largeur : this.scene.hauteur; }
  get edition() { return etat.editionPlan && this.scene.plan && this.vue === 'plan'; }
  get bord() { return this.edition ? Math.max(1.0, 0.15 * Math.max(this.scene.longueur, this.scene.largeur)) : 0; }

  /// Rectangle de la boîte de calcul dans la vue (avec de la place autour pour l'agrandir en édition).
  cadre() {
    const marge = 40, [W, H] = this.taille;
    const dispo = [Math.max(W - 2 * marge, 10), Math.max(H - 2 * marge, 10)];
    const b = this.bord, lm = this.scene.longueur + 2 * b, hm = this.hauteurMonde + 2 * b, r = hm / lm;
    let w = dispo[0], h = w * r;
    if (h > dispo[1]) { h = dispo[1]; w = h / r; }
    const k = w / lm;
    return { x: (W - w) / 2 + b * k, y: (H - h) / 2 + b * k, w: w - 2 * b * k, h: h - 2 * b * k };
  }
  versVue(u, v, c) { return [c.x + u / this.scene.longueur * c.w, c.y + c.h - v / this.hauteurMonde * c.h]; }
  versMonde(p, c) { return [(p[0] - c.x) / c.w * this.scene.longueur, (c.y + c.h - p[1]) / c.h * this.hauteurMonde]; }
  coord(e) { return this.vue === 'plan' ? [e.x, e.y] : [e.x, e.z]; }

  // MARK: Dessin

  dessiner() {
    const ctx = this.ctx, dpr = window.devicePixelRatio || 1, s = this.scene, c = this.cadre();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--fond-vue') || '#9a9a9a';
    ctx.fillRect(0, 0, this.taille[0], this.taille[1]);
    this.fond(c);
    if (this.edition) this.grille(c);
    const contour = this.vue === 'plan' ? (s.contour || []) : [];
    if (contour.length < 3) {
      const coins = [[0, 0], [s.longueur, 0], [s.longueur, this.hauteurMonde], [0, this.hauteurMonde]].map((p) => this.versVue(p[0], p[1], c));
      const cotes4 = this.vue === 'plan' ? [[0, 3, 0], [1, 2, 1], [0, 1, 2], [3, 2, 3]] : [[0, 3, 0], [1, 2, 1], [0, 1, 4], [3, 2, 5]];
      for (const [a, b, cote] of cotes4) {
        ctx.beginPath(); ctx.moveTo(...coins[a]); ctx.lineTo(...coins[b]);
        if (estOuvert(s.faces[cote])) { ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; }
        else { ctx.setLineDash([]); ctx.strokeStyle = 'rgba(20,20,20,0.85)'; ctx.lineWidth = 3.5; }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // Ligne de coupe (plan) ou hauteur d'écoute (coupe).
    ctx.beginPath();
    if (this.vue === 'plan') { ctx.moveTo(...this.versVue(0, s.micro[1], c)); ctx.lineTo(...this.versVue(s.longueur, s.micro[1], c)); }
    else { ctx.moveTo(...this.versVue(0, s.ecoute, c)); ctx.lineTo(...this.versVue(s.longueur, s.ecoute, c)); }
    ctx.setLineDash([2, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    if (contour.length > 2) {
      ctx.beginPath(); contour.forEach((p, i) => (i ? ctx.lineTo(...this.versVue(p[0], p[1], c)) : ctx.moveTo(...this.versVue(p[0], p[1], c)))); ctx.closePath();
      ctx.strokeStyle = 'rgba(20,20,20,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
    }
    if (s.plan) this.toit(c);
    for (const b of s.blocs) if (b.duPlan == null) this.dessinerBloc(b, c);
    if (s.plan && this.vue === 'plan') this.poignees(c);
    if (this.vue === 'plan') this.cotesSelection(c);
    for (const e of s.enceintes) this.dessinerEnceinte(e, c);
    this.dessinerPoignees(c);
    // Micro.
    const m = this.versVue(...(this.vue === 'plan' ? [s.micro[0], s.micro[1]] : [s.micro[0], s.ecoute]), c);
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.arc(m[0], m[1], 7, 0, 2 * Math.PI); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(m[0] - 11, m[1]); ctx.lineTo(m[0] + 11, m[1]); ctx.moveTo(m[0], m[1] - 11); ctx.lineTo(m[0], m[1] + 11); ctx.stroke();
    this.regles(c);
    ctx.font = '11px -apple-system, system-ui, sans-serif'; ctx.fillStyle = 'rgba(30,30,30,0.75)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(this.vue === 'plan' ? `Plan à ${s.ecoute.toFixed(2)} m du sol` : `Coupe à y = ${(s.micro[1] - origine(s)[1]).toFixed(2)} m`, c.x, c.y - 12);
    if (this.survol) this.bulle(c);
  }

  fond(c) {
    const ctx = this.ctx, r = etat.raster, s = this.scene;
    let l, h, remplir;
    if (etat.enCours && etat.apercu && this.vue === 'plan') {
      const a = etat.apercu;
      let m = 1e-12; for (const v of a.valeurs) if (!isNaN(v)) m = Math.max(m, Math.abs(v));
      l = a.l; h = a.h;
      remplir = (px) => {
        for (let k = 0; k < l * h; k++) {
          const v = a.valeurs[k];
          if (isNaN(v)) continue;
          const x = ((k % l) + 0.5) / l * s.longueur, y = (Math.floor(k / l) + 0.5) / h * s.largeur;
          if (!dansPolygone(x, y, s.contour)) continue;
          const u = v / m, col = divergente(Math.sign(u) * Math.sqrt(Math.abs(u)));
          const j = ((h - 1 - Math.floor(k / l)) * l + (k % l)) * 4;
          px[j] = col[0]; px[j + 1] = col[1]; px[j + 2] = col[2]; px[j + 3] = 255;
        }
      };
    } else if (r && r.vue === this.vue) {
      l = r.l; h = r.h;
      const anime = etat.animer && r.phaseurs ? (performance.now() / 1000 % 1.6) / 1.6 * 2 * Math.PI : null;
      const haut = hautEchelle(), plage = etat.plage, co = Math.cos(anime || 0), si = Math.sin(anime || 0);
      remplir = (px) => {
        for (let k = 0; k < l * h; k++) {
          const v = r.db[k], j = ((h - 1 - Math.floor(k / l)) * l + (k % l)) * 4;
          let col;
          if (isNaN(v)) col = [60, 60, 64];
          else if (anime != null) col = divergente(r.phaseurs[2 * k] * co - r.phaseurs[2 * k + 1] * si);
          else if (!isFinite(v)) col = [20, 20, 40];
          else col = turbo((v - (haut - plage)) / plage);
          px[j] = col[0]; px[j + 1] = col[1]; px[j + 2] = col[2]; px[j + 3] = 255;
        }
      };
    } else return;
    this.image.width = l; this.image.height = h;
    const ic = this.image.getContext('2d'), img = ic.createImageData(l, h);
    remplir(img.data);
    ic.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.image, c.x, c.y, c.w, c.h);
  }

  grille(c) {
    const ctx = this.ctx, pl = this.scene.plan, b = this.bord, k = c.w / this.scene.longueur;
    let pas = pl.pas;
    while (pas * k < 9) pas *= 2;
    const [ox, oy] = pl.decalage, s = this.scene;
    const traits = (deb, fin, o, f) => { for (let i = Math.floor((deb - o) / pas); o + i * pas <= fin; i++) { const v = o + i * pas; f(v, Math.abs((v - o) - Math.round(v - o)) < 1e-6); } };
    const fin = new Path2D(), fort = new Path2D();
    traits(-b, s.longueur + b, ox, (x, m) => { const p = m ? fort : fin; p.moveTo(...this.versVue(x, -b, c)); p.lineTo(...this.versVue(x, s.largeur + b, c)); });
    traits(-b, s.largeur + b, oy, (y, m) => { const p = m ? fort : fin; p.moveTo(...this.versVue(-b, y, c)); p.lineTo(...this.versVue(s.longueur + b, y, c)); });
    ctx.lineWidth = 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke(fin);
    ctx.lineWidth = 0.7; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke(fort);
  }

  /// Toit : en plan, les zones sous un rampant (plus sombres sous la hauteur d'écoute) ; en coupe, sa vraie section.
  toit(c) {
    const ctx = this.ctx, s = this.scene, t = toit(s);
    if (!t) return;
    if (this.vue === 'plan') {
      for (const f of t.faces()) {
        if (f.mur == null) continue;
        const r = t.bord(f.mur), pts = f.points.map((p) => [p[0], p[1]]);
        const chemin = (ps) => { ctx.beginPath(); ps.forEach((p, i) => (i ? ctx.lineTo(...this.versVue(p[0], p[1], c)) : ctx.moveTo(...this.versVue(p[0], p[1], c)))); ctx.closePath(); };
        chemin(pts); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
        const bas = couper(pts, r.g, r.c - s.ecoute);
        if (bas.length >= 3) { chemin(bas); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(); }
      }
    } else {
      const y0 = s.micro[1];
      ctx.beginPath(); ctx.moveTo(...this.versVue(0, s.hauteur, c));
      for (let x = 0; x <= s.longueur + 1e-9; x += 0.01) ctx.lineTo(...this.versVue(x, dansContour(s, x, y0) ? t.hauteur([x, y0])[0] : 0, c));
      ctx.lineTo(...this.versVue(s.longueur, s.hauteur, c)); ctx.closePath();
      ctx.fillStyle = 'rgba(140,140,140,0.85)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  /// Contour d'un volume dans la vue (enveloppe convexe de ses sommets projetés).
  enveloppe(b, c) {
    const pts = polyedre(b).sommets.map((p) => (this.vue === 'plan' ? this.versVue(p[0], p[1], c) : this.versVue(p[0], p[2], c)))
      .sort((a, d) => (a[0] === d[0] ? a[1] - d[1] : a[0] - d[0]));
    if (pts.length < 3) return pts;
    const cr = (o, a, d) => (a[0] - o[0]) * (d[1] - o[1]) - (a[1] - o[1]) * (d[0] - o[0]);
    const bas = [], haut = [];
    for (const p of pts) { while (bas.length >= 2 && cr(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop(); bas.push(p); }
    for (const p of pts.slice().reverse()) { while (haut.length >= 2 && cr(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop(); haut.push(p); }
    return bas.slice(0, -1).concat(haut.slice(0, -1));
  }

  dessinerBloc(b, c) {
    const ctx = this.ctx, poly = this.enveloppe(b, c);
    if (poly.length < 3) return;
    const sel = etat.selection === b.id;
    ctx.beginPath(); poly.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
    if (b.forme === 'ouverture') {
      ctx.setLineDash([4, 3]); ctx.strokeStyle = sel ? '#fb8c00' : 'rgb(102,178,255)'; ctx.lineWidth = sel ? 2.5 : 2; ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.globalAlpha = 0.35; ctx.fillStyle = cssMateriau(b.materiau); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = sel ? '#fb8c00' : 'rgba(255,255,255,0.8)'; ctx.lineWidth = sel ? 2 : 1; ctx.stroke();
    }
    const h = poly.reduce((m, p) => (p[1] < m[1] ? p : m));
    ctx.font = '10px -apple-system, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = sel ? '#fb8c00' : 'rgba(255,255,255,0.9)';
    ctx.fillText(b.nom, poly.reduce((a, p) => a + p[0], 0) / poly.length, h[1] + 9);
  }

  dessinerEnceinte(e, c) {
    const ctx = this.ctx, sel = etat.selection === e.id;
    const teinte = !e.active ? '#999' : (sel ? '#fb8c00' : '#fff');
    const a = axe(e), b = [-a[1], a[0], 0], o = [e.x, e.y, e.z];
    const pt = (p) => (this.vue === 'plan' ? this.versVue(p[0], p[1], c) : this.versVue(p[0], p[2], c));
    const centre = pt(o);
    if (e.genre === 'enceinte' || e.genre === 'caisson') {
      const w = e.largeur / 2, d = e.profondeur;
      if (this.vue === 'plan') {
        const q = [[o[0] + b[0] * w, o[1] + b[1] * w, 0], [o[0] - b[0] * w, o[1] - b[1] * w, 0], [o[0] - b[0] * w - a[0] * d, o[1] - b[1] * w - a[1] * d, 0], [o[0] + b[0] * w - a[0] * d, o[1] + b[1] * w - a[1] * d, 0]].map(pt);
        ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fill(); ctx.strokeStyle = teinte; ctx.lineWidth = sel ? 2 : 1.2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[1]); ctx.lineWidth = 3; ctx.stroke();
      } else {
        const xs = [o[0] + b[0] * w, o[0] - b[0] * w, o[0] - b[0] * w - a[0] * d, o[0] + b[0] * w - a[0] * d];
        const p0 = this.versVue(Math.min(...xs), e.z + e.hauteur / 2, c), p1 = this.versVue(Math.max(...xs), e.z - e.hauteur / 2, c);
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(p0[0], p0[1], Math.max(p1[0] - p0[0], 3), Math.max(p1[1] - p0[1], 3));
        ctx.strokeStyle = teinte; ctx.lineWidth = sel ? 2 : 1.2; ctx.strokeRect(p0[0], p0[1], Math.max(p1[0] - p0[0], 3), Math.max(p1[1] - p0[1], 3));
      }
    } else if (e.genre === 'nu') {
      const w = e.baffle / 2;
      ctx.beginPath();
      if (this.vue === 'plan') { ctx.moveTo(...pt([o[0] + b[0] * w, o[1] + b[1] * w, 0])); ctx.lineTo(...pt([o[0] - b[0] * w, o[1] - b[1] * w, 0])); }
      else { ctx.moveTo(...this.versVue(e.x, e.z - w, c)); ctx.lineTo(...this.versVue(e.x, e.z + w, c)); }
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = teinte; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(centre[0], centre[1], 6, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fill(); ctx.strokeStyle = teinte; ctx.lineWidth = 2; ctx.stroke();
    }
    if (this.vue === 'plan' && e.genre !== 'omni') {
      const bout = [centre[0] + a[0] * 26, centre[1] - a[1] * 26];
      ctx.beginPath(); ctx.moveTo(...centre); ctx.lineTo(...bout); ctx.strokeStyle = teinte; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(bout[0], bout[1], 2.5, 0, 2 * Math.PI); ctx.fillStyle = teinte; ctx.fill();
    }
    ctx.font = `${sel ? '600 ' : ''}10px -apple-system, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = teinte;
    ctx.fillText(e.nom, centre[0], centre[1] + 18);
  }

  /// Une cote : trait fin, petits traits aux bouts, texte au milieu dans l'axe du trait.
  cote(a, b, texte, teinte) {
    const ctx = this.ctx, d = v2.sub(b, a), l = v2.len(d);
    if (l <= 4) return;
    const u = v2.mul(d, 1 / l), v = [-u[1] * 4, u[0] * 4];
    ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b);
    for (const e of [a, b]) { ctx.moveTo(e[0] - v[0], e[1] - v[1]); ctx.lineTo(e[0] + v[0], e[1] + v[1]); }
    ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = teinte; ctx.stroke();
    let ang = Math.atan2(d[1], d[0]);
    if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
    ctx.save();
    ctx.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); ctx.rotate(ang);
    ctx.font = '600 10px -apple-system, system-ui, sans-serif';
    const w = ctx.measureText(texte).width;
    if (w + 6 < l) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(-w / 2 - 3, -7, w + 6, 14, 3); ctx.fill();
      ctx.fillStyle = teinte; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(texte, 0, 0.5);
    }
    ctx.restore();
  }

  /// Murs (rampants en tirets), cotes intérieures, « + » des milieux, coins.
  poignees(c) {
    const ctx = this.ctx, s = this.scene, pl = s.plan, qm = coinsPlan(s), q = qm.map((p) => this.versVue(p[0], p[1], c)), n = q.length;
    if (n < 3) return;
    const ms = murDuPlan(s, etat.selection), k = c.w / s.longueur;
    for (let i = 0; i < n; i++) {
      const a = q[i], b = q[(i + 1) % n];
      if (pl.murs[i].rampant) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.setLineDash([7, 4]); ctx.strokeStyle = 'rgba(255,191,89,0.9)'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); }
      if (ms === i) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.strokeStyle = '#fb8c00'; ctx.lineWidth = 4.5; ctx.stroke(); }
      const nIn = normalePlan(s, i);
      if (nIn) {
        const dv = [nIn[0] * 0.22 * k, -nIn[1] * 0.22 * k];
        this.cote([a[0] + dv[0], a[1] + dv[1]], [b[0] + dv[0], b[1] + dv[1]], `${v2.dist(qm[i], qm[(i + 1) % n]).toFixed(2)} m`, ms === i ? '#fb8c00' : '#fff');
      }
      if (this.edition) {
        const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        ctx.beginPath(); ctx.arc(m[0], m[1], 5, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(m[0] - 3, m[1]); ctx.lineTo(m[0] + 3, m[1]); ctx.moveTo(m[0], m[1] - 3); ctx.lineTo(m[0], m[1] + 3); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke();
      }
    }
    if (!this.edition) return;
    q.forEach((p, i) => {
      const actif = this.cible && this.cible.type === 'coin' && this.cible.i === i;
      ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 2 * Math.PI); ctx.fillStyle = actif ? '#fb8c00' : '#fff'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.lineWidth = 1.5; ctx.stroke();
      if (actif) {
        const o = origine(s), w = v2.sub(qm[i], o), t = `x ${w[0].toFixed(2)} · y ${w[1].toFixed(2)} m`;
        ctx.font = '600 11px -apple-system, system-ui, sans-serif';
        const tw = ctx.measureText(t).width;
        ctx.fillStyle = '#fb8c00'; ctx.beginPath(); ctx.roundRect(p[0] + 8, p[1] - 25, tw + 8, 18, 4); ctx.fill();
        ctx.fillStyle = '#000'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, p[0] + 12, p[1] - 16);
      }
    });
  }

  /// Poignées d'étirement du meuble sélectionné (plan seulement ; la hauteur se règle en 3D).
  poigneesMeuble(c) {
    if (this.vue !== 'plan') return [];
    return poigneesBloc(this.scene, etat.selection).filter((q) => q.n).map((q) => Object.assign({ v: this.versVue(q.p[0], q.p[1], c) }, q));
  }
  dessinerPoignees(c) {
    const actif = this.cible && this.cible.type === 'etirer' ? this.cible.nom : this.survolPoignee;
    for (const q of this.poigneesMeuble(c)) flechePoignee(this.ctx, q.v, this.versVue(q.p[0] + q.n[0] * 0.3, q.p[1] + q.n[1] * 0.3, c), q.nom === actif, false);
  }

  /// Distances de l'objet sélectionné aux murs, et trait vert là où il touche un mur.
  cotesSelection(c) {
    const ctx = this.ctx, s = this.scene, id = etat.selection;
    if (!id) return;
    for (const [a, b] of contacts(s, id)) {
      ctx.beginPath(); ctx.moveTo(...this.versVue(a[0], a[1], c)); ctx.lineTo(...this.versVue(b[0], b[1], c)); ctx.lineCap = 'round';
      ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgb(89,230,115)'; ctx.stroke(); ctx.lineCap = 'butt';
    }
    for (const [a, b] of cotes(s, id)) this.cote(this.versVue(a[0], a[1], c), this.versVue(b[0], b[1], c), v2.dist(a, b).toFixed(2), '#fb8c00');
  }

  /// Règles graduées le long du bas et de la gauche, comptées depuis le coin de la pièce.
  regles(c) {
    const ctx = this.ctx, s = this.scene, o = origine(s), k = c.w / s.longueur;
    let fin = 0.25; while (fin * k < 7) fin *= 2;
    let grand = 1; while (grand * k < 38) grand *= 2;
    const u0 = o[0], v0 = this.vue === 'plan' ? o[1] : 0, yb = c.y + c.h + 10, xg = c.x - 24;
    ctx.beginPath(); ctx.strokeStyle = 'rgba(30,30,30,0.7)'; ctx.fillStyle = 'rgba(30,30,30,0.75)'; ctx.lineWidth = 1;
    ctx.font = '10px -apple-system, system-ui, sans-serif';
    ctx.moveTo(c.x, yb); ctx.lineTo(c.x + c.w, yb);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let t = Math.ceil(-u0 / fin) * fin; u0 + t <= s.longueur + 1e-9; t += fin) {
      const x = this.versVue(u0 + t, 0, c)[0], maj = Math.abs(t / grand - Math.round(t / grand)) < 1e-6;
      ctx.moveTo(x, yb); ctx.lineTo(x, yb + (maj ? 7 : 3.5));
      if (maj) ctx.fillText(t === 0 ? '0' : `${+t.toFixed(1)} m`, x, yb + 9);
    }
    ctx.moveTo(xg, c.y); ctx.lineTo(xg, c.y + c.h);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let t = Math.ceil(-v0 / fin) * fin; v0 + t <= this.hauteurMonde + 1e-9; t += fin) {
      const y = this.versVue(0, v0 + t, c)[1], maj = Math.abs(t / grand - Math.round(t / grand)) < 1e-6;
      ctx.moveTo(xg, y); ctx.lineTo(xg - (maj ? 7 : 3.5), y);
      if (maj && t > 0) ctx.fillText(`${+t.toFixed(1)}`, xg - 10, y);
    }
    ctx.stroke();
  }

  bulle(c) {
    const ctx = this.ctx, s = this.scene, [u, v] = this.versMonde(this.survol, c), o = origine(s);
    if (u < 0 || v < 0 || u > s.longueur || v > this.hauteurMonde) return;
    let t = this.vue === 'plan' ? `x ${(u - o[0]).toFixed(2)}  y ${(v - o[1]).toFixed(2)} m` : `x ${(u - o[0]).toFixed(2)}  h ${v.toFixed(2)} m`;
    const val = etat.raster && etat.raster.vue === this.vue ? valeurRaster(etat.raster, u, v) : null;
    if (val != null) t = `${val.toFixed(1)} dB   ` + t;
    ctx.font = '11px -apple-system, system-ui, sans-serif';
    const w = ctx.measureText(t).width + 12, p = [this.survol[0] + 14, this.survol[1] + 10];
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(p[0], p[1], w, 20, 5); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, p[0] + 6, p[1] + 10.5);
  }

  // MARK: Interaction

  viserPlan(p, c) {
    const s = this.scene;
    if (!s.plan || this.vue !== 'plan' || !this.edition) return null;
    const q = coinsPlan(s).map((x) => this.versVue(x[0], x[1], c));
    let best = null;
    q.forEach((x, i) => { const d = v2.dist(x, p); if (d < 10 && (!best || d < best[1])) best = [i, d]; });
    if (best) {
      const i = best[0];
      if (this.dernierCoin && this.dernierCoin[0] === i && performance.now() - this.dernierCoin[1] < 400) { this.dernierCoin = null; supprimerCoin(i); finirEditionPlan(); return { type: 'rien' }; }
      this.dernierCoin = [i, performance.now()];
      return { type: 'coin', i };
    }
    for (let i = 0; i < q.length; i++) {
      const m = v2.mul(v2.add(q[i], q[(i + 1) % q.length]), 0.5);
      if (v2.dist(m, p) < 8) { const w = this.versMonde(m, c), k = insererCoin(i, w); if (k != null) return { type: 'coin', i: k }; }
    }
    return null;
  }

  viserMur(p, c) {
    const s = this.scene;
    if (!s.plan || this.vue !== 'plan') return null;
    const q = coinsPlan(s).map((x) => this.versVue(x[0], x[1], c)), n = q.length;
    const tol = Math.max(7, EPAISSEUR * c.w / s.longueur);
    const dist = (pt, a, b) => { const d = v2.sub(b, a), l2 = v2.dot(d, d); const t = l2 > 0 ? Math.min(Math.max(v2.dot(v2.sub(pt, a), d) / l2, 0), 1) : 0; return v2.dist(pt, v2.add(a, v2.mul(d, t))); };
    let best = null;
    for (let i = 0; i < n; i++) { const d = dist(p, q[i], q[(i + 1) % n]); if (d < tol && (!best || d < best[1])) best = [i, d]; }
    if (!best) return null;
    etat.selection = idMur(best[0]); notifier();
    return { type: 'mur', i: best[0], depart: this.versMonde(p, c), coins: s.plan.coins.map((x) => x.slice()) };
  }

  souris() {
    const cv = this.canvas;
    cv.addEventListener('pointerdown', (ev) => {
      cv.setPointerCapture(ev.pointerId);
      const c = this.cadre(), r = cv.getBoundingClientRect(), p = [ev.clientX - r.left, ev.clientY - r.top], s = this.scene;
      this.depart = p;
      const pq = this.poigneesMeuble(c).find((q) => v2.dist(q.v, p) < 11);
      if (pq) {
        this.cible = { type: 'etirer', nom: pq.nom, n: pq.n, depart: this.versMonde(p, c), bloc: Object.assign({}, s.blocs.find((x) => x.id === etat.selection)) };
        return;
      }
      let cible = this.viserPlan(p, c);
      if (!cible) {
        let best = null;
        for (const e of s.enceintes) { const d = v2.dist(this.versVue(...this.coord(e), c), p); if (d < 16 && (!best || d < best[1])) best = [e.id, d]; }
        if (best) { cible = { type: 'enceinte', id: best[0] }; etat.selection = best[0]; notifier(); }
      }
      if (!cible) {
        const dans = (pt, poly) => dansPolygone(pt[0], pt[1], poly);
        const b = [...s.blocs].reverse().find((x) => x.duPlan == null && dans(p, this.enveloppe(x, c)));
        if (b) {
          const w = this.versMonde(p, c);
          cible = { type: 'bloc', id: b.id, depart: w, origine: this.vue === 'plan' ? [b.x, b.y] : [b.x, b.z], az: b.azimut };
          etat.selection = b.id; notifier();
        }
      }
      if (!cible) cible = this.viserMur(p, c);
      if (!cible) {
        const b = [...s.blocs].reverse().find((x) => x.duPlan != null && dansPolygone(p[0], p[1], this.enveloppe(x, c)));
        if (b) { etat.selection = b.id; notifier(); cible = { type: 'rien' }; }
      }
      this.cible = cible || { type: 'micro' };
      this.glisser(p, ev);
    });
    cv.addEventListener('pointermove', (ev) => {
      const r = cv.getBoundingClientRect(), p = [ev.clientX - r.left, ev.clientY - r.top];
      this.survol = p; this.besoin = true;
      if (!this.cible || !ev.buttons) {
        const q = this.poigneesMeuble(this.cadre()).find((x) => v2.dist(x.v, p) < 11), nom = q ? q.nom : null;
        if (nom !== this.survolPoignee) { this.survolPoignee = nom; cv.style.cursor = q ? 'ew-resize' : ''; }
      }
      if (this.cible && ev.buttons) this.glisser(p, ev);
    });
    cv.addEventListener('pointerleave', () => { this.survol = null; this.besoin = true; });
    cv.addEventListener('pointerup', () => {
      if (this.cible && (this.cible.type === 'coin' || this.cible.type === 'mur')) finirEditionPlan();
      this.cible = null; this.besoin = true;
    });
  }

  glisser(p, ev) {
    const c = this.cadre(), [u, v] = this.versMonde(p, c), s = this.scene, C = this.cible;
    switch (C.type) {
      case 'etirer': {
        const d = (u - C.depart[0]) * C.n[0] + (v - C.depart[1]) * C.n[1];
        etirerBloc(C.bloc.id, C.nom, C.bloc, Math.round(d * 100) / 100);
        break;
      }
      case 'enceinte': {
        const e = s.enceintes.find((x) => x.id === C.id);
        if (!e) return;
        if (this.vue === 'plan' && ev.altKey) tournerObjet(C.id, Math.round(Math.atan2(v - e.y, u - e.x) * 180 / Math.PI));
        else if (this.vue === 'plan') deplacerObjet(C.id, Math.round(u * 100) / 100, Math.round(v * 100) / 100, null, true);
        else deplacerObjet(C.id, Math.round(u * 100) / 100, null, Math.round(v * 100) / 100, false);
        break;
      }
      case 'bloc': {
        const b = s.blocs.find((x) => x.id === C.id);
        if (!b) return;
        const nu = Math.round((C.origine[0] + u - C.depart[0]) * 100) / 100, nv = Math.round((C.origine[1] + v - C.depart[1]) * 100) / 100;
        if (this.vue === 'plan' && ev.altKey) tournerObjet(C.id, Math.round(Math.atan2(v - b.y, u - b.x) * 180 / Math.PI / 5) * 5);
        else if (this.vue === 'plan') deplacerObjet(C.id, nu, nv, null, true);
        else deplacerObjet(C.id, nu, null, Math.max(nv, b.hauteur / 2), false);
        break;
      }
      case 'micro':
        modifier((sc) => { if (this.vue === 'plan') sc.micro = [u, v]; else { sc.micro[0] = u; sc.ecoute = v; } });
        break;
      case 'coin': deplacerCoin(C.i, [u, v], ev.altKey); break;
      case 'mur': {
        if (v2.dist(p, this.depart) <= 2) return;
        const nIn = normalePlan(s, C.i);
        if (nIn) pousserMur(C.i, C.coins, -((u - C.depart[0]) * nIn[0] + (v - C.depart[1]) * nIn[1]), ev.altKey);
        break;
      }
      default: break;
    }
    this.besoin = true;
  }
}

export { cssMateriau };
