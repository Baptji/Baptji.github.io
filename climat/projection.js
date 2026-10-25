// Conversion Lambert II étendu (IGNF:LAMBE, NTF/Clarke 1880 IGN) -> WGS84 (lat/lon).
// C'est le CRS NATIF de la grille SAFRAN-ISBA (voir tools/build_grid.py) : on convertit
// uniquement pour l'affichage sur la carte (Leaflet veut du lat/lon), les requêtes à
// l'API utilisent directement les coordonnées natives.
// Formule standard IGN (projection conique conforme de Lambert), vérifiée sur le point
// d'origine de la projection : (600000, 2200000) -> (46.8°N, 2.337229167° E, méridien de Paris).
(function (global) {
  const N = 0.7289686274;
  const C = 11745793.39;
  const XS = 600000.0;
  const YS = 8199695.768;
  const E = 0.08248325676;
  const LAMBDA_C = (2.337229167 * Math.PI) / 180; // méridien de Paris, exprimé depuis Greenwich

  function lambertIIEtenduToWGS84(x, y) {
    const dx = x - XS;
    const dy = y - YS;
    const R = Math.hypot(dx, dy);
    const gamma = Math.atan(dx / -dy);
    const lon = LAMBDA_C + gamma / N;
    const latIso = -Math.log(Math.abs(R / C)) / N;

    let lat = 2 * Math.atan(Math.exp(latIso)) - Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      lat =
        2 *
          Math.atan(
            Math.pow((1 + E * Math.sin(lat)) / (1 - E * Math.sin(lat)), E / 2) *
              Math.exp(latIso)
          ) -
        Math.PI / 2;
    }

    return { lat: (lat * 180) / Math.PI, lon: (lon * 180) / Math.PI };
  }

  global.lambertIIEtenduToWGS84 = lambertIIEtenduToWGS84;
})(window);
