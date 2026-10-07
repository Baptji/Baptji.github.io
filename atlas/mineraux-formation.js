// ============ Fiche minéral : forme, structure, formation (F.3) ============
// Chargé après formation.js (il en réutilise les diagrammes de conditions, C.4) et avant app.js.
// MIN_F[id] = ce que la fiche d'un minéral raconte EN PLUS de ses propriétés :
//   forme    : pourquoi le cristal a cette forme et ces clivages (texte posé sous le schéma de cristal.js)
//   intro    : une phrase qui annonce les modes de formation
//   scenarios: [{ nom, texte, cond, src }] — un diagramme de conditions par mode de formation,
//              avec le chemin numéroté et la liste des étapes (mêmes numéros), comme pour les roches.
// Les types de diagramme (cond.type) sont ceux de formation.js : pt, silice, enfouissement, calcite,
// carbonates, evaporation, climat, ehph, grains, choc.
const MIN_F = {

  // ─────────────────────────────── Quartz ───────────────────────────────
  quartz: {
    forme: `Le quartz est un empilement d'hélices de tétraèdres SiO₄ vissées autour de l'axe c, toutes dans le
      même sens. Aucune direction n'y est plus faible qu'une autre : le quartz n'a <b>pas de clivage</b> et casse
      en écailles courbes (cassure conchoïdale). Les faces qui poussent le plus vite sont celles du prisme,
      parallèles aux hélices, et elles gardent la trace de chaque arrêt de croissance sous forme de
      <b>stries horizontales</b> — le signe auquel on le reconnaît sur le terrain. Le sens de l'hélice, lui,
      se voit à l'autre bout de l'échelle : il place les petites faces <i>x</i> d'un côté ou de l'autre des arêtes
      et fait du cristal un quartz droit ou un quartz gauche.`,
    intro: `Le quartz cristallise dans trois situations très différentes, et il n'a pas la même allure dans les
      trois : serré entre les autres minéraux d'un granite, il n'a aucune face ; libre dans une fissure, il donne
      les prismes du schéma ci-dessus ; dissous puis reprécipité entre les grains d'un sable, il ne se voit plus
      qu'au microscope.`,
    scenarios: [
      { nom: "Dans un granite",
        texte: `Dans un magma riche en silice, le quartz est le <b>dernier</b> à cristalliser. Quand vient son tour,
          les feldspaths et les micas occupent déjà toute la place : il ne fait que remplir les vides qui restent.
          C'est pourquoi les grains gris vitreux d'un granite n'ont aucune face propre, alors que la charpente
          atomique, elle, est exactement la même que celle d'un beau prisme de filon.`,
        cond: { type: "pt", echelle: "croute", courbes: ["graniteEau"], fondu: ["graniteEau"],
          bande: [650, 720, 0.2],
          etiquettes: [["graniteEau", 470, 0.62, -72]],
          chemin: [
            { T: 830, P: 0.80, n: 1, t: "La croûte épaissie par une collision fond partiellement vers 28–30 km : le liquide produit est saturé en silice." },
            { T: 800, P: 0.22, n: 2, t: "Plus léger que son encaissant, le magma monte et s'arrête vers 7 km de profondeur." },
            { T: 690, P: 0.20, n: 3, t: "Entre ≈ 720 et 650 °C, la silice qui reste cristallise en quartz dans les interstices : environ 100 000 ans pour un pluton de quelques kilomètres." },
          ],
          note: "Le solidus tracé est celui d'un granite saturé en eau : sec, le même magma ne fondrait qu'au-delà de 950 °C. Chemin schématique." },
        src: ["tuttle", "profondeur", "diffusion"] },

      { nom: "Dans un filon",
        texte: `Une eau chaude qui circule dans les fractures d'un massif dissout la silice des roches
          traversées. En remontant, elle se refroidit — et la solubilité du quartz s'effondre. Tout ce que l'eau
          ne peut plus porter cristallise sur les parois de la fissure, où rien ne gêne la croissance :
          c'est là, et seulement là, que le quartz prend la forme dessinée plus haut.`,
        cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
          chemin: [
            { T: 300, C: 663, n: 1, t: "À 300 °C, l'eau d'une fracture est à l'équilibre avec le quartz de la roche : elle porte ≈ 660 mg de silice par litre." },
            { T: 200, C: 663, n: 2, t: "Elle remonte et se refroidit sans rien perdre : à 200 °C, elle en porte deux fois et demie trop." },
            { T: 150, C: 137, n: 3, t: "L'excès cristallise sur les parois — ≈ 520 mg de quartz par litre d'eau passée. Un filon d'un mètre demande le passage de beaucoup d'eau, pendant des dizaines de milliers d'années." },
          ],
          note: "Les deux courbes sont les solubilités à l'équilibre. Au-dessus d'une courbe, l'eau est sursaturée et le minéral correspondant précipite ; au-dessous, il se dissout." },
        src: ["rimstidt", "fournier", "siliceChaud"] },

      { nom: "En ciment d'un grès",
        texte: `Un sable de quartz enfoui se tasse, puis chauffe. Au-delà de 70 à 80 °C, la silice dissoute dans
          l'eau des pores se redépose <b>sur les grains eux-mêmes</b>, dans le prolongement exact de leur réseau :
          chaque grain s'entoure d'une auréole qui vient souder ses voisins. Le sable devient grès. Au microscope,
          une fine ligne de poussière marque encore la limite du grain d'origine.`,
        cond: { type: "enfouissement", tmax: 120, zmax: 4, seuils: ["quartz"],
          chemin: [
            { age: 120, z: 0, n: 1, t: "Le sable se dépose sur une plate-forme marine." },
            { age: 70, z: 2.4, n: 2, t: "Enfoui sous 2 à 3 km de sédiments, il atteint 70–80 °C." },
            { age: 20, z: 3.2, n: 3, t: "La cimentation par le quartz se fait dans cette fenêtre de température : elle dure des millions d'années et ferme la porosité." },
          ] },
        src: ["walderhaug", "gradient"] },
    ],
  },

  // ─────────────────────────────── Calcite ───────────────────────────────
  calcite: {
    forme: `La calcite empile des plans de calcium et des plans de groupes CO₃ triangulaires, tous couchés à plat
      et perpendiculaires à l'axe c. D'un plan à l'autre, la liaison est nettement plus faible qu'à l'intérieur des
      triangles : la calcite se fend selon trois familles de plans obliques, et <b>tout éclat de calcite est un
      rhomboèdre</b>, quelle que soit la forme extérieure du cristal de départ. Affichez les clivages sur le
      scalénoèdre : les traces le traversent en biais, sans aucun rapport avec ses faces. Cet empilement de
      triangles explique aussi la <b>double réfraction</b> du spath d'Islande : la lumière ne traverse pas la pile
      à la même vitesse selon qu'elle vibre dans le plan des triangles ou perpendiculairement.`,
    intro: `La calcite est le minéral le plus fabriqué et le plus détruit de la surface terrestre : les organismes
      la bâtissent, l'eau chargée de CO₂ la dissout, et elle reprécipite dès que ce CO₂ s'échappe.`,
    scenarios: [
      { nom: "Dans une mer chaude",
        texte: `Dans les premiers mètres d'une mer chaude, coraux, algues calcaires, foraminifères et coquillages
          bâtissent leur squelette en calcite ou en aragonite. Leurs débris couvrent le fond d'une boue qui contient
          plus de 90 % de carbonate : c'est le futur calcaire. Mais la calcite n'est stable que dans l'eau de
          surface — plus bas que 4 à 5 kilomètres, l'eau froide et sous pression la redissout, et il n'en arrive
          plus rien au fond des océans.`,
        cond: { type: "carbonates", depots: [[10, 200, "plate-forme carbonatée"]],
          chemin: [
            { x: 92, z: 15, n: 1, t: "Zone éclairée : les organismes fixent le carbonate de l'eau de mer." },
            { x: 92, z: 90, n: 2, t: "Les débris tombent et s'accumulent : une boue à plus de 90 % de carbonate." },
            { x: 55, z: 4300, n: 3, t: "Plus profond, l'eau devient corrosive pour la calcite ; vers 4,5 à 5,5 km, la profondeur de compensation, il n'en reste plus." },
          ] },
        src: ["ccd", "photique"] },

      { nom: "Dans une grotte",
        texte: `La pluie ne dissout presque pas le calcaire. C'est en traversant le sol qu'elle devient agressive :
          l'air d'un sol contient dix à cent fois plus de CO₂ que l'atmosphère, et ce CO₂ dissous acidifie l'eau.
          Elle creuse alors le karst. Arrivée dans la grotte, où l'air est redevenu normal, elle dégaze — et rend
          le calcium qu'elle ne peut plus porter. Une stalactite est ce dégazage, goutte après goutte.`,
        cond: { type: "calcite",
          chemin: [
            { pco2: 0.032, Ca: 8, n: 1, t: "L'eau de pluie traverse le sol et s'y charge de CO₂ (≈ 0,03 atmosphère au lieu de 0,0004)." },
            { pco2: 0.032, Ca: 127, n: 2, t: "Sous ce CO₂, elle peut dissoudre ≈ 127 mg de calcium par litre : elle élargit les fissures et ouvre le karst." },
            { pco2: 0.0004, Ca: 127, n: 3, t: "Dans la grotte, l'air n'a plus que le CO₂ de l'atmosphère : l'eau dégaze et se retrouve très sursaturée." },
            { pco2: 0.0004, Ca: 27, n: 4, t: "Elle rend l'excès sous forme de calcite : ≈ 100 mg par litre égoutté. À 100 litres par an, une stalactite grossit de quelques centièmes de millimètre." },
          ],
          note: "Calcium à l'équilibre avec la calcite, calculé pour une eau pure à 10 °C (grotte) et 25 °C." },
        src: ["plummer"] },
    ],
  },

  // ─────────────────────────────── Orthose ───────────────────────────────
  orthose: {
    forme: `La charpente des feldspaths est faite de chaînes de tétraèdres (Si,Al)O₄ parallèles à l'axe a, reliées
      latéralement ; le potassium loge dans les grandes cavités qu'elles laissent. Deux directions de liaisons
      faibles traversent cet édifice, {001} et {010}, et elles se coupent <b>exactement à angle droit</b> : ce sont
      les deux clivages, et ce 90° a donné son nom au minéral (du grec <i>orthós</i>, « droit »). Le plagioclase,
      bâti pareil mais triclinique, les coupe à 94° — c'est la façon la plus simple de séparer les deux au
      microscope. Le cristal est allongé selon a et souvent aplati sur {010}, la face qui porte les macles.`,
    intro: `L'orthose est un minéral de refroidissement lent : il lui faut du temps pour que le potassium, le
      silicium et l'aluminium se mettent en ordre. C'est pour cela qu'on le trouve dans les granites et non dans
      les laves, où la même formule donne la sanidine, désordonnée.`,
    scenarios: [
      { nom: "Dans un granite",
        texte: `Le feldspath potassique cristallise <b>avant</b> le quartz, entre ≈ 730 et 660 °C. À ce moment le
          magma est encore largement liquide : le cristal a de la place et développe ses faces. C'est ce qui donne
          les gros cristaux roses bien dessinés, parfois longs de plusieurs centimètres, qui ponctuent les granites
          porphyroïdes — et qui portent si souvent la macle de Carlsbad.`,
        cond: { type: "pt", echelle: "croute", courbes: ["graniteEau"], fondu: ["graniteEau"],
          bande: [660, 730, 0.2],
          etiquettes: [["graniteEau", 470, 0.62, -72]],
          chemin: [
            { T: 830, P: 0.80, n: 1, t: "Fusion partielle de la croûte profonde : le liquide emporte le potassium, l'aluminium et la silice." },
            { T: 800, P: 0.22, n: 2, t: "Le magma monte et s'installe vers 7 km." },
            { T: 700, P: 0.20, n: 3, t: "Entre 730 et 660 °C, le feldspath potassique cristallise dans un magma encore liquide : il grandit librement." },
          ],
          note: "Intervalle de cristallisation pour un magma granitique hydraté à ≈ 0,2 GPa. Chemin schématique." },
        src: ["tuttle", "profondeur"] },

      { nom: "À l'air libre : arène ou kaolinite",
        texte: `Sorti du granite, le même cristal se fait attaquer par l'eau chargée de CO₂ : l'hydrolyse emporte le
          potassium et une partie de la silice, et ce qui reste se réorganise en argile. Mais la vitesse dépend
          entièrement du climat. Sous nos latitudes, l'attaque est assez lente pour que des grains frais survivent
          au transport et se retrouvent dans un sable ou une arkose. Sous un climat tropical humide, il ne reste
          rapidement plus que de la kaolinite.`,
        cond: { type: "climat",
          domaines: [[-5, 13, 0, 0.75], [20, 30, 0.9, 2.5]],
          etiquettes: [["le feldspath survit : arkose", 4, 0.38], ["hydrolyse complète : kaolinite", 25, 2.2]],
          villes: ["Brest", "Paris", "Marseille"],
          chemin: [
            { T: 11.5, ai: 0.9, n: 1, t: "Dans un granite breton, l'hydrolyse ronge les feldspaths sans les effacer : le granite se défait en arène, où le feldspath reste reconnaissable." },
            { T: 26, ai: 1.8, n: 2, t: "Transporté sous un climat tropical humide, le même grain est entièrement hydrolysé : il ne reste que de la kaolinite et la silice part en solution." },
          ],
          note: "Échelle climatique commune de l'atlas : température moyenne annuelle et pluie divisée par l'évapotranspiration potentielle. Les points sont les normales 1991–2020." },
        src: ["h5", "safran"] },
    ],
  },

  // ─────────────────────────────── Gypse ───────────────────────────────
  gypse_m: {
    forme: `Le gypse est bâti en sandwichs : deux plans de tétraèdres SO₄ encadrant les calciums, puis un
      <b>double plan de molécules d'eau</b>. D'un sandwich à l'autre, il n'y a que des liaisons hydrogène, de loin
      les plus faibles de l'édifice — affichez-les dans la structure 3D ci-dessous. D'où le clivage {010} parfait,
      qui détache des lamelles souples et transparentes (le « miroir d'âne »), et une dureté de 2 : l'ongle raye le
      gypse. C'est aussi cette eau qui part vers 150 °C et fait le plâtre, et qui revient quand on le gâche.`,
    intro: `Le gypse ne se forme que là où l'eau s'évapore plus vite qu'elle n'arrive : lagunes coupées de la mer,
      sebkhas, croûtes de marnes. C'est un minéral fragile, qui se dissout dès qu'il pleut — d'où sa rareté à
      l'affleurement en France, et les carrières souterraines de Montmartre.`,
    scenarios: [
      { nom: "Dans une lagune qui s'évapore",
        texte: `Une lagune peu profonde qui ne communique plus avec la mer que par un seuil se concentre à chaque
          saison sèche. Les sels ne précipitent pas tous ensemble : chacun attend que sa propre limite de
          solubilité soit franchie. Les carbonates partent les premiers, le gypse à 3,8 fois la concentration de
          l'eau de mer, le sel gemme à 10,6 fois. Un banc de gypse de plusieurs mètres n'est donc pas le résidu
          d'une évaporation unique, mais la somme de milliers de remplissages.`,
        cond: { type: "evaporation", couche: "gypse",
          chemin: [
            { an: 0, n: 1, t: "La lagune se ferme : l'eau de mer commence à se concentrer." },
            { an: 3.7, n: 2, t: "À 3,8 fois la concentration de départ (≈ 74 % de l'eau évaporée), le sulfate de calcium sature : le gypse se dépose." },
            { an: 4.55, n: 3, t: "Au-delà de 10,6 fois, c'est l'halite qui prend le relais et le gypse ne se forme plus. Repère de temps : ≈ 2 m d'eau évaporés par an sur une tranche de 10 m." },
          ] },
        src: ["mccaffrey", "warren", "sofianos"] },

      { nom: "Enfoui, il devient anhydrite",
        texte: `Le gypse ne supporte pas d'être enterré : au-delà de 40 à 60 °C, soit à peine 1 à 1,5 kilomètre de
          profondeur, il perd ses deux molécules d'eau et devient de l'<b>anhydrite</b> (CaSO₄). L'opération se fait
          dans l'autre sens à la remontée : l'anhydrite reprend son eau et regonfle d'environ 60 % de son volume,
          ce qui disloque la roche encaissante et fait les cargneules. C'est aussi ce que redoutent les tunneliers
          des Alpes.`,
        cond: { type: "enfouissement", tmax: 230, zmax: 3, seuils: ["gypse"], labDroite: true,
          chemin: [
            { age: 225, z: 0, n: 1, t: "Le gypse du Keuper se dépose dans des lagunes, il y a ≈ 225 millions d'années." },
            { age: 120, z: 2.0, n: 2, t: "Enfoui sous 1,5 à 2 km, il dépasse 60 °C : il se déshydrate en anhydrite." },
            { age: 0, z: 0.1, n: 3, t: "Ramené près de la surface par l'érosion, il se réhydrate en gypse en gonflant de ≈ 60 % (volumes molaires : 46 cm³/mol pour l'anhydrite, 75 pour le gypse)." },
          ] },
        src: ["hardie", "gradient"] },
    ],
  },
};
