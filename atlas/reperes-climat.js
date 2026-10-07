// ============ Repères climatiques (H.5, 16/09/2026) — sortis de app.js le 06/10/2026 (B.9) ============
// Retirés des fiches roches à sa demande (« on peut supprimer les repères climatiques en les gardant dans un fichier ») ;
// encore affichés en bas des pages oxydes. Chargé avant app.js.
// une seule échelle pour « froid », « chaud », « sec », « humide » ----------------
// Températures : bornes des régimes de température des sols de la Soil Taxonomy (8, 15, 22 °C) et groupe A de Köppen.
// Eau : indice d'aridité pluie ÷ ETP de l'UNEP (1992). Saisons sèches : régimes hydriques de la Soil Taxonomy.
// Repères français : normales 1991–2020 calculées sur la maille SAFRAN (8 km) de chaque ville, ETP de Penman-Monteith.
function reperesClimatHTML() {
  return `<div class="card reperes-climat">
    <details>
      <summary><h2 style="display:inline">Repères climatiques</h2></summary>
      <p class="sub">Les mots « froid », « tempéré », « chaud », « sec » et « humide » suivent partout dans l'Atlas la même échelle.
      Les villes donnent la moyenne 1991–2020.</p>
      <div class="rc-grille">
        <table class="data">
          <tr><th>Température moyenne annuelle</th><th>Repères</th></tr>
          <tr><td><b>froid</b> · moins de 8 °C</td><td>Chamonix 5,2 · mont Aigoual 7,7</td></tr>
          <tr><td><b>tempéré</b> · 8 à 15 °C</td><td>Brest 11,7 · Paris 12,7 · Toulouse 13,9</td></tr>
          <tr><td><b>chaud</b> · 15 à 22 °C</td><td>Montpellier 15,1 · Marseille 15,9</td></tr>
          <tr><td><b>tropical</b> · 22 °C et plus, aucun mois sous 18 °C</td><td>—</td></tr>
        </table>
        <table class="data">
          <tr><th>Pluie ÷ évapotranspiration (ETP)</th><th>Repères</th></tr>
          <tr><td><b>hyper-aride</b> · moins de 5 %</td><td>désert d'Atacama</td></tr>
          <tr><td><b>aride</b> · 5 à 20 %</td><td>—</td></tr>
          <tr><td><b>semi-aride</b> · 20 à 50 %</td><td>Marseille : 530 mm, 42 %</td></tr>
          <tr><td><b>sec subhumide</b> · 50 à 65 %</td><td>Montpellier : 670 mm, 55 %</td></tr>
          <tr><td><b>humide</b> · plus de 65 %</td><td>Paris : 670 mm, 77 % · Brest : 1 120 mm, 167 %</td></tr>
        </table>
      </div>
      <p class="sub" style="margin-top:10px"><b>L'ETP</b> est l'eau que le sol et les plantes rendraient à l'air s'ils en avaient
      toujours : 670 mm par an à Brest, 1 250 mm à Marseille. À pluie égale, Paris est humide et Montpellier sec.</p>
      <p class="sub"><b>Régime hydrique du sol</b> : <b>udique</b>, sol sec moins de 90 jours par an (presque toute la France) ;
      <b>xérique</b>, sol sec au moins 45 jours d'affilée en été, humide en hiver (climat méditerranéen) ; <b>ustique</b>, saison
      sèche de 90 jours ou plus, pluies en saison chaude (tropiques à saison sèche) ; <b>aridique</b>, sol sec plus de la moitié
      de l'année ; <b>aquique</b>, sol engorgé et privé d'oxygène.</p>
    </details>
  </div>`;
}
function reperesClimatSourceHTML() {
  return `<p class="page-source">Repères climatiques : régimes de température et d'humidité des sols, <i>Keys to Soil Taxonomy</i>
    (USDA, Soil Survey Staff) ; indice d'aridité de l'UNEP, <i>World Atlas of Desertification</i> (1992) ; groupe A de la
    classification de Köppen ; normales 1991–2020 calculées à partir de la réanalyse SAFRAN de Météo-France (API GeoSAS), ETP de
    Penman-Monteith — avec une ETP de Thornthwaite, les pourcentages seraient plus élevés ; France entière : 13,0 °C et 935 mm
    (Météo-France) ; carbonates pédogénétiques rares au-delà de 760 mm/an : Royer (1999), <i>Geology</i> 27.</p>`;
}
