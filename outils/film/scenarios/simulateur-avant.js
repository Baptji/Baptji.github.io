// Injecté avant la page du Simulateur 3D : garde la carte Leaflet sous la main (window.__carte).
(() => {
  let L;
  Object.defineProperty(window, 'L', { configurable: true, get: () => L, set: (v) => {
    L = v;
    try { v.Map.addInitHook(function () { window.__carte = this; }); } catch (e) {}
  } });
})();
