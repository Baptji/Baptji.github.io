// La France entière d'un coup : la température moyenne de chaque jour pour toutes les
// mailles SAFRAN, lue dans data/france/ (écrit par outils/france.py), et l'échelle de
// couleurs qui va avec. Sert à la carte de l'appli et à la vue 3D (3d.html).
(function (global) {
  const MS_JOUR = 86400000;

  /** Les octets, décompressés s'il le faut : le fichier est un .gz servi tel quel, mais
   *  un serveur peut aussi l'avoir déjà décodé en route (Content-Encoding). */
  async function octets(resp) {
    const brut = new Uint8Array(await resp.arrayBuffer());
    if (brut[0] !== 0x1f || brut[1] !== 0x8b) return brut;
    const flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(flux).arrayBuffer());
  }

  const CHARGEES = new Map();

  /** { meta, valeurs, jours, mailles, valeur(jour, maille), date(jour) } ; `valeurs` est
   *  un Int16Array en dixièmes de degré, jour par jour, mailles dans l'ordre de grid.js. */
  function charger(annee, base = "") {
    if (CHARGEES.has(annee)) return CHARGEES.get(annee);
    const p = (async () => {
      const [rMeta, rBin] = await Promise.all([
        fetch(`${base}data/france/temperature-${annee}.json`),
        fetch(`${base}data/france/temperature-${annee}.bin.gz`),
      ]);
      if (!rMeta.ok || !rBin.ok) throw new Error(`températures ${annee} introuvables`);
      const meta = await rMeta.json();
      const b = await octets(rBin);
      const ecarts = new Int16Array(b.buffer, b.byteOffset, b.byteLength / 2);
      const { jours, mailles } = meta;
      if (ecarts.length !== jours * mailles) throw new Error("fichier de températures tronqué");
      // le fichier garde l'écart à la veille : on refait les valeurs, maille par maille
      const valeurs = new Int16Array(ecarts.length);
      valeurs.set(ecarts.subarray(0, mailles));
      for (let j = 1; j < jours; j++) {
        const o = j * mailles, v = o - mailles;
        for (let m = 0; m < mailles; m++) valeurs[o + m] = valeurs[v + m] + ecarts[o + m];
      }
      const t0 = Date.parse(meta.debut);
      return {
        meta, valeurs, jours, mailles,
        valeur: (j, m) => valeurs[j * mailles + m] / 10,
        date: (j) => new Date(t0 + j * MS_JOUR),
      };
    })();
    CHARGEES.set(annee, p);
    p.catch(() => CHARGEES.delete(annee));
    return p;
  }

  // ---------- échelle de couleurs ----------
  // Turbo (Google, 2019), la palette de QGIS : l'approximation polynomiale publiée par
  // son auteur, à moins d'un niveau près sur 255. Bornes fixes pour toute l'année, de
  // -20 à 35 °C (les extrêmes de 2025 : -19,6 et 34,1 °C), comme un min/max fixé dans
  // QGIS : une même couleur veut dire la même température quel que soit le jour.
  const BAS = -20, HAUT = 35;

  function turbo(x) {
    x = Math.min(1, Math.max(0, x));
    const r = 0.13572138 + x * (4.61539260 + x * (-42.66032258 + x * (132.13108234 + x * (-152.94239396 + x * 59.28637943))));
    const g = 0.09140261 + x * (2.19418839 + x * (4.84296658 + x * (-14.18503333 + x * (4.27729857 + x * 2.82956604))));
    const b = 0.10667330 + x * (12.64194608 + x * (-60.58204836 + x * (110.36276771 + x * (-89.90310912 + x * 27.34824973))));
    return [r, g, b].map((v) => Math.round(255 * Math.min(1, Math.max(0, v))));
  }

  /** { rvb(t), css(t), bas, haut } : `rvb` donne [r, g, b] de 0 à 255, `css` « rgb(…) ».
   *  La même en clair et en sombre : Turbo n'a pas de variante. */
  function echelle() {
    const rvb = (t) => turbo((t - BAS) / (HAUT - BAS));
    return {
      rvb,
      css: (t) => { const c = rvb(t); return `rgb(${c[0]},${c[1]},${c[2]})`; },
      bas: BAS, haut: HAUT,
    };
  }

  /** Remplit `el` d'une légende : le dégradé, puis les graduations de 10 en 10 °C. */
  function legende(el, ech) {
    const pos = (t) => ((t - BAS) / (HAUT - BAS)) * 100;
    const arrets = [];
    for (let i = 0; i <= 24; i++) {
      const t = BAS + ((HAUT - BAS) * i) / 24;
      arrets.push(`${ech.css(t)} ${pos(t).toFixed(1)}%`);
    }
    let html = `<div class="fr-degrade" style="background:linear-gradient(to right, ${arrets.join(", ")})"></div>` +
               `<div class="fr-graduations">`;
    for (let t = -20; t <= 30; t += 10) {
      html += `<span style="left:${pos(t).toFixed(1)}%">${t < 0 ? "−" + -t : t}</span>`;
    }
    el.innerHTML = html + `<span class="fr-unite">°C</span></div>`;
  }

  const FMT_DATE = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const fmtDate = (d) => FMT_DATE.format(d);

  global.France = { charger, echelle, legende, fmtDate };
})(window);
