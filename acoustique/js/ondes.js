// Calcul ONDULATOIRE des graves : équation des ondes acoustiques sur une grille 3D décalée
// (schéma de Yee, FDTD) par la carte graphique, via WebGPU. Traduction de l'app Mac (Ondes.swift) :
// impulsion large bande, transformée de Fourier accumulée sur un réseau 3D (1/24 d'octave),
// parois à impédance réelle tirée de α, faces ouvertes en couche absorbante (PML).

import { celerite, rhoAir, cxAdd, cxMul, cxPhase, cxScal, cxDiv } from './base.js?v=20261024205355';
import { MATERIAUX, materiau, alphaOndes, estOuvert, axeCote, hautCote, aireCote, volume, polyedre, passage, axe, dansContour } from './modele.js?v=20261024205355';

export const QUALITES = {
  brouillon: { nom: 'Brouillon', budget: 600000, fmaxPlafond: 500, dureeMax: 1.0 },
  normal: { nom: 'Normal', budget: 2500000, fmaxPlafond: 800, dureeMax: 1.6 },
  fin: { nom: 'Fin', budget: 7000000, fmaxPlafond: 1200, dureeMax: 2.4 },
};

const POINTS_PAR_LONGUEUR = 8, EPAISSEUR_PML = 12, K = 32;

// MARK: Grille

export function grillePour(s, q) {
  const qu = QUALITES[q];
  const d = [s.longueur, s.largeur, s.hauteur];
  const ep = s.faces.map((id) => (estOuvert(id) ? EPAISSEUR_PML : 1));
  const compte = (dx) => {
    const ni = d.map((v) => Math.max(4, Math.round(v / dx)));
    return [ni, [0, 1, 2].map((a) => ni[a] + ep[2 * a] + ep[2 * a + 1])];
  };
  let dx = celerite / (POINTS_PAR_LONGUEUR * qu.fmaxPlafond);
  let [ni, n] = compte(dx);
  while (n[0] * n[1] * n[2] > qu.budget) { dx *= 1.03; [ni, n] = compte(dx); }
  const dt = 0.98 * dx / (celerite * Math.sqrt(3));
  return {
    dx, dt, n, ni, bord: ep, pml: s.faces.map((id) => (estOuvert(id) ? EPAISSEUR_PML : 0)),
    fmax: celerite / (POINTS_PAR_LONGUEUR * dx), cellules: n[0] * n[1] * n[2],
  };
}

const indexG = (g, i, j, k) => (k * g.n[1] + j) * g.n[0] + i;
const centreG = (g, i, j, k) => [(i - g.bord[0] + 0.5) * g.dx, (j - g.bord[2] + 0.5) * g.dx, (k - g.bord[4] + 0.5) * g.dx];
function celluleG(g, p) {
  const c = (v, a) => Math.min(Math.max(Math.floor(v / g.dx), 0), g.ni[a] - 1) + g.bord[2 * a];
  return [c(p[0], 0), c(p[1], 1), c(p[2], 2)];
}

/// Durée simulée : de quoi laisser la réverbération s'éteindre (Sabine), bornée.
export function duree(s, g, q) {
  let a = 0;
  for (let c = 0; c < 6; c++) a += aireCote(s, c) * alphaOndes(s.faces[c], g.fmax);
  const t60 = 0.161 * volume(s) / Math.max(a, 0.01);
  const traversee = 3 * Math.hypot(s.longueur, s.largeur, s.hauteur) / celerite;
  return Math.min(Math.max(Math.max(t60, traversee), 0.3), QUALITES[q].dureeMax);
}

export function frequences(fmax) {
  const f = [];
  for (let k = 0; ; k++) { const v = 20 * Math.pow(2, k / 24); if (v > fmax) break; f.push(v); }
  return f;
}

function reseauPour(g, nf, budget) {
  for (let pxy = 1; pxy <= 16; pxy++) {
    for (let pz = pxy; pz <= 2 * pxy; pz++) {
      const pas = [pxy, pxy, pz];
      const m = [0, 1, 2].map((a) => Math.floor((g.ni[a] - 1) / pas[a]) + 1);
      if (m[0] * m[1] * m[2] * nf <= budget) {
        const debut = [0, 1, 2].map((a) => g.bord[2 * a] + Math.floor(((g.ni[a] - 1) - (m[a] - 1) * pas[a]) / 2));
        return { debut, pas, m, points: m[0] * m[1] * m[2] };
      }
    }
  }
  return { debut: [g.bord[0], g.bord[2], g.bord[4]], pas: [16, 16, 32], m: [1, 1, 1], points: 1 };
}
const indexR = (r, a, b, c) => (c * r.m[1] + b) * r.m[0] + a;

// MARK: Résultat

export class ChampOnde {
  constructor(o) { Object.assign(this, o); }
  get fmax() { return this.freqs.length ? this.freqs[this.freqs.length - 1] : 0; }

