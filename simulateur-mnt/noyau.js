/* Noyau de calcul du simulateur, en JavaScript (tâche B.1).
 *
 * Recopie l'étalon Python (reference/noyau.py) et le noyau Swift (Sources/Noyau) :
 * mêmes voisins dans le même ordre (E, SE, S, SO, O, NO, N, NE), même départage des égalités
 * (ordre d'entrée dans le tas), mêmes sommes dans l'ordre des lignes, mêmes arrondis float32.
 * Méthodes de SAGA : Wang & Liu (défaut) ou Sink Removal du Basic Terrain Analysis, D8 départagé dans l'ordre de SAGA, MFD de Freeman,
 * Strahler, pente de Zevenbergen & Thorne, TWI de ta_hydrology 19/20.
 *
 * Script ordinaire (pas de module) : chargé par le Web Worker (importScripts), par la page
 * de test et par l'autotest en ligne de commande (jsc de macOS). Tout est dans `Noyau`.
 *
 * Grille : { lignes, colonnes, pas, z: Float32Array (NaN = sans donnée), x0, y0, epsg }
 * (x0, y0) = coin nord-ouest du premier pixel ; les lignes croissent vers le sud.
 */
(function (global) {
  "use strict";

  const DL = [0, 1, 1, 1, 0, -1, -1, -1];
  const DC = [1, 1, 0, -1, -1, -1, 0, 1];
  const SORTIE = -1, AUCUNE = -2;
  const ORDRE_SAGA = [6, 7, 0, 1, 2, 3, 4, 5];
  const PENTE_MIN = 0.1, CONVERGENCE = 1.1;
  const FLT_EPSILON = 1.1920928955078125e-07;
  const f32 = Math.fround;

  function distances(pas) {
    const d = [];
    for (let k = 0; k < 8; k++) d.push(k % 2 === 0 ? pas : pas * Math.sqrt(2.0));
    return d;
  }

  /** Voisin k de i, ou -1 hors de la grille. */
  function voisin(g, i, k) {
    const C = g.colonnes;
    const l = (i / C) | 0, c = i - l * C;
    const ll = l + DL[k], cc = c + DC[k];
    if (ll < 0 || ll >= g.lignes || cc < 0 || cc >= C) return -1;
    return ll * C + cc;
  }

  // ---------------------------------------------------------------------------
  // Tas binaire trié par (altitude, ordre d'entrée) : l'ordre départage les égalités.
  // ---------------------------------------------------------------------------
  class Tas {
    constructor(capacite) {
      this.z = new Float64Array(Math.max(16, capacite));
      this.o = new Uint32Array(this.z.length);
      this.i = new Int32Array(this.z.length);
      this.n = 0;
    }
    get vide() { return this.n === 0; }
    agrandir() {
      const t = this.z.length * 2;
      const z = new Float64Array(t); z.set(this.z); this.z = z;
      const o = new Uint32Array(t); o.set(this.o); this.o = o;
      const i = new Int32Array(t); i.set(this.i); this.i = i;
    }
    avant(a, b) { return this.z[a] < this.z[b] || (this.z[a] === this.z[b] && this.o[a] < this.o[b]); }
    echanger(a, b) {
      let t = this.z[a]; this.z[a] = this.z[b]; this.z[b] = t;
      t = this.o[a]; this.o[a] = this.o[b]; this.o[b] = t;
      t = this.i[a]; this.i[a] = this.i[b]; this.i[b] = t;
    }
    ajouter(z, ordre, indice) {
      if (this.n === this.z.length) this.agrandir();
      let k = this.n++;
      this.z[k] = z; this.o[k] = ordre; this.i[k] = indice;
      while (k > 0) {
        const p = (k - 1) >> 1;
        if (!this.avant(k, p)) break;
        this.echanger(k, p); k = p;
      }
    }
    retirer() {
      const r = this.i[0];
      this.n--;
      if (this.n > 0) {
        this.z[0] = this.z[this.n]; this.o[0] = this.o[this.n]; this.i[0] = this.i[this.n];
        let k = 0;
        for (;;) {
          const a = 2 * k + 1, b = a + 1;
          let m = k;
          if (a < this.n && this.avant(a, m)) m = a;
          if (b < this.n && this.avant(b, m)) m = b;
          if (m === k) break;
          this.echanger(k, m); k = m;
        }
      }
      return r;
    }
  }

  function Annule() { this.message = "calcul annulé"; }

  // ---------------------------------------------------------------------------
  // 1. Remplissage à plat : Priority-Flood + file FIFO (Barnes et al., 2014)
  // ---------------------------------------------------------------------------
  function remplir(g, suivi, avecParent) {
    const n = g.lignes * g.colonnes, z = g.z;
    const rempli = new Float32Array(z);
    const parent = avecParent ? new Int32Array(n).fill(-1) : null;
    const graine = new Uint8Array(n), ferme = new Uint8Array(n);
    const fosse = new Int32Array(n);
    let tete = 0, queue = 0, ordre = 0;
    const tas = new Tas(2 * (g.lignes + g.colonnes));
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(z[i])) { ferme[i] = 1; continue; }
      for (let k = 0; k < 8; k++) {
        const j = voisin(g, i, k);
        if (j < 0 || Number.isNaN(z[j])) {
          graine[i] = 1; ferme[i] = 1;
          tas.ajouter(z[i], ordre++, i);
          break;
        }
      }
    }
    let traitees = 0;
    while (!tas.vide || tete < queue) {
      const c = tete < queue ? fosse[tete++] : tas.retirer();
      if ((++traitees & 0xFFFFF) === 0 && suivi) suivi("Remplissage à plat", 0.25 * traitees / n);
      for (let k = 0; k < 8; k++) {
        const j = voisin(g, c, k);
        if (j < 0 || ferme[j]) continue;
        ferme[j] = 1;
        if (parent) parent[j] = c;
        if (z[j] <= rempli[c]) { rempli[j] = rempli[c]; fosse[queue++] = j; }
        else { rempli[j] = z[j]; tas.ajouter(z[j], ordre++, j); }
      }
    }
    return { rempli, graine, parent };
  }

  // ---------------------------------------------------------------------------
  // 1 bis. Surface d'écoulement de Wang & Liu (ta_preprocessor 4 de SAGA)
  // ---------------------------------------------------------------------------
  function remplirWL(g, penteMin, suivi) {
    const n = g.lignes * g.colonnes, z = g.z;
    const t = Math.tan(penteMin * Math.PI / 180.0);
    const dist = distances(g.pas);
    const ecart = dist.map(d => t * d);
    const surface = new Float32Array(n).fill(NaN);
    const parent = new Int32Array(n).fill(-1);
    const ferme = new Uint8Array(n);
    const tas = new Tas(2 * (g.lignes + g.colonnes));
    let ordre = 0;
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(z[i])) { ferme[i] = 1; continue; }
      for (let k = 0; k < 8; k++) {
        const j = voisin(g, i, k);
        if (j < 0 || Number.isNaN(z[j])) {
          surface[i] = z[i]; ferme[i] = 1;
          tas.ajouter(z[i], ordre++, i);
          break;
        }
      }
    }
    let traitees = 0;
    while (!tas.vide) {
      const c = tas.retirer();
      if ((++traitees & 0xFFFFF) === 0 && suivi) suivi("Remplissage de Wang & Liu", 0.25 + 0.25 * traitees / n);
      const sc = surface[c];
      for (let k = 0; k < 8; k++) {
        const j = voisin(g, c, k);
        if (j < 0 || ferme[j]) continue;
        ferme[j] = 1;
        parent[j] = c;
        let v = z[j];
        if (penteMin > 0.0) { if (v < sc + ecart[k]) v = f32(sc + ecart[k]); }
        else if (v <= sc) v = sc;
        surface[j] = v;
        tas.ajouter(v, ordre++, j);
      }
    }
    return { surface, parent };
  }

  // ---------------------------------------------------------------------------
  // 1 ter. Surface d'écoulement : Sink Removal (O. Conrad), Basic Terrain Analysis de SAGA
  // ---------------------------------------------------------------------------
  // ta_preprocessor 2, méthode « Fill Sinks », ε = 0,001 m, appuyé sur « Sink Drainage Route
  // Detection » (ta_preprocessor 1). Recopie reference/noyau.py (sink_removal, remplir_sr) et
  // Sources/Noyau/SinkRemoval.swift. Repère de SAGA : x = colonne, y = ligne comptée depuis le SUD,
  // cellule s = y × NX + x ; directions 0 = N, 1 = NE, 2 = E … 7 = NO. Tout en tableaux typés.
  const EPSILON_SR = 1.0e-3;
  const DX_S = [0, 1, 1, 1, 0, -1, -1, -1];
  const DY_S = [1, 1, 0, -1, -1, -1, 0, 1];

  /** Ordre croissant des cellules, comme CSG_Grid::_Set_Index de SAGA (tri rapide des Numerical
   *  Recipes, médiane de trois, insertion sous 7 éléments) : il ne départage pas les égalités par
   *  l'indice, donc on le recopie. On trie des paires (altitude, cellule), mêmes comparaisons et
   *  mêmes échanges. Renvoie { ks, ndata } : les ndata premières cellules ont une donnée. */
  function indexSAGA(dem) {
    const n = dem.length;
    const kv = new Float32Array(n), ks = new Int32Array(n);
    let j = 0, ndata = n;
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(dem[i])) { ndata--; ks[ndata] = i; kv[ndata] = NaN; }
      else { kv[j] = dem[i]; ks[j] = i; j++; }
    }
    if (ndata <= 0) return { ks, ndata };
    const echange = (a, b) => {
      let t = kv[a]; kv[a] = kv[b]; kv[b] = t;
      const u = ks[a]; ks[a] = ks[b]; ks[b] = u;
    };
    let l = 0, ir = ndata - 1;
    const pile = [];
    for (;;) {
      if (ir - l < 7) {
        for (let jj = l + 1; jj <= ir; jj++) {
          const tv = kv[jj], ts = ks[jj];
          let i = jj - 1;
          while (i >= 0) {
            if (kv[i] <= tv) break;
            kv[i + 1] = kv[i]; ks[i + 1] = ks[i];
            i--;
          }
          kv[i + 1] = tv; ks[i + 1] = ts;
        }
        if (pile.length === 0) break;
        ir = pile.pop();
        l = pile.pop();
      } else {
        const k = (l + ir) >> 1;
        echange(k, l + 1);
        if (kv[l + 1] > kv[ir]) echange(l + 1, ir);
        if (kv[l] > kv[ir]) echange(l, ir);
        if (kv[l + 1] > kv[l]) echange(l + 1, l);
        let i = l + 1, jj = ir;
        const tv = kv[l], ts = ks[l];
        for (;;) {
          do i++; while (kv[i] < tv);
          do jj--; while (kv[jj] > tv);
          if (jj < i) break;
          echange(i, jj);
        }
        kv[l] = kv[jj]; ks[l] = ks[jj];
        kv[jj] = tv; ks[jj] = ts;
        if (ir - i + 1 >= jj - l) { pile.push(i, ir); ir = jj - 1; }
        else { pile.push(l, jj - 1); l = i; }
      }
    }
    return { ks, ndata };
  }

  /** Tas d'entiers (le plus petit d'abord) : le premier exutoire utilisable dans l'ordre de la liste. */
  class TasEntiers {
    constructor() { this.e = new Int32Array(1024); this.n = 0; }
    get vide() { return this.n === 0; }
    ajouter(x) {
      if (this.n === this.e.length) { const e = new Int32Array(this.n * 2); e.set(this.e); this.e = e; }
      const e = this.e;
      let i = this.n++;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (x < e[p]) { e[i] = e[p]; i = p; } else break;
      }
      e[i] = x;
    }
    retirer() {
      const e = this.e, premier = e[0], dernier = e[--this.n], n = this.n;
      if (n > 0) {
        let i = 0;
        for (;;) {
          const g = 2 * i + 1;
          if (g >= n) break;
          let m = g;
          if (g + 1 < n && e[g + 1] < e[g]) m = g + 1;
          if (e[m] < dernier) { e[i] = e[m]; i = m; } else break;
        }
        e[i] = dernier;
      }
      return premier;
    }
  }

  /** Routes de SAGA (0 = aucune, 1…8 = direction, 8 = nord) et nombre de cuvettes. dem : Float32Array
   *  dans le repère de SAGA. etape(f) peut lever Annule. */
  function routesSAGA(dem, NX, NY, pas, etape) {
    const N = NX * NY;
    const longueur = [];
    for (let k = 0; k < 8; k++) longueur.push(k % 2 === 0 ? pas : pas * Math.sqrt(2.0));
    const valide = (x, y) => x >= 0 && x < NX && y >= 0 && y < NY && !Number.isNaN(dem[y * NX + x]);

    let { ks: tri, ndata } = indexSAGA(dem);
    etape(0.2);

    // a. Cuvettes (Find_Pits) et plats (Mark_Flat).
    const pits = new Int32Array(N), flats = new Int32Array(N);
    const rects = [];                       // xmin, ymin, xmax, ymax, à la suite
    let nPits = 0;
    const pile = [];
    for (let n = 0; n < ndata; n++) {
      const s = tri[n];
      const z = dem[s];
      const y = (s / NX) | 0, x = s - y * NX;
      if (!(x > 0 && x < NX - 1 && y > 0 && y < NY - 1 && pits[s] === 0)) continue;
      let plusBas = false, plat = false;
      for (let i = 0; i < 8; i++) {
        const zt = dem[(y + DY_S[i]) * NX + x + DX_S[i]];
        if (Number.isNaN(zt) || z > zt) { plusBas = true; break; }
        if (z === zt) plat = true;
      }
      if (plusBas) continue;
      nPits++;
      pits[s] = nPits;
      if (!plat) continue;
      const fid = rects.length / 4 + 1;
      let r0 = x, r1 = y, r2 = x, r3 = y;
      flats[s] = fid;
      pile.length = 0;
      pile.push(s);
      while (pile.length) {
        const c = pile.pop();
        const cy = (c / NX) | 0, cx = c - cy * NX;
        for (let i = 0; i < 8; i++) {
          const ix = cx + DX_S[i], iy = cy + DY_S[i];
          if (ix < 0 || ix >= NX || iy < 0 || iy >= NY) continue;
          const t = iy * NX + ix;
          if (pits[t] === 0 && dem[t] === z) {
            pits[t] = nPits;
            flats[t] = fid;
            if (ix < r0) r0 = ix; if (iy < r1) r1 = iy; if (ix > r2) r2 = ix; if (iy > r3) r3 = iy;
            pile.push(t);
          }
        }
      }
      rects.push(r0, r1, r2, r3);
    }
    etape(0.35);

    // b. Exutoires (Find_Outlets).
    const jonctions = new Set();
    const K = nPits + 1;
    const cle = (a, b) => a < b ? a * K + b : b * K + a;
    const relies = (a, b) => a === b || jonctions.has(cle(a, b));
    const sortieCel = [], sortieIds = [];        // 8 numéros par exutoire, -1 : voisin pas plus bas
    const ids = new Int32Array(8);
    for (let n = 0; n < ndata; n++) {
      const s = tri[n];
      if (pits[s] !== 0) continue;
      const z = dem[s];
      const y = (s / NX) | 0, x = s - y * NX;
      let imin = -1, dzmin = 0.0, exutoire = false, versDehors = false;
      for (let i = 0; i < 8; i++) {
        const ix = x + DX_S[i], iy = y + DY_S[i];
        const dehors = !valide(ix, iy);
        const t = iy * NX + ix;
        if (dehors || z > dem[t]) {
          const iid = dehors ? 0 : pits[t];
          ids[i] = iid;
          if (!exutoire) {
            for (let j = 0; j < i; j++) if (ids[j] >= 0 && !relies(iid, ids[j])) { exutoire = true; break; }
          }
          if (!versDehors) {
            if (dehors) { versDehors = true; imin = i; }
            else {
              const dz = (z - dem[t]) / longueur[i];
              if (imin < 0 || dzmin < dz) { imin = i; dzmin = dz; }
            }
          }
        } else ids[i] = -1;
      }
      if (exutoire) {
        sortieCel.push(s);
        for (let i = 0; i < 8; i++) sortieIds.push(ids[i]);
        for (let i = 1; i < 8; i++) {
          if (ids[i] < 0) continue;
          for (let j = 0; j < i; j++) if (ids[j] >= 0 && !relies(ids[i], ids[j])) jonctions.add(cle(ids[i], ids[j]));
        }
      }
      if (imin >= 0) pits[s] = ids[imin];
    }
    tri = null;
    jonctions.clear();
    etape(0.6);

    // c. Routage (Get_Routes, Find_Route, Drain_Pit, Drain_Flat).
    const route = new Uint8Array(N);
    const nombreSorties = sortieCel.length;
    const P = nPits;
    if (P === 0) return { route, cuvettes: 0 };
    const draine = new Uint8Array(P);

    // Exutoires touchant chaque cuvette (pour retrouver ceux qui deviennent utilisables).
    const debut = new Int32Array(P + 1);
    for (let o = 0; o < nombreSorties; o++) for (let k = 0; k < 8; k++) { const p = sortieIds[8 * o + k]; if (p > 0) debut[p]++; }
    for (let p = 0; p < P; p++) debut[p + 1] += debut[p];
    const parCuvette = new Int32Array(debut[P]);
    const rempli = debut.slice(0, P);
    for (let o = 0; o < nombreSorties; o++) {
      for (let k = 0; k < 8; k++) {
        const p = sortieIds[8 * o + k];
        if (p > 0) parCuvette[rempli[p - 1]++] = o;
      }
    }
    const retire = new Uint8Array(nombreSorties);

    const utilisable = (o) => {
      let avecDrainee = false, avecNonDrainee = false;
      for (let k = 0; k < 8; k++) {
        const p = sortieIds[8 * o + k];
        if (p === 0) avecDrainee = true;
        else if (p > 0) { if (draine[p - 1]) avecDrainee = true; else avecNonDrainee = true; }
      }
      return avecDrainee && avecNonDrainee;
    };

    // Plat parcouru en largeur depuis s0 ; chaque couche dans l'ordre de balayage de SAGA.
    let couche = new Int32Array(1024), suivante = new Int32Array(1024);
    const grandir = (a, n) => { const b = new Int32Array(a.length * 2); b.set(a.subarray(0, n)); return b; };
    function drainerPlat(s0) {
      const fid = flats[s0];
      if (fid <= 0) return;
      flats[s0] = 0;
      let nc = 1;
      couche[0] = s0;
      while (nc > 0) {
        let ns = 0;
        for (let q = 0; q < nc; q++) {
          const c = couche[q];
          const cy = (c / NX) | 0, cx = c - cy * NX;
          for (let i = 0; i < 8; i++) {
            const ix = cx + DX_S[i], iy = cy + DY_S[i];
            if (!valide(ix, iy)) continue;
            const t = iy * NX + ix;
            if (flats[t] === fid) {
              const j = (i + 4) & 7;
              route[t] = j === 0 ? 8 : j;
              flats[t] = 0;
              if (ns === suivante.length) suivante = grandir(suivante, ns);
              suivante[ns++] = t;
            }
          }
        }
        suivante.subarray(0, ns).sort();
        const tmp = couche; couche = suivante; suivante = tmp;
        if (suivante.length < couche.length) suivante = new Int32Array(couche.length);
        nc = ns;
      }
    }

    function drainerCuvette(s0, pid) {
      let s = s0;
      for (;;) {
        if (flats[s] > 0) { drainerPlat(s); return; }
        const y = (s / NX) | 0, x = s - y * NX;
        const z = dem[s];
        let imin = -1, dzmin = 0.0;
        for (let i = 0; i < 8; i++) {
          const ix = x + DX_S[i], iy = y + DY_S[i];
          if (!valide(ix, iy)) continue;
          const t = iy * NX + ix;
          if (pits[t] === pid && route[t] === 0) {
            const dz = (z - dem[t]) / longueur[i];
            if (dzmin < dz) { imin = i; dzmin = dz; }
          }
        }
        if (imin < 0) return;
        s += DY_S[imin] * NX + DX_S[imin];
        const j = (imin + 4) & 7;
        route[s] = j === 0 ? 8 : j;
      }
    }

    const tas = new TasEntiers();
    for (let o = 0; o < nombreSorties; o++) if (utilisable(o)) tas.ajouter(o);
    let faits = 0, premiereNonDrainee = 0;
    const rendreUtilisables = (p) => {
      for (let q = debut[p]; q < debut[p + 1]; q++) {
        const o = parCuvette[q];
        if (!retire[o] && utilisable(o)) tas.ajouter(o);
      }
    };
    let traites = 0;
    const nouvelles = [];
    for (;;) {
      while (!tas.vide) {
        const o = tas.retirer();
        if (retire[o] || !utilisable(o)) continue;
        retire[o] = 1;
        if ((++traites & 4095) === 0) etape(0.6 + 0.2 * faits / P);
        const s = sortieCel[o];
        const y = (s / NX) | 0, x = s - y * NX;
        if (route[s] === 0) {
          const z = dem[s];
          let imin = -1, dzmin = 0.0;
          for (let i = 0; i < 8; i++) {
            const ix = x + DX_S[i], iy = y + DY_S[i];
            if (!valide(ix, iy) || route[iy * NX + ix] > 0) { imin = i; break; }
            const p = sortieIds[8 * o + i];
            if (p === 0 || (p > 0 && draine[p - 1])) {
              const dz = (z - dem[iy * NX + ix]) / longueur[i];
              if (imin < 0 || dzmin < dz) { imin = i; dzmin = dz; }
            }
          }
          if (imin >= 0) route[s] = imin > 0 ? imin : 8;
        }
        nouvelles.length = 0;
        for (let i = 0; i < 8; i++) {
          const p = sortieIds[8 * o + i];
          if (p > 0 && !draine[p - 1]) {
            draine[p - 1] = 1;
            drainerCuvette(s, p);
            nouvelles.push(p - 1);
            faits++;
          }
        }
        for (const p of nouvelles) rendreUtilisables(p);
      }
      if (faits >= P) break;
      // Cuvette qu'aucun exutoire n'atteint : déclarée drainée sans route (la plus petite d'abord).
      while (draine[premiereNonDrainee]) premiereNonDrainee++;
      draine[premiereNonDrainee] = 1;
      faits++;
      rendreUtilisables(premiereNonDrainee);
      if (faits >= P) break;
    }
    return { route, cuvettes: P };
  }

  /** Fill Sinks (Pit_Eliminator) : relève dem (repère de SAGA) selon les routes. */
  function comblerSAGA(dem, route, NX, NY, pas, epsilon) {
    const N = NX * NY;
    const unite = [], longueur = [];
    for (let k = 0; k < 8; k++) { unite.push(k % 2 === 0 ? 1.0 : Math.sqrt(2.0)); longueur.push(k % 2 === 0 ? pas : pas * Math.sqrt(2.0)); }
    // goRoute : la route trouvée, sinon la plus forte pente (Get_Gradient_NeighborDir : aucune
    // sur le bord ni à côté d'un vide), -1 = nulle part.
    const va = new Int8Array(N).fill(-1);
    for (let y = 0; y < NY; y++) {
      for (let x = 0; x < NX; x++) {
        const s = y * NX + x;
        if (route[s] > 0) { va[s] = route[s] % 8; continue; }
        const zs = dem[s];
        if (Number.isNaN(zs)) continue;
        let d = -1, dzmax = 0.0;
        for (let i = 0; i < 8; i++) {
          const ix = x + DX_S[i], iy = y + DY_S[i];
          if (ix < 0 || ix >= NX || iy < 0 || iy >= NY || Number.isNaN(dem[iy * NX + ix])) { d = -1; break; }
          const dz = (zs - dem[iy * NX + ix]) / longueur[i];
          if (dz > 0 && (d < 0 || dzmax < dz)) { d = i; dzmax = dz; }
        }
        va[s] = d;
      }
    }

    const verrou = new Uint32Array(N);
    let passage = 0;
    let pileCel = new Int32Array(1024), pileZ = new Float64Array(1024), np = 0;
    const empiler = (cx, cy, cz) => {
      for (let i = 0; i < 8; i++) {
        const ix = cx + DX_S[i], iy = cy + DY_S[i];
        if (ix < 0 || ix >= NX || iy < 0 || iy >= NY) continue;
        const t = iy * NX + ix;
        if (va[t] === ((i + 4) & 7) && verrou[t] !== passage) {
          if (np === pileCel.length) {
            const a = new Int32Array(np * 2); a.set(pileCel); pileCel = a;
            const b = new Float64Array(np * 2); b.set(pileZ); pileZ = b;
          }
          pileCel[np] = t; pileZ[np] = cz; np++;
        }
      }
    };
    for (let y = 0; y < NY; y++) {
      for (let x = 0; x < NX; x++) {
        const s = y * NX + x;
        const zs = dem[s];
        if (Number.isNaN(zs)) continue;
        const i0 = va[s] < 0 ? 7 : va[s];          // Get_xTo ramène -1 à 7 (NO)
        const ix0 = x + DX_S[i0], iy0 = y + DY_S[i0];
        if (ix0 >= 0 && ix0 < NX && iy0 >= 0 && iy0 < NY) {
          const zt = dem[iy0 * NX + ix0];
          if (!Number.isNaN(zt) && !(zs > zt)) continue;
        }
        let exutoire = false;
        for (let i = 0; i < 8; i++) {
          const ix = x + DX_S[i], iy = y + DY_S[i];
          if (ix < 0 || ix >= NX || iy < 0 || iy >= NY) continue;
          const t = iy * NX + ix;
          if (va[t] === ((i + 4) & 7) && zs > dem[t]) { exutoire = true; break; }
        }
        if (!exutoire) continue;
        passage++;
        verrou[s] = passage;
        // Fill_Sink : chaque cellule n'a qu'une route, donc un seul chemin vers l'exutoire ;
        // l'ordre de visite ne change rien.
        np = 0;
        empiler(x, y, zs);
        while (np > 0) {
          np--;
          const ci = pileCel[np];
          let cz = pileZ[np];
          if (verrou[ci] === passage) continue;
          verrou[ci] = passage;
          cz += epsilon * unite[va[ci]];
          if (dem[ci] < cz) {
            dem[ci] = cz;                           // arrondi au float32 par le tableau
            const cy = (ci / NX) | 0;
            empiler(ci - cy * NX, cy, cz);
          }
        }
      }
    }
  }

  /** Le MNT après Sink Removal (float32, vides gardés) et le nombre de cuvettes trouvées. */
  function sinkRemoval(g, epsilon, suivi) {
    const NX = g.colonnes, NY = g.lignes, N = NX * NY;
    const etape = f => { if (suivi && suivi("Sink Removal (SAGA)", 0.25 + 0.2 * f) === false) throw new Annule(); };
    const dem = new Float32Array(N);
    for (let y = 0; y < NY; y++) {
      const r = NY - 1 - y;
      dem.set(g.z.subarray(r * NX, (r + 1) * NX), y * NX);
    }
    const { route, cuvettes } = routesSAGA(dem, NX, NY, g.pas, etape);
    etape(0.8);
    comblerSAGA(dem, route, NX, NY, g.pas, epsilon === undefined ? EPSILON_SR : epsilon);
    const z = new Float32Array(N);
    for (let y = 0; y < NY; y++) {
      const r = NY - 1 - y;
      z.set(dem.subarray(y * NX, (y + 1) * NX), r * NX);
    }
    return { z, cuvettes };
  }

  /** (surface, parent) : Sink Removal, puis comblement à plat de ce qui resterait (plat parfait sans
   *  exutoire, où SAGA laisse l'eau sans direction), comme remplir_sr de l'étalon. */
  function remplirSR(g, epsilon, suivi) {
    const z = sinkRemoval(g, epsilon, suivi).z;
    const relais = suivi ? (e, f) => suivi("Sink Removal (SAGA)", 0.45 + 0.2 * f) : null;
    const { rempli, parent } = remplir(Object.assign({}, g, { z }), relais, true);
    return { surface: rempli, parent };
  }

  // ---------------------------------------------------------------------------
  // 2. Directions D8 : plus forte pente, à égalité le premier dans l'ordre de SAGA
  // ---------------------------------------------------------------------------
  function directions(g, surface, parent, graine) {
    const n = g.lignes * g.colonnes;
    const d = new Int8Array(n).fill(AUCUNE);
    const dist = distances(g.pas);
    for (let i = 0; i < n; i++) {
      const zi = surface[i];
      if (Number.isNaN(zi)) continue;
      let meilleur = -1, meilleurePente = 0.0;
      for (const k of ORDRE_SAGA) {
        const j = voisin(g, i, k);
        if (j < 0) continue;
        const zj = surface[j];
        if (Number.isNaN(zj)) continue;
        const chute = zi - zj;
        if (chute > 0.0) {
          const p = chute / dist[k];
          if (p > meilleurePente) { meilleur = k; meilleurePente = p; }
        }
      }
      if (meilleur >= 0) d[i] = meilleur;
      else if (graine[i]) d[i] = SORTIE;
      else { for (let k = 0; k < 8; k++) if (voisin(g, i, k) === parent[i]) { d[i] = k; break; } }
    }
    return d;
  }

  function aval(g, d, i) { return d[i] >= 0 ? voisin(g, i, d[i]) : -1; }

  // ---------------------------------------------------------------------------
  // 3. Accumulation D8 (cellules drainées, la cellule comprise)
  // ---------------------------------------------------------------------------
  function accumulation(g, d) {
    const n = g.lignes * g.colonnes;
    const entrees = new Uint8Array(n), acc = new Int32Array(n), file = new Int32Array(n);
    for (let i = 0; i < n; i++) if (d[i] >= 0) entrees[aval(g, d, i)]++;
    let tete = 0, queue = 0;
    for (let i = 0; i < n; i++) {
      if (d[i] === AUCUNE) continue;
      acc[i] = 1;
      if (entrees[i] === 0) file[queue++] = i;
    }
    while (tete < queue) {
      const i = file[tete++];
      const j = aval(g, d, i);
      if (j >= 0) {
        acc[j] += acc[i];
        if (--entrees[j] === 0) file[queue++] = j;
      }
    }
    return acc;
  }

  // ---------------------------------------------------------------------------
  // 3 bis. Accumulation MFD (Freeman 1991), Flow Accumulation (Top-Down) de SAGA
  // ---------------------------------------------------------------------------
  function chutesMFD(g, surface, i, chutes) {
    for (let k = 0; k < 8; k++) {
      chutes[k] = 0.0;
      const j = voisin(g, i, k);
      if (j >= 0 && !Number.isNaN(surface[j])) chutes[k] = surface[i] - surface[j];
      else {
        const o = voisin(g, i, (k + 4) & 7);
        if (o >= 0 && !Number.isNaN(surface[o])) chutes[k] = -(surface[i] - surface[o]);
      }
    }
  }

  /** `apports` (facultatif) : ce que chaque cellule apporte au lieu de 1 (le C de la section 7). */
  function accumulationMFD(g, surface, d, convergence, apports) {
    const n = g.lignes * g.colonnes;
    const dist = distances(g.pas);
    const valide = i => !Number.isNaN(g.z[i]);
    const entrees = new Uint8Array(n);
    const chutes = new Float64Array(8), poids = new Float64Array(8);
    // Les parts sont recalculées au passage plutôt que gardées : mêmes valeurs, moins de mémoire.
    function parts(i) {
      chutesMFD(g, surface, i, chutes);
      let somme = 0.0;
      for (let k = 0; k < 8; k++) {
        poids[k] = 0.0;
        if (chutes[k] > 0.0) { poids[k] = Math.pow(chutes[k] / dist[k], convergence); somme += poids[k]; }
      }
      return somme;
    }
    for (let i = 0; i < n; i++) {
      if (!valide(i)) continue;
      const somme = parts(i);
      if (somme > 0.0) {
        for (let k = 0; k < 8; k++) if (poids[k] > 0.0) { const j = voisin(g, i, k); if (j >= 0 && valide(j)) entrees[j]++; }
      } else if (d[i] >= 0) {
        const j = voisin(g, i, d[i]); if (j >= 0 && valide(j)) entrees[j]++;
      }
    }
    const acc = new Float64Array(n);
    const file = new Int32Array(n);
    let tete = 0, queue = 0;
    for (let i = 0; i < n; i++) if (valide(i)) { acc[i] = apports ? apports[i] : 1.0; if (entrees[i] === 0) file[queue++] = i; }
    let sortie = 0.0;
    while (tete < queue) {
      const i = file[tete++];
      const somme = parts(i);
      const a = acc[i];
      function donner(k, f) {
        const j = voisin(g, i, k);
        if (j >= 0 && valide(j)) {
          acc[j] += f * a;
          if (--entrees[j] === 0) file[queue++] = j;
        } else sortie += f * a;
      }
      if (somme > 0.0) { for (let k = 0; k < 8; k++) if (poids[k] > 0.0) donner(k, poids[k] / somme); }
      else if (d[i] >= 0) donner(d[i], 1.0);
      else sortie += a;
    }
    return { acc: Float32Array.from(acc), sortie };
  }

  // ---------------------------------------------------------------------------
  // 3 ter. Ordre de Strahler sur les directions D8
  // ---------------------------------------------------------------------------
  function strahler(g, d) {
    const n = g.lignes * g.colonnes;
    const entrees = new Uint8Array(n), ordre = new Uint8Array(n), nombre = new Uint8Array(n), file = new Int32Array(n);
    for (let i = 0; i < n; i++) if (d[i] >= 0) entrees[aval(g, d, i)]++;
    let tete = 0, queue = 0;
    for (let i = 0; i < n; i++) if (d[i] !== AUCUNE && entrees[i] === 0) file[queue++] = i;
    while (tete < queue) {
      const i = file[tete++];
      if (ordre[i] === 0) ordre[i] = 1;
      else if (nombre[i] > 1) ordre[i]++;
      const j = aval(g, d, i);
      if (j >= 0) {
        if (ordre[i] > ordre[j]) { ordre[j] = ordre[i]; nombre[j] = 1; }
        else if (ordre[i] === ordre[j]) nombre[j] = Math.min(255, nombre[j] + 1);
        if (--entrees[j] === 0) file[queue++] = j;
      }
    }
    return ordre;
  }

  // ---------------------------------------------------------------------------
  // 4. Pente (Zevenbergen & Thorne) et TWI, Basic Terrain Analysis de SAGA
  // ---------------------------------------------------------------------------
  // Résultat dans GR (pas d'allocation par cellule) : GR[0] = G (nord-sud), GR[1] = H (est-ouest).
  const GR = new Float64Array(2);
  function dz(s, l, c, L, C, z, dl, dc) {
    let ll = l + dl, cc = c + dc;
    if (ll >= 0 && ll < L && cc >= 0 && cc < C) { const v = s[ll * C + cc]; if (!Number.isNaN(v)) return v - z; }
    ll = l - dl; cc = c - dc;
    if (ll >= 0 && ll < L && cc >= 0 && cc < C) { const v = s[ll * C + cc]; if (!Number.isNaN(v)) return z - v; }
    return 0.0;
  }
  function gradient(g, s, i) {
    const C = g.colonnes, L = g.lignes;
    const l = (i / C) | 0, c = i - l * C;
    const z = s[i];
    const nord = dz(s, l, c, L, C, z, -1, 0), est = dz(s, l, c, L, C, z, 0, 1);
    const sud = dz(s, l, c, L, C, z, 1, 0), ouest = dz(s, l, c, L, C, z, 0, -1);
    GR[0] = (nord - sud) / (2.0 * g.pas); GR[1] = (est - ouest) / (2.0 * g.pas);
    return GR;
  }

  function pente(g, surface) {
    const n = g.lignes * g.colonnes;
    const t = new Float32Array(n).fill(NaN);
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(g.z[i])) continue;
      const gr = gradient(g, surface, i);
      t[i] = Math.sqrt(gr[0] * gr[0] + gr[1] * gr[1]);
    }
    return t;
  }

  function largeur(g, surface, i) {
    const gr = gradient(g, surface, i), G = gr[0], H = gr[1];
    let a;
    if (G !== 0.0) a = Math.PI + Math.atan2(H, G);
    else a = H > 0.0 ? 1.5 * Math.PI : (H < 0.0 ? 0.5 * Math.PI : -1.0);
    return (Math.abs(Math.sin(a)) + Math.abs(Math.cos(a))) * g.pas;
  }

  function twi(g, surface, acc, tanb) {
    const n = g.lignes * g.colonnes;
    const w = new Float32Array(n).fill(NaN);
    const aire = g.pas * g.pas;
    for (let i = 0; i < n; i++) {
      if (Number.isNaN(tanb[i])) continue;
      const sca = acc[i] * aire / largeur(g, surface, i);
      w[i] = Math.log(sca / Math.max(tanb[i], FLT_EPSILON));
    }
    return w;
  }

  // ---------------------------------------------------------------------------
  // 5. Dépressions : cellules comblées connexes (8-connexité), sommes dans l'ordre des lignes
  // ---------------------------------------------------------------------------
  function depressions(g, rempli) {
    const n = g.lignes * g.colonnes, C = g.colonnes, z = g.z;
    const etiq = new Int32Array(n);
    const profonde = i => !Number.isNaN(z[i]) && rempli[i] - z[i] > 0.0;
    const file = new Int32Array(n);
    let nombre = 0;
    for (let i = 0; i < n; i++) {
      if (etiq[i] !== 0 || !profonde(i)) continue;
      etiq[i] = ++nombre;
      let tete = 0, queue = 0;
      file[queue++] = i;
      while (tete < queue) {
        const c = file[tete++];
        for (let k = 0; k < 8; k++) {
          const j = voisin(g, c, k);
          if (j >= 0 && etiq[j] === 0 && profonde(j)) { etiq[j] = nombre; file[queue++] = j; }
        }
      }
    }
    const aire = g.pas * g.pas;
    const liste = [];
    for (let e = 0; e < nombre; e++) {
      liste.push({ id: e + 1, cellules: 0, surface: 0, volume: 0, profondeur: 0, niveau: 0,
                   sommeLigne: 0, sommeColonne: 0, cellulePlusProfonde: -1, bassin: 0, exutoire: -1 });
    }
    for (let i = 0; i < n; i++) {
      const e = etiq[i];
      if (e === 0) continue;
      const d = liste[e - 1], prof = rempli[i] - z[i], l = (i / C) | 0;
      d.cellules++;
      d.volume += prof * aire;
      if (prof > d.profondeur) { d.profondeur = prof; d.cellulePlusProfonde = i; }
      d.niveau = rempli[i];
      d.sommeLigne += l; d.sommeColonne += i - l * C;
    }
    for (const d of liste) d.surface = d.cellules * aire;
    return { etiquettes: etiq, liste };
  }

  // ---------------------------------------------------------------------------
  // Tout d'un coup
  // ---------------------------------------------------------------------------
  /** methode : { comblement: "wang_liu" | "sink_removal", penteMin (degrés, Wang & Liu seul), partage: "mfd" | "d8", convergence } ; suivi(etape, fraction) → false pour arrêter. */
  function calculer(g, methode, suivi) {
    const m = Object.assign({ comblement: "wang_liu", penteMin: PENTE_MIN, partage: "mfd", convergence: CONVERGENCE }, methode || {});
    const durees = [];
    function etape(nom, f) { if (suivi && suivi(nom, f) === false) throw new Annule(); }
    function chrono(nom, f) { const t = Date.now(); const r = f(); durees.push([nom, (Date.now() - t) / 1000]); return r; }
    etape("Remplissage à plat", 0);
    const { rempli, graine } = chrono("Remplissage à plat", () => remplir(g, suivi));
    let surface, parent;
    if (m.comblement === "sink_removal") {
      etape("Sink Removal (SAGA)", 0.25);
      ({ surface, parent } = chrono("Sink Removal", () => remplirSR(g, EPSILON_SR, suivi)));
    } else if (m.comblement === "wang_liu") {
      etape("Remplissage de Wang & Liu", 0.25);
      ({ surface, parent } = chrono("Wang & Liu", () => remplirWL(g, m.penteMin, suivi)));
    } else throw new Error("comblement inconnu : " + m.comblement);
    etape("Directions d'écoulement", 0.5);
    const dir = chrono("Directions", () => directions(g, surface, parent, graine));
    etape("Accumulation", 0.55);
    const accD8 = chrono("Accumulation D8", () => accumulation(g, dir));
    let acc;
    if (m.partage === "mfd") {
      etape("Partage MFD", 0.6);
      acc = chrono("Accumulation MFD", () => accumulationMFD(g, surface, dir, m.convergence).acc);
    } else acc = Float32Array.from(accD8);
    etape("Ordre de Strahler", 0.75);
    const ordre = chrono("Strahler", () => strahler(g, dir));
    etape("Pente et TWI", 0.8);
    const tanb = chrono("Pente", () => pente(g, surface));
    const w = chrono("TWI", () => twi(g, surface, acc, tanb));
    etape("Dépressions", 0.9);
    const { etiquettes, liste } = chrono("Dépressions", () => depressions(g, rempli));
    // Bassin d'une dépression : l'eau qui en sort (D8) ; l'exutoire est la cellule qui en porte le plus.
    const n = g.lignes * g.colonnes;
    const portee = new Int32Array(liste.length);
    for (let i = 0; i < n; i++) {
      const e = etiquettes[i];
      if (e === 0) continue;
      const k = dir[i];
      if (k === SORTIE || (k >= 0 && etiquettes[voisin(g, i, k)] !== e)) {
        liste[e - 1].bassin += accD8[i];
        if (accD8[i] > portee[e - 1]) { portee[e - 1] = accD8[i]; liste[e - 1].exutoire = i; }
      }
    }
    let exutoire = null;
    for (let i = 0; i < n; i++) {
      if (dir[i] === SORTIE && (exutoire === null || accD8[i] > exutoire.cellules)) exutoire = { cellule: i, cellules: accD8[i] };
    }
    return { methode: m, rempli, surface, dir, accD8, acc, strahler: ordre, tanb, twi: w, etiquettes,
             depressions: liste, exutoire, durees };
  }

  /** Débit de ruissellement (m³/s), méthode rationnelle : Q = C × i × A. */
  function debit(cellules, pas, coefficient, intensiteMmH) {
    return coefficient * (intensiteMmH / 1000.0 / 3600.0) * (cellules * pas * pas);
  }

  // ---------------------------------------------------------------------------
  // 6. Remodelage, sur une copie (noyau.py section 6, Sources/Noyau/Remodelage.swift)
  // ---------------------------------------------------------------------------
  function dansZone(x, y, anneaux) {
    let dedans = false;
    for (const a of anneaux) {
      const n = a.length;
      if (n === 0) continue;
      let j = n - 1;
      for (let i = 0; i < n; i++) {
        const xi = a[i][0], yi = a[i][1], xj = a[j][0], yj = a[j][1];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
        j = i;
      }
    }
    return dedans;
  }

  function poidsEgalisation(d, rayon, raccord) {
    if (d <= rayon) return 1.0;
    if (raccord <= 0.0 || d >= rayon + raccord) return 0.0;
    const u = (d - rayon) / raccord;
    return 0.5 * (1.0 + Math.cos(Math.PI * u));
  }

  /** Pinceau (camion, aspirateur) : distance normalisée au centre de la forme, 0 au centre, 1 au bord. */
  function rayonPinceau(forme, u, v, a, b) {
    if (forme === "rond") return Math.sqrt(u * u + v * v) / a;
    if (forme === "carre") return Math.max(Math.abs(u), Math.abs(v)) / a;
    if (forme === "rectangle") return Math.max(Math.abs(u) / a, Math.abs(v) / b);
    if (forme === "hexagone") return Math.max(Math.abs(v), Math.abs(u) * Math.sqrt(3.0) / 2.0 + Math.abs(v) / 2.0) / (a * Math.sqrt(3.0) / 2.0);
    throw new Error("forme inconnue : " + forme);
  }

  function poidsPinceau(r, repartition) {
    const f = 0.5 * (1.0 + Math.cos(Math.PI * r));
    return repartition < 0.0 ? 1.0 + repartition * (1.0 - f) : 1.0 - repartition * f;
  }

  function peindre(g, op, z) {
    const C = g.colonnes, L = g.lignes, x0 = g.x0 || 0, y0 = g.y0 || 0, pas = g.pas;
    const a = op.longueur / 2.0, b = (op.forme === "rectangle" ? op.largeur : op.longueur) / 2.0;
    const ang = op.angle * (Math.PI / 180.0), ct = Math.cos(ang), st = Math.sin(ang);
    const R = (op.forme === "carre" ? a * Math.SQRT2 : op.forme === "rectangle" ? Math.sqrt(a * a + b * b) : a) + pas;
    for (const [px, py, dz] of op.touches) {
      const c0 = Math.max(0, Math.floor((px - R - x0) / pas)), c1 = Math.min(C - 1, Math.ceil((px + R - x0) / pas));
      const l0 = Math.max(0, Math.floor((y0 - py - R) / pas)), l1 = Math.min(L - 1, Math.ceil((y0 - py + R) / pas));
      for (let l = l0; l <= l1; l++) {
        for (let c = c0; c <= c1; c++) {
          const i = l * C + c;
          if (Number.isNaN(z[i])) continue;
          const dx = x0 + (c + 0.5) * pas - px, dy = y0 - (l + 0.5) * pas - py;
          const r = rayonPinceau(op.forme, dx * ct + dy * st, dy * ct - dx * st, a, b);
          if (r <= 1.0) z[i] = f32(z[i] + dz * poidsPinceau(r, op.repartition));
        }
      }
    }
    return Object.assign({}, g, { z });
  }

  /** op : { type: "decaler", dz, zone } | { type: "niveler", altitude, zone } |
   *       { type: "egaliser", x, y, altitude, rayon, raccord } |
   *       { type: "pinceau", forme, longueur, largeur, angle, repartition, touches: [[x, y, dz], …] } ;
   *       zone = [[ [x, y], … ], …] ou null. */
  function remodeler(g, op) {
    const C = g.colonnes, L = g.lignes, z = new Float32Array(g.z);
    const x0 = g.x0 || 0, y0 = g.y0 || 0, pas = g.pas;
    if (op.type === "pinceau") return peindre(g, op, z);
    let l0 = 0, l1 = L - 1, c0 = 0, c1 = C - 1;
    if (op.type === "egaliser") {
      const m = op.rayon + Math.max(0, op.raccord) + pas;
      c0 = Math.max(0, Math.floor((op.x - m - x0) / pas)); c1 = Math.min(C - 1, Math.ceil((op.x + m - x0) / pas));
      l0 = Math.max(0, Math.floor((y0 - op.y - m) / pas)); l1 = Math.min(L - 1, Math.ceil((y0 - op.y + m) / pas));
    } else if (op.zone) {
      let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
      for (const a of op.zone) for (const p of a) {
        xmin = Math.min(xmin, p[0]); xmax = Math.max(xmax, p[0]); ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]);
      }
      if (!Number.isFinite(xmin)) return Object.assign({}, g, { z });
      c0 = Math.max(0, Math.floor((xmin - x0) / pas) - 1); c1 = Math.min(C - 1, Math.ceil((xmax - x0) / pas) + 1);
      l0 = Math.max(0, Math.floor((y0 - ymax) / pas) - 1); l1 = Math.min(L - 1, Math.ceil((y0 - ymin) / pas) + 1);
    }
    for (let l = l0; l <= l1; l++) {
      for (let c = c0; c <= c1; c++) {
        const i = l * C + c;
        if (Number.isNaN(z[i])) continue;
        const x = x0 + (c + 0.5) * pas, y = y0 - (l + 0.5) * pas;
        if (op.type === "egaliser") {
          const dx = x - op.x, dy = y - op.y;
          const w = poidsEgalisation(Math.sqrt(dx * dx + dy * dy), op.rayon, op.raccord);
          if (w > 0.0) z[i] = f32(z[i] + w * (op.altitude - z[i]));
          continue;
        }
        if (op.zone && !dansZone(x, y, op.zone)) continue;
        if (op.type === "decaler") z[i] = f32(z[i] + op.dz);
        else if (op.type === "niveler") z[i] = f32(op.altitude);
        else throw new Error("opération inconnue : " + op.type);
      }
    }
    return Object.assign({}, g, { z });
  }

  function remodelerTout(g, ops) { return ops.reduce((h, op) => remodeler(h, op), g); }

  function bilanTerrassement(avant, apres, pas) {
    let remblai = 0.0, deblai = 0.0;
    const aire = pas * pas;
    for (let i = 0; i < avant.length; i++) {
      const a = avant[i], b = apres[i];
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      const d = b - a;
      if (d > 0.0) remblai += d * aire; else if (d < 0.0) deblai -= d * aire;
    }
    return { remblai, deblai };
  }

  // ---------------------------------------------------------------------------
  // 7. Pluie de projet et ruissellement (noyau.py section 7, Sources/Noyau/Pluie.swift)
  // ---------------------------------------------------------------------------
  // Q = i × Σ (C × aire) sur ce qui est drainé : accumulation pondérée par le C de chaque cellule,
  // avec le même partage (MFD ou D8) que l'aire drainée.

  /** Montana : i = a × t^(−b), a en mm/min et t en minutes. En mm/h. */
  function intensiteMontana(a, b, dureeMin) { return 60.0 * a * Math.pow(dureeMin, -b); }

  /** C = R / P par le SCS : S = 25 400 / CN − 254 (mm), pertes initiales Ia·S. */
  function coefficientCN(cn, pluieMm, ia) {
    if (ia === undefined) ia = 0.2;
    if (pluieMm <= 0.0) return 0.0;
    if (cn >= 100.0) return 1.0;
    if (cn <= 0.0) return 0.0;
    const s = 25400.0 / cn - 254.0, p0 = ia * s;
    if (pluieMm <= p0) return 0.0;
    return (pluieMm - p0) * (pluieMm - p0) / (pluieMm + (1.0 - ia) * s) / pluieMm;
  }

  /** Le C de chaque cellule (float32) : `defaut`, sauf dans les surfaces (la dernière l'emporte), 0 hors MNT.
   *  surface = { zone: anneaux, c } ou { zone: anneaux, cn } ; une surface proposée a { polygones: [anneaux, …] }
   *  à la place de zone : la réunion de ses polygones, chacun en pair-impair (comme l'étalon). */
  function carteCoefficients(g, defaut, surfaces, pluieMm) {
    const C = g.colonnes, L = g.lignes, x0 = g.x0 || 0, y0 = g.y0 || 0, pas = g.pas;
    const valeurs = surfaces.map(s => f32("c" in s ? s.c : coefficientCN(s.cn, pluieMm)));
    // Rectangle englobant de chaque surface, en lignes et colonnes (une cellule de marge).
    const cadres = surfaces.map(s => {
      let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
      for (const a of (s.polygones ? s.polygones.flat() : s.zone)) for (const p of a) {
        xmin = Math.min(xmin, p[0]); xmax = Math.max(xmax, p[0]); ymin = Math.min(ymin, p[1]); ymax = Math.max(ymax, p[1]);
      }
      if (!Number.isFinite(xmin)) return [1, 0, 1, 0];
      return [Math.max(0, Math.floor((y0 - ymax) / pas) - 1), Math.min(L - 1, Math.ceil((y0 - ymin) / pas) + 1),
              Math.max(0, Math.floor((xmin - x0) / pas) - 1), Math.min(C - 1, Math.ceil((xmax - x0) / pas) + 1)];
    });
    const k = new Float32Array(L * C), d = f32(defaut);
    for (let l = 0; l < L; l++) {
      for (let c = 0; c < C; c++) {
        const i = l * C + c;
        if (Number.isNaN(g.z[i])) continue;
        k[i] = d;
        if (!surfaces.length) continue;
        const x = x0 + (c + 0.5) * pas, y = y0 - (l + 0.5) * pas;
        for (let s = surfaces.length - 1; s >= 0; s--) {
          const f = cadres[s];
          if (l < f[0] || l > f[1] || c < f[2] || c > f[3]) continue;
          const su = surfaces[s];
          if (su.polygones ? su.polygones.some(p => dansZone(x, y, p)) : dansZone(x, y, su.zone)) { k[i] = valeurs[s]; break; }
        }
      }
    }
    return k;
  }

  /** Comme `accumulation`, chaque cellule apportant son poids au lieu de 1. */
  function accumulationD8Ponderee(g, d, poids) {
    const n = g.lignes * g.colonnes;
    const entrees = new Uint8Array(n), acc = new Float64Array(n), file = new Int32Array(n);
    for (let i = 0; i < n; i++) if (d[i] >= 0) entrees[aval(g, d, i)]++;
    let tete = 0, queue = 0;
    for (let i = 0; i < n; i++) {
      if (d[i] === AUCUNE) continue;
      acc[i] = poids[i];
      if (entrees[i] === 0) file[queue++] = i;
    }
    while (tete < queue) {
      const i = file[tete++];
      const j = aval(g, d, i);
      if (j >= 0) {
        acc[j] += acc[i];
        if (--entrees[j] === 0) file[queue++] = j;
      }
    }
    return Float32Array.from(acc);
  }

  /** Carte des C et accumulation pondérée (cellules × C), même partage que l'aire drainée.
   *  r : { methode, surface, dir } d'un calcul sur la même grille. */
  function ruissellement(g, r, defaut, surfaces, pluieMm) {
    const coefficients = carteCoefficients(g, defaut, surfaces, pluieMm);
    const m = r.methode || {};
    const accC = (m.partage || "mfd") === "mfd"
      ? accumulationMFD(g, r.surface, r.dir, m.convergence || CONVERGENCE, coefficients).acc
      : accumulationD8Ponderee(g, r.dir, coefficients);
    return { coefficients, accC };
  }

  /** Débit (m³/s) quand le C varie d'une cellule à l'autre : Q = i × aire × Σ C. */
  function debitPondere(accC, pas, intensiteMmH) { return (intensiteMmH / 1000.0 / 3600.0) * pas * pas * accC; }

  global.Noyau = {
    DL, DC, SORTIE, AUCUNE, ORDRE_SAGA, PENTE_MIN, CONVERGENCE, Tas, Annule,
    voisin, remplir, remplirWL, remplirSR, sinkRemoval, indexSAGA, directions, accumulation, accumulationMFD, strahler, pente, twi,
    depressions, calculer, debit, dansZone, poidsEgalisation, rayonPinceau, poidsPinceau, remodeler, remodelerTout, bilanTerrassement,
    intensiteMontana, coefficientCN, carteCoefficients, accumulationD8Ponderee, ruissellement, debitPondere,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
