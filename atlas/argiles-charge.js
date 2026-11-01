// ============ D'où vient la charge d'une argile : permanente ou variable (08/10/2026) ============
// Demande de l'utilisateur, à la lecture de la note de l'allophane (G.8) : « c'est hyper important, il faut un panneau
// explicatif avec un schéma en dessous du simulateur 3D ». Carte placée sur les 11 fiches d'argiles, juste après la 3D
// (EspacementBasal.carte, renderArgile d'app.js). Contenu :
//   · schéma à curseur de pH : à gauche la charge PERMANENTE (substitution dans le feuillet, ne bouge pas avec le pH),
//     à droite la charge VARIABLE (groupes OH des bords ou de la surface : OH₂⁺ en milieu acide, O⁻ en milieu basique) ;
//     état des groupes = modèle à deux pK autour du point de charge nulle (pK = PCN ∓ 1,5), schématique ;
//   · comparaison des 11 fiches : part de la charge qui est permanente, en fourchettes (ordres de grandeur) ;
//   · puces repliées : pourquoi c'est important (CEC à pH 7 / effective, chaulage, phosphore des andosols), sources.
(function () {
  "use strict";
  const fr = (x, n = 1) => Number(x).toLocaleString("fr-FR", { maximumFractionDigits: n });

  // part permanente [min, max] en % de la CEC ; pcn = point de charge nulle des groupes variables (bords ou surface) ;
  // src = d'où vient la fourchette (« structure » = déduite de la charge du feuillet, nulle ou compensée)
  const FICHES = {
    allophane: { perm: [0, 5], pcn: 6, pcnTxt: "vers pH 6 (5 à 7 selon le rapport Al/Si)", lieu: "surface", src: "parfitt",
      dit: "Aucun feuillet, donc aucune substitution : l'essentiel de la charge est variable." },
    talc: { perm: [0, 10], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Feuillet neutre, sans substitution : sa faible CEC provient des bords rompus." },
    serpentines: { perm: [0, 20], pcn: 7, lieu: "bords", src: "structure",
      dit: "Feuillet quasiment neutre : sa charge provient surtout des bords et des surfaces." },
    kaolinite: { perm: [10, 50], pcn: 6.3, pcnTxt: "vers pH 6 à 6,5 pour les bords", lieu: "bords", src: "kaolinite",
      dit: "Substitutions quasi absentes : la charge naît surtout des bords et varie avec le pH. La fraction permanente fait encore débat." },
    chlorite: { perm: [20, 60], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Le feuillet d'hydroxyde intercalé compense la charge du feuillet, sans s'échanger : seuls les bords et les faces externes participent à l'échange." },
    sepiolite: { perm: [30, 70], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Les substitutions sont peu nombreuses (charge permanente), tandis que les groupes Si-OH bordant les rubans fournissent une charge variable abondante." },
    illite: { perm: [60, 85], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Charge permanente élevée, mais largement neutralisée par le K⁺ fixé : les bords pèsent plus que dans une smectite." },
    glauconite: { perm: [60, 85], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Comme l'illite, elle porte une forte charge en partie compensée par le K⁺ fixé, auquel s'ajoutent les bords." },
    interstratifies: { perm: [60, 90], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Cela varie avec la part de feuillets gonflants : une proportion accrue de smectite rend la charge plus permanente." },
    smectites: { perm: [80, 95], pcn: 6.5, lieu: "bords", src: "sposito",
      dit: "Elle naît des substitutions au sein du feuillet et reste donc surtout permanente ; les bords n'en représentent qu'une faible part." },
    vermiculite: { perm: [90, 100], pcn: 6.5, lieu: "bords", src: "structure",
      dit: "Le feuillet porte une charge très forte, entièrement échangeable : l'essentiel de la charge est permanent." },
  };
  const ORDRE = ["vermiculite", "smectites", "interstratifies", "illite", "glauconite", "sepiolite", "chlorite", "kaolinite", "serpentines", "talc", "allophane"];
  const SOURCES = {
    sposito: "Sposito G. (2008). <i>The Chemistry of Soils</i>, 2ᵉ éd. Oxford University Press (charge permanente et charge des bords ; point de charge nulle).",
    kaolinite: "Ma C. et Eggleton R. A. (1999). « Cation exchange capacity of kaolinite ». <i>Clays and Clay Minerals</i> 47, p. 174–180 ; Tombácz E. et Szekeres M. (2006). « Surface charge heterogeneity of kaolinite in aqueous suspension ». <i>Applied Clay Science</i> 34, p. 105–124.",
    parfitt: "Parfitt R. L. (2009). « Allophane and imogolite: role in soil biogeochemical processes ». <i>Clay Minerals</i> 44, p. 135–155.",
    baize: "Baize D. (2000). <i>Guide des analyses en pédologie</i>, 2ᵉ éd. INRA (CEC à pH 7 et CEC effective au pH du sol).",
  };

  // état des groupes de surface à ce pH : parts OH₂⁺ / OH / O⁻ (modèle à deux pK, schématique)
  function parts(pH, pcn) {
    const a = Math.pow(10, (pcn - 1.5) - pH), b = Math.pow(10, pH - (pcn + 1.5)), t = 1 + a + b;
    return { plus: a / t, zero: 1 / t, moins: b / t };
  }

  function schema(f, pH) {
    const P = parts(pH, f.pcn), N = 6;
    let np = Math.round(P.plus * N), nm = Math.round(P.moins * N);
    if (np + nm > N) nm = N - np;
    const etats = [];
    for (let i = 0; i < N; i++) etats.push(0);
    // les + et les − sont répartis le long du bord (pas tous en tête)
    const ordre = [0, 3, 5, 1, 4, 2];
    for (let i = 0; i < np; i++) etats[ordre[i]] = 1;
    for (let i = 0; i < nm; i++) etats[ordre[N - 1 - i]] = -1;
    const sansPerm = f.perm[1] <= 10, surface = f.lieu === "surface";
    // ── gauche : charge permanente ──
    let g = `<text class="ch-t" x="20" y="22">Charge permanente</text>
      <text class="ch-p" x="20" y="38">dans le feuillet : ne dépend pas du pH</text>`;
    if (surface) {
      g += `<circle cx="150" cy="118" r="44" class="ch-sphere"/><circle cx="150" cy="118" r="30" class="ch-creux"/>
        <text class="ch-p" x="150" y="186" text-anchor="middle">aucun feuillet empilé,</text>
        <text class="ch-p" x="150" y="200" text-anchor="middle">aucune substitution : rien ici</text>`;
    } else {
      g += `<rect x="30" y="94" width="240" height="14" class="ch-T"/><rect x="30" y="108" width="240" height="20" class="ch-O"/>
        <rect x="30" y="128" width="240" height="14" class="ch-T"/>
        <text class="ch-mini" x="276" y="105">T</text><text class="ch-mini" x="276" y="122">O</text><text class="ch-mini" x="276" y="139">T</text>`;
      if (sansPerm) {
        g += `<text class="ch-p" x="150" y="172" text-anchor="middle">aucune substitution : feuillet neutre</text>`;
      } else {
        [[90, 118], [190, 118], [140, 101]].forEach(([x, y], i) => {
          g += `<circle cx="${x}" cy="${y}" r="7" class="ch-moins"/><text class="ch-sig" x="${x}" y="${y + 4}" text-anchor="middle">−</text>`;
        });
        [[70, 72], [170, 72], [120, 164], [220, 164]].forEach(([x, y]) => {
          g += `<circle cx="${x}" cy="${y}" r="11" class="ch-eau"/><circle cx="${x}" cy="${y}" r="6" class="ch-cation"/>
            <text class="ch-mini" x="${x + 14}" y="${y + 4}">Ca²⁺</text>`;
        });
        g += `<text class="ch-p" x="150" y="196" text-anchor="middle">Mg²⁺ pour Al³⁺, ou Al³⁺ pour Si⁴⁺ :</text>
          <text class="ch-p" x="150" y="210" text-anchor="middle">une charge − subsiste, que des cations compensent</text>`;
      }
    }
    // ── droite : charge variable ──
    let d = `<text class="ch-t" x="340" y="22">Charge variable</text>
      <text class="ch-p" x="340" y="38">${surface ? "à la surface" : "sur les bords"} : les O et OH gagnent ou perdent un H⁺</text>`;
    const xb = 470, ys = [72, 92, 112, 132, 152, 172];
    if (surface) d += `<path d="M ${xb - 60} 56 Q ${xb + 8} 122 ${xb - 60} 188" class="ch-surf"/>`;
    else d += `<rect x="350" y="94" width="${xb - 350}" height="14" class="ch-T"/><rect x="350" y="108" width="${xb - 350}" height="20" class="ch-O"/>
      <rect x="350" y="128" width="${xb - 350}" height="14" class="ch-T"/><line x1="${xb}" y1="60" x2="${xb}" y2="184" class="ch-bord"/>`;
    ys.forEach((y, i) => {
      const e = etats[i], u = (y - 56) / 132, x0 = surface ? xb - 60 + 136 * u * (1 - u) : xb;   // point de la courbe Q (surface)
      const lab = e > 0 ? "OH₂⁺" : e < 0 ? "O⁻" : "OH", cl = e > 0 ? "ch-gp" : e < 0 ? "ch-gm" : "ch-g0";
      d += `<line x1="${x0}" y1="${y}" x2="${x0 + 16}" y2="${y}" class="ch-lien"/><text class="${cl}" x="${x0 + 19}" y="${y + 4}">${lab}</text>`;
      if (e > 0) d += `<text class="ch-ion ch-gp" x="${x0 + 54}" y="${y + 4}">← H₂PO₄⁻</text>`;
      if (e < 0) d += `<text class="ch-ion ch-gm" x="${x0 + 54}" y="${y + 4}">← K⁺</text>`;
    });
    const net = P.plus - P.moins;
    const etat = Math.abs(net) < 0.08 ? "les bords sont à peu près neutres" : net > 0 ? "les bords sont chargés + : ils retiennent des anions"
      : "sur les bords, la charge est négative : ce sont des cations qu'ils retiennent";
    d += `<text class="ch-p" x="340" y="204">pH ${fr(pH)} : ${surface ? etat.replace("les bords sont", "la surface est").replace("chargés", "chargée").replace("neutres", "neutre").replace("ils retiennent", "elle retient") : etat}</text>`;
    return `<svg class="ch-svg" viewBox="0 0 640 220" role="img" aria-label="Charge permanente et charge variable d'une argile au pH ${fr(pH)}">
      <line x1="320" y1="10" x2="320" y2="210" class="ch-sep"/>${g}${d}</svg>`;
  }

  function comparaison(id) {
    return `<div class="ch-comp">
      <p class="ch-comp-t">Part de la charge permanente, fiche par fiche (ordres de grandeur)</p>
      ${ORDRE.map((k) => {
        const f = FICHES[k], a = ARGILES.find((x) => x.id === k);
        if (!a) return "";
        return `<div class="ch-l${k === id ? " ch-ici" : ""}">
          <button type="button" class="ch-nom" data-goargile="${k}">${a.nom.split(" (")[0]}</button>
          <span class="ch-piste"><span class="ch-plage" style="left:${f.perm[0]}%;width:${Math.max(2, f.perm[1] - f.perm[0])}%"></span></span>
          <span class="ch-val">${f.perm[0]} à ${f.perm[1]} %</span>
        </div>`;
      }).join("")}
      <p class="ch-echelle"><span>0 % : entièrement variable</span><span>100 % : entièrement permanente</span></p>
    </div>`;
  }

  function carte(a) {
    const f = FICHES[a.id];
    if (!f) return "";
    const pH0 = 6.5;
    return `<div class="card ch-carte" data-ch="${a.id}">
      <h2>Permanente ou variable : d'où vient la charge</h2>
      <p class="sub ch-lead">Des charges négatives permettent à une argile de retenir des cations. Elles naissent de deux manières : des <b>substitutions au sein du feuillet</b> (charge permanente, indépendante du pH), ou des <b>groupes OH en bordure ou en surface</b>, qui captent ou libèrent un H⁺ selon le pH (charge variable). <b>${a.nom.split(" (")[0]}</b> : ${f.dit.charAt(0).toLowerCase() + f.dit.slice(1)}</p>
      <div class="ch-schema">${schema(f, pH0)}</div>
      <label class="ch-curseur"><span>pH de la solution du sol</span>
        <input type="range" min="3" max="10" step="0.1" value="${pH0}" data-ch-ph>
        <output data-ch-sortie>${fr(pH0)}</output></label>
      <p class="ch-pcn">Point de charge nulle des groupes variables : ${f.pcnTxt || "vers pH " + fr(f.pcn)}. Sous ce pH ils tendent vers le positif, au-delà vers le négatif. Le nombre de groupes chargés est schématique.</p>
      ${comparaison(a.id)}
      <details class="cmp-puce ch-plus"><summary>Pourquoi cela compte</summary>
        <p>• <b>La CEC évolue avec le pH</b> pour une argile à charge variable. Au laboratoire, la CEC « à pH 7 » (méthode Metson) dépasse celle d'un sol acide ; la CEC effective, mesurée au pH du sol, est aussi déterminée (Baize 2000).</p>
        <p>• <b>Un chaulage</b> d'un sol riche en kaolinite, en allophane ou en oxydes élève le pH et donc la CEC ; sur une smectite, l'effet reste faible.</p>
        <p>• <b>Les sites positifs captent des anions</b> : phosphate, sulfate. Les andosols, riches en allophane, immobilisent tant de phosphore des engrais qu'une large part n'est plus accessible aux plantes (Parfitt 2009).</p>
        <p>• Les oxydes de fer et d'aluminium (goethite, gibbsite) portent eux aussi une charge presque entièrement variable : c'est ce qui rapproche l'allophane des oxydes et l'éloigne des argiles en feuillets.</p>
      </details>
      <details class="cmp-puce ch-sources"><summary>Références</summary>
        <ul>${[f.src, "sposito", "baize", "parfitt"].filter((x, i, t) => x !== "structure" && t.indexOf(x) === i).map((k) => `<li>${SOURCES[k]}</li>`).join("")}
          <li>Les fourchettes marquées « structure » sont déduites par l'atlas de la charge du feuillet (nulle, ou compensée par un feuillet d'hydroxyde ou par du K⁺ fixé) ; ce sont des ordres de grandeur, qui dépendent aussi de la taille des cristaux (plus ils sont petits, plus il y a de bords).${f.src === "structure" ? " C'est ce que montre cette fiche." : ""}</li></ul>
      </details>
    </div>`;
  }

  function monter(racine) {
    const el = racine && racine.querySelector("[data-ch]");
    if (!el) return;
    const f = FICHES[el.dataset.ch], inp = el.querySelector("[data-ch-ph]"), out = el.querySelector("[data-ch-sortie]"), sch = el.querySelector(".ch-schema");
    inp.addEventListener("input", () => {
      const pH = Number(inp.value);
      out.textContent = fr(pH);
      sch.innerHTML = schema(f, pH);
    });
  }

  window.ChargeArgile = { carte, monter, FICHES, parts };
})();