  /// Poids d'interpolation trilinéaire d'un point (les coins solides sont écartés).
  poids(p) {
    const g = this.grille, r = this.reseau, a0 = [0, 0, 0], t = [0, 0, 0];
    for (let ax = 0; ax < 3; ax++) {
      const i = p[ax] / g.dx - 0.5 + g.bord[2 * ax];
      let u = (i - r.debut[ax]) / r.pas[ax];
      u = Math.min(Math.max(u, 0), r.m[ax] - 1);
      const b = Math.min(Math.floor(u), Math.max(r.m[ax] - 2, 0));
      a0[ax] = b; t[ax] = r.m[ax] > 1 ? u - b : 0;
    }
    const idx = [], w = [];
    for (let c = 0; c < 2; c++) for (let b = 0; b < 2; b++) for (let a = 0; a < 2; a++) {
      const ia = Math.min(a0[0] + a, r.m[0] - 1), ib = Math.min(a0[1] + b, r.m[1] - 1), ic = Math.min(a0[2] + c, r.m[2] - 1);
      const k = indexR(r, ia, ib, ic);
      const wt = (a === 0 ? 1 - t[0] : t[0]) * (b === 0 ? 1 - t[1] : t[1]) * (c === 0 ? 1 - t[2] : t[2]);
      if (wt > 1e-9 && !this.solide[k]) { idx.push(k); w.push(wt); }
    }
    const sm = w.reduce((x, y) => x + y, 0);
    if (sm <= 1e-6) return null;
    return { idx, w: w.map((v) => v / sm) };
  }

  valeur(pw, f) {
    let re = 0, im = 0;
    const nf = this.freqs.length, d = this.donnees;
    for (let n = 0; n < pw.idx.length; n++) {
      const i = (pw.idx[n] * nf + f) * 2;
      re += d[i] * pw.w[n]; im += d[i + 1] * pw.w[n];
    }
    return { re, im };
  }

  /// Indice de la fréquence calculée la plus proche (en log).
  indice(f) {
    if (!this.freqs.length) return 0;
    const x = 24 * Math.log2(Math.max(f, this.freqs[0]) / this.freqs[0]);
    return Math.min(Math.max(Math.round(x), 0), this.freqs.length - 1);
  }
}

// MARK: Espace (cellules pleines et leur matériau)

export function espace(g, s) {
  const sol = new Uint8Array(g.cellules);
  const rigide = materiau('rigide').numero;
  // Parois : la couche de bord de chaque face fermée.
  for (let c = 0; c < 6; c++) {
    if (estOuvert(s.faces[c])) continue;
    const m = materiau(s.faces[c]).numero, a = axeCote(c), plan = hautCote(c) ? g.n[a] - 1 : 0;
    const b1 = (a + 1) % 3, b2 = (a + 2) % 3;
    for (let u = 0; u < g.n[b1]; u++) for (let v = 0; v < g.n[b2]; v++) {
      const ijk = [0, 0, 0]; ijk[a] = plan; ijk[b1] = u; ijk[b2] = v;
      const id = indexG(g, ijk[0], ijk[1], ijk[2]);
      if (sol[id] === 0) sol[id] = m;
    }
  }
  const remplir = (p, m, seulementParois) => {
    const lo = celluleG(g, p.bmin.map((v) => v - g.dx)), hi = celluleG(g, p.bmax.map((v) => v + g.dx));
    const r0 = seulementParois ? lo.map((v) => Math.max(v - 1, 0)) : lo;
    const r1 = seulementParois ? hi.map((v, a) => Math.min(v + 1, g.n[a] - 1)) : hi;
    for (let k = r0[2]; k <= r1[2]; k++) for (let j = r0[1]; j <= r1[1]; j++) for (let i = r0[0]; i <= r1[0]; i++) {
      const id = indexG(g, i, j, k);
      if (seulementParois && sol[id] === 0) continue;
      if (p.contient(centreG(g, i, j, k), seulementParois ? g.dx : 0)) sol[id] = m;
    }
  };
  for (const b of s.blocs) {
    if (b.forme === 'ouverture') continue;
    const p = polyedre(b);
    remplir(p, estOuvert(b.materiau) ? rigide : materiau(b.materiau).numero, false);
  }
  // Ouvertures : la paroi devient « ouverte » (rien ne revient), ou de l'air pour une porte intérieure.
  for (const b of s.blocs) {
    if (b.forme !== 'ouverture') continue;
    remplir(polyedre(b), passage(b, s) ? 0 : materiau('ouvert').numero, true);
  }
  return sol;
}

