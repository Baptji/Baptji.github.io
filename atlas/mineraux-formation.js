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
    forme: `Le quartz se compose d'hélices de tétraèdres SiO₄ enroulées autour de l'axe c, toutes orientées dans le même sens. Aucune direction ne se révèle plus fragile qu'une autre : le quartz ne présente <b>pas de clivage</b> et se brise en écailles courbes (cassure conchoïdale). Les faces qui croissent le plus vite sont celles du prisme, parallèles aux hélices, et conservent la trace de chaque pause de croissance sous forme de <b>stries horizontales</b>, indice qui permet de l'identifier sur le terrain. Le sens de l'hélice se lit, lui, à l'autre bout de l'échelle : les petites faces <i>x</i> se placent d'un côté ou de l'autre des arêtes, faisant du cristal un quartz droit ou gauche.`,
    intro: `Le quartz se forme selon trois configurations contrastées, et son aspect varie en conséquence : coincé entre les autres minéraux d'un granite, il reste sans face ; dans une fissure libre, il adopte les prismes du schéma ci-dessus ; dissous puis reprécipité entre les grains d'un sable, il n'est plus visible qu'au microscope.`,
    scenarios: [
      { nom: "Dans un granite",
        texte: `Dans un magma riche en silice, le quartz cristallise en <b>dernier</b>. Lorsque vient son tour, les feldspaths et les micas occupent déjà tout le volume : il ne fait que combler les vides restants. C'est pourquoi les grains gris et vitreux d'un granite ne présentent aucune face propre, bien que leur réseau atomique soit identique à celui d'un beau prisme de filon.`,
        cond: { type: "pt", echelle: "croute", courbes: ["graniteEau"], fondu: ["graniteEau"],
          bande: [650, 720, 0.2],
          etiquettes: [["graniteEau", 470, 0.62, -72]],
          chemin: [
            { T: 830, P: 0.80, n: 1, t: "À une profondeur voisine de 28 à 30 km, la croûte épaissie par collision entre partiellement en fusion ; le liquide obtenu est saturé en silice." },
            { T: 800, P: 0.22, n: 2, t: "Moins dense que son encaissant, le magma remonte et s'immobilise vers 7 km de profondeur." },
            { T: 690, P: 0.20, n: 3, t: "Entre ≈ 720 et 650 °C, la silice résiduelle se fixe en quartz dans les interstices : un pluton de quelques kilomètres exige environ 100 000 ans." },
          ],
          note: "La courbe du solidus correspond à un granite saturé en eau : à sec, le même magma ne fondrait qu'au-delà de 950 °C. Chemin schématique." },
        src: ["tuttle", "profondeur", "diffusion"] },

      { nom: "Dans un filon",
        texte: `Dans un massif, l'eau chaude qui s'infiltre par les fractures dissout la silice des roches qu'elle traverse. Lors de la remontée, le refroidissement fait chuter brusquement la solubilité du quartz : ce que l'eau ne peut plus transporter se dépose sur les parois de la fissure, là où la croissance n'est pas gênée. C'est uniquement dans ces conditions que le quartz prend la forme représentée plus haut.`,
        cond: { type: "silice", tmax: 300, xlab: "Température de l'eau (°C)",
          chemin: [
            { T: 300, C: 663, n: 1, t: "Une eau de fracture portée à 300 °C contient ≈ 660 mg de silice par litre, en équilibre avec le quartz de la roche." },
            { T: 200, C: 663, n: 2, t: "Elle remonte en se refroidissant sans rien perdre : à 200 °C, elle en transporte deux fois et demie de trop." },
            { T: 150, C: 137, n: 3, t: "L'excédent cristallise sur les parois, à raison de ≈ 520 mg de quartz par litre d'eau écoulée. Pour former un filon d'un mètre, il faut faire passer une grande quantité d'eau pendant des dizaines de milliers d'années." },
          ],
          note: "Les deux courbes indiquent les solubilités d'équilibre : l'eau se trouve sursaturée au-dessus d'une courbe, et le minéral associé précipite ; en dessous, il se dissout." },
        src: ["rimstidt", "fournier", "siliceChaud"] },

      { nom: "En ciment d'un grès",
        texte: `Enfoui, un sable de quartz se tasse et se réchauffe. Au-delà de 70 à 80 °C, la silice dissoute dans l'eau des pores se redépose <b>directement sur les grains</b>, en prolongeant leur réseau : chaque grain se couvre d'une auréole qui soude ses voisins et transforme le sable en grès. Au microscope, une mince ligne de poussière trahit encore les contours du grain initial.`,
        cond: { type: "enfouissement", tmax: 120, zmax: 4, seuils: ["quartz"],
          chemin: [
            { age: 120, z: 0, n: 1, t: "Le sable se met en place sur une plate-forme marine." },
            { age: 70, z: 2.4, n: 2, t: "Enfoui sous 2 à 3 km de sédiments, il parvient à 70 à 80 °C." },
            { age: 20, z: 3.2, n: 3, t: "La cimentation par le quartz s'opère dans cette plage de température : elle se prolonge pendant des millions d'années et colmate la porosité." },
          ] },
        src: ["walderhaug", "gradient"] },
    ],
  },

  // ─────────────────────────────── Calcite ───────────────────────────────
  calcite: {
    forme: `Les plans de calcium et les groupes CO₃ triangulaires s'empilent à plat, perpendiculairement à l'axe c. La liaison entre deux plans est nettement plus faible qu'au sein des triangles : la calcite se clive selon trois familles de plans obliques, et <b>tout éclat de calcite est un rhomboèdre</b>, quelle que soit la forme du cristal d'origine. Sur un scalénoèdre affichant ses clivages, les traces coupent la forme en biais, indépendamment de ses faces. Ce même empilement de triangles rend compte de la <b>double réfraction</b> du spath d'Islande : la lumière se propage à une vitesse différente selon qu'elle vibre dans le plan des triangles ou perpendiculairement.`,
    intro: `À la surface du globe, la calcite est à la fois l'un des minéraux les plus fabriqués et les plus dissous : les organismes la construisent, l'eau chargée de CO₂ la dissout, puis elle se reprécipite dès que le CO₂ s'échappe.`,
    scenarios: [
      { nom: "Dans une mer chaude",
        texte: `Dans les premiers mètres d'une mer chaude, coraux, algues calcaires, foraminifères et coquilles bâtissent leur squelette en calcite ou en aragonite. Leurs débris forment un fond boueux carbonaté à plus de 90 % : voilà le futur calcaire. La calcite reste toutefois stable seulement dans les eaux superficielles ; au-delà de 4 à 5 kilomètres, l'eau froide et sous forte pression la redissout, et plus aucun carbonate ne parvient au plancher océanique.`,
        cond: { type: "carbonates", depots: [[10, 200, "plate-forme carbonatée"]],
          chemin: [
            { x: 92, z: 15, n: 1, t: "Zone éclairée : les organismes captent le carbonate contenu dans l'eau de mer." },
            { x: 92, z: 90, n: 2, t: "Les débris sédimentent et s'accumulent : il en résulte une boue carbonatée à plus de 90 %." },
            { x: 55, z: 4300, n: 3, t: "En profondeur, l'eau agresse la calcite ; vers 4,5 à 5,5 km, à la profondeur de compensation, plus rien ne subsiste." },
          ] },
        src: ["ccd", "photique"] },

      { nom: "Dans une grotte",
        texte: `La pluie ne dissout presque pas le calcaire. C'est en traversant le sol qu'elle devient agressive :
          l'air d'un sol contient dix à cent fois plus de CO₂ que l'atmosphère, et ce CO₂ dissous acidifie l'eau.
          Elle creuse alors le karst. Arrivée dans la grotte, où l'air est redevenu normal, elle dégaze et rend
          le calcium qu'elle ne peut plus porter. Une stalactite est ce dégazage, goutte après goutte.`,
        cond: { type: "calcite",
          chemin: [
            { pco2: 0.032, Ca: 8, n: 1, t: "Dans le sol, l'eau de pluie se charge de CO₂ (≈ 0,03 atmosphère, contre 0,0004 dans l'air)." },
            { pco2: 0.032, Ca: 127, n: 2, t: "Dans ces conditions de CO₂, elle dissout ≈ 127 mg de calcium par litre et agrandit fissures et conduits karstiques." },
            { pco2: 0.0004, Ca: 127, n: 3, t: "Dans la grotte, l'air ne contient plus que le CO₂ atmosphérique : l'eau dégaze et se retrouve fortement sursaturée." },
            { pco2: 0.0004, Ca: 27, n: 4, t: "Elle relâche l'excédent sous forme de calcite : ≈ 100 mg par litre d'eau égouttée. Pour 100 litres annuels, une stalactite gagne quelques centièmes de millimètre." },
          ],
          note: "Calcium en équilibre avec la calcite, calcul effectué pour de l'eau pure à 10 °C (grotte) et à 25 °C." },
        src: ["plummer"] },
    ],
  },

  // ─────────────────────────────── Orthose ───────────────────────────────
  orthose: {
    forme: `La charpente des feldspaths se compose de chaînes de tétraèdres (Si,Al)O₄ parallèles à l'axe a, reliées latéralement ; le potassium occupe les grandes cavités qu'elles délimitent. Deux directions de liaisons faibles traversent cet édifice, {001} et {010}, qui se recoupent <b>exactement à angle droit</b> : ce sont les deux clivages, et cet angle de 90° a donné son nom au minéral (du grec <i>orthós</i>, « droit »). Le plagioclase, de structure identique mais tricline, les recoupe à 94° : c'est le moyen le plus simple de les distinguer au microscope. Le cristal est allongé selon a et souvent aplati sur {010}, face qui porte les macles.`,
    intro: `L'orthose se forme par refroidissement lent : le potassium, le silicium et l'aluminium disposent du temps nécessaire pour s'ordonner. Il se rencontre donc dans les granites, et non dans les laves, où la même composition donne la sanidine désordonnée.`,
    scenarios: [
      { nom: "Dans un granite",
        texte: `Le feldspath potassique précède le quartz : il cristallise <b>avant</b> entre ≈ 730 et 660 °C. Le magma reste alors largement fluide, laissant au cristal la place de développer ses faces. Ainsi naissent les gros cristaux roses, bien dessinés et parfois longs de plusieurs centimètres, qui parsèment les granites porphyroïdes, souvent avec la macle de Carlsbad.`,
        cond: { type: "pt", echelle: "croute", courbes: ["graniteEau"], fondu: ["graniteEau"],
          bande: [660, 730, 0.2],
          etiquettes: [["graniteEau", 470, 0.62, -72]],
          chemin: [
            { T: 830, P: 0.80, n: 1, t: "Dans la croûte profonde, une fusion partielle transporte vers le liquide potassium, aluminium et silice." },
            { T: 800, P: 0.22, n: 2, t: "Le magma remonte et se met en place vers 7 km." },
            { T: 700, P: 0.20, n: 3, t: "Entre 730 et 660 °C, le feldspath potassique cristallise au sein d'un magma encore liquide, où il croît librement." },
          ],
          note: "Plage de cristallisation d'un magma granitique hydraté, à ≈ 0,2 GPa. Chemin schématique." },
        src: ["tuttle", "profondeur"] },

      { nom: "À l'air libre : arène ou kaolinite",
        texte: `Une fois extrait du granite, ce même cristal subit l'attaque de l'eau chargée de CO₂ : l'hydrolyse évacue le potassium et une part de la silice, tandis que le reste s'organise en argile. Pourtant, la rapidité du processus dépend uniquement du climat. Sous nos latitudes, l'attaque demeure assez modérée pour que des grains encore frais survivent au transport et s'accumulent dans un sable ou une arkose. Dans un climat tropical humide, il ne reste en peu de temps que de la kaolinite.`,
        cond: { type: "climat",
          domaines: [[-5, 13, 0, 0.75], [20, 30, 0.9, 2.5]],
          etiquettes: [["le feldspath survit : arkose", 4, 0.38], ["hydrolyse complète : kaolinite", 25, 2.2]],
          villes: ["Brest", "Paris", "Marseille"],
          chemin: [
            { T: 11.5, ai: 0.9, n: 1, t: "Dans un granite breton, l'hydrolyse ronge les feldspaths sans les faire disparaître : la roche se défait en arène, où le feldspath demeure reconnaissable." },
            { T: 26, ai: 1.8, n: 2, t: "Charrié sous un climat tropical humide, le même grain subit une hydrolyse complète : seule la kaolinite subsiste, tandis que la silice rejoint la solution." },
          ],
          note: "Échelle climatique commune à l'atlas : température moyenne annuelle et rapport entre la pluie et l'évapotranspiration potentielle. Les points représentent les normales 1991 à 2020." },
        src: ["h5", "safran"] },
    ],
  },

  // ─────────────────────────────── Gypse ───────────────────────────────
  gypse_m: {
    forme: `Le gypse est constitué de feuillets alternés : deux plans de tétraèdres SO₄ encadrent les ions calcium, puis vient un <b>double plan de molécules d'eau</b>. D'un feuillet au suivant, seules des liaisons hydrogène assurent la cohésion, ce sont les plus faibles de l'édifice ; on peut les observer dans la structure 3D ci-dessous. Il en résulte un clivage {010} parfait, qui sépare des lamelles souples et transparentes (le « miroir d'âne »), et une dureté de 2 : l'ongle suffit à le rayer. Cette eau quitte le cristal vers 150 °C, ce qui permet de fabriquer le plâtre, et elle se fixe de nouveau lorsqu'on gâche celui-ci.`,
    intro: `Le gypse ne précipite que là où l'eau s'évapore plus vite qu'elle n'est apportée : lagunes isolées de la mer, sebkhas, croûtes de marnes. Minéral fragile, il se dissout dès les premières pluies ; il affleure donc rarement en France, et on l'exploite en carrières souterraines, à Montmartre par exemple.`,
    scenarios: [
      { nom: "Dans une lagune qui s'évapore",
        texte: `Une lagune peu profonde, qui ne communique plus avec la mer que par un seuil, se concentre à chaque saison sèche. Les sels ne précipitent pas simultanément : chacun ne cristallise qu'une fois sa propre limite de solubilité atteinte. Les carbonates apparaissent les premiers, puis le gypse lorsque l'eau atteint 3,8 fois la concentration de l'eau de mer, et le sel gemme à 10,6 fois. Un banc de gypse de plusieurs mètres ne résulte donc pas d'une évaporation unique, mais de l'empilement de milliers de cycles de remplissage.`,
        cond: { type: "evaporation", couche: "gypse",
          chemin: [
            { an: 0, n: 1, t: "Le bassin se ferme, et l'eau marine y gagne peu à peu en concentration." },
            { an: 3.7, n: 2, t: "À 3,8 fois la concentration initiale (≈ 74 % de l'eau évaporée), le sulfate de calcium atteint la saturation et le gypse se dépose." },
            { an: 4.55, n: 3, t: "Passé le seuil de 10,6 fois, l'halite cristallise à son tour et interrompt la formation du gypse. Pour fixer les idées, il faut environ 2 m d'eau évaporée chaque année sur une tranche de 10 m." },
          ] },
        src: ["mccaffrey", "warren", "sofianos"] },

      { nom: "Enfoui, il devient anhydrite",
        texte: `Le gypse ne supporte pas l'enfouissement : au-delà de 40 à 60 °C, soit seulement 1 à 1,5 kilomètre de profondeur, il perd ses deux molécules d'eau et se transforme en <b>anhydrite</b> (CaSO₄). Le processus s'inverse lors de la remontée : l'anhydrite reprend son eau et gonfle d'environ 60 % de son volume, ce qui disloque la roche encaissante et produit les cargneules. C'est également ce que redoutent les tunneliers des Alpes.`,
        cond: { type: "enfouissement", tmax: 230, zmax: 3, seuils: ["gypse"], labDroite: true,
          chemin: [
            { age: 225, z: 0, n: 1, t: "C'est dans des lagunes que se sont déposés les gypses du Keuper, il y a ≈ 225 millions d'années." },
            { age: 120, z: 2.0, n: 2, t: "Lorsqu'il est enfoui sous 1,5 à 2 km, le gypse dépasse 60 °C et perd son eau pour devenir de l'anhydrite." },
            { age: 0, z: 0.1, n: 3, t: "Une fois remonté près de la surface, il se réhydrate en gypse et son volume croît d'environ 60 % (volumes molaires : 46 cm³/mol pour l'anhydrite, 75 pour le gypse)." },
          ] },
        src: ["hardie", "gradient"] },
    ],
  },
};
