/* geol50.js — chargement à la demande du vecteur géologique 1/50 000 (BRGM BD Charm-50).
   Plein détail, découpé par département, chargé par injection de <script> (compatible file://).
   Un fichier data/geol50/<dept>.js appelle GEOL50.register("<dept>", <FeatureCollection>). */
window.GEOL50 = {
  cache: {},        // dept -> FeatureCollection (déjà chargé)
  index: {},        // dept -> { nom, bbox:[minLon,minLat,maxLon,maxLat] }  (rempli par data/geol50/index.js)
  _cb: {},          // dept -> [callbacks en attente]
  _loading: {},     // dept -> true pendant le chargement

  // Édition installée (cf. edition.js) : "complete" = données 1/50 000 présentes.
  edition: window.ATLAS_EDITION === "legere" ? "legere" : "complete",
  indexPret: false, // vrai dès que data/geol50/index.js a été chargé
  _indexCb: [],     // callbacks à rappeler quand l'index arrive

  // cb() est appelé quand l'index départemental est disponible (jamais en édition légère).
  quandIndexPret(cb) {
    if (this.indexPret) cb();
    else if (this.edition === "complete") this._indexCb.push(cb);
  },

  _indexCharge() {
    this.indexPret = true;
    this._indexCb.forEach((f) => f());
    this._indexCb = [];
  },

  register(dept, fc) {
    this.cache[dept] = fc;
    this._loading[dept] = false;
    (this._cb[dept] || []).forEach((f) => f(fc));
    this._cb[dept] = [];
  },

  // Départements dont la bbox recoupe des bounds Leaflet donnés.
  deptsForBounds(b) {
    const w = b.getWest(), e = b.getEast(), s = b.getSouth(), n = b.getNorth(), out = [];
    for (const d in this.index) {
      const bb = this.index[d].bbox;
      if (bb[0] <= e && bb[2] >= w && bb[1] <= n && bb[3] >= s) out.push(d);
    }
    return out;
  },

  // Charge un département (depuis le cache, ou en injectant son script). cb(fc) ; cb(null) si absent.
  load(dept, cb) {
    if (this.cache[dept]) { cb(this.cache[dept]); return; }
    (this._cb[dept] = this._cb[dept] || []).push(cb);
    if (this._loading[dept]) return;
    this._loading[dept] = true;
    const s = document.createElement("script");
    s.src = "data/geol50/" + dept + ".js";
    s.async = true;
    s.onerror = () => {
      this._loading[dept] = false;
      (this._cb[dept] || []).forEach((f) => f(null));
      this._cb[dept] = [];
    };
    document.head.appendChild(s);
  },
};

// L'index départemental n'est chargé qu'en édition complète — en édition légère le dossier
// data/geol50/ n'existe pas, et on évite ainsi une erreur 404 dans la console.
(function () {
  if (GEOL50.edition !== "complete") return;
  const s = document.createElement("script");
  s.src = "data/geol50/index.js";
  s.onload = () => GEOL50._indexCharge();
  s.onerror = () => { GEOL50.edition = "legere"; };  // dossier data/ absent malgré tout
  document.head.appendChild(s);
})();