/// Cellules pleines d'une enceinte et points d'injection [cellule, signe].
export function voxeliser(g, e, sol) {
  const rigide = materiau('rigide').numero;
  const o = [e.x, e.y, e.z], a = axe(e), b = [-a[1], a[0], 0];
  let umin = 0, umax = 0, demiV = 0, demiW = 0;
  if (e.genre === 'enceinte' || e.genre === 'caisson') { umin = -e.profondeur; umax = 0; demiV = e.largeur / 2; demiW = e.hauteur / 2; }
  else if (e.genre === 'nu') { umin = -0.75 * g.dx; umax = 0.75 * g.dx; demiV = e.baffle / 2; demiW = e.baffle / 2; }
  if (e.genre !== 'omni') {
    const r = Math.max(Math.abs(umin), umax) + demiV + demiW + 2 * g.dx;
    const [ci, cj, ck] = celluleG(g, o), nr = Math.ceil(r / g.dx);
    for (let k = Math.max(ck - nr, g.bord[4]); k <= Math.min(ck + nr, g.bord[4] + g.ni[2] - 1); k++)
      for (let j = Math.max(cj - nr, g.bord[2]); j <= Math.min(cj + nr, g.bord[2] + g.ni[1] - 1); j++)
        for (let i = Math.max(ci - nr, g.bord[0]); i <= Math.min(ci + nr, g.bord[0] + g.ni[0] - 1); i++) {
          const c = centreG(g, i, j, k), d = [c[0] - o[0], c[1] - o[1], c[2] - o[2]];
          const u = d[0] * a[0] + d[1] * a[1], v = d[0] * b[0] + d[1] * b[1], w = d[2];
          if (u >= umin && u <= umax && Math.abs(v) <= demiV && Math.abs(w) <= demiW) sol[indexG(g, i, j, k)] = rigide;
        }
  }
  const premiereAir = (sens) => {
    for (let dist = 0.6 * g.dx; dist < 10 * g.dx; dist += 0.5 * g.dx) {
      const c = celluleG(g, [o[0] + a[0] * sens * dist, o[1] + a[1] * sens * dist, o[2]]);
      const id = indexG(g, ...c);
      if (sol[id] === 0) return id;
    }
    return indexG(g, ...celluleG(g, o));
  };
  if (e.genre === 'omni') return [[indexG(g, ...celluleG(g, o)), 1]];
  if (e.genre === 'nu') return [[premiereAir(1), 1], [premiereAir(-1), -1]];
  return [[premiereAir(1), 1]];
}

// MARK: Débit mesuré (cellules × pas par seconde)

/// Coût fixe d'un pas de temps (envoi des commandes), puis débit de la carte graphique.
const COUT_PAS = 0.0003;
export function debit() { try { return +localStorage.getItem('acoustique-debit-2') || 6e8; } catch { return 6e8; } }
function noterDebit(v) { try { localStorage.setItem('acoustique-debit-2', String(v)); } catch { /* sans stockage */ } }

/// Estimation (fréquence limite, cellules, secondes par enceinte).
export function estimation(s, q) {
  const g = grillePour(s, q);
  const pas = duree(s, g, q) / g.dt;
  return { fmax: 0.9 * g.fmax, cellules: g.cellules, secondes: pas * (COUT_PAS + g.cellules / debit()) + 1 };
}

// MARK: Moteur WebGPU

