'use strict';
/* Calque d'effets au-dessus de la page (fixe, transparent aux clics) : caisses et étoiles qui volent jusqu'aux
   compteurs, pièces, confettis, textes qui montent. Ne redessine que lorsque quelque chose est en vol.
   Plus bas : les nombres de l'interface qui défilent jusqu'à leur nouvelle valeur. */

const Anim = {
  cv: null, g: null, dpr: 1, effets: [], sale: false,
  reduit: matchMedia('(prefers-reduced-motion: reduce)').matches,
  init() {
    this.cv = document.getElementById('effets'); this.g = this.cv.getContext('2d');
    this.dimensionner();
    addEventListener('resize', () => this.dimensionner());
  },
  dimensionner() {
    this.dpr = devicePixelRatio || 1;
    this.cv.width = Math.round(innerWidth * this.dpr); this.cv.height = Math.round(innerHeight * this.dpr);
  },
  _sprites: {},
  spr(cle, w, h, dessin) {
    let s = this._sprites[cle];
    if (!s) { s = document.createElement('canvas'); s.width = w; s.height = h; dessin(s.getContext('2d')); this._sprites[cle] = s; }
    return s;
  },
  spriteCaisse(c) { return this.spr('c' + c.id, 38, 34, g => caisse(g, 1, 3, c)); },
  spriteEtoile() { return this.spr('etoile', 11, 11, g => etoile(g, 0, 0, true)); },
  spritePiece() {
    return this.spr('piece', 9, 9, g => { disque(g, 4, 4, 4, '#b8861a'); disque(g, 4, 4, 3, '#f2c240'); R(g, 4, 2, 1, 5, '#c8961e'); P(g, 2, 2, '#fff2b0'); });
  },
  spriteTrouvaille(id) { return this.spr('t' + id, 16, 16, g => trouvailleIcone(g, 0, 0, id)); },
  // Pixels d'écran par pixel d'art : comme le champ, ou un peu plus pour les étoiles
  get ps() { return Math.max(1, Rendu.k || this.dpr); },

  // ---------- Effets ----------
  // de : {x, y} ou fonction qui les rend (pixels CSS) ; vers : élément visé ; arrivee : rappel à l'arrivée
  enRetard: 0,
  vol(o) {
    if (document.hidden || this.reduit) { this.enRetard++; setTimeout(() => { this.enRetard--; o.arrivee?.(); }, o.retard || 0); return; }
    this.effets.push({ type: 'vol', echelle: 1, duree: 1200, ...o, t0: performance.now() + (o.retard || 0), fait: false });
  },
  caisse(de, c, vers, retard, arrivee) { this.vol({ sprite: this.spriteCaisse(c), de, vers, retard, arrivee, echelle: 1, duree: 1250 }); },
  etoiles(de, n, vers, retard, arrivee) {
    for (let i = 0; i < n; i++) this.vol({ sprite: this.spriteEtoile(), de, vers, retard: (retard || 0) + i * 170, echelle: 3, duree: 1500, tourne: true, ecart: (i - (n - 1) / 2) * 30, arrivee: i === n - 1 ? arrivee : null, eclat: true });
  },
  pieces(de, vers, n, retard, arrivee) {
    for (let i = 0; i < n; i++) this.vol({ sprite: this.spritePiece(), de, vers, retard: (retard || 0) + i * 60, echelle: 2, duree: 900 + Math.random() * 300, ecart: (Math.random() - 0.5) * 60, arrivee: i === n - 1 ? arrivee : null });
  },
  trouvaille(de, id, vers, arrivee) { this.vol({ sprite: this.spriteTrouvaille(id), de, vers, echelle: 3, duree: 1600, arrivee, eclat: true }); },
  texte(de, txt, coul, retard) {
    if (document.hidden || this.reduit) return;
    this.effets.push({ type: 'texte', de, txt, coul: coul || '#fff3c4', t0: performance.now() + (retard || 0), duree: 1300 });
  },
  confettis(x, y, n = 60) {
    if (this.reduit) return;
    const t0 = performance.now(), cols = ['#f2c230', '#e85a3a', '#5aa848', '#4a8ad8', '#f6f2ea', '#c868c8'];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 160 + Math.random() * 260;
      this.effets.push({ type: 'confetti', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, col: cols[i % cols.length], t0: t0 + Math.random() * 120, duree: 1400 + Math.random() * 900, ph: Math.random() * 6 });
    }
  },

  // ---------- Dessin ----------
  dessiner(t) {
    const g = this.g;
    if (!this.effets.length) { if (this.sale) { g.clearRect(0, 0, this.cv.width, this.cv.height); this.sale = false; } return; }
    g.clearRect(0, 0, this.cv.width, this.cv.height);
    g.imageSmoothingEnabled = false;
    this.sale = true;
    this.effets = this.effets.filter(e => {
      const ms = t - e.t0;
      if (ms < 0) return true;
      const a = ms / e.duree;
      if (a >= 1) { if (e.type === 'vol' && !e.fait) { e.fait = true; e.arrivee?.(); } return false; }
      if (e.type === 'vol') this.dessinerVol(g, e, ms, a);
      else if (e.type === 'texte') {
        const p = typeof e.de === 'function' ? e.de() : e.de, u = 1 - (1 - a) * (1 - a);
        g.globalAlpha = a < 0.15 ? a / 0.15 : a > 0.7 ? (1 - a) / 0.3 : 1;
        g.font = `700 ${Math.round(15 * this.dpr)}px -apple-system, system-ui, sans-serif`; g.textAlign = 'center';
        g.lineWidth = 4 * this.dpr; g.strokeStyle = 'rgba(43,33,24,.85)'; g.strokeText(e.txt, p.x * this.dpr, (p.y - 18 - u * 34) * this.dpr);
        g.fillStyle = e.coul; g.fillText(e.txt, p.x * this.dpr, (p.y - 18 - u * 34) * this.dpr);
        g.globalAlpha = 1;
      } else if (e.type === 'confetti') {
        const s = ms / 1000, x = e.x + e.vx * s * (1 - a * 0.4), y = e.y + e.vy * s + 380 * s * s, w = Math.abs(Math.cos(ms / 120 + e.ph));
        g.globalAlpha = a > 0.75 ? (1 - a) * 4 : 1; g.fillStyle = e.col;
        g.fillRect(Math.round(x * this.dpr), Math.round(y * this.dpr), Math.max(1, Math.round(6 * w * this.dpr)), Math.round(4 * this.dpr));
        g.globalAlpha = 1;
      }
      return true;
    });
  },
  dessinerVol(g, e, ms, a) {
    const ps = this.ps * e.echelle, dpr = this.dpr, p0 = typeof e.de === 'function' ? e.de() : e.de;
    let x = p0.x, y = p0.y, sc, rot = 0;
    const pop = 280, flotte = 480;
    if (ms < pop) { const u = ms / pop; sc = u < 0.7 ? u / 0.7 * 1.25 : 1.25 - (u - 0.7) / 0.3 * 0.25; y -= u * 14; x += (e.ecart || 0) * u; }
    else if (ms < flotte) { sc = 1; y -= 14 + Math.sin((ms - pop) / (flotte - pop) * Math.PI) * 3; x += e.ecart || 0; }
    else {
      const u = Math.min(1, (ms - flotte) / (e.duree - flotte)), v = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const el = typeof e.vers === 'function' ? e.vers() : e.vers, b = el?.isConnected ? el.getBoundingClientRect() : null;
      const cx = b ? b.left + b.width / 2 : x, cy = b ? b.top + b.height / 2 : y - 200;
      const x0 = p0.x + (e.ecart || 0), y0 = p0.y - 14, mx = (x0 + cx) / 2, my = Math.min(y0, cy) - 90;
      x = (1 - v) * (1 - v) * x0 + 2 * (1 - v) * v * mx + v * v * cx;
      y = (1 - v) * (1 - v) * y0 + 2 * (1 - v) * v * my + v * v * cy;
      sc = 1 - 0.5 * v; if (e.tourne) rot = v * Math.PI * 2;
    }
    const w = e.sprite.width * ps * sc, h = e.sprite.height * ps * sc;
    if (e.eclat && ms < flotte + 200) {
      const r = (ms / (flotte + 200)) * 18 * dpr;
      g.globalAlpha = 0.6 * (1 - ms / (flotte + 200)); g.fillStyle = '#fff6c8';
      for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + ms / 300; g.fillRect(Math.round(x * dpr + Math.cos(an) * r) - 1, Math.round(y * dpr + Math.sin(an) * r) - 1, 2 * Math.ceil(dpr), 2 * Math.ceil(dpr)); }
      g.globalAlpha = 1;
    }
    g.save(); g.translate(Math.round(x * dpr), Math.round(y * dpr)); if (rot) g.rotate(rot);
    g.drawImage(e.sprite, Math.round(-w / 2), Math.round(-h / 2), Math.round(w), Math.round(h));
    g.restore();
  },
};

// ---------- Nombres qui défilent ----------
const Compteur = {
  animer(el, valeur, format, duree = 700) {
    if (!el) return;
    const de = el._valeur ?? valeur;
    el._valeur = valeur;
    if (Anim.reduit || document.hidden || de === valeur) { el.textContent = format(valeur); return; }
    const t0 = performance.now(), id = (el._anim || 0) + 1; el._anim = id;
    const pas = t => {
      if (el._anim !== id) return;
      const a = Math.min(1, (t - t0) / duree), u = 1 - Math.pow(1 - a, 3);
      el.textContent = format(de + (valeur - de) * u);
      if (a < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  },
  // Petit rebond d'un élément (classe CSS rejouée)
  rebond(el, classe = 'rebond') { if (!el) return; el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe); },
};
