'use strict';
/* Outils 3D communs (three.js r128) : couleurs en espace linéaire, matériaux patchés (vent dans le shader des plantes,
   ombres douces des nuages sur tout ce qui est au sol), fusion de pièces colorées en une géométrie, primitives
   végétales légères (feuilles en rubans, brins à trois faces, épillets), matrices d'instances calculées à la main.
   Repère : 1 unité = 1 case du plan ; x vers l'est, z vers le sud, y vers le haut. */

const T3 = THREE;
const K3 = (() => {
  const K = {};
  const _c = new Map();
  // Toutes les couleurs passent par l'espace linéaire, sinon tout paraît délavé avec la sortie sRGB.
  K.col = c => { let v = _c.get(c); if (!v) { v = new T3.Color(c).convertSRGBToLinear(); _c.set(c, v); } return v; };
  K.melange = (a, b, t) => K.col(a).clone().lerp(K.col(b), Math.max(0, Math.min(1, t)));

  // ---------- Uniformes partagés ----------
  K.U = {
    uTemps: { value: 0 }, uVent: { value: new T3.Vector2(1, 0) }, uForce: { value: 0.5 },
    tNuages: { value: null }, uNuageDecal: { value: new T3.Vector2() }, uNuage: { value: 0 }, uEchelleNuage: { value: 1 / 22 },
  };
  const projection = souple => `
    vec4 pm = vec4( transformed, 1.0 );
    #ifdef USE_INSTANCING
      pm = instanceMatrix * pm;
    #endif
    ${souple ? `
    vec3 org = vec3( 0.0 );
    #ifdef USE_INSTANCING
      org = instanceMatrix[ 3 ].xyz;
    #endif
    float hh = max( 0.0, pm.y - org.y );
    float onde = sin( uTemps * 2.1 - dot( org.xz, uVent ) * 0.8 ) * ( 0.55 + 0.45 * sin( uTemps * 0.47 - org.x * 0.23 - org.z * 0.07 ) )
      + 0.3 * sin( uTemps * 3.3 + org.x * 7.1 + org.z * 3.7 );
    float pli = uForce * ${souple.toFixed(3)} * onde * hh * hh;
    pm.xz += uVent * pli; pm.y -= abs( pli ) * 0.35;` : ''}
    vec4 wpos = modelMatrix * pm;
    vMonde = wpos.xz;
    vec4 mvPosition = viewMatrix * wpos;
    gl_Position = projectionMatrix * mvPosition;`;
  // Symptômes d'une alerte (C.3b) : code porté par la partie entière du rouge de l'instance, 2 × (3 × eau + azote), eau et azote de 0 à 2.
  // Aucun attribut d'instance en plus : les géométries restent partagées. aBout vaut 0 à la base d'une feuille, 1 à sa pointe.
  const vec = c => { const v = K.col(c); return `vec3(${v.r.toFixed(3)}, ${v.g.toFixed(3)}, ${v.b.toFixed(3)})`; };
  const symptomes = () => `
    vColor = color;
    vec3 ic = instanceColor; float sy = floor( ic.r / 2.0 ); ic.r -= 2.0 * sy; vColor *= ic;
    vFiss = 0.0;
    if ( sy > 8.5 ) vFiss = sy - 9.0;   // planche de maraîchage : seulement le niveau de fissures
    else if ( sy > 0.5 ) {
      float ea = floor( sy / 3.0 ), az = sy - 3.0 * ea, ton = 0.55 + 0.45 * color.g;
      if ( az > 0.5 ) {
        float fort = az - 1.0;
        vColor = mix( vColor, mix( ${vec('#b9cf6a')}, ${vec('#c8c85a')}, fort ) * ton, mix( 0.2, 0.5, fort ) );
        vColor = mix( vColor, ${vec('#ecd23a')} * ton, smoothstep( mix( 0.55, 0.22, fort ), mix( 0.95, 0.7, fort ), aBout ) * mix( 0.9, 1.0, fort ) );
      }
      if ( ea > 0.5 ) {
        float fort = ea - 1.0;
        vColor = mix( vColor, mix( ${vec('#8f9563')}, ${vec('#c9b06e')}, fort ) * ton, mix( 0.3, 0.74, fort ) );
        vColor = mix( vColor, mix( ${vec('#b9a56c')}, ${vec('#a98f5a')}, fort ) * ton, smoothstep( mix( 0.62, 0.3, fort ), mix( 0.98, 0.75, fort ), aBout ) );
      }
    }`;
  // Patch commun : le vent (si souple > 0), l'ombre des nuages qui glissent, les symptômes des cultures.
  K.patcher = (m, souple = 0, nuages = true, sympt = false) => {
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, K.U);
      sh.vertexShader = 'uniform float uTemps;\nuniform vec2 uVent;\nuniform float uForce;\nvarying vec2 vMonde;\n' + (sympt ? 'attribute float aBout;\nvarying float vFiss;\n' : '')
        + sh.vertexShader.replace('#include <project_vertex>', projection(souple)).replace('#include <color_vertex>', sympt ? symptomes() : '#include <color_vertex>');
      sh.fragmentShader = 'uniform sampler2D tNuages;\nuniform vec2 uNuageDecal;\nuniform float uNuage;\nuniform float uEchelleNuage;\nvarying vec2 vMonde;\n'
        + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
          ${nuages ? 'diffuseColor.rgb *= 1.0 - uNuage * texture2D( tNuages, vMonde * uEchelleNuage + uNuageDecal ).r;' : ''}`);
    };
    m.customProgramCacheKey = () => 'sf' + souple + (nuages ? 'n' : '') + (sympt ? 's' : '');
    return m;
  };
  // Sol qui se fend quand l'eau manque (C.3b). Motif périodique calculé une fois : rouge = distance à la fissure (réseau de Voronoï
  // déformé, 8 × 8 cellules), vert = masque lent qui ne laisse qu'une partie du réseau au stade léger.
  let _texFiss = null;
  const texFissures = () => {
    if (_texFiss) return _texFiss;
    const N = 512, C = 8, pas = N / C, d = new Uint8Array(N * N * 4), h = K.hasard, tau = Math.PI * 2;
    const germe = (a, b) => { const i = ((a % C) + C) % C + C * (((b % C) + C) % C); return [(a + 0.12 + 0.76 * h(i * 2 + 1)) * pas, (b + 0.12 + 0.76 * h(i * 2 + 2)) * pas]; };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const px = x + 7 * Math.sin(tau * y * 3 / N + 1.1) + 3.5 * Math.sin(tau * y * 7 / N + 4), py = y + 7 * Math.sin(tau * x * 2 / N + 2.3) + 3.5 * Math.sin(tau * x * 6 / N + 0.4);
      const cx = Math.floor(px / pas), cy = Math.floor(py / pas);
      let m = 1e9, ax = 0, ay = 0;
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const [sx, sy] = germe(cx + a, cy + b), q = (sx - px) ** 2 + (sy - py) ** 2; if (q < m) { m = q; ax = sx; ay = sy; } }
      let bord = 1e9;
      for (let b = -2; b <= 2; b++) for (let a = -2; a <= 2; a++) {
        const [sx, sy] = germe(cx + a, cy + b), ex = sx - ax, ey = sy - ay, l = Math.hypot(ex, ey);
        if (l > 1e-3) bord = Math.min(bord, ((px - (ax + sx) / 2) * -ex + (py - (ay + sy) / 2) * -ey) / l);
      }
      const o = (y * N + x) * 4, lent = 0.5 + 0.28 * Math.sin(tau * x * 3 / N + 0.7) * Math.cos(tau * y * 2 / N + 1.9) + 0.22 * Math.sin(tau * (x + y) * 4 / N + 3.1);
      d[o] = Math.min(255, Math.max(0, bord / (pas / 2)) * 255); d[o + 1] = Math.max(0, Math.min(1, lent)) * 255; d[o + 3] = 255;
    }
    const t = new T3.DataTexture(d, N, N, T3.RGBAFormat); t.wrapS = t.wrapT = T3.RepeatWrapping; t.magFilter = T3.LinearFilter; t.minFilter = T3.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; t.needsUpdate = true;
    return (_texFiss = t);
  };
  // m : matériau passé par K.patcher. instance : le niveau vient du code d'instance (planches de maraîchage) et non de l'attribut aFiss du sol.
  K.fissurable = (m, instance) => {
    const base = m.onBeforeCompile;
    m.onBeforeCompile = sh => {
      base(sh);
      sh.uniforms.tFiss = { value: texFissures() };
      if (!instance) sh.vertexShader = 'attribute float aFiss;\nvarying float vFiss;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n    vFiss = aFiss;');
      sh.fragmentShader = 'uniform sampler2D tFiss;\nvarying float vFiss;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        if ( vFiss > 0.5 ) {
          vec4 f = texture2D( tFiss, vMonde * 0.375 );
          float fort = vFiss - 1.0, large = mix( 0.05, 0.095, fort );
          float part = mix( smoothstep( 0.46, 0.62, f.g ), 1.0, fort );
          float ligne = ( 1.0 - smoothstep( large * 0.35, large, f.r ) ) * part * mix( 0.72, 0.92, fort );
          float levre = ( smoothstep( large * 0.7, large * 1.3, f.r ) - smoothstep( large * 1.3, large * 2.6, f.r ) ) * part * mix( 0.12, 0.22, fort );
          diffuseColor.rgb *= 1.0 + levre;
          diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 0.2, 0.16, 0.13 ), ligne );
        }`);
    };
    m.customProgramCacheKey = () => 'sfissures' + (instance ? 'i' : '');
    return m;
  };
  K.mat = (c, o, souple) => K.patcher(new T3.MeshStandardMaterial(Object.assign({ color: K.col(c), roughness: 0.9, metalness: 0, flatShading: true }, o || {})), souple);
  K.matV = (o, souple, sympt) => K.patcher(new T3.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true }, o || {})), souple, true, sympt);
  K.matT = (map, o) => K.patcher(new T3.MeshStandardMaterial(Object.assign({ map, roughness: 0.92, metalness: 0, flatShading: true }, o || {})));

  K.texture = (dessin, S = 128, rep = true) => {
    const c = document.createElement('canvas'); c.width = c.height = S; dessin(c.getContext('2d'), S);
    const t = new T3.CanvasTexture(c); if (rep) t.wrapS = t.wrapT = T3.RepeatWrapping; t.encoding = T3.sRGBEncoding; t.anisotropy = 4; return t;
  };
  K.hasard = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------- Fusion de pièces colorées (couleurs par sommet) ----------
  const _m = new T3.Matrix4(), _q = new T3.Quaternion(), _e = new T3.Euler(), _p = new T3.Vector3(), _s = new T3.Vector3();
  K.piece = (g, c, p, r, s, q) => ({ g, c, p, r, s, q });
  K.fusion = parts => {
    let n = 0;
    const hautDe = {};
    const geos = parts.map(pt => {
      const g = pt.g.index ? pt.g.toNonIndexed() : pt.g.clone();
      if (!g.attributes.normal) g.computeVertexNormals();
      if (pt.haut) hautDe[parts.indexOf(pt)] = Array.from(g.attributes.position.array).filter((_, i) => i % 3 === 1).map(y => ((y + 1) / 2) ** 3);   // feuillage en boule : la pointe est le sommet
      if (pt.q) _q.copy(pt.q); else { _e.set(...(pt.r || [0, 0, 0])); _q.setFromEuler(_e); }
      _m.compose(_p.set(...(pt.p || [0, 0, 0])), _q, _s.set(...(Array.isArray(pt.s) ? pt.s : [pt.s || 1, pt.s || 1, pt.s || 1])));
      g.applyMatrix4(_m); n += g.attributes.position.count; return { g, c: K.col(pt.c) };
    });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3), bout = new Float32Array(n);
    let o = 0;
    geos.forEach(({ g, c }, k) => {
      const pt = parts[k];
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.aBout) bout.set(g.attributes.aBout.array, o);
      if (pt.haut) for (let i = 0; i < hautDe[k].length; i++) bout[o + i] = hautDe[k][i];
      for (let i = 0; i < g.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
      o += g.attributes.position.count; g.dispose();
    });
    const out = new T3.BufferGeometry();
    out.setAttribute('position', new T3.BufferAttribute(pos, 3)); out.setAttribute('normal', new T3.BufferAttribute(nor, 3)); out.setAttribute('color', new T3.BufferAttribute(col, 3)); out.setAttribute('aBout', new T3.BufferAttribute(bout, 1));
    out.computeBoundingSphere();
    return out;
  };
  K.mesh = (parent, geo, mat, p, r, s) => {
    const m = new T3.Mesh(geo, mat); if (p) m.position.set(...p); if (r) m.rotation.set(...r);
    if (s) Array.isArray(s) ? m.scale.set(...s) : m.scale.setScalar(s);
    m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  };
  const dummy = new T3.Object3D();
  K.inst = (parent, geo, mat, n, ombre = true) => {
    const im = new T3.InstancedMesh(geo, mat, Math.max(1, n)); im.castShadow = ombre; im.receiveShadow = true; im.count = n;
    im.frustumCulled = false; parent.add(im); return im;
  };
  K.poser = (im, i, p, r, s, c) => {
    dummy.position.set(p[0], p[1], p[2]); dummy.rotation.set(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0, 'XZY');   // pivot propre d'abord, inclinaison ensuite
    if (Array.isArray(s)) dummy.scale.set(s[0], s[1], s[2]); else dummy.scale.setScalar(s == null ? 1 : s);
    dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (c) im.setColorAt(i, typeof c === 'string' ? K.col(c) : c);
  };
  // Matrice d'instance écrite directement : rotation propre ry, puis inclinaison rx / rz (ordre XZY), échelle, position.
  K.matrice = (e, o, x, y, z, ry, rx, rz, sx, sy, sz) => {
    const cb = Math.cos(ry), sb = Math.sin(ry), cc = Math.cos(rz), sc = Math.sin(rz), ca = Math.cos(rx), sa = Math.sin(rx);
    e[o] = cc * cb * sx; e[o + 1] = (ca * sc * cb + sa * sb) * sx; e[o + 2] = (sa * sc * cb - ca * sb) * sx; e[o + 3] = 0;
    e[o + 4] = -sc * sy; e[o + 5] = ca * cc * sy; e[o + 6] = sa * cc * sy; e[o + 7] = 0;
    e[o + 8] = cc * sb * sz; e[o + 9] = (ca * sc * sb - sa * cb) * sz; e[o + 10] = (sa * sc * sb + ca * cb) * sz; e[o + 11] = 0;
    e[o + 12] = x; e[o + 13] = y; e[o + 14] = z; e[o + 15] = 1;
  };
  // Prisme de toit (faîtage le long de z), base à y = 0
  K.toit = (w, h, L) => { const s = new T3.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); const g = new T3.ExtrudeGeometry(s, { depth: L, bevelEnabled: false }); g.translate(0, 0, -L / 2); return g; };

  // ---------- Primitives ----------
  const G = K.G = {
    boule: (a = 6, b = 4) => new T3.SphereGeometry(1, a, b), ico: () => new T3.IcosahedronGeometry(1, 0), ico1: () => new T3.IcosahedronGeometry(1, 1),
    octa: () => new T3.OctahedronGeometry(1, 0), boite: (w, h, d) => new T3.BoxGeometry(w, h, d),
    cyl: (a, b, h, n = 6, ouvert = false) => new T3.CylinderGeometry(a, b, h, n, 1, ouvert), cone: (r, h, n = 5) => new T3.ConeGeometry(r, h, n),
    disque: (r, n = 10) => new T3.CircleGeometry(r, n).rotateX(-Math.PI / 2),
  };
  // Feuille en ruban le long de +x depuis l'origine : monte (angle a0) puis s'arque de « arc » radians ; largeur w ; n segments.
  G.feuille = (L, w, a0 = 0.9, arc = 1.2, n = 3, pointe = 0.7) => {
    const pos = [], bout = [];
    let x = 0, y = 0, prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, th = a0 - arc * t, l = w * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.12 + t * 0.88)), pointe) * (i === n ? 0 : 1);
      if (i) { x += Math.cos(th) * L / n; y += Math.sin(th) * L / n; }
      const cur = [[x, y, -l / 2], [x, y, l / 2]];
      if (prev) { const a = (i - 1) / n; pos.push(...prev[0], ...cur[0], ...prev[1], ...prev[1], ...cur[0], ...cur[1]); bout.push(a, t, a, a, t, t); }
      prev = cur;
    }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.setAttribute('aBout', new T3.Float32BufferAttribute(bout, 1)); g.computeVertexNormals(); return g;
  };
  // Brin à trois faces, base à l'origine, le long de +y
  G.brin = (h, r) => { const g = new T3.CylinderGeometry(r * 0.6, r, h, 3, 1, true); g.translate(0, h / 2, 0); return g; };
  // Pièce orientée de la base b vers la direction d (vecteur), pour un brin de longueur h
  const HAUT = new T3.Vector3(0, 1, 0);
  K.oriente = (g, c, b, d, s) => { const v = new T3.Vector3(...d).normalize(); return K.piece(g, c, b, null, s, new T3.Quaternion().setFromUnitVectors(HAUT, v)); };
  K.bout = (b, d, h) => { const v = new T3.Vector3(...d).normalize(); return [b[0] + v.x * h, b[1] + v.y * h, b[2] + v.z * h]; };
  return K;
})();