const NOYAUX = /* wgsl */ `
struct Params { nx: u32, ny: u32, nz: u32, p0: u32, p1: u32, p2: u32, p3: u32, p4: u32, p5: u32, kp: f32, ku: f32, smax: f32 };
@group(0) @binding(0) var<storage, read_write> px: array<f32>;
@group(0) @binding(1) var<storage, read_write> py: array<f32>;
@group(0) @binding(2) var<storage, read_write> pz: array<f32>;
@group(0) @binding(3) var<storage, read_write> ux: array<f32>;
@group(0) @binding(4) var<storage, read_write> uy: array<f32>;
@group(0) @binding(5) var<storage, read_write> uz: array<f32>;
@group(0) @binding(6) var<storage, read> sol: array<u32>;
@group(0) @binding(7) var<uniform> P: Params;
@group(0) @binding(8) var<storage, read> beta: array<f32>;

fn plein(i: u32) -> u32 { return (sol[i >> 2u] >> ((i & 3u) * 8u)) & 255u; }

// Amortissement de la PML à la position x (en cellules, 0 = bord du domaine).
fn sig(x: f32, n: u32, lo: u32, hi: u32) -> f32 {
  var r = 0.0;
  if (lo > 0u && x < f32(lo)) { r = (f32(lo) - x) / f32(lo); }
  else if (hi > 0u && x > f32(n - hi)) { r = (x - f32(n - hi)) / f32(hi); }
  r = min(r, 1.0);
  return P.smax * r * r;
}

@compute @workgroup_size(8, 8, 2)
fn vitesse(@builtin(global_invocation_id) g: vec3<u32>) {
  if (g.x >= P.nx || g.y >= P.ny || g.z >= P.nz) { return; }
  let sy = P.nx; let sz = P.nx * P.ny;
  let i = g.x + g.y * sy + g.z * sz;
  let s0 = plein(i) != 0u;
  let p0 = px[i] + py[i] + pz[i];
  if (g.x + 1u < P.nx) {
    let j = i + 1u;
    if (s0 || plein(j) != 0u) { ux[i] = 0.0; }
    else { let s = sig(f32(g.x + 1u), P.nx, P.p0, P.p1); ux[i] = ((1.0 - s) * ux[i] - P.ku * (px[j] + py[j] + pz[j] - p0)) / (1.0 + s); }
  }
  if (g.y + 1u < P.ny) {
    let j = i + sy;
    if (s0 || plein(j) != 0u) { uy[i] = 0.0; }
    else { let s = sig(f32(g.y + 1u), P.ny, P.p2, P.p3); uy[i] = ((1.0 - s) * uy[i] - P.ku * (px[j] + py[j] + pz[j] - p0)) / (1.0 + s); }
  }
  if (g.z + 1u < P.nz) {
    let j = i + sz;
    if (s0 || plein(j) != 0u) { uz[i] = 0.0; }
    else { let s = sig(f32(g.z + 1u), P.nz, P.p4, P.p5); uz[i] = ((1.0 - s) * uz[i] - P.ku * (px[j] + py[j] + pz[j] - p0)) / (1.0 + s); }
  }
}

@compute @workgroup_size(8, 8, 2)
fn pression(@builtin(global_invocation_id) g: vec3<u32>) {
  if (g.x >= P.nx || g.y >= P.ny || g.z >= P.nz) { return; }
  let sy = P.nx; let sz = P.nx * P.ny;
  let i = g.x + g.y * sy + g.z * sz;
  if (plein(i) != 0u) { return; }
  var dux = ux[i]; if (g.x > 0u) { dux = dux - ux[i - 1u]; }
  var duy = uy[i]; if (g.y > 0u) { duy = duy - uy[i - sy]; }
  var duz = uz[i]; if (g.z > 0u) { duz = duz - uz[i - sz]; }
  // Voisins pleins : paroi à impédance de leur matériau.
  var bx = 0.0; var by = 0.0; var bz = 0.0;
  if (g.x > 0u) { bx = bx + beta[plein(i - 1u)]; }
  if (g.x + 1u < P.nx) { bx = bx + beta[plein(i + 1u)]; }
  if (g.y > 0u) { by = by + beta[plein(i - sy)]; }
  if (g.y + 1u < P.ny) { by = by + beta[plein(i + sy)]; }
  if (g.z > 0u) { bz = bz + beta[plein(i - sz)]; }
  if (g.z + 1u < P.nz) { bz = bz + beta[plein(i + sz)]; }
  let sx = sig(f32(g.x) + 0.5, P.nx, P.p0, P.p1);
  let sy2 = sig(f32(g.y) + 0.5, P.ny, P.p2, P.p3);
  let sz2 = sig(f32(g.z) + 0.5, P.nz, P.p4, P.p5);
  let p = px[i] + py[i] + pz[i];
  var ax = (px[i] * (1.0 - sx) - P.kp * dux) / (1.0 + sx);
  var ay = (py[i] * (1.0 - sy2) - P.kp * duy) / (1.0 + sy2);
  var az = (pz[i] * (1.0 - sz2) - P.kp * duz) / (1.0 + sz2);
  let B = bx / (1.0 + sx) + by / (1.0 + sy2) + bz / (1.0 + sz2);
  if (B > 0.0) {
    // Parois à impédance : la vitesse normale y vaut p/Z, p pris à mi-pas (semi-implicite).
    let pn = (ax + ay + az - B * p) / (1.0 + B);
    let s = p + pn;
    ax = ax - bx * s / (1.0 + sx);
    ay = ay - by * s / (1.0 + sy2);
    az = az - bz * s / (1.0 + sz2);
  }
  px[i] = ax; py[i] = ay; pz[i] = az;
}
`;

const NOYAUX_INJ = /* wgsl */ `
struct Inj { n: u32, k: u32, a: u32, b: u32 };
@group(0) @binding(0) var<storage, read_write> px: array<f32>;
@group(0) @binding(1) var<storage, read> cel: array<u32>;
@group(0) @binding(2) var<storage, read> signe: array<f32>;
@group(0) @binding(3) var<storage, read> imp: array<f32>;
@group(0) @binding(4) var<uniform> I: Inj;
@compute @workgroup_size(1)
fn injecter(@builtin(global_invocation_id) g: vec3<u32>) {
  for (var t = 0u; t < I.k; t = t + 1u) { px[cel[t]] = px[cel[t]] + signe[t] * imp[I.n]; }
}
`;

