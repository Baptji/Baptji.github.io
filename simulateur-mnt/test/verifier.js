/* Comparaison du noyau JavaScript à l'étalon Python (reference/attendus/*.json).
 * Commun à l'autotest en ligne de commande (jsc) et à la page test.html.
 * lireCas(nom) → objet JSON du cas ; journal(texte) affiche une ligne. */
(function (global) {
  "use strict";
  function verifierTout(noms, lireCas, journal) {
    let reussis = 0;
    const echecs = [];
    const verifier = (ok, message) => { if (ok) reussis++; else { echecs.push(message); journal("   ✗ " + message); } };
    const nan = v => (v === null || v === undefined) ? NaN : v;
    const f32 = a => Float32Array.from(a.map(nan));
    const egaux = (a, b) => a.length === b.length && Array.prototype.every.call(a, (v, i) => v === b[i] || (Number.isNaN(v) && Number.isNaN(b[i])));
    const proches = (a, b, rel, abs) => a.length === b.length && Array.prototype.every.call(a, (x, i) => {
      const y = b[i];
      if (Number.isNaN(x) || Number.isNaN(y)) return Number.isNaN(x) === Number.isNaN(y);
      return Math.abs(x - y) <= Math.max(abs || 0, (rel || 0) * Math.abs(y));
    });
    const premiere = (a, b) => {
      if (a.length !== b.length) return "tailles " + a.length + " et " + b.length;
      for (let i = 0; i < a.length; i++) if (!(a[i] === b[i] || (Number.isNaN(a[i]) && Number.isNaN(b[i])))) return "cellule " + i + " : " + a[i] + " au lieu de " + b[i];
      return "aucune";
    };
    verifier(noms.length >= 12, "au moins 12 cas d'étalon (trouvés : " + noms.length + ")");
    for (const fichier of noms) {
      const j = lireCas(fichier);
      const nom = j.nom, att = j.attendu, avant = echecs.length;
      const g = { lignes: j.lignes, colonnes: j.colonnes, pas: j.pas, z: f32(j.z), x0: 0, y0: 0 };
      let dureeSR = "";
      const t0 = Date.now();
      const r = Noyau.calculer(g);
      const duree = Date.now() - t0;
      verifier(egaux(r.rempli, f32(att.rempli)), nom + " : remplissage différent (" + premiere(r.rempli, f32(att.rempli)) + ")");
      verifier(egaux(r.surface, f32(att.surface)), nom + " : surface de Wang & Liu différente (" + premiere(r.surface, f32(att.surface)) + ")");
      verifier(egaux(r.dir, att.dir), nom + " : directions D8 différentes (" + premiere(r.dir, att.dir) + ")");
      verifier(egaux(r.accD8, att.acc_d8), nom + " : accumulation D8 différente");
      verifier(proches(r.acc, att.acc_mfd.map(nan), 1e-6), nom + " : accumulation MFD hors tolérance");
      verifier(egaux(r.strahler, att.strahler), nom + " : ordre de Strahler différent (" + premiere(r.strahler, att.strahler) + ")");
      verifier(proches(r.tanb, att.tanb.map(nan), 1e-6, 1e-9), nom + " : pente hors tolérance");
      verifier(proches(r.twi, att.twi.map(nan), 0, 1e-4), nom + " : TWI au-delà de 1e-4");
      verifier(egaux(r.etiquettes, att.etiquettes), nom + " : étiquettes des dépressions différentes");
      verifier(r.depressions.length === att.depressions.length, nom + " : " + r.depressions.length + " dépressions au lieu de " + att.depressions.length);
      r.depressions.forEach((a, k) => {
        const b = att.depressions[k];
        if (!b) return;
        verifier(a.cellules === b.cellules, nom + " : dépression " + a.id + ", cellules");
        verifier(Math.abs(a.volume - b.volume) <= 1e-9 * Math.max(1, Math.abs(b.volume)), nom + " : dépression " + a.id + ", volume " + a.volume + " au lieu de " + b.volume);
        verifier(Math.abs(a.profondeur - b.profondeur) <= 1e-9, nom + " : dépression " + a.id + ", profondeur");
      });
      if (j.attendu_sink_removal) {
        // Option « comblement Sink Removal » (Basic Terrain Analysis de SAGA) : mêmes tolérances.
        const sr = j.attendu_sink_removal, t1 = Date.now();
        const q = Noyau.calculer(g, { comblement: "sink_removal" });
        dureeSR = " (Sink Removal " + (Date.now() - t1) + " ms)";
        verifier(egaux(q.rempli, r.rempli) && egaux(q.etiquettes, r.etiquettes), nom + " : Sink Removal change les dépressions");
        verifier(egaux(q.surface, f32(sr.surface)), nom + " : surface de Sink Removal différente (" + premiere(q.surface, f32(sr.surface)) + ")");
        verifier(egaux(q.dir, sr.dir), nom + " : directions D8 (Sink Removal) différentes (" + premiere(q.dir, sr.dir) + ")");
        verifier(egaux(q.accD8, sr.acc_d8), nom + " : accumulation D8 (Sink Removal) différente (" + premiere(q.accD8, sr.acc_d8) + ")");
        verifier(proches(q.acc, sr.acc_mfd.map(nan), 1e-6), nom + " : accumulation MFD (Sink Removal) hors tolérance");
        verifier(egaux(q.strahler, sr.strahler), nom + " : ordre de Strahler (Sink Removal) différent (" + premiere(q.strahler, sr.strahler) + ")");
        verifier(proches(q.tanb, sr.tanb.map(nan), 1e-6, 1e-9), nom + " : pente (Sink Removal) hors tolérance");
        verifier(proches(q.twi, sr.twi.map(nan), 0, 1e-4), nom + " : TWI (Sink Removal) au-delà de 1e-4");
      }
      if (j.remodelage) {
        const rem = j.remodelage, base = lireCas(rem.base + ".json");
        const g0 = { lignes: j.lignes, colonnes: j.colonnes, pas: j.pas, z: f32(base.z), x0: 0, y0: 0 };
        const h = Noyau.remodelerTout(g0, rem.operations);
        verifier(egaux(h.z, g.z), nom + " : MNT remodelé différent de l'étalon (" + premiere(h.z, g.z) + ")");
        const b = Noyau.bilanTerrassement(g0.z, h.z, j.pas);
        verifier(Math.abs(b.remblai - rem.remblai) <= 1e-9 * Math.max(1, rem.remblai) && Math.abs(b.deblai - rem.deblai) <= 1e-9 * Math.max(1, rem.deblai),
                 nom + " : remblai " + b.remblai + " / déblai " + b.deblai + " au lieu de " + rem.remblai + " / " + rem.deblai);
      }
      if (j.ruissellement) {
        // Surfaces dessinées (A.2) : même carte des C, même accumulation pondérée en MFD et en D8.
        const ru = j.ruissellement;
        const k = Noyau.carteCoefficients(g, ru.defaut, ru.surfaces, ru.pluie_mm);
        verifier(egaux(k, f32(ru.coefficients)), nom + " : carte des C différente (" + premiere(k, f32(ru.coefficients)) + ")");
        for (const partage of ["mfd", "d8"]) {
          const rp = partage === r.methode.partage ? r : Noyau.calculer(g, { partage });
          const acc = Noyau.ruissellement(g, rp, ru.defaut, ru.surfaces, ru.pluie_mm).accC;
          verifier(proches(acc, ru["acc_c_" + partage].map(nan), 1e-6, 1e-6), nom + " : accumulation pondérée " + partage + " hors tolérance");
        }
      }
      if (j.controles_pluie) {
        for (const [a, b, t, att] of j.controles_pluie.montana) {
          const i = Noyau.intensiteMontana(a, b, t);
          verifier(Math.abs(i - att) <= 1e-9 * att, "Montana a=" + a + " b=" + b + " t=" + t + " : " + i + " au lieu de " + att);
        }
        for (const [cn, pl, att] of j.controles_pluie.cn) {
          const c = Noyau.coefficientCN(cn, pl);
          verifier(Math.abs(c - att) <= 1e-12, "CN " + cn + " sous " + pl + " mm : C = " + c + " au lieu de " + att);
        }
      }
      const ok = echecs.length === avant;
      journal("   " + (ok ? "✓" : "✗") + " " + (nom + "                    ").slice(0, 20) + " " + j.lignes + "×" + j.colonnes + "  " + r.depressions.length + " dépression(s)  " + duree + " ms" + dureeSR);
    }
    return { reussis, echecs };
  }
  global.verifierTout = verifierTout;
})(typeof globalThis !== "undefined" ? globalThis : this);
