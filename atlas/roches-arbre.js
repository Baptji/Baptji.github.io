// =====================================================================
//  ARBRE DES ROCHES — calqué sur le Lexique Lithologie du BRGM
//  (registre data.geoscience.fr/ncl/litho, version du 04/02/2025)
//
//  famille (categorie des fiches) → branche (code M.1, S.3, R.2…) → groupe → roches
//  Une fiche = un seul emplacement dans l'arbre (contrôlé en bas de fichier).
//  `brgm` = nœud du lexique qui correspond à la branche ou au groupe.
// =====================================================================

const ROCHES_ARBRE = [
  {
    id: "magmatique", nom: "Roches magmatiques",
    desc: "Le BRGM répartit d'abord les roches magmatiques selon la profondeur de mise en place (plutoniques, volcaniques, hypovolcaniques), puis selon leur chimie : depuis les termes acides, riches en silice, jusqu'aux termes ultrabasiques. Toutes proviennent de la solidification d'un magma.",
    plus: `<p>C'est la profondeur qui fixe la texture. Lorsqu'un magma refroidit lentement, à plusieurs kilomètres sous la surface, les cristaux disposent d'assez de temps pour grossir : la roche est <b>grenue</b> (granite, gabbro). Une lave émise en surface, au contraire, se fige en quelques heures ou quelques jours, et il en résulte des cristaux microscopiques ou du verre (basalte, obsidienne). Les filons et les petits massifs, situés entre ces deux niveaux, présentent des textures <b>microgrenues</b> ou <b>porphyriques</b>.</p>
      <p>Ce sont les minéraux qui dépendent de la chimie. Les géologues découpent la teneur en silice (SiO₂) en quatre domaines : <b>acide</b> (au-delà de 63 % environ), <b>intermédiaire</b> (de 52 à 63 %), <b>basique</b> (de 45 à 52 %) et <b>ultrabasique</b> (sous 45 %). Un second critère oppose les roches <b>sursaturées</b> (quartz libre), <b>saturées</b> et <b>sous-saturées</b>, pauvres en silice, où feldspathoïdes (néphéline, leucite) occupent la place du quartz.</p>
      <p>Ces deux critères se combinent : granite et rhyolite partagent une même composition, le premier cristallisé en profondeur, la seconde en surface ; il en va de même pour gabbro et basalte. Les plutoniques sont nommées à l'aide du diagramme QAPF de Streckeisen (proportions de quartz, de feldspaths alcalins, de plagioclases et de feldspathoïdes), les volcaniques à l'aide du diagramme TAS (silice en fonction des alcalins). L'Union internationale des sciences géologiques (IUGS) a retenu ces deux diagrammes.</p>`,
    branches: [
      {
        code: "M.1", nom: "Roches plutoniques", brgm: "Roche plutonique",
        note: "Cristallisées lentement en profondeur, elles présentent des cristaux visibles à l'œil nu (texture grenue). Elles sont classées selon leur teneur en silice et selon leurs minéraux dominants.",
        plus: `<p>On observe les massifs plutoniques là où l'érosion a mis à nu plusieurs kilomètres de roches : Massif armoricain, Massif central, Vosges, Corse, cœur des Pyrénées et des Alpes. Le diagramme QAPF permet de les nommer : un granite comporte entre 20 et 60 % de quartz parmi ses minéraux clairs, une diorite en contient presque pas, et une syénite foïdique remplace le quartz par des feldspathoïdes. Les roches ultramafiques, composées à plus de 90 % de minéraux sombres, sortent de ce cadre et reçoivent un nom tiré de l'olivine, des pyroxènes ou de l'amphibole.</p>`,
        groupes: [
          { nom: "Granitoïdes", brgm: "Granitoïde", note: "Roches acides où quartz et feldspaths dominent. En passant du granite à la trondhjémite, le plagioclase gagne du terrain sur le feldspath potassique.",
            roches: ["granite", "granodiorite", "tonalite", "trondhjemite", "charnockite"] },
          { nom: "Roches intermédiaires", brgm: "Roche magmatique intermédiaire", note: "Quartz rare ou absent, les feldspaths étant dominants. La syénite foïdique renferme des feldspathoïdes en lieu et place du quartz.",
            roches: ["diorite", "monzodiorite", "monzonite", "syenite", "syenite_nephelinique"] },
          { nom: "Gabbroïdes", brgm: "Gabbroïde", note: "Le plagioclase calcique et le pyroxène caractérisent ces roches basiques. Les termes sous-saturés renferment des feldspathoïdes : l'essexite à côté de ses feldspaths, la foïdolite presque sans feldspath.",
            roches: ["gabbro", "essexite", "foidolite"] },
          { nom: "Roches ultramafiques", brgm: "Roche ultramafique", note: "Les minéraux ferromagnésiens (olivine, pyroxènes, amphibole) représentent plus de 90 % de la roche. La péridotite forme l'essentiel du manteau terrestre.",
            roches: ["peridotite", "pyroxenite", "hornblendite"] },
        ],
      },
      {
        code: "M.2", nom: "Roches volcaniques", brgm: "Roche volcanique",
        note: "Refroidies rapidement en surface, elles présentent des cristaux microscopiques ou du verre. Le lexique distingue les laves, épanchées en coulées, des roches pyroclastiques, projetées lors des éruptions.",
        plus: `<p>Deux grands ensembles volcaniques récents marquent la France métropolitaine : le Massif central (Cantal, Mont-Dore, chaîne des Puys, Velay, Aubrac, Devès) et, plus ancien, l'Esterel avec ses rhyolites permiennes. Plus une lave est riche en silice, plus elle est visqueuse : les basaltes s'étalent sur des kilomètres, tandis que trachytes et phonolites bâtissent des dômes et des aiguilles (puy de Dôme, Gerbier de Jonc). Les magmas acides, chargés de gaz, explosent en ponces et en cendres. Les pyroclastes se désignent d'après la taille de leurs fragments, non d'après leur chimie : cendres (moins de 2 mm), lapilli (2 à 64 mm), blocs et bombes (au-delà).</p>`,
        groupes: [
          { nom: "Laves acides", brgm: "Roche volcanique acide", note: "Laves riches en silice et visqueuses, souvent associées à des éruptions explosives. Le lexique classe le trachyte parmi les acides, alors que la classification de l'IUGS le rattache aux intermédiaires.",
            roches: ["rhyolite", "dacite", "trachyte", "obsidienne"] },
          { nom: "Laves intermédiaires", brgm: "Roche volcanique intermédiaire", note: "Environ 52 à 63 % de silice. La phonolite en constitue le terme sous-saturé, riche en néphéline.",
            roches: ["andesite", "trachyandesite", "latite", "phonolite"] },
          { nom: "Laves basiques", brgm: "Roche volcanique basique", note: "Environ 45 à 52 % de silice ; laves fluides. Le basalte est la roche volcanique la plus répandue à la surface de la Terre, puisqu'il constitue les planchers océaniques.",
            roches: ["basalte", "trachybasalte", "basanite"] },
          { nom: "Laves ultrabasiques et exotiques", brgm: "Roche volcanique ultrabasique et exotique", note: "Magnésiennes et pauvres en silice, ces laves atteignent des températures très élevées (komatiites archéennes) ou proviennent de grandes profondeurs (kimberlites, qui transportent des diamants).",
            roches: ["picrite", "komatiite", "kimberlite"] },
          { nom: "Roches pyroclastiques et téphras", brgm: "Roche pyroclastique consolidée", note: "Les éruptions éjectent des fragments : cendres cimentées (tuf), ponces soudées à chaud (ignimbrite), gros blocs (brèche), scories restées friables (pouzzolane, qui relève des téphras pour le lexique).",
            roches: ["tuf_volcanique", "ignimbrite", "breche_volcanique", "pouzzolane"] },
        ],
      },
      {
        code: "M.3", nom: "Roches hypovolcaniques", brgm: "Roche hypovolcanique",
        note: "Mises en place à faible profondeur, sous forme de filons ou de petits massifs. Leur texture se situe entre celle des plutoniques et celle des volcaniques, et elle est souvent porphyrique.",
        plus: `<p>Un magma injecté dans une fracture perd sa chaleur plus vite qu'au cœur d'un pluton, mais plus lentement qu'à l'air libre. Elle donne des roches au grain fin, qui renferment fréquemment de gros cristaux formés plus tôt en profondeur (texture porphyrique). Leurs noms reprennent ceux des plutoniques, précédés de la mention « micro » (microgranite, microdiorite). Filons tardifs des granites, les aplites ont un grain très fin et les pegmatites des cristaux géants. Dans le Massif armoricain, les dolérites s'organisent en essaims de filons ; les lamprophyres, riches en mica ou en amphibole, traversent les massifs granitiques du Limousin et des Vosges.</p>`,
        groupes: [
          { nom: "Roches filoniennes", brgm: "Roche hypovolcanique", note: "",
            roches: ["microgranite", "microdiorite", "dolerite", "aplite", "pegmatite", "lamprophyre", "porphyre"] },
        ],
      },
      {
        code: "M.4", nom: "Carbonatites", brgm: "Carbonatite",
        note: "Roches magmatiques dont plus de 50 % est constitué de carbonates. Peu répandues, elles se rattachent au magmatisme alcalin des rifts continentaux, et le lexique les isole dans une branche distincte.",
        plus: `<p>Pendant longtemps, un magma de carbonates a paru irréalisable. L'Ol Doinyo Lengai (Tanzanie), seul volcan actif à émettre des natrocarbonatites, en a apporté la preuve : sa lave sort vers 500 à 600 °C, nettement plus froide qu'un basalte (1 100 à 1 200 °C). Ces carbonatites accompagnent des roches alcalines sous-saturées (foïdolites, syénites foïdiques) et les fénites de leur auréole. Elles concentrent terres rares et niobium, ce qui en fait des gisements convoités. Aucun affleurement notable n'en existe en France métropolitaine.</p>`,
        groupes: [
          { nom: "Carbonatites", brgm: "Carbonatite", note: "", roches: ["carbonatite"] },
        ],
      },
    ],
  },
  {
    id: "sedimentaire", nom: "Roches sédimentaires",
    desc: "À la surface du globe, ces roches naissent de trois voies : dépôt de particules, précipitation chimique ou accumulation d'organismes. Le BRGM les range d'après leur mode de formation. L'atlas leur associe les formations superficielles, qui coiffent le substratum.",
    plus: `<p>Les roches sédimentaires occupent environ les deux tiers du territoire français, au sein des grands bassins (bassin parisien, bassin aquitain, fossé rhénan, couloir rhodanien) ainsi que dans les chaînes alpine et pyrénéenne. Leur genèse comporte deux étapes : le <b>dépôt</b> d'un sédiment meuble, puis la <b>diagenèse</b> (compaction, circulation de fluides, cimentation), qui le convertit en roche. Un sable devient ainsi grès, et une boue calcaire devient calcaire.</p>
      <p>C'est le mode de formation qui structure la classification. Les roches <b>silicoclastiques</b> regroupent des débris d'autres roches, triés selon la taille des grains. Les roches <b>carbonatées</b> naissent surtout de coquilles et de boues marines. Les roches <b>chimiques</b> cristallisent à partir d'une eau saturée (sel, gypse, silex). Les roches <b>organiques</b>, enfin, accumulent des matières végétales ou planctoniques (charbons, schistes bitumineux).</p>
      <p>Les <b>roches d'altération</b> se forment sur place, par décomposition d'autres roches sous un climat tropical humide (≥ 22 °C, pluie > ETP) : bauxites et cuirasses en sont les exemples. Les <b>formations superficielles</b> (alluvions, moraines, lœss, altérites) ne relèvent pas strictement des roches : ce sont des dépôts meubles récents, qui constituent le matériau parental de la plupart des sols.</p>`,
    branches: [
      {
        code: "S.1", nom: "Roches silicoclastiques", brgm: "Roche silicoclastique",
        note: "Ces roches proviennent de débris de roches et de minéraux silicatés (quartz, feldspaths, argiles), transportés avant d'être déposés. Leur classement repose sur le calibre des grains.",
        plus: `<p>L'échelle granulométrique habituelle (Wentworth) répartit les rudites (grains de plus de 2 mm : conglomérats et brèches), les arénites (de 2 mm à 63 µm : sables et grès) et les lutites (moins de 63 µm : silts et argiles). La forme des grains trahit le transport : arrondis dans un conglomérat, où l'eau d'une rivière ou de la mer les a roulés, ils restent anguleux dans une brèche, peu transportée. La composition, elle, révèle la source : une arkose, riche en feldspaths, dérive de l'érosion rapide d'un granite proche, alors qu'un grès quartzeux pur a subi un tri prolongé. La molasse et le flysch désignent davantage des successions que des roches : ils consignent l'érosion d'une chaîne, déposée en mer profonde (flysch) durant sa formation, puis dans les bassins de piémont (molasse).</p>`,
        groupes: [
          { nom: "Roches grossières", brgm: "Conglomérat", note: "Calibre supérieur à 2 mm. La tillite, issue d'un dépôt glaciaire cimenté, associe blocs et fines particules sans trace de classement.",
            roches: ["conglomerat", "breche_sedimentaire", "tillite"] },
          { nom: "Grès et sables", brgm: "Grès", note: "Calibre compris entre 63 µm et 2 mm : meubles, ces grains forment le sable ; cimentés, ils donnent le grès. Feldspaths abondants ou matrice fine distinguent respectivement arkose et grauwacke.",
            roches: ["gres", "arkose", "grauwacke", "sable"] },
          { nom: "Roches fines", brgm: "Roche silicoclastique", note: "Grains inférieurs à 63 µm : silts (siltite) et argiles (argilite).",
            roches: ["siltite", "argile"] },
          { nom: "Ensembles de bassin", brgm: null, note: "Successions de grès, de marnes et de conglomérats issues de l'érosion d'une chaîne de montagnes. Il ne s'agit pas de lithologies du lexique, qui décrit séparément chacune de ces roches.",
            roches: ["molasse", "flysch"] },
        ],
      },
      {
        code: "S.2", nom: "Roches carbonatées", brgm: "Roche carbonatée",
        note: "Carbonates (calcite, dolomite) en proportion élevée : ces roches tirent leur origine de la mer et du vivant, à partir de coquilles, de squelettes et de boues carbonatées.",
        plus: `<p>La plupart des calcaires naissent dans des mers chaudes et peu profondes, où des organismes fixent le carbonate de calcium dissous. La craie du Bassin parisien s'est ainsi bâtie avec des coccolithes, plaques calcaires d'algues planctoniques de quelques millièmes de millimètre. La dolomie provient le plus souvent d'un calcaire transformé en dolomite, riche en magnésium, pendant la diagenèse. La marne associe argile et carbonate, dans des proportions voisines (environ 35 à 65 % de carbonate). Dissous par une eau chargée de CO₂, le calcaire façonne les paysages karstiques : causses, gorges, grottes et gouffres.</p>`,
        groupes: [
          { nom: "Calcaires", brgm: "Calcaire", note: "Calcite en majorité. Craie, tuffeau et falun constituent autant de variétés, distinctes par leur origine comme par leur texture.",
            roches: ["calcaire", "craie", "tuffeau", "falun"] },
          { nom: "Roches dolomitiques", brgm: "Roche carbonatée", note: "Roches riches en dolomite. La cargneule, brèche dolomitique à structure cellulaire, date du Trias alpin.",
            roches: ["dolomie", "cargneule"] },
          { nom: "Roches mixtes", brgm: "Roche carbonatée", note: "Argile et carbonate en proportions voisines.",
            roches: ["marne"] },
        ],
      },
      {
        code: "S.3", nom: "Roches chimiques et biochimiques", brgm: "Roche chimique",
        note: "Elles se déposent par précipitation depuis une eau saturée, avec ou sans l'aide d'organismes. Elles portent sur la silice, les sels, les phosphates et le fer.",
        plus: `<p>Dès que sa concentration dépasse sa solubilité, une substance dissoute précipite. Lorsqu'une lagune ou un lac salé s'évapore, les sels se séparent selon l'ordre inverse de leur solubilité : d'abord les carbonates, puis le gypse (environ 2,4 g/L), ensuite la halite (environ 360 g/L) et, en dernier lieu, les sels potassiques. Les roches siliceuses relèvent fréquemment du biochimique : squelettes de radiolaires (radiolarite), de diatomées (diatomite) ou d'éponges (gaize, spongolite). Quant au silex, il résulte d'une précipitation de silice dans la craie, au cours de la diagenèse. Phosphorites et roches ferrifères (minette de Lorraine) ont été exploitées comme minerais. Le travertin, enfin, se dépose près des sources carbonatées, une fois l'eau dégazée de son CO₂.</p>`,
        groupes: [
          { nom: "Roches siliceuses", brgm: "Roche siliceuse", note: "Silice d'origine biologique ou chimique, amorphe ou à cristallisation très fine.",
            roches: ["silex", "radiolarite", "diatomite", "gaize"] },
          { nom: "Évaporites", brgm: "Évaporite", note: "Sels issus de l'évaporation d'eaux marines ou lacustres.",
            roches: ["gypse", "anhydrite", "sel", "sylvinite"] },
          { nom: "Roches phosphatées et ferrifères", brgm: "Roche phosphatée", note: "Roches enrichies en phosphate ou en fer, autrefois exploitées comme minerais.",
            roches: ["phosphorite", "roche_ferrifere"] },
          { nom: "Concrétions", brgm: "Concrétion", note: "Carbonates précipités aux sources et dans les cours d'eau.",
            roches: ["travertin"] },
        ],
      },
      {
        code: "S.4", nom: "Roches organiques", brgm: "Roche organique",
        note: "Roches issues de l'accumulation de matière organique végétale ou planctonique, préservée à l'abri de l'oxygène.",
        plus: `<p>Enfouie, la matière végétale perd peu à peu son eau et ses composés volatils, en s'enrichissant en carbone : tourbe (environ 55 % de carbone), lignite (65 à 75 %), houille (75 à 90 %), anthracite (plus de 90 %). Ce processus, la « houillification », répond surtout à la température atteinte et à la durée de l'enfouissement. Les bassins houillers français (Nord-Pas-de-Calais, Lorraine, Saint-Étienne) remontent au Carbonifère. Les schistes bitumineux, riches en matière organique planctonique, forment les roches mères du pétrole : vers 60 à 120 °C, ils libèrent des hydrocarbures qui migrent jusqu'aux roches réservoirs.</p>`,
        groupes: [
          { nom: "Charbons et tourbe", brgm: "Charbon", note: "Maturation croissante de la matière végétale, de la tourbe à l'anthracite.",
            roches: ["tourbe", "lignite", "houille", "anthracite"] },
          { nom: "Roches bitumineuses", brgm: "Roche organique", note: "Roches à matière organique planctonique, sources d'hydrocarbures.",
            roches: ["schiste_bitumineux"] },
        ],
      },
      {
        code: "S.5", nom: "Roches d'altération", brgm: "Roche d'altération",
        note: "Roches indurées formées sur place par l'altération d'autres roches, soit par lessivage des éléments solubles, soit par concentration d'éléments apportés par l'eau.",
        plus: `<p>En climat tropical humide (≥ 22 °C, pluie > ETP), silice et bases (calcium, magnésium, potassium, sodium) sont entraînées par l'eau, tandis que les éléments peu mobiles, aluminium (bauxite) et fer (cuirasse latéritique), restent sur place. Le nom « bauxite » rappelle les Baux-de-Provence, où ce minerai d'aluminium fut décrit en 1821. La meulière du Bassin parisien est un calcaire lacustre dont le carbonate a disparu au profit de la silice. En climat semi-aride, en revanche (pluie comprise entre 20 et 50 % de l'ETP, moins de 760 mm/an), la remontée capillaire de l'eau laisse du carbonate dans le sol : c'est la calcrète, qui peut former des dalles de plusieurs mètres.</p>`,
        groupes: [
          { nom: "Par lessivage", brgm: "Roche d'altération par lessivage", note: "Les éléments solubles sont évacués, tandis que les éléments peu mobiles demeurent sur place.",
            roches: ["bauxite", "laterite", "meuliere"] },
          { nom: "Par concentration", brgm: "Roche d'altération par concentration", note: "Des éléments apportés par l'eau précipitent au sein du sol.",
            roches: ["calcrete"] },
        ],
      },
      {
        code: "S.6", nom: "Formations superficielles", brgm: "Sédiment",
        note: "Formations meubles et récentes couvrant le substratum. Elles n'entrent pas vraiment dans la catégorie des roches, mais servent de matériau parental à la plupart des sols. Le lexique n'en retient qu'une fraction, sous la rubrique « Sédiment ».",
        plus: `<p>Les formations superficielles n'apparaissent sur les cartes géologiques au 1/50 000 que si elles ont une épaisseur notable, souvent supérieure à un mètre. Le code des notations est le suivant : F pour les alluvions fluviatiles (Fz pour les plus récentes, Fy, Fx… pour les terrasses plus anciennes), C pour les colluvions, G pour les dépôts glaciaires, E pour les éboulis, LP pour les limons des plateaux, R pour les formations résiduelles. Les formations <b>transportées</b> (par l'eau, la glace, le vent ou la gravité) s'opposent aux formations <b>résiduelles</b>, demeurées en place après la dissolution ou l'altération de leur substratum. En pédologie, ce matériau parental fixe la texture, la réserve en eau et la richesse chimique du sol qui en dérive.</p>`,
        groupes: [
          { nom: "Formations transportées", brgm: "Sédiment", note: "Matériaux mis en place par transport, qu'il s'agisse de l'eau, de la glace, du vent ou de la gravité.",
            roches: ["alluvions", "colluvions", "eboulis", "moraine", "dunes", "loess", "vase_tangue"] },
          { nom: "Formations résiduelles", brgm: "Roche d'altération par lessivage", note: "Formations demeurées sur place, issues de l'altération ou de la dissolution de leur substratum.",
            roches: ["alterite", "terra_rossa", "argile_silex"] },
        ],
      },
    ],
  },
  {
    id: "metamorphique", nom: "Roches métamorphiques",
    desc: "Ces roches se transforment à l'état solide sous l'effet de la température, de la pression ou de fluides, sans jamais fondre. Le BRGM les répartit selon le type de métamorphisme en jeu.",
    plus: `<p>Placée dans d'autres conditions que celles de sa genèse, une roche voit ses minéraux devenir instables et se recomposer en un assemblage nouveau. Une argile enfouie passe successivement à l'ardoise, au micaschiste puis au gneiss ; un calcaire devient marbre ; un basalte se mue en schiste vert, en amphibolite ou en éclogite selon la pression et la température. Certains minéraux jouent le rôle de thermomètres et de baromètres : les trois polymorphes Al₂SiO₅ (andalousite, disthène, sillimanite) délimitent à eux seuls le domaine de pression et de température.</p>
      <p>Le contexte détermine le type de métamorphisme. Le métamorphisme <b>régional</b> touche de vastes volumes pendant la formation des chaînes de montagnes (Massif central, Massif armoricain, Alpes). Le métamorphisme de <b>contact</b> cuit l'encaissant autour d'une intrusion. Le métamorphisme <b>dynamique</b> se localise le long des failles. La <b>métasomatose</b>, enfin, change la composition chimique de la roche par apport de fluides.</p>
      <p>Au-delà d'environ 650 à 700 °C en présence d'eau, la roche entame sa fusion : c'est la migmatite, située à la limite entre métamorphisme et magmatisme.</p>`,
    branches: [
      {
        code: "R.1", nom: "Métamorphisme régional", brgm: "Roche du métamorphisme régional",
        note: "Des volumes importants de roches, enfouis pendant la construction des chaînes, recristallisent ; leurs minéraux s'alignent et la roche prend une foliation.",
        plus: `<p>Le grade augmente avec la profondeur atteinte. Pour une roche issue d'une argile, la série commence par l'ardoise (très bas grade, clivage fin), se poursuit avec le micaschiste (micas visibles) puis le gneiss (alternance de lits clairs et sombres) et s'achève par la migmatite (fusion partielle). Pour classer les assemblages minéraux, les géologues définissent des « faciès » à partir des roches basiques : schistes verts, amphibolite et granulite correspondent aux températures élevées ; schistes bleus et éclogite aux fortes pressions des zones de subduction. Les schistes bleus et les éclogites des Alpes occidentales et de l'île de Groix attestent de roches enfouies à plusieurs dizaines de kilomètres, puis ramenées en surface.</p>`,
        groupes: [
          { nom: "D'origine sédimentaire", brgm: "Roche métasédimentaire", note: "Ardoise et micaschiste dérivent d'anciennes argiles, quartzite d'un grès, marbre d'un calcaire, calcschiste d'une alternance marno-calcaire.",
            roches: ["ardoise", "micaschiste", "quartzite", "marbre", "calcschiste"] },
          { nom: "D'origine basique", brgm: "Roche métamorphique", note: "Ces roches proviennent de basaltes ou de gabbros anciens. Leur assemblage minéral désigne le faciès : schistes verts, amphibolite, schistes bleus (haute pression et basse température) ou éclogite (très haute pression).",
            roches: ["schiste_vert", "amphibolite", "schiste_bleu", "eclogite"] },
          { nom: "Haut grade", brgm: "Roche métamorphique", note: "Conditions de température élevée : la migmatite signale le début de la fusion partielle.",
            roches: ["gneiss", "leptynite", "granulite_meta", "migmatite"] },
        ],
      },
      {
        code: "R.2", nom: "Métamorphisme de contact", brgm: "Roche du métamorphisme de contact",
        note: "Cuisson des roches voisines d'une intrusion magmatique, sur une distance de quelques mètres à quelques kilomètres, sans déformation sensible.",
        plus: `<p>La chaleur d'un pluton granitique gagne les roches qu'elle traverse et dessine une auréole de contact. Tout près de l'intrusion, les argiles se changent en cornéennes, dures et à cassure esquilleuse ; plus loin, des schistes tachetés voient se former de petits cristaux d'andalousite ou de cordiérite. Si l'encaissant est calcaire et que des fluides chargés de silice, de fer et de magnésium le traversent, le contact se couvre de skarns, riches en grenats et en pyroxènes calciques. Celui de Salau (Ariège) a été exploité pour la scheelite, minerai de tungstène.</p>`,
        groupes: [
          { nom: "Roches de contact", brgm: "Roche du métamorphisme de contact", note: "", roches: ["corneenne", "skarn"] },
        ],
      },
      {
        code: "R.3", nom: "Métamorphisme dynamique", brgm: "Roche dynamométamorphique",
        note: "Les failles localisent la déformation : broyage cassant (cataclasite), cisaillement ductile (mylonite) ou fusion par friction (pseudotachylite). Le lexique range également l'impactite, née du choc d'une météorite.",
        plus: `<p>Dans une faille, le comportement de la roche dépend de sa profondeur d'enfouissement. Proche de la surface, les fragments s'accumulent par fracturation : on parle alors de brèches de faille et de cataclasites. À des niveaux plus profonds, dès 10 à 15 km et au-delà de 300 °C environ, la déformation devient plastique : le quartz s'écoule, et la roche se transforme en mylonite, de grain très fin et fortement feuilletée. Lors d'un séisme, le frottement peut porter la roche à la fusion en quelques secondes ; le verre figé ainsi obtenu forme une pseudotachylite. L'impactite résulte d'un choc plus soudain et plus violent : à Rochechouart (Haute-Vienne), l'astroblème, vieux d'environ 200 millions d'années, en garde des brèches et des suévites.</p>`,
        groupes: [
          { nom: "Roches de faille et de choc", brgm: "Roche dynamométamorphique", note: "", roches: ["mylonite", "cataclasite", "pseudotachylite", "impactite"] },
        ],
      },
      {
        code: "R.4", nom: "Métasomatose", brgm: "Roche métasomatique",
        note: "Des fluides modifient la composition d'une roche en lui apportant ou en lui retirant des éléments. Exemples : serpentinisation, greisenisation, fénitisation et spilitisation.",
        plus: `<p>Le métamorphisme « isochimique » conserve la composition globale de la roche, alors que la métasomatose la modifie. Au contact de l'eau de mer, les péridotites du plancher océanique s'hydratent et deviennent des serpentinites ; des basaltes échangent leur calcium contre du sodium et se transforment en spilites. Les gabbros et dolérites emprisonnés dans ces serpentinites perdent de la silice et gagnent du calcium : ce sont les rodingites. Sous le toit des granites, des fluides riches en fluor et en bore convertissent la roche en greisen (quartz et micas blancs), souvent porteur d'étain et de tungstène. Autour des carbonatites, des fluides alcalins engendrent les fénites.</p>`,
        groupes: [
          { nom: "Roches métasomatiques", brgm: "Roche métasomatique", note: "", roches: ["serpentinite", "greisen", "fenite", "rodingite", "spilite"] },
        ],
      },
    ],
  },
  // 4ᵉ famille (B.5, 08/10/2026) : fiches dans meteorites.js. Le lexique range les roches météoritiques selon deux axes
  // qui se croisent : composition (pierreuse, de fer, mixte) et histoire du corps parent (non différencié ou différencié).
  {
    id: "meteoritique", nom: "Roches météoritiques",
    desc: "Ces roches arrivent de l'espace : fragments d'astéroïdes et, plus rarement, morceaux de Mars ou de la Lune. Le BRGM les classe d'après leur composition (pierreuses, de fer, mixtes) et d'après l'histoire de leur corps parent : soit intactes depuis la naissance du Système solaire (météorites primitives), soit issues d'un corps fondu, séparé en noyau, manteau et croûte (météorites différenciées).",
    plus: `<p>Un solide qui a traversé l'atmosphère sans se consumer entièrement constitue une météorite. Elle ralentit à quelques dizaines de kilomètres d'altitude et termine sa course en quelques minutes, à peu près à la vitesse d'un caillou tombé d'un avion (quelques centaines de km/h). Durant la traversée, sa surface a fondu : il en subsiste une <b>croûte de fusion</b> noire, de moins d'un millimètre, indice le plus sûr pour la reconnaître, tandis que le cœur n'a guère eu le temps de chauffer.</p>
      <p>Les <b>météorites primitives</b> (non différenciées) sont avant tout des <b>chondrites</b> : des agglomérats de petites billes fondues (les chondres), de grains métalliques et de poussière, réunis dans des astéroïdes trop petits ou formés trop tard pour fondre. Leurs constituants les plus anciens, des inclusions blanches riches en calcium et en aluminium, datent de 4 567 millions d'années, soit l'âge du Système solaire. Les <b>météorites différenciées</b> viennent de corps fondus sous la chaleur de la désintégration de l'aluminium 26 : le métal s'est rassemblé en noyau (les <b>météorites de fer</b>), tandis que les silicates formaient un manteau et une croûte basaltique (les <b>achondrites</b>). Les <b>sidérolithes</b>, où métal et silicates sont présents à parts égales, résultent de mélanges entre les deux.</p>
      <p>Parmi les chutes observées, environ 87 % sont des chondrites, 8 % des achondrites, 5 % des fers et moins de 1 % des sidérolithes. La Meteoritical Society recense plus de 70 000 météorites, dont un peu plus de 1 400 chutes vues ; la plupart ont été retrouvées dans les déserts chauds et en Antarctique, où elles se conservent et se repèrent aisément. La France en compte environ 70, presque toutes tombées aux XVIIIᵉ et XIXᵉ siècles.</p>
      <p>Il ne faut pas confondre avec l'<b>impactite</b> (fiche du métamorphisme dynamique) : celle-ci est une roche terrestre transformée par le choc d'une météorite, comme les brèches de Rochechouart, où l'astéroïde lui-même s'est vaporisé.</p>`,
    branches: [
      {
        code: "E.1", nom: "Météorites primitives", brgm: "Météorite non-différenciée (primitive)",
        note: "Leur astéroïde n'a jamais connu la fusion, si bien qu'elles conservent chondres et composition du disque protoplanétaire. Les achondrites primitives ont entamé la fusion sans la mener à son terme.",
        plus: `<p>Le classement des chondrites repose d'abord sur le <b>groupe chimique</b> (H, L, LL pour les ordinaires ; CI, CM, CO, CV… pour les carbonées ; EH, EL pour les chondrites à enstatite). Chaque groupe provient d'un astéroïde distinct. Vient ensuite le <b>type pétrologique</b>, qui va de 1 à 6 (Van Schmus et Wood 1967). Le type 3 demeure presque intact. Les types 1 et 2 ont été altérés par une eau liquide circulant dans l'astéroïde, vers 20 à 150 °C. Les types 4 à 6 ont subi un chauffage sans fusion, à environ 600 à 950 °C, qui a effacé leurs chondres. Cette chaleur venait surtout de l'aluminium 26, radioactif, dont la moitié disparaît en 717 000 ans : un astéroïde formé tôt se réchauffait fortement, un astéroïde formé tard à peine.</p>
          <p>Au sein d'un même astéroïde, le cœur chauffait davantage et se refroidissait en dernier. Les chondrites H les plus recuites (type 6) ont donc refroidi des dizaines de millions d'années après les moins recuites (type 4), à la manière des couches d'un oignon. Les chondrites françaises de Sainte-Marguerite (H4, Nord, 1962) et de Kernouvé (H6, Morbihan, 1869) ont permis de l'établir.</p>`,
        groupes: [
          { nom: "Chondrites", brgm: "Chondrite", note: "Chondres, grains métalliques et poussière fine, agglomérés ensemble : plus de huit chutes sur dix appartiennent à ce type.",
            roches: ["chondrite_ordinaire", "chondrite_carbonee", "chondrite_enstatite"] },
          { nom: "Achondrites primitives", brgm: "Achondrite primitive", note: "Chondrite portée jusqu'au seuil de fusion : sa composition reste celle d'une chondrite, mais ses grains recristallisent et ses chondres disparaissent.",
            roches: ["achondrite_primitive"] },
        ],
      },
      {
        code: "E.2", nom: "Achondrites", brgm: "Achondrite",
        note: "Roches pierreuses dépourvues de chondres, issues d'un magma cristallisé dans un corps ayant fondu, comme Vesta, Mars ou la Lune.",
        plus: `<p>Une achondrite rappelle une roche magmatique terrestre : basalte, gabbro, roche à olivine ou à pyroxène. Son origine se révèle par la signature isotopique de l'oxygène (rapports des isotopes 16, 17 et 18), propre à chaque corps du Système solaire, et, pour Mars, par les gaz de l'atmosphère martienne piégés dans le verre de choc.</p>
          <p>Les achondrites issues d'astéroïdes (eucrites, diogénites, howardites, aubrites…) sont presque aussi anciennes que le Système solaire. Les martiennes, en revanche, sont bien plus récentes, de 150 millions à 4,4 milliards d'années, car Mars, plus massive, a conservé longtemps un volcanisme actif. Un fragment doit être éjecté de Mars à plus de 5 km/s par l'impact d'un astéroïde ; pour quitter la Lune, il suffit de 2,4 km/s.</p>`,
        groupes: [
          { nom: "Achondrites", brgm: "Achondrite", note: "Le corps parent détermine la classe : astéroïde, Mars ou Lune.",
            roches: ["achondrite_asteroidale", "achondrite_martienne", "achondrite_lunaire"] },
        ],
      },
      {
        code: "E.3", nom: "Météorites de fer", brgm: "Météorite de fer",
        note: "Quasiment purs en fer et en nickel, ces métaux proviennent du noyau d'astéroïdes fondus, ensuite fragmentés par des chocs.",
        plus: `<p>Plus de 50 astéroïdes distincts ont livré des météorites de fer : au début du Système solaire, les corps fondus étaient donc bien plus nombreux qu'aujourd'hui. On les répartit selon leur structure (octaédrites, hexaédrites, ataxites, d'après la teneur en nickel) et selon leur chimie (groupes IAB, IIAB, IIIAB, IVA…, établis d'après le gallium, le germanium et l'iridium).</p>
          <p>Les figures de Widmanstätten apparaissent entre 700 et 450 °C, lorsque la taénite riche en nickel expulse des lamelles de kamacite ; il faut pour cela un refroidissement de quelques dizaines à quelques milliers de degrés par million d'années. La largeur des lamelles mesure cette vitesse, donc la taille du noyau d'origine.</p>`,
        groupes: [
          { nom: "Météorites de fer", brgm: "Météorite de fer", note: "", roches: ["meteorite_fer"] },
        ],
      },
      {
        code: "E.4", nom: "Sidérolithes", brgm: "Sidérolithe",
        note: "Ces météorites mêlent métal et silicates, presque à parts égales.",
        plus: `<p>Ces deux familles diffèrent nettement. Les <b>pallasites</b> réunissent des cristaux d'olivine issus du manteau, enchâssés dans du métal de noyau ; les <b>mésosidérites</b> sont des brèches de croûte basaltique mêlée de métal. Dans les deux cas, une collision a rassemblé ce qu'un astéroïde avait séparé en fondant. Elles ne forment qu'environ 1 % des chutes.</p>`,
        groupes: [
          { nom: "Sidérolithes", brgm: "Sidérolithe", note: "", roches: ["pallasite", "mesosiderite"] },
        ],
      },
    ],
  },
];