const NOYAUX_ECH = /* wgsl */ `
struct Ech { slot: u32, points: u32, K: u32, z: u32 };
@group(0) @binding(0) var<storage, read> px: array<f32>;
@group(0) @binding(1) var<storage, read> py: array<f32>;
@group(0) @binding(2) var<storage, read> pz: array<f32>;
@group(0) @binding(3) var<storage, read> pts: array<u32>;
@group(0) @binding(4) var<storage, read_write> hist: array<f32>;
@group(0) @binding(5) var<uniform> E: Ech;
@compute @workgroup_size(64)
fn echantillonner(@builtin(global_invocation_id) g: vec3<u32>) {
  let t = g.x + g.y * 65535u * 64u;
  if (t >= E.points) { return; }
  let c = pts[t];
  hist[t * E.K + E.slot] = px[c] + py[c] + pz[c];
}
`;

const NOYAUX_DFT = /* wgsl */ `
struct Dft { points: u32, nf: u32, K: u32, cnt: u32 };
@group(0) @binding(0) var<storage, read> hist: array<f32>;
@group(0) @binding(1) var<storage, read_write> acc: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read> base: array<vec2<f32>>;
@group(0) @binding(3) var<storage, read> pas: array<vec2<f32>>;
@group(0) @binding(4) var<storage, read> poids: array<f32>;
@group(0) @binding(5) var<uniform> D: Dft;
// Transformée de Fourier discrète d'un bloc de K échantillons, ajoutée aux accumulateurs.
@compute @workgroup_size(64)
fn dft(@builtin(global_invocation_id) g: vec3<u32>) {
  let t = g.x + g.y * 65535u * 64u;
  if (t >= D.points) { return; }
  var h: array<f32, 32>;
  for (var k = 0u; k < D.cnt; k = k + 1u) { h[k] = hist[t * D.K + k] * poids[k]; }
  for (var f = 0u; f < D.nf; f = f + 1u) {
    var z = base[f];
    let st = pas[f];
    var s = vec2<f32>(0.0, 0.0);
    for (var k = 0u; k < D.cnt; k = k + 1u) {
      s = s + h[k] * z;
      z = vec2<f32>(z.x * st.x - z.y * st.y, z.x * st.y + z.y * st.x);
    }
    acc[t * D.nf + f] = acc[t * D.nf + f] + s;
  }
}
`;

let moteur = null;

/// Le moteur WebGPU (null si le navigateur ne l'a pas).
export async function moteurOndes() {
  if (moteur !== null) return moteur || null;
  try {
    if (!navigator.gpu) { moteur = false; return null; }
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) { moteur = false; return null; }
    const lim = adapter.limits;
    const device = await adapter.requestDevice({ requiredLimits: {
      maxStorageBufferBindingSize: lim.maxStorageBufferBindingSize, maxBufferSize: lim.maxBufferSize,
      maxStorageBuffersPerShaderStage: Math.min(lim.maxStorageBuffersPerShaderStage, 10),
    } });
    const pipe = (code, entree) => device.createComputePipeline({ layout: 'auto', compute: { module: device.createShaderModule({ code }), entryPoint: entree } });
    moteur = {
      device, limite: Math.min(device.limits.maxStorageBufferBindingSize, device.limits.maxBufferSize),
      pVitesse: pipe(NOYAUX, 'vitesse'), pPression: pipe(NOYAUX, 'pression'),
      pInjecter: pipe(NOYAUX_INJ, 'injecter'), pEch: pipe(NOYAUX_ECH, 'echantillonner'), pDft: pipe(NOYAUX_DFT, 'dft'),
    };
    device.lost.then(() => { moteur = null; });
    return moteur;
  } catch (err) {
    console.warn('WebGPU indisponible :', err);
    moteur = false;
    return null;
  }
}

