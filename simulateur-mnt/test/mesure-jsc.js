// jsc web/test/mesure-jsc.js -- <racine> [côté] : chronométrage sur un MNT synthétique (comme --mesure en Swift).
load(arguments[0] + "/web/noyau.js");
const L = parseInt(arguments[1] || "3163"), C = L;
const z = new Float32Array(L * C);
let graine = 0x9E3779B9 >>> 0;
const alea = () => { graine = (Math.imul(graine, 1664525) + 1013904223) >>> 0; return graine / 4294967296; };
for (let l = 0; l < L; l++) for (let c = 0; c < C; c++) {
  const x = c / 400, y = l / 400;
  const v = 100 + 8 * Math.sin(x) * Math.cos(y * 1.3) + 3 * Math.sin(x * 3.1 + y * 2.2) + 0.02 * l / 10 + 0.05 * alea();
  z[l * C + c] = Math.round(v * 100) / 100;
}
const g = { lignes: L, colonnes: C, pas: 1, z, x0: 0, y0: 0 };
print("MNT synthétique " + L + " × " + C + " = " + (L * C / 1e6).toFixed(1) + " millions de cellules");
const t0 = Date.now();
const r = Noyau.calculer(g);
for (const [nom, d] of r.durees) print("   " + (nom + "                    ").slice(0, 20) + d.toFixed(2).padStart(7) + " s");
print("   total               " + ((Date.now() - t0) / 1000).toFixed(2).padStart(7) + " s · " + r.depressions.length + " dépressions");