// Correspondance de chaque fiche avec le lexique du BRGM :
// [terme, nœud parent]              → terme exact du lexique
// [terme, nœud parent, "proche"]    → pas de terme propre ; rattachement au concept le plus proche
// null                              → hors lexique
const ROCHES_BRGM = {
  // — M.1 plutoniques —
  granite: ["Granite", "Granitoïde"], granodiorite: ["Granodiorite", "Granitoïde"], tonalite: ["Tonalite", "Granitoïde"],
  trondhjemite: ["Trondhjémite", "Granitoïde"], charnockite: ["Charnockite", "Granitoïde"],
  diorite: ["Diorite", "Dioritoïde"], monzodiorite: ["Monzodiorite", "Dioritoïde"], monzonite: ["Monzonite", "Roche plutonique"],
  syenite: ["Syénite", "Roche plutonique"], syenite_nephelinique: ["Syénite foïdique", "Syénitoïde foïdique"],
  gabbro: ["Gabbro", "Gabbroïde"], essexite: ["Essexite", "Gabbroïde foïdique"], foidolite: ["Foïdolite", "Roche plutonique"],
  peridotite: ["Péridotite", "Roche magmatique ultrabasique"], pyroxenite: ["Pyroxénolite", "Roche ultramafique"],
  hornblendite: ["Hornblendite", "Amphibololite"],
  // — M.2 volcaniques —
  rhyolite: ["Rhyolite", "Roche volcanique lavique"], dacite: ["Dacite", "Roche volcanique lavique"],
  trachyte: ["Trachyte", "Roche volcanique lavique"], obsidienne: ["Roche vitreuse", "Roche volcanique", "proche"],
  andesite: ["Andésite", "Roche volcanique lavique"], trachyandesite: ["Trachyandésite", "Roche volcanique lavique"],
  latite: ["Latite", "Trachyandésite"], phonolite: ["Phonolite", "Roche volcanique lavique"],
  basalte: ["Basalte", "Roche volcanique lavique"], trachybasalte: ["Trachybasalte", "Roche volcanique lavique"],
  basanite: ["Basanite", "Roche volcanique lavique"], picrite: ["Picrite", "Roche volcanique lavique"],
  komatiite: ["Komatiite", "Roche volcanique lavique"], kimberlite: ["Kimberlite", "Roche volcanique lavique"],
  tuf_volcanique: ["Tuf (volcanique)", "Roche pyroclastique consolidée"], ignimbrite: ["Ignimbrite", "Roche pyroclastique consolidée"],
  breche_volcanique: ["Brèche (volcanique)", "Roche pyroclastique consolidée"], pouzzolane: ["Pouzzolane", "Téphra"],
  // — M.3 / M.4 —
  microgranite: ["Microgranite", "Roche hypovolcanique"], microdiorite: ["Microdiorite", "Roche hypovolcanique"],
  dolerite: ["Dolérite", "Roche hypovolcanique"], aplite: ["Aplite", "Roche hypovolcanique"],
  pegmatite: ["Pegmatite", "Roche hypovolcanique"], lamprophyre: ["Lamprophyre", "Roche hypovolcanique"],
  porphyre: null,
  carbonatite: ["Carbonatite", "Roche magmatique"],
  // — S.1 silicoclastiques —
  conglomerat: ["Conglomérat", "Roche silicoclastique"], breche_sedimentaire: ["Brèche", "Conglomérat"],
  tillite: ["Tillite", "Conglomérat"], gres: ["Grès", "Roche silicoclastique"], arkose: ["Arkose", "Arénite"],
  grauwacke: ["Grauwacke", "Wacke"], sable: ["Sable", "Roche silicoclastique"], siltite: ["Siltite", "Roche silicoclastique"],
  argile: ["Argilite", "Roche silicoclastique"],
  molasse: ["Roche silicoclastique", "Roche détritique", "proche"], flysch: ["Roche silicoclastique", "Roche détritique", "proche"],
  // — S.2 carbonatées —
  calcaire: ["Calcaire", "Roche carbonatée"], craie: ["Craie", "Calcaire"], tuffeau: ["Tuffeau", "Calcaire"],
  falun: ["Falun", "Roche carbonatée"], dolomie: ["Dolomie", "Roche carbonatée"], cargneule: ["Cargneule", "Roche carbonatée"],
  marne: ["Marne", "Roche carbonatée"],
  // — S.3 chimiques —
  silex: ["Silex", "Roche siliceuse"], radiolarite: ["Radiolarite", "Roche siliceuse"], diatomite: ["Diatomite", "Roche siliceuse"],
  gaize: ["Gaize", "Roche siliceuse"], gypse: ["Gypse", "Évaporite"], anhydrite: ["Anhydrite", "Évaporite"],
  sel: ["Halite", "Évaporite"], sylvinite: ["Sylvinite", "Évaporite"], phosphorite: ["Phosphorite", "Roche biochimique"],
  roche_ferrifere: ["Roche ferrifère", "Roche sédimentaire"], travertin: ["Travertin", "Concrétion"],
  // — S.4 organiques —
  tourbe: ["Tourbe", "Roche organique"], lignite: ["Lignite", "Roche organique"], houille: ["Houille", "Roche organique"],
  anthracite: ["Anthracite", "Roche organique"], schiste_bitumineux: ["Schistes bitumineux", "Roche organique"],
  // — S.5 altération —
  bauxite: ["Bauxite", "Roche d'altération par lessivage"], laterite: ["Cuirasse", "Roche d'altération par lessivage"],
  meuliere: ["Meulière", "Roche d'altération par lessivage"], calcrete: ["Calcrète", "Roche d'altération par concentration"],
  // — S.6 formations superficielles —
  alluvions: ["Sédiment", "Roche sédimentaire", "proche"], colluvions: ["Sédiment", "Roche sédimentaire", "proche"],
  eboulis: ["Cailloutis", "Sédiment", "proche"], moraine: ["Till", "Sédiment"], dunes: ["Sable", "Sédiment", "proche"],
  loess: ["Lœss", "Sédiment"], vase_tangue: ["Vase", "Sédiment"],
  alterite: ["Arène", "Roche d'altération par lessivage"], terra_rossa: ["Terra rossa", "Roche d'altération par lessivage"],
  argile_silex: ["Roche d'altération par lessivage", "Roche d'altération", "proche"],
  // — R.1 régional —
  ardoise: ["Ardoise", "Roche métasédimentaire"], micaschiste: ["Micaschiste", "Roche métasédimentaire"],
  quartzite: ["Quartzite", "Roche métasédimentaire"], marbre: ["Marbre", "Roche métasédimentaire"],
  calcschiste: ["Calcschiste", "Roche métasédimentaire"],
  schiste_vert: ["Schiste vert", "Roche métamorphique"], amphibolite: ["Amphibolite", "Roche métamorphique"],
  schiste_bleu: ["Schiste bleu", "Roche métamorphique"], eclogite: ["Éclogite", "Roche métamorphique"],
  gneiss: ["Gneiss", "Roche métamorphique"], leptynite: ["Leptynite", "Roche métamorphique"],
  granulite_meta: ["Granulite", "Roche métamorphique"], migmatite: ["Migmatite", "Roche métamorphique"],
  // — R.2 à R.4 —
  corneenne: ["Cornéenne", "Roche du métamorphisme de contact"], skarn: ["Skarn", "Roche du métamorphisme de contact"],
  mylonite: ["Mylonite", "Roche dynamométamorphique"], cataclasite: ["Cataclasite", "Roche dynamométamorphique"],
  pseudotachylite: ["Pseudotachylite", "Roche dynamométamorphique"], impactite: ["Impactite", "Roche dynamométamorphique"],
  serpentinite: ["Serpentinite", "Roche métasomatique"], greisen: ["Greisen", "Roche métasomatique"],
  fenite: ["Fénite", "Roche métasomatique"], rodingite: ["Rodingite", "Roche métasomatique"],
  spilite: ["Spilite", "Roche métasomatique"],
  // — E.1 à E.4 météorites (meteorites.js) —
  chondrite_ordinaire: ["Chondrite ordinaire", "Chondrite"], chondrite_carbonee: ["Chondrite carbonée", "Chondrite"],
  chondrite_enstatite: ["Chondrite à enstatite", "Chondrite"], achondrite_primitive: ["Achondrite primitive", "Achondrite"],
  achondrite_asteroidale: ["Achondrite astéroïdale", "Météorite différenciée"],
  achondrite_martienne: ["Météorite (achondrite) martienne", "Météorite différenciée"],
  achondrite_lunaire: ["Météorite (achondrite) lunaire", "Météorite différenciée"],
  meteorite_fer: ["Météorite de fer", "Roche météoritique"],
  pallasite: ["Pallasite", "Sidérolithe"], mesosiderite: ["Mésosidérite", "Sidérolithe"],
};
const ROCHES_HORS_LEXIQUE = {
  porphyre: "Le mot « porphyre » qualifie une texture (gros cristaux dans une pâte fine) et non une lithologie ; le lexique n'en propose donc aucun terme équivalent.",
};