/// Lit un tampon de la carte graphique.
async function lire(device, src, octets, decalage = 0) {
  const b = device.createBuffer({ size: octets, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const enc = device.createCommandEncoder();
  enc.copyBufferToBuffer(src, decalage, b, 0, octets);
  device.queue.submit([enc.finish()]);
  await b.mapAsync(GPUMapMode.READ);
  const r = new Float32Array(b.getMappedRange().slice(0));
  b.unmap(); b.destroy();
  return r;
}

/// Calcule la réponse d'une enceinte. options : { progres(t, apercu), annule(), hauteurApercu, intervalleApercu }.
export async function calculer(s, e, q, cle, options = {}) {
  const M = await moteurOndes();
  if (!M) throw new Error('Ce navigateur ne permet pas le calcul des graves (WebGPU absent).');
  const { device } = M;
  const debutCalcul = performance.now();
  const g = grillePour(s, q);
  const freqs = frequences(0.9 * g.fmax);
  const nf = freqs.length;
  const res = reseauPour(g, nf, Math.min(18e6, Math.floor(M.limite / 8)));
  const N = g.cellules;

  // Matériaux → coefficient semi-implicite β = K/(2Z) (0 si rigide).
  const kp = rhoAir * celerite * celerite * g.dt / g.dx;
  const tableBeta = new Float32Array(64);
  for (const m of MATERIAUX) {
    const al = estOuvert(m.id) ? 0.999 : Math.min(Math.max(alphaOndes(m.id, g.fmax), 0), 0.999);
    if (al <= 0) continue;
    const r = Math.sqrt(1 - al), z = rhoAir * celerite * (1 + r) / (1 - r);
    tableBeta[m.numero] = kp / (2 * z);
  }
  const lp = EPAISSEUR_PML * g.dx, sigmaMax = 3 * celerite * Math.log(1e4) / (2 * lp);
  const params = new ArrayBuffer(48), pu = new Uint32Array(params), pf = new Float32Array(params);
  pu.set([g.n[0], g.n[1], g.n[2], ...g.pml]);
  pf[9] = kp; pf[10] = g.dt / (rhoAir * g.dx); pf[11] = sigmaMax * g.dt / 2;

  const tampons = [];
  const tampon = (octets, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC) => {
    const b = device.createBuffer({ size: Math.max(Math.ceil(octets / 4) * 4, 16), usage });
    tampons.push(b);
    return b;
  };
  try {
    const champs = [0, 1, 2, 3, 4, 5].map(() => tampon(N * 4));
    const chrono = [['début', performance.now()]];
    const sol = espace(g, s);
    chrono.push(['espace', performance.now()]);
    const injections = voxeliser(g, e, sol);
    const solPack = new Uint32Array(Math.ceil(N / 4));
    new Uint8Array(solPack.buffer).set(sol);
    const bSol = tampon(solPack.byteLength); device.queue.writeBuffer(bSol, 0, solPack);
    const bBeta = tampon(64 * 4); device.queue.writeBuffer(bBeta, 0, tableBeta);
    const bParams = tampon(48, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST); device.queue.writeBuffer(bParams, 0, params);
    const bInj = tampon(injections.length * 4), bSigne = tampon(injections.length * 4);
    device.queue.writeBuffer(bInj, 0, new Uint32Array(injections.map((x) => x[0])));
    device.queue.writeBuffer(bSigne, 0, new Float32Array(injections.map((x) => x[1])));
    const pts = new Uint32Array(res.points), ptPlein = new Uint8Array(res.points);
    for (let c = 0; c < res.m[2]; c++) for (let b = 0; b < res.m[1]; b++) for (let a = 0; a < res.m[0]; a++) {
      const id = indexG(g, res.debut[0] + a * res.pas[0], res.debut[1] + b * res.pas[1], res.debut[2] + c * res.pas[2]);
      pts[indexR(res, a, b, c)] = id; ptPlein[indexR(res, a, b, c)] = sol[id] !== 0 ? 1 : 0;
    }
    const bPts = tampon(res.points * 4); device.queue.writeBuffer(bPts, 0, pts);
    const bHist = tampon(res.points * K * 4);
    const bAcc = tampon(res.points * nf * 8);

    // Signal : dérivée de gaussienne.
    const f0 = g.fmax / 2, sigma = 1 / (2 * Math.PI * f0), t0 = 4.5 * sigma;
    const nImp = Math.ceil(2 * t0 / g.dt) + 1;
    const impulsion = new Float32Array(nImp);
    for (let m = 0; m < nImp; m++) { const t = (m + 1) * g.dt - t0; impulsion[m] = -(t / sigma) * Math.exp(-t * t / (2 * sigma * sigma)); }
    const bImp = tampon(nImp * 4); device.queue.writeBuffer(bImp, 0, impulsion);

    const dureeS = duree(s, g, q), nPas = Math.ceil(dureeS / g.dt);
    const D = Math.max(1, Math.floor(1 / (3 * g.fmax * g.dt))), dtE = D * g.dt;
    const pasPh = new Float32Array(nf * 2);
    freqs.forEach((f, i) => { const w = 2 * Math.PI * f; pasPh[2 * i] = Math.cos(-w * dtE); pasPh[2 * i + 1] = Math.sin(-w * dtE); });
    const bPas = tampon(nf * 8); device.queue.writeBuffer(bPas, 0, pasPh);
    // Tampons de la transformée de Fourier, en anneau : plusieurs blocs peuvent finir dans un même envoi.
    const NDFT = 4;
    const bBase = [], bPoids = [], bDftU = [];
    for (let k = 0; k < NDFT; k++) { bBase.push(tampon(nf * 8)); bPoids.push(tampon(K * 4)); bDftU.push(tampon(16, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST)); }
    const fenetre = (t) => { const d0 = 0.85 * dureeS; if (t <= d0) return 1; const x = Math.min((t - d0) / (dureeS - d0), 1); return 0.5 * (1 + Math.cos(Math.PI * x)); };

    // Uniformes à décalage dynamique : un enregistrement de 256 octets par pas d'injection et par case du bloc.
    const AL = 256;
    const bInjU = tampon(nImp * AL, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    const injU = new Uint32Array(nImp * AL / 4);
    for (let m = 0; m < nImp; m++) { injU[m * AL / 4] = m; injU[m * AL / 4 + 1] = injections.length; }
    device.queue.writeBuffer(bInjU, 0, injU);
    const bEchU = tampon(K * AL, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
    const echU = new Uint32Array(K * AL / 4);
    for (let k = 0; k < K; k++) { echU[k * AL / 4] = k; echU[k * AL / 4 + 1] = res.points; echU[k * AL / 4 + 2] = K; }
    device.queue.writeBuffer(bEchU, 0, echU);

    // Un groupe par pas d'injection et par case du bloc (uniforme lu à son décalage).
    const bg = (pipe, liste, decalage) => device.createBindGroup({ layout: pipe.getBindGroupLayout(0),
      entries: liste.map((b, i) => ({ binding: i, resource: (decalage != null && i === liste.length - 1) ? { buffer: b, offset: decalage, size: 16 } : { buffer: b } })) });
    const gVit = bg(M.pVitesse, [...champs, bSol, bParams]);
    const gPre = bg(M.pPression, [...champs, bSol, bParams, bBeta]);
    const gInj = [...Array(nImp).keys()].map((m) => bg(M.pInjecter, [champs[0], bInj, bSigne, bImp, bInjU], m * AL));
    const gEch = [...Array(K).keys()].map((k) => bg(M.pEch, [champs[0], champs[1], champs[2], bPts, bHist, bEchU], k * AL));
    const gDft = [...Array(NDFT).keys()].map((k) => bg(M.pDft, [bHist, bAcc, bBase[k], bPas, bPoids[k], bDftU[k]]));
    let nDft = 0;
    const wg3 = [Math.ceil(g.n[0] / 8), Math.ceil(g.n[1] / 8), Math.ceil(g.n[2] / 2)];
    const grp = Math.ceil(res.points / 64);
    const wg1 = [Math.min(grp, 65535), Math.ceil(grp / 65535)];

    let slot = 0, tBloc = 0, n = 0;
    const poidsBloc = new Float32Array(K);
    const lot = options.pasParLot || Math.min(256, K * D * (NDFT - 1));
    const kApercu = Math.min(Math.max(Math.floor((options.hauteurApercu ?? s.ecoute) / g.dx), 0), g.ni[2] - 1) + g.bord[4];
    let dernierApercu = -Infinity;
    const intervalle = options.intervalleApercu ?? 120;

    chrono.push(['préparation', performance.now()]);
    while (n < nPas) {
      if (options.annule && options.annule()) return null;
      const enc = device.createCommandEncoder();
      const passe = enc.beginComputePass();
      const fin = Math.min(n + lot, nPas);
      const dfts = [];
      while (n < fin) {
        passe.setPipeline(M.pVitesse); passe.setBindGroup(0, gVit); passe.dispatchWorkgroups(...wg3);
        passe.setPipeline(M.pPression); passe.setBindGroup(0, gPre); passe.dispatchWorkgroups(...wg3);
        if (n < nImp) { passe.setPipeline(M.pInjecter); passe.setBindGroup(0, gInj[n]); passe.dispatchWorkgroups(1); }
        if ((n + 1) % D === 0) {
          const t = (n + 1) * g.dt;
          if (slot === 0) tBloc = t;
          poidsBloc[slot] = fenetre(t);
          passe.setPipeline(M.pEch); passe.setBindGroup(0, gEch[slot]); passe.dispatchWorkgroups(...wg1);
          slot++;
          if (slot === K) {
            const k = nDft++ % NDFT;
            dfts.push({ k, tBloc, compte: K, poids: poidsBloc.slice() });
            slot = 0; passe.setPipeline(M.pDft); passe.setBindGroup(0, gDft[k]); passe.dispatchWorkgroups(...wg1);
          }
        }
        n++;
      }
      passe.end();
      for (const d of dfts) ecrireDft(device, bBase[d.k], bPoids[d.k], bDftU[d.k], freqs, d, res.points, nf);
      device.queue.submit([enc.finish()]);
      await device.queue.onSubmittedWorkDone();
      let apercu = null;
      if (options.progres && performance.now() - dernierApercu > intervalle) {
        dernierApercu = performance.now();
        apercu = await lireApercu(device, champs, g, kApercu, sol);
      }
      if (options.progres) options.progres(n / nPas, apercu);
    }
    if (slot > 0) {
      const enc = device.createCommandEncoder();
      const passe = enc.beginComputePass();
      const k = nDft++ % NDFT;
      passe.setPipeline(M.pDft); passe.setBindGroup(0, gDft[k]); passe.dispatchWorkgroups(...wg1);
      passe.end();
      ecrireDft(device, bBase[k], bPoids[k], bDftU[k], freqs, { tBloc, compte: slot, poids: poidsBloc.slice() }, res.points, nf);
      device.queue.submit([enc.finish()]);
    }
    await device.queue.onSubmittedWorkDone();
    chrono.push([`${nPas} pas`, performance.now()]);
    const acc = await lire(device, bAcc, res.points * nf * 8);
    chrono.push([`lecture ${(res.points * nf * 8 / 1e6).toFixed(0)} Mo`, performance.now()]);

    // Normalisation : P / (iω dx³ S(ω) / 4πc²) → 1 à 1 m d'une source ponctuelle en champ libre.
    const norme = freqs.map((f) => {
      const w = 2 * Math.PI * f;
      let sm = { re: 0, im: 0 };
      for (let m = 0; m < nImp; m++) sm = cxAdd(sm, cxScal(cxPhase(-w * (m + 1) * g.dt), impulsion[m]));
      const nw = cxScal(cxMul({ re: 0, im: w }, sm), Math.pow(g.dx, 3) / (4 * Math.PI * celerite * celerite));
      return cxDiv({ re: dtE, im: 0 }, nw);
    });
    const donnees = new Float32Array(res.points * nf * 2);
    for (let pt = 0; pt < res.points; pt++) for (let f = 0; f < nf; f++) {
      const k = (pt * nf + f) * 2, a = acc[k], b = acc[k + 1], m = norme[f];
      donnees[k] = a * m.re - b * m.im; donnees[k + 1] = a * m.im + b * m.re;
    }
    const secondes = (performance.now() - debutCalcul) / 1000;
    chrono.push(['normalisation', performance.now()]);
    if (globalThis.CHRONO_ONDES) console.log(`ondes ${N} cellules : ` + chrono.slice(1).map(([n, t], i) => `${n} ${((t - chrono[i][1]) / 1000).toFixed(2)} s`).join(' · '));
    if (secondes > 3) noterDebit(N * nPas / Math.max(secondes - nPas * COUT_PAS, 0.5));
    return new ChampOnde({ cle, grille: g, reseau: res, freqs, donnees, solide: ptPlein, secondes });
  } finally {
    for (const b of tampons) b.destroy();
  }
}

function ecrireDft(device, bBase, bPoids, bU, freqs, d, points, nf) {
  const base = new Float32Array(nf * 2);
  freqs.forEach((f, i) => { const ph = -2 * Math.PI * f * d.tBloc; base[2 * i] = Math.cos(ph); base[2 * i + 1] = Math.sin(ph); });
  device.queue.writeBuffer(bBase, 0, base);
  device.queue.writeBuffer(bPoids, 0, d.poids);
  device.queue.writeBuffer(bU, 0, new Uint32Array([points, nf, K, d.compte]));
}

/// Tranche horizontale de la pression (pour voir l'impulsion se propager), agrandie 4 fois.
async function lireApercu(device, champs, g, kApercu, sol) {
  const l = g.ni[0], h = g.ni[1], ligne = g.n[0] * g.n[1];
  const tr = await Promise.all([0, 1, 2].map((c) => lire(device, champs[c], ligne * 4, kApercu * ligne * 4)));
  const v = new Float32Array(l * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < l; i++) {
    const id = (j + g.bord[2]) * g.n[0] + i + g.bord[0];
    v[j * l + i] = sol[kApercu * ligne + id] !== 0 ? NaN : tr[0][id] + tr[1][id] + tr[2][id];
  }
  return lisser(l, h, v);
}

/// Agrandi 4 fois par interpolation bilinéaire (les cellules pleines, NaN, ne comptent pas).
export function lisser(l, h, v, f = 4) {
  const L = l * f, H = h * f, r = new Float32Array(L * H).fill(NaN);
  for (let y = 0; y < H; y++) {
    const sy = (y + 0.5) / f - 0.5, j0 = Math.min(Math.max(Math.floor(sy), 0), h - 1), j1 = Math.min(j0 + 1, h - 1), ty = Math.min(Math.max(sy - j0, 0), 1);
    for (let x = 0; x < L; x++) {
      const sx = (x + 0.5) / f - 0.5, i0 = Math.min(Math.max(Math.floor(sx), 0), l - 1), i1 = Math.min(i0 + 1, l - 1), tx = Math.min(Math.max(sx - i0, 0), 1);
      if (isNaN(v[(ty < 0.5 ? j0 : j1) * l + (tx < 0.5 ? i0 : i1)])) continue;
      let s = 0, w = 0;
      const c = [[v[j0 * l + i0], (1 - tx) * (1 - ty)], [v[j0 * l + i1], tx * (1 - ty)], [v[j1 * l + i0], (1 - tx) * ty], [v[j1 * l + i1], tx * ty]];
      for (const [val, p] of c) if (!isNaN(val)) { s += val * p; w += p; }
      if (w > 0) r[y * L + x] = s / w;
    }
  }
  return { l: L, h: H, valeurs: r };
}

export { dansContour };
