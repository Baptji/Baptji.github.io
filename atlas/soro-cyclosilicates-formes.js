// ============================================================
// CLASSES IX.B (sorosilicates) et IX.C (cyclosilicates) : formes cristallines (cristal.js) et modes de formation (MIN_F)
// chantier F.4, 01/10/2026. Chargé après nesosilicates-formes.js. Mailles = celles des structures 3D (COD).
// Épidotes en P2₁/m (a 8,9 · b 5,6 · c 10,2, β 115°) : allongement selon b, comme dans les ouvrages.
// Tourmalines : classe 3m polaire dessinée telle quelle (prisme trigonal + prisme hexagonal, rhomboèdre en haut, base en bas).
// ============================================================

(function () {
  const HEX = (a, c) => [a, a, c, 90, 90, 120];
  const EPIDOTE = (nom, couleur, m, cod, note) => ({
    nom, couleur, systeme: "monoclinique", classe: "2/m", classeNom: "prismatique", reseau: "P", maille: m, mailleSource: cod,
    azimut: 70, elevation: 14,
    facies: [{ nom: "Prisme strié", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.1 },
      { sym: "r", hkl: [-1, 0, 1], nom: "pinacoïde", d: 1.05 }, { sym: "n", hkl: [-1, 1, 1], nom: "prisme", d: 2.6 }], note }],
    clivages: [{ hkl: [0, 0, 1], qualite: "parfait", nom: "{001}", pas: 0.22 }],
  });
  const TOURMALINE = (nom, couleur, a, c, cod, note) => ({
    nom, couleur, systeme: "trigonal", classe: "3m", classeNom: "ditrigonale pyramidale (polaire)", reseau: "R", maille: HEX(a, c), mailleSource: cod,
    azimut: 18, elevation: 14,
    facies: [{ nom: "Prisme à section triangulaire", formes: [
      { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme trigonal", d: 1.0 }, { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.06 },
      { sym: "r", hkl: [1, 0, -1, 1], nom: "pyramide trigonale", d: 2.6 }, { sym: "c", hkl: [0, 0, 0, -1], nom: "pédion", d: 2.4 }], note }],
    clivages: [],
  });
  const CANAUX = (nom, couleur, a, c, cod, note, dc) => ({
    nom, couleur, systeme: "hexagonal", classe: "6/mmm", classeNom: "dihexagonale dipyramidale", reseau: "P", maille: HEX(a, c), mailleSource: cod,
    azimut: 20, elevation: 16,
    facies: [{ nom: "Prisme hexagonal", formes: [
      { sym: "m", hkl: [1, 0, -1, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: dc || 1.8 }], note }],
    clivages: [],
  });
  const MELILITE = (nom, couleur, a, c, cod, note) => ({
    nom, couleur, systeme: "quadratique", classe: "-42m", classeNom: "scalénoédrique quadratique", reseau: "P", maille: [a, a, c, 90, 90, 90], mailleSource: cod,
    azimut: 22, elevation: 18,
    facies: [{ nom: "Tablette carrée", formes: [
      { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.5 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.05 }], note }],
    clivages: [{ hkl: [0, 0, 1], qualite: "net", nom: "basal", pas: 0.24 }],
  });

  if (window.Cristal) Object.assign(Cristal.CRISTAUX, {
    epidote: EPIDOTE("Épidote", "#5e7a2a", [8.914, 5.64, 10.162, 90, 115.4, 90], "cod9000220",
      "Prismes vert pistache, allongés selon b et striés dans leur longueur, terminés en toit : les cristaux de Knappenwand (Autriche) et du Bourg-d'Oisans."),
    clinozoisite: EPIDOTE("Clinozoïsite", "#b8b49a", [8.879, 5.583, 10.155, 90, 115.5, 90], "cod9000180",
      "Même forme que l'épidote, gris à vert pâle : moins de fer, moins de couleur."),
    piemontite: EPIDOTE("Piémontite", "#8a2a4a", [8.8727, 5.6686, 10.1682, 90, 115.48, 90], "cod9015882",
      "Prismes rouge violacé, en aiguilles dans les quartzites manganésifères (Saint-Marcel, Val d'Aoste, Piémont : d'où son nom)."),
    zoisite: {
      nom: "Zoïsite", couleur: "#5a6aa8", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "P",
      maille: [16.212, 5.559, 10.036, 90, 90, 90], mailleSource: "cod9000179", azimut: 70, elevation: 14,
      facies: [{ nom: "Prisme strié", formes: [
        { sym: "a", hkl: [1, 0, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde", d: 1.0 }, { sym: "d", hkl: [1, 0, 1], nom: "prisme", d: 1.05 },
        { sym: "p", hkl: [1, 1, 1], nom: "bipyramide", d: 2.6 }],
        note: "Prismes allongés selon b ; la tanzanite, bleu violet, est une zoïsite à vanadium de Merelani (Tanzanie)." }],
      clivages: [{ hkl: [1, 0, 0], qualite: "parfait", nom: "{100}", pas: 0.22 }],
    },
    vesuvianite: {
      nom: "Vésuvianite", couleur: "#7a6a2a", systeme: "quadratique", classe: "4/mmm", classeNom: "ditétragonale dipyramidale", reseau: "P",
      maille: [15.533, 15.533, 11.785, 90, 90, 90], mailleSource: "cod9004529", azimut: 22, elevation: 16,
      facies: [{ nom: "Prisme carré", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "a", hkl: [1, 0, 0], nom: "prisme", d: 1.0 },
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.2 }, { sym: "p", hkl: [1, 0, 1], nom: "bipyramide", d: 1.08 }],
        note: "Prismes à huit pans, à sommet aplati bordé de facettes : la forme des cristaux bruns des skarns et des blocs du Vésuve." }],
      clivages: [],
    },
    lawsonite: {
      nom: "Lawsonite", couleur: "#b7c6cc", systeme: "orthorhombique", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [8.795, 5.847, 13.142, 90, 90, 90], mailleSource: "cod9000627", azimut: 22, elevation: 22,
      facies: [{ nom: "Tablette losangique", formes: [
        { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }],
        note: "Tablettes à contour losangique, bleu pâle, dans les schistes bleus : la Corse alpine et l'île de Syros en sont riches." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "parfait", nom: "{010}", pas: 0.24 }],
    },
    akermanite: MELILITE("Åkermanite", "#c9b48a", 7.8348, 5.0087, "cod9006935",
      "Tablettes carrées courtes ; dans les laves pauvres en silice, la mélilite forme des baguettes rectangulaires visibles au microscope."),
    gehlenite: MELILITE("Gehlénite", "#bfae8a", 7.685, 5.0636, "cod9006112",
      "Tablettes carrées gris-vert ; les blocs de marbre rejetés par les volcans en montrent (Monte Somma, Fassa)."),
    hemimorphite: {
      nom: "Hémimorphite", couleur: "#d6e6ea", systeme: "orthorhombique", classe: "mm2", classeNom: "pyramidale rhombique (polaire)", reseau: "I",
      maille: [8.367, 10.73, 5.115, 90, 90, 90], mailleSource: "cod9008269", azimut: 20, elevation: 12,
      facies: [{ nom: "Tablette à deux bouts différents", formes: [
        { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 0.45 }, { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 },
        { sym: "t", hkl: [3, 0, 1], nom: "dôme (haut)", d: 1.7 }, { sym: "e", hkl: [0, 1, 1], nom: "dôme (haut)", d: 1.7 }, { sym: "v", hkl: [1, 2, -1], nom: "pyramide (bas)", d: 1.6 }],
        note: "Le haut est coupé par des dômes, le bas se termine en pointe par une pyramide : les deux bouts ne se ressemblent pas, d'où son nom (« forme à moitié »). Chauffée, elle se charge d'électricité positive à un bout, négative à l'autre." }],
      clivages: [{ hkl: [1, 1, 0], qualite: "parfait", nom: "{110}", pas: 0.24 }],
    },
    benitoite: {
      nom: "Bénitoïte", couleur: "#3a5ac0", systeme: "hexagonal", classe: "-6m2", classeNom: "ditrigonale dipyramidale", reseau: "P",
      maille: HEX(6.643, 9.766), mailleSource: "cod9014388", azimut: 20, elevation: 24,
      facies: [{ nom: "Dipyramide triangulaire", formes: [
        { sym: "p", hkl: [1, 1, -2, 1], nom: "dipyramide trigonale", d: 1.0 }, { sym: "c", hkl: [0, 0, 0, 1], nom: "pinacoïde basal", d: 0.55 }],
        note: "Cristaux en triangle, bleu saphir : la seule espèce minérale connue de la classe 6̄m2. Elle brille en bleu sous ultraviolets courts. (La dipyramide, notée {10-11} dans les ouvrages, porte ici les indices {11-21} : le moteur place les axes d'ordre 2 de la classe 6̄m2 dans l'autre orientation.)" }],
      clivages: [],
    },
    beryl: CANAUX("Béryl", "#6aa88a", 9.2077, 9.1953, "cod9001162",
      "Prismes hexagonaux coupés net par la base : l'émeraude (chrome ou vanadium), l'aigue-marine (fer), la morganite (manganèse), l'héliodore. Les béryls des pegmatites atteignent plusieurs mètres.", 2.2),
    bazzite: CANAUX("Bazzite", "#5a8ac0", 9.549, 9.163, "cod9004606",
      "Petits prismes bleu azur, dans les fentes alpines et les pegmatites (Baveno, Val Vigezzo).", 2.4),
    milarite: CANAUX("Milarite", "#c6d9a6", 10.41, 13.845, "cod9001381",
      "Prismes hexagonaux vert pâle, dans les fentes alpines (Val Giuv, Grisons).", 1.6),
    cordierite: {
      nom: "Cordiérite", couleur: "#5a5ab0", systeme: "orthorhombique (pseudo-hexagonal)", classe: "mmm", classeNom: "dipyramidale rhombique", reseau: "C",
      maille: [17.072, 9.727, 9.351, 90, 90, 90], mailleSource: "cod9002408", azimut: 20, elevation: 16,
      macleNote: "Macles cycliques par trois ou six, sur {110} : elles donnent des prismes pseudo-hexagonaux.",
      facies: [{ nom: "Prisme pseudo-hexagonal", formes: [
        { sym: "m", hkl: [1, 1, 0], nom: "prisme", d: 1.0 }, { sym: "b", hkl: [0, 1, 0], nom: "pinacoïde", d: 1.0 }, { sym: "c", hkl: [0, 0, 1], nom: "pinacoïde basal", d: 1.4 }],
        note: "Prismes courts à six pans : la maille est presque hexagonale (a ≈ b√3), si bien que {110} et {010} se coupent presque à 60°." }],
      clivages: [{ hkl: [0, 1, 0], qualite: "médiocre", nom: "{010}", pas: 0.3 }],
    },
    tourmaline: TOURMALINE("Schorl", "#24242a", 15.992, 7.19, "cod9004090",
      "Prismes noirs striés en long, à section en triangle bombé (prisme trigonal + prisme hexagonal) ; terminés différemment aux deux bouts, comme le veut la symétrie polaire 3m."),
    dravite: TOURMALINE("Dravite", "#7a4a2a", 15.926, 7.21, "cod9001513",
      "Prismes bruns, souvent courts, dans les marbres et les schistes magnésiens."),
    elbaite: TOURMALINE("Elbaïte", "#c8406a", 15.84, 7.1, "cod9015211",
      "Prismes roses, verts ou bicolores (« melon d'eau » : cœur rose, écorce verte) des pegmatites à lithium."),
    uvite: TOURMALINE("Uvite", "#6a5a3a", 15.949, 7.188, "cod9004362",
      "Prismes courts, bruns à verts, dans les marbres."),
    liddicoatite: TOURMALINE("Liddicoatite", "#8a3a6a", 15.88, 7.118, "cod9005381",
      "Prismes de Madagascar qui, sciés en travers, montrent des triangles concentriques de toutes les couleurs."),
    dioptase: {
      nom: "Dioptase", couleur: "#0f8a6a", systeme: "trigonal", classe: "-3", classeNom: "rhomboédrique", reseau: "R",
      maille: HEX(14.566, 7.778), mailleSource: "cod9000576", azimut: 20, elevation: 16,
      facies: [{ nom: "Prisme et rhomboèdre", formes: [
        { sym: "a", hkl: [1, 1, -2, 0], nom: "prisme hexagonal", d: 1.0 }, { sym: "r", hkl: [1, 0, -1, 1], nom: "rhomboèdre", d: 1.35 }],
        note: "Prismes courts vert émeraude, terminés en rhomboèdre (Tsumeb, Kazakhstan). On l'a prise pour de l'émeraude ; son clivage parfait la rend fragile." }],
      clivages: [{ hkl: [1, 0, -1, 1], qualite: "parfait", nom: "rhomboédrique", pas: 0.24 }],
    },
  });

  // ─────────────────────────── modes de formation ───────────────────────────
  if (typeof MIN_F === "undefined") return;
  const pt = (T, P, n, t, o) => Object.assign({ T, P }, n ? { n } : {}, t ? { t } : {}, o || {});
  const SRC = {
    london: "London D. (2008). <i>Pegmatites</i>. Canadian Mineralogist, Special Publication 10.",
    henry: "Henry D. J. et Dutrow B. L. (1996). « Metamorphic tourmaline and its petrologic applications ». <i>Reviews in Mineralogy</i> 33, p. 503–557.",
    franz: "Franz G. et Liebscher A. (2004). « Physical and chemical properties of the epidote minerals ». <i>Reviews in Mineralogy and Geochemistry</i> 56, p. 1–81.",
    giuliani: "Giuliani G. et al. (2019). « Emerald deposits: a review and enhanced classification ». <i>Minerals</i> 9, 105.",
  };
  const PEG = "Pas de diagramme : la pegmatite cristallise à partir d'un liquide très riche en eau et en éléments rares, que le diagramme du granite ne représente pas.";
  const RARE = (t) => ({ cond: false, sansDiagramme: "Pas de diagramme : " + (t || "minéral rare, formé dans des conditions particulières.") });
  const s = (nom, texte, cond, src) => Object.assign({ nom, texte }, cond && cond.type ? { cond } : (cond || RARE()), src ? { src } : {});
  const meta = (chemin, o) => Object.assign({ type: "meta", echelle: "reg", gradients: [10, 30, 60], chemin, note: "Chemin schématique." }, o || {});
  const contact = (chemin) => ({ type: "meta", echelle: "contact", courbes: ["graniteEau"], chemin, note: "Chemin schématique." });
  const SKARN = (min) => contact([pt(150, 0.12, 1, "Un calcaire repose à 4–5 km près d'un granite."), pt(550, 0.12, 2, "Le granite le chauffe et lui apporte silice, fer et aluminium : " + min + " cristallise.", { bande: "skarn" }), pt(15, 0, 3, "L'érosion met le skarn à jour.")]);
  const SF = (t) => "Forme non dessinée : " + t;

  Object.assign(MIN_F, {
    // ═══════════ sorosilicates ═══════════
    epidote: {
      forme: `L'épidote a des chaînes d'octaèdres d'aluminium et de fer le long de b, reliées par des tétraèdres SiO₄ isolés et par des paires
        Si₂O₇ (d'où sa place parmi les sorosilicates). Les cristaux s'allongent le long des chaînes : prismes striés selon b. Le fer
        ferrique lui donne son vert pistache.`,
      intro: `L'épidote est le minéral emblématique du métamorphisme faible des basaltes et des roches calciques : le vert des schistes verts.`,
      scenarios: [
        s("Dans un schiste vert", `Quand un basalte est enfoui et chauffé vers 300–450 °C en présence d'eau, son plagioclase calcique et ses pyroxènes se
          transforment en chlorite, albite, actinote et épidote : le schiste vert.`, meta([pt(10, 0, 1, "Un basalte se forme au fond de l'océan."), pt(400, 0.4, 2, "Enfoui et chauffé vers 300–450 °C, il recristallise : l'épidote pousse avec la chlorite et l'actinote.", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison", SRC.franz]),
        s("Dans une fente alpine", `Les eaux chaudes qui circulent dans les fissures des Alpes y déposent l'épidote en prismes brillants avec le quartz et
          l'albite (Bourg-d'Oisans, Knappenwand).`, RARE("dépôt d'eau chaude dans une fissure.")),
      ],
    },
    clinozoisite: {
      forme: `Même structure que l'épidote, avec de l'aluminium à la place du fer : plus pâle. Épidote et clinozoïsite forment une série.`,
      intro: `La clinozoïsite se forme comme l'épidote, dans les roches pauvres en fer.`,
      scenarios: [s("Dans une roche métamorphique calcique", `Schistes verts, marbres impurs, saussurite (plagioclase altéré en fin feutrage de clinozoïsite et
        d'albite).`, meta([pt(10, 0, 1, "Une roche riche en calcium et en aluminium se forme."), pt(400, 0.4, 2, "Enfouie et chauffée vers 300–500 °C, elle fait pousser la clinozoïsite.", { bande: "schistes verts" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.franz])],
    },
    zoisite: {
      forme: `Même formule que la clinozoïsite, mais une maille orthorhombique (empilement différent des chaînes). La variété tanzanite doit sa
        couleur au vanadium ; chauffée, elle passe du brun au bleu violet.`,
      intro: `La zoïsite se forme dans les roches calciques métamorphiques, jusqu'aux éclogites.`,
      scenarios: [s("Dans une roche métamorphique de haute pression", `Dans les gneiss calciques, les amphibolites et les éclogites ; la tanzanite a cristallisé dans
        les gneiss graphiteux de Merelani (Tanzanie), seul gisement au monde, vers 600 °C.`, meta([pt(15, 0, 1, "Une roche calcique se forme."), pt(600, 1.0, 2, "Enfouie à grande profondeur, chauffée vers 600 °C, elle fait pousser la zoïsite.", { bande: "zoïsite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison"])],
    },
    piemontite: {
      forme: `Épidote où le manganèse trivalent occupe un site octaédrique : il la colore en rouge.`,
      intro: `La piémontite se forme dans les roches métamorphiques riches en manganèse et oxydées.`,
      scenarios: [s("Dans un quartzite manganésifère", `Saint-Marcel (Val d'Aoste) : schistes et quartzites manganésifères métamorphisés.`, meta([pt(15, 0, 1, "Un sédiment siliceux riche en manganèse se dépose."), pt(450, 0.7, 2, "Enfoui et chauffé, il recristallise : la piémontite pousse en aiguilles rouges.", { bande: "piémontite" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    allanite: {
      sansForme: SF("l'allanite forme des grains et des tablettes souvent métamictes (réseau détruit par sa radioactivité)."),
      forme: `Épidote où les terres rares (cérium, lanthane) et le thorium remplacent un calcium : radioactive, elle détruit souvent son propre
        réseau (état métamicte).`,
      intro: `L'allanite est le principal minéral accessoire à terres rares des granites.`,
      scenarios: [s("Dans un granite", `Petits grains bruns, entourés d'un halo de radiation dans la biotite.`, { type: "magma", echelle: "croute", chemin: [pt(850, 0.4, 1, "La croûte fond ; les terres rares passent dans le magma."), pt(760, 0.3, 2, "Le magma refroidit : l'allanite cristallise.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann"])],
    },
    vesuvianite: {
      forme: `La vésuvianite (idocrase) associe des tétraèdres SiO₄ et des paires Si₂O₇ à des colonnes de calcium et de fer le long de c. C'est
        un minéral complexe (plus de 100 atomes par formule), à la symétrie quadratique : d'où les prismes carrés.`,
      intro: `La vésuvianite cristallise dans les skarns et les marbres de contact.`,
      scenarios: [s("Dans un skarn", `Au contact d'un granite et d'un calcaire, avec le grossulaire et le diopside ; décrite dans les blocs rejetés par le Vésuve.`, SKARN("la vésuvianite"), ["tuttle"])],
    },
    pumpellyite: {
      sansForme: SF("la pumpellyite forme des fibres et des aiguilles vertes microscopiques."),
      forme: `Chaînes d'octaèdres reliées par des SiO₄ et des Si₂O₇, avec plus d'eau que l'épidote : stable à plus basse température.`,
      intro: `La pumpellyite est le minéral repère du métamorphisme très faible des basaltes.`,
      scenarios: [s("Dans un basalte faiblement chauffé", `Vers 200–300 °C, avec la prehnite : le faciès « prehnite–pumpellyite » des basaltes enfouis.`, meta([pt(10, 0, 1, "Un basalte se forme."), pt(270, 0.3, 2, "Enfoui à une dizaine de kilomètres, vers 250 °C, il fait pousser pumpellyite et prehnite.", { bande: "très faible degré" }), pt(15, 0, 3, "L'érosion le ramène en surface.")]), ["pattison"])],
    },
    lawsonite: {
      forme: `La lawsonite associe des chaînes d'octaèdres d'aluminium, des paires Si₂O₇, du calcium et de l'eau (11 %). Elle n'est stable qu'à
        haute pression et basse température : c'est le minéral des zones de subduction froides.`,
      intro: `La lawsonite naît dans les plaques océaniques qui plongent dans une subduction.`,
      scenarios: [s("Dans un schiste bleu", `Plongée rapidement, la croûte océanique reste froide : vers 30–50 km et 300–400 °C, ses minéraux deviennent glaucophane et
        lawsonite. La lawsonite emporte de l'eau jusqu'à 300 km de profondeur.`, meta([pt(10, 0, 1, "Un basalte du fond océanique est entraîné dans la subduction."), pt(380, 1.2, 2, "Vers 40 km, à 350–400 °C seulement, la lawsonite cristallise.", { bande: "schistes bleus" }), pt(200, 0.3, 3, "La roche remonte en restant froide (Corse alpine, Syros).")], { echelle: "hp" }), ["pattison"])],
    },
    akermanite: {
      forme: `Mélilite magnésienne : couches de tétraèdres (Si₂O₇ reliées par un tétraèdre de magnésium), calcium entre les couches.`,
      intro: `L'åkermanite cristallise dans les laves très pauvres en silice et dans les calcaires très chauffés.`,
      scenarios: [s("Dans une lave sous-saturée", `Les mélilitites (laves du Kaiserstuhl, de l'Eifel) et les calcaires au contact de laves ; aussi dans les laitiers de
        haut-fourneau et les inclusions blanches des météorites (chondrites carbonées), les plus vieux solides du système solaire.`, RARE("laves très pauvres en silice."))],
    },
    gehlenite: {
      forme: `Mélilite alumineuse : l'aluminium remplace le magnésium et la moitié du silicium.`,
      intro: `La gehlénite cristallise dans les calcaires argileux très chauffés.`,
      scenarios: [s("Au contact d'un magma très chaud", `Calcaires impurs chauffés au-delà de 900 °C à faible pression (Monte Somma) ; aussi dans le clinker de ciment.`, contact([pt(150, 0.05, 1, "Un calcaire argileux repose près de la surface."), pt(950, 0.05, 2, "Un magma le chauffe au-delà de 900 °C : la gehlénite cristallise.", { bande: "gehlénite" }), pt(15, 0, 3, "L'érosion met la roche à jour.")]), ["tuttle"])],
    },
    hardystonite: {
      sansForme: SF("la hardystonite forme des masses grenues."),
      forme: `Mélilite où le zinc remplace le magnésium.`,
      intro: `La hardystonite ne se trouve qu'à Franklin (New Jersey).`,
      scenarios: [s("Dans le marbre de Franklin", `Grains blancs qui brillent en violet sous ultraviolets.`)],
    },
    hemimorphite: {
      forme: `L'hémimorphite associe des paires Si₂O₇ et des tétraèdres de zinc tous tournés dans le même sens le long de c : les deux bouts du
        cristal sont différents, et il se charge électriquement quand on le chauffe (pyroélectricité).`,
      intro: `L'hémimorphite naît de l'oxydation de la blende, avec la smithsonite.`,
      scenarios: [s("Dans la zone oxydée d'un gisement de zinc", `Avec la smithsonite, elle forme la « calamine » des anciens mineurs (Les Malines, Moresnet).`, RARE("c'est l'oxydation près de la surface qui la fait."))],
    },
    bertrandite: {
      sansForme: SF("la bertrandite forme de petites tablettes mal décrites."),
      forme: `Charpente de tétraèdres BeO₃(OH) et de paires Si₂O₇.`,
      intro: `La bertrandite est le principal minerai de béryllium aujourd'hui.`,
      scenarios: [s("Dans un tuf altéré", `À Spor Mountain (Utah), des fluides riches en fluor ont déposé la bertrandite dans des tufs rhyolitiques : la principale source
        de béryllium. Elle se forme aussi aux dépens du béryl dans les pegmatites. Décrite près de Nantes en 1883 et nommée d'après le minéralogiste Émile Bertrand.`, RARE())],
    },
    ilvaite: {
      sansForme: SF("ses prismes noirs, striés, sont décrits dans une autre maille que celle de la structure 3D."),
      forme: `Doubles chaînes d'octaèdres de fer ferreux et ferrique le long de c, reliées par des paires Si₂O₇.`,
      intro: `L'ilvaïte est un minéral des skarns à fer ; elle a été décrite à l'île d'Elbe (Ilva en latin).`,
      scenarios: [s("Dans un skarn à fer", `Avec l'hédenbergite et la magnétite, dans les skarns de Rio Marina (Elbe) et de Dal'negorsk (Russie).`, SKARN("l'ilvaïte"), ["tuttle"])],
    },
    thortveitite: {
      sansForme: SF("la thortveitite forme des prismes mal décrits."),
      forme: `Octaèdres de scandium reliés par des paires Si₂O₇ « droites » (l'angle Si–O–Si y vaut 180°).`,
      intro: `La thortveitite est le principal minéral de scandium.`,
      scenarios: [s("Dans une pegmatite", `Iveland (Norvège), Madagascar. Le scandium, prédit par Mendeleïev, est rarement concentré : c'est l'un des seuls minéraux qui en contiennent beaucoup.`, { cond: false, sansDiagramme: PEG })],
    },
    cuspidine: {
      sansForme: SF("la cuspidine forme des grains et des cristaux en pointe de lance mal décrits."),
      forme: `Paires Si₂O₇ et chaînes de calcium, avec du fluor.`,
      intro: `La cuspidine naît dans les calcaires chauffés en présence de fluor.`,
      scenarios: [s("Au contact d'un magma", `Blocs de marbre du Vésuve, skarns ; aussi dans les laitiers sidérurgiques à fluorine.`)],
    },
    tilleyite: {
      sansForme: SF("la tilleyite forme des grains dans les marbres."),
      forme: `Paires Si₂O₇ et triangles CO₃ reliés par des calciums : un silicate-carbonate.`,
      intro: `La tilleyite naît dans les calcaires chauffés à très haute température.`,
      scenarios: [s("Au contact d'un magma très chaud", `Crestmore (Californie), Scawt Hill (Irlande du Nord).`)],
    },
    rankinite: {
      sansForme: SF("la rankinite forme des grains."),
      forme: `Paires Si₂O₇ reliées par des calciums.`,
      intro: `La rankinite naît dans les calcaires chauffés au-delà de 900 °C.`,
      scenarios: [s("Au contact d'un magma très chaud", `Scawt Hill (Irlande du Nord), Hatrurim (Israël) ; aussi dans le clinker de ciment.`)],
    },
    axinite: {
      sansForme: SF("ses cristaux en coin, tranchants, appartiennent à la classe la moins symétrique (triclinique) et sont décrits dans une autre orientation que la structure 3D."),
      forme: `L'axinite associe des groupes Si₂O₇ reliés deux à deux par des triangles de bore, des octaèdres d'aluminium et de fer, et du calcium.
        Triclinique, elle n'a ni axe ni plan de symétrie : ses cristaux, aplatis et tranchants comme une hache, lui ont donné son nom.`,
      intro: `L'axinite cristallise dans les fissures des roches calciques chauffées par un granite.`,
      scenarios: [s("Dans une fente ou un skarn", `Les fluides des granites, riches en bore, la déposent dans les fissures : Bourg-d'Oisans (Isère), d'où viennent les
        cristaux de référence, Puiva (Oural).`, RARE("dépôt de fluides riches en bore dans une fissure."))],
    },

    // ═══════════ cyclosilicates ═══════════
    benitoite: {
      forme: `La bénitoïte a des anneaux de trois tétraèdres (Si₃O₉) reliés par des octaèdres de titane, avec le baryum entre eux. Sa symétrie
        (6̄m2) n'existe chez aucun autre minéral connu : d'où ses cristaux en triangle.`,
      intro: `La bénitoïte n'a qu'un gisement important au monde, en Californie.`,
      scenarios: [s("Dans une serpentinite traversée par des fluides", `Comté de San Benito (Californie), dans des veines de natrolite qui traversent une serpentinite
        transformée en schiste bleu. Pierre officielle de la Californie.`, RARE("composition et circonstances exceptionnelles."))],
    },
    wadeite: {
      sansForme: SF("la wadéite forme de petits grains."),
      forme: `Anneaux de trois tétraèdres reliés par des octaèdres de zirconium, potassium entre eux.`,
      intro: `La wadéite cristallise dans les laves riches en potassium (lamproïtes).`,
      scenarios: [s("Dans une lamproïte", `Lamproïtes de Kimberley (Australie occidentale), d'où elle a été décrite.`)],
    },
    catapleiite: {
      sansForme: SF("la catapléiite forme des tablettes pseudo-hexagonales mal décrites."),
      forme: `Anneaux de trois tétraèdres reliés par des octaèdres de zirconium, sodium et eau dans les cavités.`,
      intro: `La catapléiite cristallise dans les syénites néphéliniques et leurs pegmatites.`,
      scenarios: [s("Dans une pegmatite de syénite", `Fjord de Langesund (Norvège), Mont Saint-Hilaire (Québec).`, { cond: false, sansDiagramme: PEG })],
    },
    joaquinite: {
      sansForme: SF("la joaquinite forme de petits cristaux bruns mal décrits."),
      forme: `Anneaux de quatre tétraèdres reliés par des octaèdres de titane, avec baryum et terres rares.`,
      intro: `La joaquinite accompagne la bénitoïte à San Benito (Californie).`,
      scenarios: [s("Avec la bénitoïte", `Décrite en 1909 dans les veines à bénitoïte de la chaîne de Joaquin Ridge.`)],
    },
    baotite: {
      sansForme: SF("la baotite forme des grains."),
      forme: `Anneaux de quatre tétraèdres et colonnes d'octaèdres de titane et de niobium ; baryum et chlore dans les canaux.`,
      intro: `La baotite a été décrite dans le gisement géant de terres rares de Bayan Obo (Chine).`,
      scenarios: [s("Dans le gisement de Bayan Obo", `Veines de quartz et de carbonates du plus grand gisement de terres rares du monde (Mongolie-Intérieure).`)],
    },
    beryl: {
      forme: `Le béryl a des anneaux de six tétraèdres (Si₆O₁₈) empilés en colonnes le long de c, reliés par des octaèdres d'aluminium et des
        tétraèdres de béryllium. Les anneaux superposés laissent des canaux où se logent de l'eau et des alcalins. La symétrie hexagonale
        des anneaux fait les prismes à six pans.`,
      intro: `Le béryl cristallise dans les pegmatites et les greisens ; l'émeraude, elle, naît au contact de roches riches en chrome.`,
      scenarios: [
        s("Dans une pegmatite", `Le béryllium, presque absent des minéraux du granite, se concentre dans ses derniers liquides : le béryl cristallise dans les
          pegmatites, parfois en prismes de plusieurs mètres (Madagascar, Brésil) ; en France, à Chanteloube (Haute-Vienne).`, { cond: false, sansDiagramme: PEG }, [SRC.london]),
        s("L'émeraude", `L'émeraude est un béryl coloré par le chrome ou le vanadium : il faut qu'un fluide portant le béryllium des granites rencontre une
          roche riche en chrome (serpentinite, schiste noir). En Colombie (Muzo), les émeraudes ont cristallisé à partir de saumures chaudes dans des
          schistes noirs, sans aucun granite.`, RARE("rencontre de deux sources de métaux que les diagrammes de l'atlas ne représentent pas."), [SRC.giuliani]),
      ],
    },
    bazzite: {
      forme: `Béryl où le scandium remplace l'aluminium ; bleu.`,
      intro: `La bazzite est un béryl de scandium, rare.`,
      scenarios: [s("Dans une fente alpine ou une pegmatite", `Baveno (Piémont), Val Vigezzo : petits prismes bleus dans les cavités des granites et les fentes.`, { cond: false, sansDiagramme: PEG })],
    },
    cordierite: {
      forme: `La cordiérite a des anneaux de six tétraèdres (silicium et aluminium ordonnés) empilés en canaux, reliés par du magnésium. L'ordre
        Si–Al rend la maille orthorhombique, presque hexagonale. Elle est fortement pléochroïque : bleue ou jaune selon la direction de
        regard, d'où l'idée de la « pierre de soleil » des Vikings.`,
      intro: `La cordiérite est le minéral des roches alumineuses chauffées à faible pression.`,
      scenarios: [s("Autour d'un granite", `Dans les cornéennes et les gneiss chauffés à faible profondeur (moins de 0,5 GPa), et dans les granites qui ont digéré des
        schistes. Nommée d'après le géologue français Louis Cordier.`, contact([pt(150, 0.12, 1, "Un schiste argileux repose à 4 km."), pt(600, 0.12, 2, "Un granite le chauffe vers 550–650 °C : la cordiérite cristallise.", { bande: "cordiérite" }), pt(15, 0, 3, "L'érosion met la cornéenne à jour.")]), ["pattison", "tuttle"])],
    },
    sekaninaite: {
      sansForme: SF("la sékaninaïte forme des grains et des prismes mal décrits."),
      forme: `Cordiérite où le fer ferreux remplace le magnésium.`,
      intro: `La sékaninaïte cristallise dans les granites et pegmatites riches en fer.`,
      scenarios: [s("Dans une pegmatite", `Décrite en République tchèque (Dolní Bory), en grands cristaux bleus.`, { cond: false, sansDiagramme: PEG })],
    },
    indialite: {
      sansForme: SF("l'indialite forme des grains microscopiques."),
      forme: `Forme hexagonale de la cordiérite, où silicium et aluminium sont désordonnés : elle ne se forme qu'à très haute température.`,
      intro: `L'indialite naît dans les argiles cuites par des incendies de charbon ou par des laves.`,
      scenarios: [s("Dans une argile cuite", `Décrite en Inde (Bokaro) dans des argiles cuites par la combustion naturelle d'une couche de charbon.`)],
    },
    tourmaline: {
      forme: `Les tourmalines ont des anneaux de six tétraèdres tous tournés dans le même sens le long de c, des triangles de bore et des
        octaèdres. Sans centre de symétrie, le cristal est polaire : chauffé ou pressé, il se charge électriquement aux deux bouts
        (pyro- et piézoélectricité) — les Hollandais s'en servaient pour retirer la cendre des pipes. La section en triangle bombé vient de
        la combinaison du prisme trigonal et du prisme hexagonal.`,
      intro: `Le schorl (tourmaline noire) est la tourmaline des granites et des pegmatites.`,
      scenarios: [s("Dans un granite ou une pegmatite", `Le bore, rejeté par les minéraux du granite, se concentre en fin de cristallisation : le schorl cristallise en
        aiguilles noires dans les granites, les pegmatites et les greisens (granites de Bretagne, du Limousin).`, { type: "magma", echelle: "croute", chemin: [pt(800, 0.3, 1, "Un granite riche en bore cristallise."), pt(680, 0.2, 2, "Dans les derniers liquides, le bore se concentre : le schorl cristallise.", { bande: "cristallisation" })], note: "Chemin schématique." }, ["hirschmann", SRC.london])],
    },
    dravite: {
      forme: `Tourmaline magnésienne, brune.`,
      intro: `La dravite est la tourmaline du métamorphisme des roches magnésiennes.`,
      scenarios: [s("Dans un schiste ou un marbre", `Le bore des argiles marines se recycle en dravite quand elles sont métamorphisées ; décrite dans la vallée de la Drave (Carinthie).`, meta([pt(15, 0, 1, "Une argile marine, riche en bore, se dépose."), pt(500, 0.5, 2, "Enfouie et chauffée, elle fait cristalliser la dravite.", { bande: "dravite" }), pt(15, 0, 3, "L'érosion la ramène en surface.")]), ["pattison", SRC.henry])],
    },
    elbaite: {
      forme: `Tourmaline au lithium et à l'aluminium : la seule qui puisse être presque incolore, et qui prend toutes les couleurs selon ses traces
        (manganèse rose, fer bleu ou vert). Les variations de composition pendant la croissance donnent les cristaux zonés.`,
      intro: `L'elbaïte est la tourmaline gemme des pegmatites à lithium.`,
      scenarios: [s("Dans une pegmatite à lithium", `Île d'Elbe (d'où son nom), Minas Gerais, Madagascar, Afghanistan.`, { cond: false, sansDiagramme: PEG }, [SRC.london])],
    },
    uvite: {
      forme: `Tourmaline au calcium et au magnésium.`,
      intro: `L'uvite est la tourmaline des marbres.`,
      scenarios: [s("Dans un marbre", `Marbres et skarns magnésiens (Brésil, Sri Lanka ; décrite dans la province d'Uva, Sri Lanka).`, RARE(), [SRC.henry])],
    },
    liddicoatite: {
      forme: `Tourmaline au calcium et au lithium. Ses cristaux enregistrent les changements du liquide de la pegmatite en zones concentriques
        triangulaires de toutes les couleurs.`,
      intro: `La liddicoatite est la tourmaline des pegmatites de Madagascar.`,
      scenarios: [s("Dans une pegmatite à lithium", `Anjanabonoina (Madagascar) : sciés en tranches, ses cristaux sont célèbres.`, { cond: false, sansDiagramme: PEG })],
    },
    dioptase: {
      forme: `La dioptase a des anneaux de six tétraèdres reliés par des cuivres en carré ; les molécules d'eau forment elles aussi des anneaux dans
        les canaux.`,
      intro: `La dioptase cristallise dans la zone oxydée des gisements de cuivre, sous climat sec.`,
      scenarios: [s("Dans la zone oxydée d'un gisement de cuivre", `Tsumeb (Namibie), Altyn-Tyube (Kazakhstan), Congo : l'eau de pluie, rare, oxyde le cuivre et
        apporte la silice des roches ; la dioptase cristallise dans les cavités.`, { type: "climat", domaines: [[12, 30, 0.05, 0.5]], etiquettes: [["dioptase", 21, 0.62]], villes: ["Perpignan", "Marseille"],
          chemin: [{ T: 20, ai: 0.25, n: 1, t: "Tsumeb (Namibie) : climat chaud et semi-aride." }, { n: 2, t: "L'eau rare oxyde le cuivre et apporte la silice : la dioptase cristallise dans les cavités." }],
          note: "Domaine schématique : climat aride à semi-aride." }, ["h5"])],
    },
    milarite: {
      forme: `Groupe de la milarite : doubles anneaux de douze tétraèdres empilés en colonnes, reliés par du béryllium et du calcium.`,
      intro: `La milarite cristallise dans les fentes alpines et les pegmatites.`,
      scenarios: [s("Dans une fente alpine", `Val Giuv (Grisons), d'où elle a été décrite (sous le nom erroné de Val Milar).`, { cond: false, sansDiagramme: PEG })],
    },
    osumilite: {
      sansForme: SF("l'osumilite forme de petits prismes dans les cavités des laves."),
      forme: `Doubles anneaux de douze tétraèdres, reliés par du magnésium, du fer et de l'aluminium.`,
      intro: `L'osumilite cristallise dans les laves acides et dans les granulites les plus chaudes.`,
      scenarios: [s("Dans une lave ou une granulite", `Cavités des rhyolites de la péninsule d'Osumi (Japon) ; dans les granulites de plus de 900 °C.`)],
    },
    sugilite: {
      sansForme: SF("la sugilite forme des masses violettes compactes."),
      forme: `Doubles anneaux de douze tétraèdres avec lithium, sodium, fer et manganèse.`,
      intro: `La sugilite violette est une pierre ornementale d'Afrique du Sud.`,
      scenarios: [s("Dans un gisement de manganèse", `Mine de Wessels (Kalahari) ; décrite au Japon et nommée d'après le pétrologue Ken-ichi Sugi.`)],
    },
    roedderite: {
      sansForme: SF("la rœddérite forme des grains microscopiques."),
      forme: `Doubles anneaux de douze tétraèdres reliés par du magnésium.`,
      intro: `La rœddérite a été décrite dans une météorite.`,
      scenarios: [s("Dans une météorite et des laves potassiques", `Chondrite à enstatite d'Indarch ; aussi dans des lamproïtes d'Espagne.`)],
    },
    eudialyte: {
      sansForme: SF("l'eudialyte forme des grains et des cristaux rhomboédriques mal décrits."),
      forme: `Anneaux de trois et de neuf tétraèdres, octaèdres de zirconium et anneaux d'octaèdres de calcium : une des structures minérales les
        plus complexes. Elle se dissout facilement dans les acides, d'où son nom (« bien soluble »).`,
      intro: `L'eudialyte cristallise dans les syénites néphéliniques ; c'est un minerai potentiel de zirconium et de terres rares.`,
      scenarios: [s("Dans une syénite néphélinique", `Ilímaussaq (Groenland), Khibiny et Lovozero (Kola).`)],
    },
  });
})();
