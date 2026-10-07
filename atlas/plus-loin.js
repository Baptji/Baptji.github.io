// ============ « Pour aller plus loin » des fiches roches : graphiques complémentaires (25/09/2026) ============
// Chargé avant app.js. PlusLoin.html(roche) → HTML inséré dans la carte « Pour aller plus loin » ; PlusLoin.sources(roche) →
// ligne « page-source » du bas de page.
// 1. Silice des roches magmatiques (prévu dans C.2, « graphique % SiO₂ dans Pour aller plus loin des magmatiques ») : teneur en
//    silice de la roche placée sur les limites IUGS 45 / 52 / 63 % (Le Maitre et al. 2002), l'ancienne convention 45 / 53 / 66 %
//    citée en note. Valeurs : moyennes de Le Maitre (1976) arrondies au % quand elles existent (marquées `lm`), sinon valeur
//    typique de la roche ; la barre donne la fourchette courante.
(function () {
  "use strict";
  const W = 480, H = 104, X0 = 40, X1 = 452, SMIN = 20, SMAX = 80;
  const X = (s) => X0 + (Math.min(SMAX, Math.max(SMIN, s)) - SMIN) / (SMAX - SMIN) * (X1 - X0);
  const r1 = (x) => Math.round(x * 10) / 10;
  const nb = (v) => String(v).replace(".", ",");
  // [min, valeur, max, lm (1 = moyenne de Le Maitre 1976)]
  const SIO2 = {
    peridotite: [38, 42, 45, 1], pyroxenite: [44, 46, 50, 1], hornblendite: [38, 41, 46, 1], gabbro: [45, 50, 53, 1],
    diorite: [52, 57, 62, 1], tonalite: [57, 62, 67, 1], granodiorite: [62, 66, 70, 1], granite: [67, 71, 77, 1],
    trondhjemite: [66, 70, 75, 0], monzonite: [56, 63, 66, 1], monzodiorite: [50, 54, 58, 0], syenite: [55, 59, 65, 1],
    syenite_nephelinique: [52, 55, 58, 1], foidolite: [38, 42, 46, 0], charnockite: [60, 66, 73, 0], essexite: [43, 46, 50, 0],
    basalte: [45, 49, 52, 1], trachybasalte: [45, 49, 52, 0], basanite: [41, 44, 47, 1], picrite: [42, 45, 47, 0],
    andesite: [55, 58, 63, 1], trachyandesite: [53, 58, 63, 1], latite: [55, 59, 63, 0], dacite: [63, 65, 69, 1],
    trachyte: [58, 61, 66, 1], phonolite: [53, 56, 60, 1], rhyolite: [69, 73, 78, 1], obsidienne: [70, 74, 77, 0],
    ignimbrite: [63, 70, 77, 0], komatiite: [42, 45, 48, 0], kimberlite: [25, 32, 38, 0], pouzzolane: [44, 47, 52, 0],
    microgranite: [68, 72, 77, 0], aplite: [72, 75, 78, 0], pegmatite: [68, 73, 78, 0], dolerite: [46, 50, 53, 0],
    lamprophyre: [42, 50, 56, 0], porphyre: [62, 68, 75, 0], microdiorite: [52, 57, 62, 0],
  };
  // roches dont la silice dépend du magma d'origine, ou hors de l'échelle
  const SANS = {
    tuf_volcanique: "Un tuf peut venir de n'importe quel magma : sa silice va de celle d'un basalte (≈ 49 %) à celle d'une rhyolite (≈ 73 %). Ceux du Cantal sont surtout trachyandésitiques.",
    breche_volcanique: "Une brèche volcanique est faite de blocs du volcan qui l'a produite : sa silice est celle de ses laves (dans le Cantal, surtout 53 à 63 %).",
    carbonatite: "Une carbonatite contient moins de 10 % de silice (IUGS : plus de 50 % de carbonates) : elle est hors de ce graphique, bien à gauche des roches ultrabasiques.",
  };
  const REPERES = [["peridotite", "péridotite"], ["basalte", "basalte"], ["andesite", "andésite"], ["dacite", "dacite"], ["rhyolite", "rhyolite"]];
  const DOMAINES = [[SMIN, 45, "ultrabasique", "#e2d8c9"], [45, 52, "basique", "#e8dfd2"], [52, 63, "intermédiaire", "#eee8de"], [63, SMAX, "acide", "#f7f3ec"]];

  // Explication « roches acides » en trois volets repliés (B.9, 06/10/2026, sa demande : I, II, III pliés de base). La ligne du
  // tableau qui correspond à la roche est surlignée. Ordres de grandeur : viscosité (Giordano et al. 2008), températures
  // d'éruption et densités de manuel ; vocabulaire « acide/basique » gardé par l'IUGS comme simple étiquette de silice.
  const FAMILLES = [
    ["ultrabasique", "moins de 45 %", "olivine, pyroxène ; ni feldspath ni quartz", "vert sombre à noir", "≈ 3,3", "péridotite", "komatiite (presque toutes ont plus de 2,5 milliards d'années)", "1 400 à 1 650 °C", "très faible"],
    ["basique", "45 à 52 %", "pyroxène, plagioclase riche en calcium, parfois olivine", "noir à gris foncé", "≈ 3,0", "gabbro", "basalte", "1 100 à 1 250 °C", "faible : 10 à 1 000 Pa·s, comme un miel épais"],
    ["intermédiaire", "52 à 63 %", "plagioclase, amphibole, biotite, un peu de pyroxène", "gris moyen, « poivre et sel »", "≈ 2,8", "diorite", "andésite", "900 à 1 100 °C", "moyenne"],
    ["acide", "plus de 63 %", "quartz, feldspath potassique, plagioclase riche en sodium, micas", "clair : blanc, rose, gris clair", "≈ 2,65", "granite", "rhyolite", "700 à 900 °C", "très forte : un million de fois celle d'un basalte, ou plus"],
  ];
  function acideHTML(dom) {
    const lignes = FAMILLES.map((f) => `<tr${f[0] === dom ? ' class="pl-ici"' : ""}><td><b>${f[0]}</b><br><span class="pl-petit">${f[1]} de silice</span></td><td>${f[2]}</td><td>${f[3]}</td><td>${f[4]}</td><td>${f[5]} · ${f[6]}</td><td>${f[7]}</td><td>${f[8]}</td></tr>`).join("");
    return `<div class="pl-plis">
    <details class="pl-pli"><summary>I. Pourquoi dit-on « acide » ? Ce n'est pas le pH</summary>
      <p>Le mot vient de la chimie du XIXᵉ siècle. On rangeait alors les oxydes en deux camps : les <b>acides</b>, qui se combinent aux autres, et les <b>bases</b>, qui sont combinées. La silice SiO₂ était l'acide (« acide silicique »), et la chaux CaO, la magnésie MgO, l'oxyde de fer FeO, la soude Na₂O et la potasse K₂O les bases. Un silicate était vu comme un sel de cet acide. Une roche riche en silice était donc « acide », une roche riche en chaux, magnésie et fer « basique ».</p>
      <p>C'est une <b>étiquette de composition</b>, rien de plus : une roche n'a pas de pH, et le granite ne libère aucun acide. Aujourd'hui, l'IUGS garde ces mots seulement pour dire combien de silice contient la roche, avec des bornes chiffrées : 45, 52 et 63 %. Beaucoup de géologues leur préfèrent <b>felsique</b> (riche en feldspaths et en silice, donc clair) et <b>mafique</b> (riche en magnésium et en fer, donc sombre).</p>
      <p>Ce qui entretient la confusion : les sols sur granite sont bien acides, au sens du pH. Mais ce n'est pas la silice qui les acidifie. Le granite contient peu de calcium et de magnésium. Or ce sont ces éléments, libérés par l'altération, qui neutralisent l'acidité de la pluie et de l'humus. Sur un basalte, il y en a beaucoup, et le sol est moins acide. Les deux sens du mot se rejoignent donc souvent sur le terrain, pour des raisons différentes.</p>
    </details>
    <details class="pl-pli"><summary>II. Ce que la silice change : minéraux, couleur, densité, lave</summary>
      <p><b>Les minéraux.</b> Dans un magma, la silice sert d'abord à construire les silicates. Quand il y en a beaucoup, il en reste une fois les feldspaths et les micas faits : ce reste cristallise seul, c'est le <b>quartz</b>. Une roche acide a donc presque toujours du quartz. Quand il y a peu de silice, on n'a que des minéraux qui en demandent peu, comme l'olivine et le pyroxène, et jamais de quartz.</p>
      <p><b>La couleur.</b> La silice va de pair avec le sodium, le potassium et l'aluminium, qui donnent des minéraux clairs (quartz, feldspaths, muscovite). Peu de silice va avec le fer et le magnésium, qui donnent des minéraux sombres (olivine, pyroxène, amphibole, biotite). D'où la règle de terrain : plus une roche magmatique est claire, plus elle est acide.</p>
      <p><b>La densité.</b> Les minéraux clairs sont légers, les minéraux à fer et magnésium lourds. Le granite (≈ 2,65 t/m³) est plus léger que le basalte (≈ 3,0) : c'est pourquoi la croûte des continents, plutôt granitique, « flotte » plus haut que le plancher des océans, basaltique.</p>
      <p><b>La lave.</b> Dans un magma, les groupes SiO₄ s'accrochent les uns aux autres en chaînes et en réseaux. Plus il y a de silice, plus ce réseau est serré et plus le liquide est visqueux. Un magma acide est aussi plus froid, ce qui le rend plus visqueux encore. Un basalte coule en rivières de lave, comme à la chaîne des Puys. Une lave acide avance à peine : elle forme des dômes, et ses gaz, qui ne peuvent pas s'échapper, la font exploser (ponces, cendres, ignimbrites).</p>
      <div class="pl-tableau"><table class="data">
        <tr><th>Famille</th><th>Minéraux principaux</th><th>Couleur</th><th>Densité (t/m³)</th><th>En profondeur · en surface</th><th>Magma</th><th>Viscosité</th></tr>
        ${lignes}
      </table></div>
      ${dom ? `<p class="pl-petit">La ligne surlignée est celle de cette roche.</p>` : ""}
    </details>
    <details class="pl-pli"><summary>III. D'où vient un magma acide ?</summary>
      <p>Le manteau, lui, est ultrabasique (péridotite, ≈ 42 % de silice). Quand il fond en partie, il ne donne jamais directement un liquide acide : il donne un <b>basalte</b> (≈ 49 %). Pour arriver à plus de 63 %, il y a deux chemins.</p>
      <p><b>1. Faire fondre la croûte continentale.</b> La croûte est déjà riche en silice. Quand une collision l'épaissit, sa base, vers 25 à 35 km, chauffe et fond en partie vers 700 à 850 °C. Les premiers liquides qui apparaissent sont les plus riches en silice : ils donnent les granites, comme ceux du Massif central et de la Bretagne, formés pendant la collision varisque.</p>
      <p><b>2. Faire cristalliser un basalte petit à petit.</b> Les premiers minéraux qui cristallisent dans un basalte (olivine, pyroxène, plagioclase riche en calcium) contiennent moins de silice que le liquide. En se formant, ils la laissent donc dans le liquide restant, qui s'enrichit : basalte, puis andésite, dacite, et enfin rhyolite. C'est la <b>cristallisation fractionnée</b>. On la voit dans le Massif central : les grands volcans du Mont-Dore et du Cantal ont émis des basaltes, puis des laves de plus en plus riches en silice, jusqu'aux trachytes et aux rhyolites.</p>
      <p>Dans les deux cas, il faut un <b>continent</b> ou une <b>zone de subduction</b>. C'est pourquoi les roches acides sont rares au fond des océans, et abondantes dans les chaînes de montagnes et sous les volcans des subductions, comme dans les Andes.</p>
    </details>
  </div>`;
  }

  function silice(roche) {
    if (!roche || roche.categorie !== "magmatique") return "";
    if (SANS[roche.id]) return `<h3>Silice de la roche</h3><p class="sub">${SANS[roche.id]}</p>${acideHTML(null)}`;
    const d = SIO2[roche.id]; if (!d) return "";
    const [a, v, b, lm] = d;
    // Graphique refait le 06/10/2026 (sa remarque : « on ne comprend pas si la barre est pour acide ou pour la quantité de
    // silice »). Deux étages sur la MÊME échelle 0–100 % : en haut, la jauge de ce que contient la roche (silice / le reste) ;
    // en bas, la bande des familles, teintée comme les roches de chaque famille ; un trait relie le bout de la jauge à sa famille.
    const WS = 640, HS = 136, A0 = 24, A1 = 616, XS = (t) => r1(A0 + t / 100 * (A1 - A0));
    const dom = DOMAINES.find(([p, q]) => v >= p && v < q)[2];
    const BANDE = [[0, 45, "ultrabasique", "#4f6a4b", "#fff"], [45, 52, "basique", "#3d3d3b", "#fff"],
      [52, 63, "intermédiaire", "#8c8b86", "#fff"], [63, 100, "acide", "#ecd6cd", "#3a2a24"]];
    let s = `<rect x="0" y="0" width="${WS}" height="${HS}" fill="#f6f4ee"/>`;
    // 1. ce que contient la roche
    s += `<text x="${A0}" y="13" class="si-t">Ce que contient la roche (en % de sa masse)</text>`;
    s += `<rect x="${A0}" y="19" width="${A1 - A0}" height="24" rx="3" fill="#e6e2d9"/>`;
    s += `<rect x="${A0}" y="19" width="${r1(XS(v) - A0)}" height="24" rx="3" fill="#9fb8cf"/>`;
    s += `<rect x="${A0}" y="19" width="${A1 - A0}" height="24" rx="3" fill="none" stroke="#8f897d" stroke-width="0.8"/>`;
    s += `<text x="${r1((A0 + XS(v)) / 2)}" y="35" class="si-t si-fort" text-anchor="middle">silice (SiO₂) : ${v} %</text>`;
    if (100 - v >= 22) s += `<text x="${r1((XS(v) + A1) / 2)}" y="35" class="si-t si-doux" text-anchor="middle">le reste : ${100 - v} %</text>`;
    // 2. trait vers la famille
    s += `<line x1="${XS(v)}" y1="43" x2="${XS(v)}" y2="64" stroke="#c0392b" stroke-width="1.6"/><path d="M${XS(v) - 4} 59 L${XS(v)} 66 L${XS(v) + 4} 59 Z" fill="#c0392b"/>`;
    s += `<text x="${A0}" y="60" class="si-t">Sa famille, d'après cette part de silice</text>`;
    for (const [p, q, n, c, ct] of BANDE) {
      const ici = n === dom;
      s += `<rect x="${XS(p)}" y="67" width="${r1(XS(q) - XS(p))}" height="22" fill="${c}" opacity="${ici ? 1 : 0.32}"/>`;
      const etroit = XS(q) - XS(p) < 80;
      s += `<rect x="${XS(q)}" y="67" width="1.2" height="22" fill="#fff"/>`;
      s += `<text x="${r1((XS(p) + XS(q)) / 2)}" y="${etroit ? 81.5 : 82}" class="si-p${ici ? " si-fort" : ""}" text-anchor="middle" fill="${ici ? ct : "#3a3a36"}"${etroit ? ` style="font-size:${n.length > 8 ? 8.6 : 9}px"` : ""}>${n}</text>`;
    }
    const ic = BANDE.find((f) => f[2] === dom);
    s += `<rect x="${XS(ic[0])}" y="67" width="${r1(XS(ic[1]) - XS(ic[0]))}" height="22" fill="none" stroke="#c0392b" stroke-width="2"/>`;
    for (const t of [0, 45, 52, 63, 100]) s += `<line x1="${XS(t)}" y1="89" x2="${XS(t)}" y2="93" stroke="#8f897d" stroke-width="0.8"/><text x="${XS(t)}" y="103" class="si-p si-doux" text-anchor="${t === 0 ? "start" : t === 100 ? "end" : "middle"}">${t} %</text>`;
    // 3. repères pour comparer (deux rangées décalées, la roche elle-même exclue)
    s += `<text x="${A0}" y="121" class="si-p si-doux">pour comparer :</text>`;
    REPERES.forEach(([id, n], i) => {
      if (id === roche.id) return;
      const x = XS(SIO2[id][1]), y = i % 2 ? 130 : 119;
      s += `<line x1="${x}" y1="106" x2="${x}" y2="${y - 9}" stroke="#a49e93" stroke-width="0.8"/><text x="${x}" y="${y}" class="si-p si-doux" text-anchor="middle">${n} ${SIO2[id][1]} %</text>`;
    });
    const lab = `${roche.nom.split(" (")[0]} : environ ${v} % de silice`;
    return `<h3>Silice de la roche</h3>
    <p class="sub">${roche.nom.split(" (")[0]} : environ ${v} % de silice (${a} à ${b} % le plus souvent), une roche ${dom}. « Acide » veut seulement dire riche en silice : ça n'a rien à voir avec le pH. La silice règle les minéraux, la couleur, la densité de la roche et la viscosité de son magma (détails ci-dessous).</p>
    <div class="pl-silice"><svg viewBox="0 0 ${WS} ${HS}" role="img" aria-label="${lab}, roche ${dom}">${s}</svg></div>
    <p class="pl-note">La jauge du haut est la quantité de silice ; la bande du bas, les familles, teintées comme les roches de chaque famille. Limites IUGS : 45, 52 et 63 % (Le Maitre et al. 2002) ; les anciens manuels plaçaient les roches acides au-delà de 66 % et les intermédiaires à partir de 53 %. ${lm ? "Valeur : moyenne mondiale de Le Maitre (1976), arrondie." : "Valeur typique de la roche, arrondie ; la fourchette est indicative."}</p>
    ${acideHTML(dom)}`;
  }

  // 2. Quels minéraux selon la pression (tâche C.6, 25/09/2026) : diagrammes pression–température expérimentaux, pour les
  //    deux familles dont les limites publiées ont pu être vérifiées. Granite et diorite : NON FAITS (les courbes d'apparition
  //    des minéraux de Naney 1983 et Whitney 1975 n'ont pas pu être relues ; ne pas les dessiner de mémoire).
  //    Manteau (péridotite) : plagioclase → spinelle, Borghini et al. 2010 (lherzolite fertile : 0,7 GPa à 1 000 °C, 0,8 GPa à
  //    1 100 °C) ; spinelle → grenat, Klemme et O'Neill 2000 (1,8–2,0 GPa à 1 200 °C, 2,6–2,7 GPa à 1 500 °C, système CMAS) ;
  //    solidus sec, Hirschmann 2000 (comme « Conditions de formation »).
  //    Basalte : Green et Ringwood 1967, basalte à quartz, à 1 100 °C : gabbro sous 1,0 GPa (le grenat apparaît), éclogite au-delà
  //    de 2,1 GPa (le plagioclase disparaît) ; mesures au-dessus de 1 000 °C seulement, pente des limites non reprise.
  const kmDeGPa = (p) => p <= 0.9614 ? p / 0.027468 : 35 + (p - 0.9614) / 0.032373;
  function cadrePT(o) {
    const W2 = 480, H2 = 206, x0 = 58, x1 = 432, y0 = 16, y1 = 166;
    const X2 = (t) => x0 + (t - o.tmin) / (o.tmax - o.tmin) * (x1 - x0), Y2 = (p) => y0 + p / o.pmax * (y1 - y0);
    const P = (L) => L.map(([t, p]) => `${r1(X2(t))},${r1(Y2(p))}`).join(" ");
    let s = `<rect x="0" y="0" width="${W2}" height="${H2}" fill="#f3f1ea"/><defs><clipPath id="pl-${o.cle}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath></defs><g clip-path="url(#pl-${o.cle})">`;
    for (const [L, c] of o.zones) s += `<polygon points="${P(L)}" fill="${c}"/>`;
    for (const [L, c, d] of o.lignes || []) s += `<polyline points="${P(L)}" fill="none" stroke="${c}" stroke-width="1.1"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
    s += `</g><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="#8f897d" stroke-width="0.8"/>`;
    for (const t of o.tt) s += `<line x1="${r1(X2(t))}" y1="${y1}" x2="${r1(X2(t))}" y2="${y1 + 3}" stroke="#8f897d" stroke-width="0.8"/><text x="${r1(X2(t))}" y="${y1 + 12}" class="fa-lab fa-petit" text-anchor="middle">${t.toLocaleString("fr-FR")}</text>`;
    for (const p of o.pt) s += `<line x1="${x0 - 3}" y1="${r1(Y2(p))}" x2="${x0}" y2="${r1(Y2(p))}" stroke="#8f897d" stroke-width="0.8"/><text x="${x0 - 5}" y="${r1(Y2(p) + 3)}" class="fa-lab fa-petit" text-anchor="end">${nb(p)}</text>`
      + `<text x="${x1 + 5}" y="${r1(Y2(p) + 3)}" class="fa-lab fa-petit">${Math.round(kmDeGPa(p) / 5) * 5} km</text>`;
    s += `<text x="${(x0 + x1) / 2}" y="${y1 + 25}" class="fa-lab fa-petit" text-anchor="middle">température (°C)</text><text x="8" y="11" class="fa-lab fa-petit">pression (GPa)</text><text x="${x1 + 5}" y="11" class="fa-lab fa-petit">profondeur</text>`;
    for (const [t, p, n, a] of o.textes) s += `<text x="${r1(X2(t))}" y="${r1(Y2(p))}" class="fa-lab fa-petit${a && a.c ? " " + a.c : " pq-dom"}" text-anchor="${(a && a.a) || "middle"}">${n}</text>`;
    for (const [t, p, n, a] of o.points || []) s += `<circle cx="${r1(X2(t))}" cy="${r1(Y2(p))}" r="4.3" fill="#c0392b" stroke="#fff" stroke-width="1.2"/><text x="${r1(X2(t) + ((a && a.dx) || 7))}" y="${r1(Y2(p) + 3)}" class="fa-lab pq-nom-page" text-anchor="${(a && a.a) || "start"}">${n}</text>`;
    if (o.chemin) s += `<polyline points="${P(o.chemin)}" fill="none" stroke="#c0392b" stroke-width="2" stroke-linejoin="round" stroke-dasharray="4 2"/>`;
    return `<div class="pl-silice"><svg viewBox="0 0 ${W2} ${H2}" role="img" aria-label="${o.titre}">${s}</svg></div>`;
  }
  const solidusSec = (p) => 1120.661 + 132.899 * p - 5.104 * p * p;
  const plagSpl = (t) => 0.7 + 0.001 * (t - 1000), splGrt = (t) => 1.9 + 0.0025 * (t - 1200);
  const MANTEAU = { peridotite: 1, komatiite: 1, picrite: 1, kimberlite: 1 };
  const BASALTE = { basalte: 1, gabbro: 1, dolerite: 1, trachybasalte: 1, pouzzolane: 1, eclogite: 1 };
  function manteauPT(roche) {
    const T0 = 800, T1 = 1700, PM = 3.5, serie = (f, a, b) => Array.from({ length: 31 }, (_, i) => f(a + (b - a) * i / 30));
    const sol = serie((p) => [solidusSec(p), p], 0, PM);
    const lp = [[T0, plagSpl(T0)], [T1, plagSpl(T1)]], lg = [[T0, splGrt(T0)], [T1, splGrt(T1)]];
    // limite coupée au solidus (au-delà, la roche fond)
    const coupe = (f) => { let t = T0; while (t < T1 && t < solidusSec(f(t))) t += 2; return [[T0, f(T0)], [t, f(t)]]; };
    const o = {
      cle: "manteau", titre: "Minéraux du manteau selon la pression", tmin: T0, tmax: T1, pmax: PM, tt: [800, 1000, 1200, 1400, 1600], pt: [0, 1, 2, 3],
      zones: [[[[T0, 0], [T1, 0], ...lp.slice().reverse()], "#efe9dd"], [[...lp, ...lg.slice().reverse()], "#e4ebe3"], [[...lg, [T1, PM], [T0, PM]], "#ecdcda"],
        [[...sol, [T1 + 300, PM], [T1 + 300, 0]], "rgba(222, 120, 110, 0.22)"]],
      lignes: [[coupe(plagSpl), "#9c927f"], [coupe(splGrt), "#9c927f"], [sol, "#6f6a60"]],
      textes: [[830, 0.28, "à plagioclase", { a: "start" }], [960, 1.05, "à spinelle", { a: "start" }], [830, 2.9, "à grenat", { a: "start" }],
        [1600, 0.5, "fondu en partie", { a: "end" }], [1420, 1.75, "solidus sec", { a: "end" }]],
    };
    let texte = "Le même manteau, de même composition, ne cristallise pas les mêmes minéraux selon la pression. L'aluminium y loge dans le plagioclase près de la surface, dans le spinelle entre 25 et 60 km environ, dans le grenat plus bas : on parle de lherzolite à plagioclase, à spinelle ou à grenat.";
    if (roche.id === "peridotite") {
      o.chemin = [[1000, 1.2], [800, 0.55]];
      o.points = [[1000, 1.2, "Lherz", {}]];
      texte += " La lherzolite de Lherz est une lherzolite à spinelle, remontée d'environ 40 km (trait rouge : sa remontée, schématique).";
    } else if (roche.id === "kimberlite") texte += " Une kimberlite naît bien plus bas, dans le champ du grenat (150 à 250 km, hors du cadre) : elle en rapporte des grenats et parfois des diamants.";
    else if (roche.id === "komatiite") texte += " Le magma d'une komatiite naît dans le champ du grenat, à plus de 150 km, bien au-delà du solidus d'aujourd'hui.";
    else texte += " Le magma d'une picrite naît au passage du solidus, vers 2 à 3 GPa sous un panache, dans le champ du grenat.";
    return `<h3>Quels minéraux selon la pression ? Le manteau</h3><p class="sub">${texte}</p>${cadrePT(o)}
    <p class="pl-note">Limites mesurées : plagioclase → spinelle à 0,7 GPa (1 000 °C) et 0,8 GPa (1 100 °C) dans une lherzolite fertile (Borghini et al. 2010) ; spinelle → grenat à 1,8–2,0 GPa (1 200 °C) et 2,6–2,7 GPa (1 500 °C) dans le système simplifié CaO–MgO–Al₂O₃–SiO₂ (Klemme et O'Neill 2000) ; le chrome d'un manteau naturel repousse le grenat un peu plus bas. Solidus sec : Hirschmann (2000). Droites prolongées au-delà des mesures.</p>`;
  }
  function basaltePT(roche) {
    const o = {
      cle: "basalte", titre: "Minéraux d'un basalte selon la pression", tmin: 1000, tmax: 1250, pmax: 3, tt: [1000, 1050, 1100, 1150, 1200, 1250], pt: [0, 1, 2, 3],
      zones: [[[[1000, 0], [1250, 0], [1250, 1], [1000, 1]], "#efe9dd"], [[[1000, 1], [1250, 1], [1250, 2.1], [1000, 2.1]], "#e8e2ec"], [[[1000, 2.1], [1250, 2.1], [1250, 3], [1000, 3]], "#ecdcda"]],
      lignes: [[[[1000, 1], [1250, 1]], "#9c927f", "4 3"], [[[1000, 2.1], [1250, 2.1]], "#9c927f", "4 3"]],
      textes: [[1125, 0.55, "gabbro : plagioclase + pyroxène (+ olivine)"], [1125, 1.6, "granulite à grenat : grenat + pyroxène + plagioclase + quartz"], [1125, 2.6, "éclogite : grenat + pyroxène (omphacite)"],
        [1245, 0.95, "le grenat apparaît", { a: "end", c: "fa-leg" }], [1245, 2.05, "le plagioclase disparaît", { a: "end", c: "fa-leg" }]],
    };
    let texte = "Un basalte de même composition donne, en cristallisant ou en recristallisant, des roches différentes selon la pression : un gabbro près de la surface, une granulite à grenat en profondeur, une éclogite au-delà d'environ 70 km. Le grenat, très dense, remplace le plagioclase quand la pression monte.";
    if (roche.id === "gabbro" || roche.id === "dolerite") o.points = [[1150, 0.13, roche.id === "gabbro" ? "gabbro du Chenaillet (≈ 5 km)" : "dolérite (filons, sills)", {}]];
    if (roche.id === "eclogite") texte += " Les éclogites du Massif central se sont formées bien plus froides (≈ 550–700 °C, hors du cadre) : dans une subduction, la plaque reste froide.";
    return `<h3>Quels minéraux selon la pression ? Le basalte</h3><p class="sub">${texte}</p>${cadrePT(o)}
    <p class="pl-note">Limites mesurées à 1 100 °C sur un basalte à quartz : le grenat apparaît vers 1,0 GPa, le plagioclase disparaît vers 2,1 GPa (Green et Ringwood 1967) ; selon la composition du basalte, la zone de transition va de 0,34 à 1,2 GPa de large. Expériences au-dessus de 1 000 °C seulement ; la pente des limites n'est pas dessinée.</p>`;
  }

  function html(roche) {
    if (!roche) return "";
    return silice(roche) + (MANTEAU[roche.id] ? manteauPT(roche) : "") + (BASALTE[roche.id] ? basaltePT(roche) : "");
  }
  function sources(roche) {
    if (!roche) return "";
    let s = "";
    if (roche.categorie === "magmatique" && (SIO2[roche.id] || SANS[roche.id])) s += `<p class="page-source"><b>Silice de la roche</b> — Limites : Le Maitre R. W. et al. (2002), <i>Igneous Rocks: A Classification and Glossary of Terms</i>, 2ᵉ éd., Cambridge University Press. Moyennes : Le Maitre R. W. (1976), <i>Journal of Petrology</i> 17, 589. Viscosité des magmas : Giordano D., Russell J. K. et Dingwell D. B. (2008), <i>Earth and Planetary Science Letters</i> 271, 123.</p>`;
    if (MANTEAU[roche.id]) s += `<p class="page-source"><b>Minéraux du manteau selon la pression</b> — Borghini G., Fumagalli P. et Rampone E. (2010), <i>Journal of Petrology</i> 51, 229 ; Klemme S. et O'Neill H. St C. (2000), <i>Contributions to Mineralogy and Petrology</i> 138, 237 ; Hirschmann M. M. (2000), <i>Geochemistry, Geophysics, Geosystems</i> 1, 2000GC000070.</p>`;
    if (BASALTE[roche.id]) s += `<p class="page-source"><b>Minéraux d'un basalte selon la pression</b> — Green D. H. et Ringwood A. E. (1967), <i>Geochimica et Cosmochimica Acta</i> 31, 767.</p>`;
    return s;
  }
  window.PlusLoin = { html, sources, SIO2 };
})();
