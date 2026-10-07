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
    desc: "Roches issues du refroidissement d'un magma. Le lexique du BRGM les divise d'abord selon la profondeur de mise en place (plutoniques, volcaniques, hypovolcaniques), puis selon leur chimie, des roches acides riches en silice aux roches ultrabasiques.",
    plus: `<p>La profondeur commande la texture. Un magma qui refroidit lentement, à plusieurs kilomètres sous la surface, laisse
      aux cristaux le temps de grandir : la roche est <b>grenue</b> (granite, gabbro). Épanché en surface, il se fige en quelques
      heures ou jours : cristaux microscopiques ou verre (basalte, obsidienne). Entre les deux, les filons et petits massifs
      donnent des textures <b>microgrenues</b> ou <b>porphyriques</b>.</p>
      <p>La chimie commande les minéraux. Les géologues classent la teneur en silice (SiO₂) en quatre domaines : <b>acide</b>
      (plus de 63 % environ), <b>intermédiaire</b> (52–63 %), <b>basique</b> (45–52 %), <b>ultrabasique</b> (moins de 45 %).
      Un second axe distingue les roches <b>sursaturées</b> (quartz libre), <b>saturées</b> et <b>sous-saturées</b>, où la silice
      manque et où les feldspathoïdes (néphéline, leucite) remplacent le quartz.</p>
      <p>Les deux axes se croisent : le granite et la rhyolite ont la même composition, l'un cristallisé en profondeur, l'autre en
      surface ; de même pour le gabbro et le basalte. Les plutoniques sont nommées d'après le diagramme QAPF de Streckeisen
      (proportions de quartz, feldspaths alcalins, plagioclases, feldspathoïdes), les volcaniques d'après le diagramme TAS
      (silice contre alcalins), tous deux adoptés par l'Union internationale des sciences géologiques (IUGS).</p>`,
    branches: [
      {
        code: "M.1", nom: "Roches plutoniques", brgm: "Roche plutonique",
        note: "Cristallisées lentement en profondeur : les cristaux sont visibles à l'œil nu (texture grenue). Elles sont rangées par teneur en silice et par minéraux dominants.",
        plus: `<p>Les massifs plutoniques affleurent là où l'érosion a enlevé plusieurs kilomètres de roches : Massif armoricain,
          Massif central, Vosges, Corse, cœur des Pyrénées et des Alpes. Leur nom se lit dans le diagramme QAPF : un granite
          contient 20 à 60 % de quartz parmi les minéraux clairs, une diorite presque pas, une syénite foïdique des
          feldspathoïdes à la place du quartz. Les roches ultramafiques, faites à plus de 90 % de minéraux sombres, échappent à
          ce diagramme et sont nommées d'après l'olivine, les pyroxènes et l'amphibole.</p>`,
        groupes: [
          { nom: "Granitoïdes", brgm: "Granitoïde", note: "Roches acides riches en quartz et en feldspaths. Du granite à la trondhjémite, la part de plagioclase augmente aux dépens du feldspath potassique.",
            roches: ["granite", "granodiorite", "tonalite", "trondhjemite", "charnockite"] },
          { nom: "Roches intermédiaires", brgm: "Roche magmatique intermédiaire", note: "Peu ou pas de quartz ; les feldspaths dominent. La syénite foïdique contient des feldspathoïdes à la place du quartz.",
            roches: ["diorite", "monzodiorite", "monzonite", "syenite", "syenite_nephelinique"] },
          { nom: "Gabbroïdes", brgm: "Gabbroïde", note: "Roches basiques à plagioclase calcique et pyroxène. L'essexite et la foïdolite sont les termes sous-saturés, à feldspathoïdes.",
            roches: ["gabbro", "essexite", "foidolite"] },
          { nom: "Roches ultramafiques", brgm: "Roche ultramafique", note: "Plus de 90 % de minéraux ferromagnésiens (olivine, pyroxènes, amphibole). La péridotite constitue l'essentiel du manteau terrestre.",
            roches: ["peridotite", "pyroxenite", "hornblendite"] },
        ],
      },
      {
        code: "M.2", nom: "Roches volcaniques", brgm: "Roche volcanique",
        note: "Refroidies rapidement en surface : cristaux microscopiques ou verre. Le lexique distingue les laves, épanchées en coulées, et les roches pyroclastiques, projetées par les éruptions.",
        plus: `<p>La France métropolitaine compte deux grands ensembles volcaniques récents : le Massif central (Cantal, Mont-Dore,
          chaîne des Puys, Velay, Aubrac, Devès) et, plus ancien, l'Esterel et ses rhyolites permiennes. La viscosité d'une lave
          croît avec sa teneur en silice : les basaltes coulent sur des kilomètres, les trachytes et phonolites forment des dômes
          et des aiguilles (puy de Dôme, Gerbier de Jonc), les magmas acides chargés de gaz explosent en ponces et en cendres.
          Les roches pyroclastiques ne sont pas nommées d'après leur chimie mais d'après la taille des fragments :
          cendres (moins de 2 mm), lapilli (2 à 64 mm), blocs et bombes (au-delà).</p>`,
        groupes: [
          { nom: "Laves acides", brgm: "Roche volcanique acide", note: "Laves riches en silice, visqueuses, souvent liées à des éruptions explosives. Le lexique range le trachyte avec les acides ; la classification de l'IUGS le place parmi les intermédiaires.",
            roches: ["rhyolite", "dacite", "trachyte", "obsidienne"] },
          { nom: "Laves intermédiaires", brgm: "Roche volcanique intermédiaire", note: "52 à 63 % de silice environ. La phonolite en est le terme sous-saturé, à néphéline.",
            roches: ["andesite", "trachyandesite", "latite", "phonolite"] },
          { nom: "Laves basiques", brgm: "Roche volcanique basique", note: "45 à 52 % de silice environ ; laves fluides. Le basalte est la roche volcanique la plus répandue sur Terre : il forme les planchers océaniques.",
            roches: ["basalte", "trachybasalte", "basanite"] },
          { nom: "Laves ultrabasiques et exotiques", brgm: "Roche volcanique ultrabasique et exotique", note: "Laves pauvres en silice et riches en magnésium : très chaudes (komatiites archéennes) ou venues de grande profondeur (kimberlites, porteuses de diamants).",
            roches: ["picrite", "komatiite", "kimberlite"] },
          { nom: "Roches pyroclastiques", brgm: "Roche pyroclastique consolidée", note: "Fragments projetés par les éruptions : cendres consolidées (tuf), ponces soudées à chaud (ignimbrite), blocs (brèche), scories restées meubles (pouzzolane).",
            roches: ["tuf_volcanique", "ignimbrite", "breche_volcanique", "pouzzolane"] },
        ],
      },
      {
        code: "M.3", nom: "Roches hypovolcaniques", brgm: "Roche hypovolcanique",
        note: "Mises en place à faible profondeur, en filons ou en petits massifs. Leur texture est intermédiaire entre celle des plutoniques et celle des volcaniques, souvent porphyrique.",
        plus: `<p>Un magma qui s'injecte dans une fracture refroidit plus vite qu'au cœur d'un pluton, mais plus lentement qu'en
          surface. Il en résulte des roches à grain fin, souvent parsemées de gros cristaux formés plus tôt en profondeur
          (texture porphyrique). Les noms reprennent ceux des plutoniques avec le préfixe « micro- » (microgranite,
          microdiorite). Aplites et pegmatites sont des filons tardifs des granites, l'une à grain très fin, l'autre à cristaux
          géants. Les dolérites forment des essaims de filons dans le Massif armoricain ; les lamprophyres, riches en mica ou
          en amphibole, recoupent les massifs granitiques du Limousin et des Vosges.</p>`,
        groupes: [
          { nom: "Roches filoniennes", brgm: "Roche hypovolcanique", note: "",
            roches: ["microgranite", "microdiorite", "dolerite", "aplite", "pegmatite", "lamprophyre", "porphyre"] },
        ],
      },
      {
        code: "M.4", nom: "Carbonatites", brgm: "Carbonatite",
        note: "Roches magmatiques composées à plus de 50 % de carbonates. Rares, elles sont liées au magmatisme alcalin des rifts continentaux ; le lexique en fait une branche distincte.",
        plus: `<p>Longtemps, l'idée d'un magma fait de carbonates a paru impossible. L'éruption de l'Ol Doinyo Lengai (Tanzanie),
          seul volcan actif à émettre des natrocarbonatites, l'a confirmée : sa lave sort vers 500–600 °C, bien moins chaude
          qu'un basalte (1 100–1 200 °C). Les carbonatites sont associées aux roches alcalines sous-saturées (foïdolites,
          syénites foïdiques) et aux fénites de leur auréole. Elles concentrent les terres rares et le niobium, ce qui en fait
          des gisements recherchés. La France métropolitaine n'en possède pas d'affleurement notable.</p>`,
        groupes: [
          { nom: "Carbonatites", brgm: "Carbonatite", note: "", roches: ["carbonatite"] },
        ],
      },
    ],
  },
  {
    id: "sedimentaire", nom: "Roches sédimentaires",
    desc: "Roches formées à la surface de la Terre par dépôt de particules, précipitation chimique ou accumulation d'organismes. Le lexique du BRGM les classe par mode de formation ; l'atlas y ajoute les formations superficielles, qui recouvrent le substratum.",
    plus: `<p>Les roches sédimentaires couvrent environ les deux tiers de la surface de la France, dans les grands bassins
      (Bassin parisien, Bassin aquitain, fossé rhénan, couloir rhodanien) et dans les chaînes alpine et pyrénéenne. Elles se
      forment en deux temps : le <b>dépôt</b> d'un sédiment meuble, puis la <b>diagenèse</b> — compaction, circulation de
      fluides, cimentation — qui le transforme en roche. Un sable devient grès, une boue calcaire devient calcaire.</p>
      <p>Le mode de formation fonde la classification. Les roches <b>silicoclastiques</b> sont faites de débris d'autres roches,
      triés par taille de grain. Les roches <b>carbonatées</b> proviennent surtout de coquilles et de boues marines. Les
      roches <b>chimiques</b> précipitent d'une eau saturée (sel, gypse, silex). Les roches <b>organiques</b> accumulent de la
      matière végétale ou planctonique (charbons, schistes bitumineux).</p>
      <p>Les <b>roches d'altération</b> naissent en place de la décomposition d'autres roches sous climat tropical humide (≥ 22 °C, pluie > ETP)
      (bauxite, cuirasses). Les <b>formations superficielles</b> — alluvions, moraines, lœss, altérites — ne sont pas des
      roches au sens strict : ce sont des dépôts meubles récents, matériaux parentaux de la plupart des sols.</p>`,
    branches: [
      {
        code: "S.1", nom: "Roches silicoclastiques", brgm: "Roche silicoclastique",
        note: "Débris de roches et de minéraux silicatés (quartz, feldspaths, argiles) transportés puis déposés. Elles sont classées par taille de grain.",
        plus: `<p>L'échelle granulométrique usuelle (Wentworth) sépare les rudites (grains de plus de 2 mm : conglomérats,
          brèches), les arénites (de 2 mm à 63 µm : sables et grès) et les lutites (moins de 63 µm : silts et argiles). La
          forme des grains renseigne sur le transport : arrondis dans un conglomérat (galets roulés par une rivière ou la mer),
          anguleux dans une brèche (peu de transport). La composition renseigne sur la source : une arkose, riche en
          feldspaths, provient de l'érosion rapide d'un granite voisin ; un grès quartzeux pur a subi un long tri. La molasse
          et le flysch ne sont pas des roches mais des successions : ils enregistrent l'érosion d'une chaîne de montagnes,
          en mer profonde pendant sa formation (flysch), puis dans les bassins de piémont (molasse).</p>`,
        groupes: [
          { nom: "Roches grossières", brgm: "Conglomérat", note: "Grains de plus de 2 mm. La tillite, dépôt glaciaire consolidé, mêle blocs et particules fines sans tri.",
            roches: ["conglomerat", "breche_sedimentaire", "tillite"] },
          { nom: "Grès et sables", brgm: "Grès", note: "Grains de 63 µm à 2 mm, meubles (sable) ou cimentés (grès). Arkose et grauwacke se distinguent par leur richesse en feldspaths ou en matrice fine.",
            roches: ["gres", "arkose", "grauwacke", "sable"] },
          { nom: "Roches fines", brgm: "Roche silicoclastique", note: "Grains de moins de 63 µm : silts (siltite) et argiles (argilite).",
            roches: ["siltite", "argile"] },
          { nom: "Ensembles de bassin", brgm: null, note: "Successions de grès, marnes et conglomérats liées à l'érosion d'une chaîne de montagnes. Ce ne sont pas des lithologies du lexique, qui en décrit séparément chaque roche.",
            roches: ["molasse", "flysch"] },
        ],
      },
      {
        code: "S.2", nom: "Roches carbonatées", brgm: "Roche carbonatée",
        note: "Roches riches en carbonates (calcite, dolomite), le plus souvent d'origine marine et biologique : coquilles, squelettes, boues carbonatées.",
        plus: `<p>La plupart des calcaires se forment dans des mers chaudes et peu profondes, où les organismes fixent le carbonate
          de calcium dissous. La craie du Bassin parisien est ainsi faite de coccolithes, plaques calcaires d'algues
          planctoniques mesurant quelques millièmes de millimètre. La dolomie résulte le plus souvent du remplacement d'un
          calcaire par une dolomite riche en magnésium, au cours de la diagenèse. La marne mêle argile et carbonate dans des
          proportions voisines (environ 35 à 65 % de carbonate). Soluble dans l'eau chargée de CO₂, le calcaire donne les
          paysages karstiques : causses, gorges, grottes et gouffres.</p>`,
        groupes: [
          { nom: "Calcaires", brgm: "Calcaire", note: "Roches faites principalement de calcite. Craie, tuffeau et falun en sont des variétés d'origine et de texture différentes.",
            roches: ["calcaire", "craie", "tuffeau", "falun"] },
          { nom: "Roches dolomitiques", brgm: "Roche carbonatée", note: "Roches à dolomite. La cargneule est une brèche dolomitique cellulaire du Trias alpin.",
            roches: ["dolomie", "cargneule"] },
          { nom: "Roches mixtes", brgm: "Roche carbonatée", note: "Argile et carbonate en proportions voisines.",
            roches: ["marne"] },
        ],
      },
      {
        code: "S.3", nom: "Roches chimiques et biochimiques", brgm: "Roche chimique",
        note: "Roches précipitées à partir d'une eau saturée, avec ou sans intervention d'organismes : silice, sels, phosphates, fer.",
        plus: `<p>Une substance dissoute précipite quand sa concentration dépasse sa solubilité. Dans une lagune ou un lac salé qui
          s'évapore, les sels se déposent dans l'ordre inverse de leur solubilité : carbonates, puis gypse (environ 2,4 g/L),
          puis halite (environ 360 g/L), et en fin de séquence les sels potassiques. Les roches siliceuses sont souvent
          biochimiques : squelettes de radiolaires (radiolarite), de diatomées (diatomite) ou d'éponges (gaize, spongolite) ;
          le silex, lui, se forme par précipitation de silice dans la craie pendant la diagenèse. Les phosphorites et les
          roches ferrifères (minette de Lorraine) ont été exploitées comme minerais. Le travertin précipite autour des sources
          carbonatées, quand l'eau perd son CO₂.</p>`,
        groupes: [
          { nom: "Roches siliceuses", brgm: "Roche siliceuse", note: "Silice amorphe ou microcristalline, d'origine biologique ou chimique.",
            roches: ["silex", "radiolarite", "diatomite", "gaize"] },
          { nom: "Évaporites", brgm: "Évaporite", note: "Sels déposés par évaporation d'eaux marines ou lacustres.",
            roches: ["gypse", "anhydrite", "sel", "sylvinite"] },
          { nom: "Roches phosphatées et ferrifères", brgm: "Roche phosphatée", note: "Roches enrichies en phosphate ou en fer, anciens minerais.",
            roches: ["phosphorite", "roche_ferrifere"] },
          { nom: "Concrétions", brgm: "Concrétion", note: "Dépôts carbonatés des sources et des cours d'eau.",
            roches: ["travertin"] },
        ],
      },
      {
        code: "S.4", nom: "Roches organiques", brgm: "Roche organique",
        note: "Roches formées par l'accumulation de matière organique végétale ou planctonique, conservée à l'abri de l'oxygène.",
        plus: `<p>Enfouie, la matière végétale perd progressivement son eau et ses composés volatils, et s'enrichit en carbone :
          tourbe (environ 55 % de carbone), lignite (65–75 %), houille (75–90 %), anthracite (plus de 90 %). Cette
          « houillification » dépend surtout de la température atteinte et de la durée d'enfouissement. Les bassins houillers
          français (Nord–Pas-de-Calais, Lorraine, Saint-Étienne) datent du Carbonifère. Les schistes bitumineux, riches en
          matière organique planctonique, sont les roches mères du pétrole : chauffés à 60–120 °C environ, ils produisent des
          hydrocarbures qui migrent vers les roches réservoirs.</p>`,
        groupes: [
          { nom: "Charbons et tourbe", brgm: "Charbon", note: "De la tourbe à l'anthracite, maturation croissante de la matière végétale.",
            roches: ["tourbe", "lignite", "houille", "anthracite"] },
          { nom: "Roches bitumineuses", brgm: "Roche organique", note: "Roches à matière organique planctonique, sources d'hydrocarbures.",
            roches: ["schiste_bitumineux"] },
        ],
      },
      {
        code: "S.5", nom: "Roches d'altération", brgm: "Roche d'altération",
        note: "Roches indurées nées en place de l'altération d'autres roches, par lessivage des éléments solubles ou par concentration d'éléments apportés par l'eau.",
        plus: `<p>Sous climat tropical humide (≥ 22 °C, pluie > ETP), l'eau emporte la silice et les bases (calcium, magnésium, potassium, sodium) et laisse
          sur place les éléments peu mobiles : aluminium (bauxite) et fer (cuirasse latéritique). Le terme « bauxite » vient
          des Baux-de-Provence, où ce minerai d'aluminium a été décrit en 1821. La meulière du Bassin parisien est un calcaire
          lacustre dont le carbonate a été dissous et remplacé par de la silice. À l'inverse, en climat semi-aride (pluie entre 20 et 50 % de l'ETP, moins de 760 mm/an), l'eau
          remonte par capillarité et dépose du carbonate dans le sol : c'est la calcrète, qui peut former des dalles de
          plusieurs mètres.</p>`,
        groupes: [
          { nom: "Par lessivage", brgm: "Roche d'altération par lessivage", note: "Les éléments solubles partent ; les éléments peu mobiles restent.",
            roches: ["bauxite", "laterite", "meuliere"] },
          { nom: "Par concentration", brgm: "Roche d'altération par concentration", note: "Des éléments apportés par l'eau précipitent dans le sol.",
            roches: ["calcrete"] },
        ],
      },
      {
        code: "S.6", nom: "Formations superficielles", brgm: "Sédiment",
        note: "Dépôts meubles récents qui recouvrent le substratum. Ce ne sont pas des roches au sens strict mais les matériaux parentaux de la plupart des sols. Le lexique n'en connaît qu'une partie, sous « Sédiment ».",
        plus: `<p>Les cartes géologiques au 1/50 000 représentent les formations superficielles lorsqu'elles sont assez épaisses,
          souvent plus d'un mètre. Leurs notations sont codifiées : F pour les alluvions fluviatiles (Fz les plus récentes,
          puis Fy, Fx… pour les terrasses plus anciennes), C pour les colluvions, G pour les dépôts glaciaires, E pour les
          éboulis, LP pour les limons des plateaux, R pour les formations résiduelles. On distingue les formations
          <b>transportées</b> (par l'eau, la glace, le vent ou la gravité) et les formations <b>résiduelles</b>, restées en place
          après la dissolution ou l'altération de leur substratum. En pédologie, ce matériau parental conditionne la texture,
          la réserve en eau et la richesse chimique du sol qui s'y développe.</p>`,
        groupes: [
          { nom: "Formations transportées", brgm: "Sédiment", note: "Déposées par l'eau, la glace, le vent ou la gravité.",
            roches: ["alluvions", "colluvions", "eboulis", "moraine", "dunes", "loess", "vase_tangue"] },
          { nom: "Formations résiduelles", brgm: "Roche d'altération par lessivage", note: "Restées en place après l'altération ou la dissolution du substratum.",
            roches: ["alterite", "terra_rossa", "argile_silex"] },
        ],
      },
    ],
  },
  {
    id: "metamorphique", nom: "Roches métamorphiques",
    desc: "Roches transformées à l'état solide par la température, la pression ou des fluides, sans passer par la fusion. Le lexique du BRGM les classe par type de métamorphisme.",
    plus: `<p>Quand une roche est portée à d'autres conditions que celles de sa formation, ses minéraux deviennent instables et
      recristallisent en un nouvel assemblage. Une argile enfouie devient successivement ardoise, micaschiste puis gneiss ;
      un calcaire devient marbre ; un basalte devient schiste vert, amphibolite ou éclogite selon la pression et la
      température atteintes. Certains minéraux servent de thermomètres et de baromètres : les trois polymorphes
      Al₂SiO₅ (andalousite, disthène, sillimanite) indiquent à eux seuls le domaine pression–température.</p>
      <p>Le type de métamorphisme dépend du contexte. Le métamorphisme <b>régional</b> affecte de grands volumes lors de la
      formation des chaînes de montagnes (Massif central, Massif armoricain, Alpes). Le métamorphisme de <b>contact</b> recuit
      l'encaissant autour d'une intrusion. Le métamorphisme <b>dynamique</b> se concentre le long des failles. La
      <b>métasomatose</b> modifie la chimie de la roche par apport de fluides.</p>
      <p>Au-delà d'environ 650–700 °C en présence d'eau, la roche commence à fondre : c'est la migmatite, à la frontière
      entre métamorphisme et magmatisme.</p>`,
    branches: [
      {
        code: "R.1", nom: "Métamorphisme régional", brgm: "Roche du métamorphisme régional",
        note: "Enfouissement de grands volumes de roches lors de la formation des chaînes de montagnes. Les minéraux recristallisent et s'orientent : la roche acquiert une foliation.",
        plus: `<p>Le degré de métamorphisme (« grade ») croît avec la profondeur atteinte. Pour une roche d'origine argileuse, la
          séquence est : ardoise (très bas grade, clivage fin), micaschiste (micas visibles), gneiss (alternance de lits clairs
          et sombres), puis migmatite (fusion partielle). Les géologues regroupent les assemblages minéraux en « faciès »
          métamorphiques, définis sur les roches basiques : schistes verts, amphibolite, granulite pour les hautes
          températures ; schistes bleus et éclogite pour les hautes pressions des zones de subduction. Les schistes bleus et
          éclogites des Alpes occidentales et de l'île de Groix témoignent de roches enfouies à plusieurs dizaines de
          kilomètres puis remontées.</p>`,
        groupes: [
          { nom: "D'origine sédimentaire", brgm: "Roche métasédimentaire", note: "Anciennes argiles (ardoise, micaschiste), grès (quartzite), calcaires (marbre) ou alternances marno-calcaires (calcschiste).",
            roches: ["ardoise", "micaschiste", "quartzite", "marbre", "calcschiste"] },
          { nom: "D'origine basique", brgm: "Roche métamorphique", note: "Anciens basaltes ou gabbros. L'assemblage minéral indique le faciès : schistes verts, amphibolite, schistes bleus (haute pression, basse température), éclogite (très haute pression).",
            roches: ["schiste_vert", "amphibolite", "schiste_bleu", "eclogite"] },
          { nom: "Haut grade", brgm: "Roche métamorphique", note: "Températures élevées. La migmatite marque le début de la fusion partielle.",
            roches: ["gneiss", "leptynite", "granulite_meta", "migmatite"] },
        ],
      },
      {
        code: "R.2", nom: "Métamorphisme de contact", brgm: "Roche du métamorphisme de contact",
        note: "Recuit des roches encaissantes autour d'une intrusion magmatique, sur quelques mètres à quelques kilomètres, sans déformation notable.",
        plus: `<p>La chaleur d'un pluton granitique se diffuse dans les roches qu'il traverse et forme une auréole de contact. Près
          de l'intrusion, les argiles deviennent des cornéennes, dures et à cassure esquilleuse ; plus loin, des schistes
          tachetés où de petits cristaux (andalousite, cordiérite) commencent à pousser. Quand l'encaissant est calcaire et
          que des fluides chargés de silice, de fer et de magnésium circulent, il se forme des skarns, riches en grenats et
          pyroxènes calciques. Le skarn de Salau (Ariège) a été exploité pour la scheelite, minerai de tungstène.</p>`,
        groupes: [
          { nom: "Roches de contact", brgm: "Roche du métamorphisme de contact", note: "", roches: ["corneenne", "skarn"] },
        ],
      },
      {
        code: "R.3", nom: "Métamorphisme dynamique", brgm: "Roche dynamométamorphique",
        note: "Déformation localisée le long des failles : broyage cassant (cataclasite), cisaillement ductile (mylonite), fusion par friction (pseudotachylite). Le lexique y range aussi l'impactite, produite par le choc d'une météorite.",
        plus: `<p>Le comportement d'une roche dans une faille dépend de la profondeur. Près de la surface, elle se fracture et se
          broie : brèches de faille et cataclasites. Plus bas, vers 10 à 15 km et au-delà de 300 °C environ, le quartz se
          déforme plastiquement et la roche s'étire en mylonite, à grain très fin et fortement foliée. Lors d'un séisme, la
          chaleur de friction peut fondre la roche en quelques secondes : le verre obtenu est une pseudotachylite. L'impactite
          relève d'un choc bien plus bref et plus intense : l'astroblème de Rochechouart (Haute-Vienne), vieux d'environ 200
          millions d'années, en conserve des brèches et des suévites.</p>`,
        groupes: [
          { nom: "Roches de faille et de choc", brgm: "Roche dynamométamorphique", note: "", roches: ["mylonite", "cataclasite", "pseudotachylite", "impactite"] },
        ],
      },
      {
        code: "R.4", nom: "Métasomatose", brgm: "Roche métasomatique",
        note: "Transformation chimique d'une roche par des fluides qui apportent ou emportent des éléments : serpentinisation, greisenisation, fénitisation, spilitisation.",
        plus: `<p>Contrairement au métamorphisme « isochimique », où la roche garde sa composition globale, la métasomatose la
          modifie. Au contact de l'eau de mer, les péridotites du plancher océanique s'hydratent en serpentinites ; les
          basaltes échangent du calcium contre du sodium et deviennent des spilites. Les gabbros et dolérites enclavés dans ces
          serpentinites perdent leur silice et gagnent du calcium : ce sont les rodingites. Dans le toit des granites, les
          fluides riches en fluor et en bore transforment la roche en greisen (quartz et micas blancs), souvent porteur
          d'étain et de tungstène. Autour des carbonatites, les fluides alcalins produisent les fénites.</p>`,
        groupes: [
          { nom: "Roches métasomatiques", brgm: "Roche métasomatique", note: "", roches: ["serpentinite", "greisen", "fenite", "rodingite", "spilite"] },
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
};
const ROCHES_HORS_LEXIQUE = {
  porphyre: "« Porphyre » désigne une texture (gros cristaux dans une pâte fine), pas une lithologie : le lexique n'a pas de terme correspondant.",
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