// Emplacement d'une fiche dans l'arbre : { fam, branche, groupe } (null si absente)
function placeRoche(id) {
  for (const fam of ROCHES_ARBRE)
    for (const br of fam.branches)
      for (const g of br.groupes)
        if (g.roches.includes(id)) return { fam, branche: br, groupe: g };
  return null;
}
function brancheParCode(code) {
  for (const fam of ROCHES_ARBRE) {
    const br = fam.branches.find((b) => b.code === code);
    if (br) return { fam, branche: br };
  }
  return null;
}

// Contrôle : chaque fiche une seule fois, famille = categorie de la fiche, correspondance BRGM présente
(function () {
  const vus = {}, pb = [];
  ROCHES_ARBRE.forEach((fam) => fam.branches.forEach((br) => br.groupes.forEach((g) => g.roches.forEach((id) => {
    const r = ROCHES.find((x) => x.id === id);
    if (!r) pb.push("fiche absente : " + id);
    else if (r.categorie !== fam.id) pb.push("catégorie différente : " + id);
    if (vus[id]) pb.push("doublon : " + id);
    vus[id] = true;
    if (!(id in ROCHES_BRGM)) pb.push("sans correspondance BRGM : " + id);
  }))));
  ROCHES.forEach((r) => { if (!vus[r.id]) pb.push("hors de l'arbre : " + r.id); });
  if (pb.length) console.warn("Arbre des roches :", pb);
})();
