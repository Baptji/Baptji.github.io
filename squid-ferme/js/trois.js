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
  // Patch commun : le vent (si souple > 0) et l'ombre des nuages qui glissent.
  K.patcher = (m, souple = 0, nuages = true) => {
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, K.U);
      sh.vertexShader = 'uniform float uTemps;\nuniform vec2 uVent;\nuniform float uForce;\nvarying vec2 vMonde;\n'
        + sh.vertexShader.replace('#include <project_vertex>', projection(souple));
      sh.fragmentShader = 'uniform sampler2D tNuages;\nuniform vec2 uNuageDecal;\nuniform float uNuage;\nuniform float uEchelleNuage;\nvarying vec2 vMonde;\n'
        + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
          ${nuages ? 'diffuseColor.rgb *= 1.0 - uNuage * texture2D( tNuages, vMonde * uEchelleNuage + uNuageDecal ).r;' : ''}`);
    };
    m.customProgramCacheKey = () => 'sf' + souple + (nuages ? 'n' : '');
    return m;
  };
  K.mat = (c, o, souple) => K.patcher(new T3.MeshStandardMaterial(Object.assign({ color: K.col(c), roughness: 0.9, metalness: 0, flatShading: true }, o || {})), souple);
  K.matV = (o, souple) => K.patcher(new T3.MeshStandardMaterial(Object.assign({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true }, o || {})), souple);
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
    const geos = parts.map(pt => {
      const g = pt.g.index ? pt.g.toNonIndexed() : pt.g.clone();
      if (!g.attributes.normal) g.computeVertexNormals();
      if (pt.q) _q.copy(pt.q); else { _e.set(...(pt.r || [0, 0, 0])); _q.setFromEuler(_e); }
      _m.compose(_p.set(...(pt.p || [0, 0, 0])), _q, _s.set(...(Array.isArray(pt.s) ? pt.s : [pt.s || 1, pt.s || 1, pt.s || 1])));
      g.applyMatrix4(_m); n += g.attributes.position.count; return { g, c: K.col(pt.c) };
    });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
    let o = 0;
    geos.forEach(({ g, c }) => {
      pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
      for (let i = 0; i < g.attributes.position.count; i++) { col[(o + i) * 3] = c.r; col[(o + i) * 3 + 1] = c.g; col[(o + i) * 3 + 2] = c.b; }
      o += g.attributes.position.count; g.dispose();
    });
    const out = new T3.BufferGeometry();
    out.setAttribute('position', new T3.BufferAttribute(pos, 3)); out.setAttribute('normal', new T3.BufferAttribute(nor, 3)); out.setAttribute('color', new T3.BufferAttribute(col, 3));
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
    const pos = [];
    let x = 0, y = 0, prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, th = a0 - arc * t, l = w * Math.pow(Math.sin(Math.PI * Math.min(0.999, 0.12 + t * 0.88)), pointe) * (i === n ? 0 : 1);
      if (i) { x += Math.cos(th) * L / n; y += Math.sin(th) * L / n; }
      const cur = [[x, y, -l / 2], [x, y, l / 2]];
      if (prev) pos.push(...prev[0], ...cur[0], ...prev[1], ...prev[1], ...cur[0], ...cur[1]);
      prev = cur;
    }
    const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  };
  // Brin à trois faces, base à l'origine, le long de +y
  G.brin = (h, r) => { const g = new T3.CylinderGeometry(r * 0.6, r, h, 3, 1, true); g.translate(0, h / 2, 0); return g; };
  // Pièce orientée de la base b vers la direction d (vecteur), pour un brin de longueur h
  const HAUT = new T3.Vector3(0, 1, 0);
  K.oriente = (g, c, b, d, s) => { const v = new T3.Vector3(...d).normalize(); return K.piece(g, c, b, null, s, new T3.Quaternion().setFromUnitVectors(HAUT, v)); };
  K.bout = (b, d, h) => { const v = new T3.Vector3(...d).normalize(); return [b[0] + v.x * h, b[1] + v.y * h, b[2] + v.z * h]; };
  return K;
})();
