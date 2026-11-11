// Le fond « Aube », repris du visuel (visuels-fable/concentration-visuel.html) : pendant le minuteur, le jour gagne
// l'écran par le bas ; à la fin, la nuit retombe et trois ondes partent de la coche. Une seule toile, peinte au pas
// de l'horloge de la scène (12 images par seconde), à pleine cadence seulement pendant les retours à la nuit.
// Couleurs du visuel en mode sombre : l'app est toujours sombre, et le texte blanc reste lisible en plein jour.
const C = { nuitHaut: '#04051a', nuit: '#100f38', violet: '#46306f', rose: '#d96a58', or: '#eeaa62',
  jour: '#2d5f8c', jourBas: '#183c62', etoile: '#ffffff', onde: '#f2f7ff' };

const borne = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const sortie = (k) => 1 - Math.pow(1 - k, 3);
function graine(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rvb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const voile = (h, a) => `rgba(${rvb(h).join(',')},${a})`;
function mel(h1, h2, k, a = 1) {
  const p = rvb(h1), q = rvb(h2);
  return `rgba(${p.map((v, i) => Math.round(v + (q[i] - v) * k)).join(',')},${a})`;
}

const ETOILES = (() => { const a = graine(31), l = []; for (let i = 0; i < 90; i++) l.push({ fx: a(), fy: a() * 0.92, r: 0.5 + a() * 0.9, ph: a() * 6.28, s: 0.4 + a() * 1.1 }); return l; })();
const NUEES = (() => { const a = graine(12), l = []; for (let i = 0; i < 6; i++) l.push({ fx: a(), fy: 0.12 + a() * 0.7, w: 150 + a() * 240, e: 7 + a() * 12, v: 3 + a() * 5 }); return l; })();
const DUREE_ONDES = 4.6;

export class Aube {
  constructor(toile) {
    this.t = toile;
    this.x = toile.getContext('2d');
    this.L = this.H = 1;
    this.bruit = null;
    this.ondes = null;
  }

  mesurer(L, H) {
    const d = Math.min(1.5, devicePixelRatio || 1);
    L = Math.max(1, L); H = Math.max(1, H);   // une fenêtre pas encore mesurée vaut 0 × 0
    this.L = L; this.H = H; this.d = d;
    this.t.width = Math.round(L * d); this.t.height = Math.round(H * d);
  }

  /// Trois ondes depuis (x, y), pour la fin.
  lancerOndes(x, y) { this.ondes = { x, y, t0: performance.now() }; }
  get ondesEnCours() { return !!this.ondes && (performance.now() - this.ondes.t0) / 1000 < DUREE_ONDES; }

  /// h : la part du jour (0 la nuit, 1 le plein jour) ; c : l'horloge du décor, en secondes.
  dessiner(h, c) {
    const x = this.x, L = this.L, H = this.H, f = 1.1 - h * 1.42, yF = f * H;
    x.setTransform(this.d, 0, 0, this.d, 0, 0);
    const g = x.createLinearGradient(0, (f - 0.62) * H, 0, (f + 0.86) * H);
    g.addColorStop(0, C.nuitHaut); g.addColorStop(0.243, C.nuit); g.addColorStop(0.358, C.violet); g.addColorStop(0.419, C.rose);
    g.addColorStop(0.466, C.or); g.addColorStop(0.595, C.jour); g.addColorStop(1, C.jourBas);
    x.fillStyle = g; x.fillRect(0, 0, L, H);
    // la lueur de l'horizon
    if (yF > -H * 0.4 && yF < H * 1.4) {
      const R = Math.max(L, H) * 0.62;
      x.save(); x.translate(L / 2, yF + H * 0.03); x.scale(1, 0.42);
      const rg = x.createRadialGradient(0, 0, 0, 0, 0, R);
      rg.addColorStop(0, voile(C.or, 0.5)); rg.addColorStop(0.5, voile(C.rose, 0.14)); rg.addColorStop(1, voile(C.rose, 0));
      x.fillStyle = rg; x.beginPath(); x.arc(0, 0, R, 0, 6.2832); x.fill(); x.restore();
    }
    // les étoiles s'éteignent à l'approche du jour
    x.fillStyle = C.etoile;
    for (const s of ETOILES) {
      const y = s.fy * H, a = borne(((yF - y) / H - 0.2) / 0.3);
      if (a <= 0) continue;
      x.globalAlpha = a * (0.45 + 0.55 * Math.sin(c * s.s + s.ph) ** 2) * 0.9;
      x.beginPath(); x.arc(s.fx * L, y, s.r, 0, 6.2832); x.fill();
    }
    x.globalAlpha = 1;
    // de longues nuées, sombres dans la nuit, roses à l'horizon, claires au jour
    for (const n of NUEES) {
      const y = n.fy * H, nx = ((n.fx * L + c * n.v) % (L + 2 * n.w)) - n.w, d = (y - yF) / H;
      let col, a;
      if (d < 0) { const k = borne(1 + d / 0.3); col = [C.violet, C.rose, k]; a = 0.3 + 0.3 * k; }
      else { const k = borne(d / 0.3); col = [C.rose, C.jourBas, k]; a = 0.6 - 0.1 * k; }
      x.save(); x.translate(nx, y); x.scale(n.w / n.e, 1);
      const rg = x.createRadialGradient(0, 0, 0, 0, 0, n.e);
      rg.addColorStop(0, mel(...col, a)); rg.addColorStop(1, mel(...col, 0));
      x.fillStyle = rg; x.beginPath(); x.arc(0, 0, n.e, 0, 6.2832); x.fill(); x.restore();
    }
    // un grain léger, pour que le dégradé ne fasse pas de bandes
    if (!this.bruit) this.bruit = this.fabriquerBruit();
    x.globalAlpha = 0.05; x.fillStyle = this.bruit; x.fillRect(0, 0, L, H); x.globalAlpha = 1;
    // les ondes de la fin
    if (this.ondes) {
      const tc = (performance.now() - this.ondes.t0) / 1000, portee = Math.hypot(L, H) * 0.56;
      if (tc >= DUREE_ONDES) this.ondes = null;
      else {
        x.lineWidth = 1.6;
        for (let i = 0; i < 3; i++) {
          const k = borne((tc - 0.15 - i * 0.55) / 2.6);
          if (k <= 0 || k >= 1) continue;
          x.strokeStyle = voile(C.onde, (1 - k) * 0.5);
          x.beginPath(); x.arc(this.ondes.x, this.ondes.y, 46 + sortie(k) * portee, 0, 6.2832); x.stroke();
        }
      }
    }
  }

  fabriquerBruit() {
    const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
    const g = c.getContext('2d'), im = g.createImageData(128, 128), a = graine(5);
    for (let i = 0; i < im.data.length; i += 4) { const v = a() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    return this.x.createPattern(c, 'repeat');
  }
}
