// Données et règles pures (aucune vue, aucun DOM) : c'est ce qui permet à tests.html de tout
// vérifier sans rien afficher. Le format est celui de l'app Mac (schemas.json), si bien qu'un
// historique enregistré par l'app se relit tel quel.

// MARK: - Identifiants et dates

export function uuid() {
  if (globalThis.crypto && crypto.randomUUID) return crypto.randomUUID().toUpperCase();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16).toUpperCase();
  });
}

const maintenant = () => new Date().toISOString().replace(/\.\d+Z$/, 'Z');

// MARK: - Palette

/// Les quatre teintes du schéma d'origine, plus quelques teintes de terrain.
export const teintes = [
  { nom: 'Horizon de croissance', hex: '#4CAF7D' },
  { nom: 'Horizon de développement', hex: '#F5A623' },
  { nom: 'Écarté', hex: '#E0D8C8' },
  { nom: 'Écarté (pollution ?)', hex: '#CC4444' },
  { nom: 'Horizon organique', hex: '#3D2E22' },
  { nom: 'Humifère', hex: '#5C4A34' },
  { nom: 'Brun foncé', hex: '#6B4A2E' },
  { nom: 'Brun', hex: '#8A6A4A' },
  { nom: 'Brun clair', hex: '#A9835C' },
  { nom: 'Brun-jaune', hex: '#C9A86E' },
  { nom: 'Ocre', hex: '#C9862A' },
  { nom: 'Rouille', hex: '#B5622C' },
  { nom: 'Rougeâtre', hex: '#9C4A3A' },
  { nom: 'Horizon argileux', hex: '#8FA6C4' },
  { nom: 'Argile grise', hex: '#9AA0A6' },
  { nom: 'Horizon sableux', hex: '#D9C48A' },
  { nom: 'Sable clair', hex: '#E4D9B8' },
  { nom: 'Calcaire', hex: '#D8D2BE' },
  { nom: 'Roche mère', hex: '#9A9A9A' },
  { nom: 'Gley (réduit)', hex: '#7A8A82' },
  { nom: 'Tacheté (redoxique)', hex: '#B8A582' },
];

export function nomDeTeinte(hex) {
  const h = String(hex).toUpperCase();
  const t = teintes.find((x) => x.hex.toUpperCase() === h);
  return t ? t.nom : null;
}

// MARK: - Couleurs

/// "#RRGGBB" → composantes 0…1. Tolère l'absence de dièse et les valeurs douteuses.
export function composantes(hex) {
  let s = String(hex ?? '').trim();
  if (s.startsWith('#')) s = s.slice(1);
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return [0.5, 0.5, 0.5];
  const v = parseInt(s, 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function versHex([r, g, b]) {
  const c = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${c(r)}${c(g)}${c(b)}`;
}

const css = ([r, g, b], a = 1) => a === 1
  ? `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
  : `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;

export function luminance(hex) {
  const [r, g, b] = composantes(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/// Le contour : la même teinte en plus sombre, comme dans le schéma d'origine.
export function contour(hex) {
  return css(composantes(hex).map((x) => x * 0.6));
}

/// Encre lisible sur la teinte : blanc sur foncé, brun foncé sur clair.
export function encre(hex) {
  return luminance(hex) > 0.62 ? css([0.22, 0.16, 0.05]) : '#FFFFFF';
}

/// Encre secondaire (le commentaire), un peu en retrait.
export function encreDouce(hex) {
  return luminance(hex) > 0.62 ? css([0.45, 0.33, 0.05]) : 'rgba(255, 255, 255, 0.88)';
}

// MARK: - Données

export function horizon(o = {}) {
  return { id: uuid(), nom: 'H1', libelle: '', commentaire: '', epaisseur: 20, couleur: teintes[2].hex, ...o };
}

export function fosse(o = {}) {
  return { id: uuid(), nom: 'Fosse 1', sousTitre: '', note: '', horizons: [], ...o };
}

export function schema(o = {}) {
  return { id: uuid(), titre: '', numeroSansTitre: 1, sousTitre: '', basDePage: '', profondeur: 100,
    legende: true, fosses: [], modifie: maintenant(), ...o };
}

export const epaisseurTotale = (f) => f.horizons.reduce((s, h) => s + h.epaisseur, 0);

/// Profondeur (en cm) du haut de chaque horizon, puis du bas du dernier.
export function limites(f) {
  const v = [0];
  let cumul = 0;
  for (const h of f.horizons) { cumul += h.epaisseur; v.push(cumul); }
  return v;
}

export function nomAffiche(s) {
  const t = String(s.titre ?? '').trim();
  return t ? t : `Sans titre ${s.numeroSansTitre}`;
}

// MARK: - Opérations sur le modèle

export const profondeurMin = 20;
export const profondeurMax = 400;

/// Un schéma neuf : deux fosses, deux horizons chacune.
export function schemaNeuf(numero) {
  const s = schema({ numeroSansTitre: numero, sousTitre: 'Profil schématique 0–100 cm' });
  s.fosses = [fosseNeuve(1, s.profondeur), fosseNeuve(2, s.profondeur)];
  return s;
}

export function fosseNeuve(numero, profondeur) {
  const haut = Math.max(1, Math.floor(profondeur / 4));
  return fosse({ nom: `Fosse ${numero}`, horizons: [
    horizon({ nom: 'H1', epaisseur: haut, couleur: teintes[0].hex }),
    horizon({ nom: 'H2', epaisseur: profondeur - haut, couleur: teintes[2].hex }),
  ] });
}

/// Les horizons nommés « H1 », « H2 »… se renumérotent tout seuls ; les autres
/// (« Btg », « Ap »…) gardent le nom saisi.
export function renumeroter(f) {
  f.horizons.forEach((h, i) => { if (estNomAutomatique(h.nom)) h.nom = `H${i + 1}`; });
}

export function estNomAutomatique(nom) {
  return typeof nom === 'string' && nom[0] === 'H' && /^\d*$/.test(nom.slice(1));
}

/// Déplace la limite entre l'horizon `index` et le suivant de `delta` cm.
/// Le total de la fosse ne change jamais ; aucun horizon ne descend sous 1 cm.
export function deplacerLimite(f, index, delta, depart) {
  if (index < 0 || index + 1 >= depart.length || depart.length !== f.horizons.length) return;
  const d = Math.max(-(depart[index] - 1), Math.min(depart[index + 1] - 1, delta));
  f.horizons[index].epaisseur = depart[index] + d;
  f.horizons[index + 1].epaisseur = depart[index + 1] - d;
}

/// Fixe l'épaisseur d'un horizon en prenant (ou rendant) le complément au voisin.
export function fixerEpaisseur(f, index, valeur) {
  if (!f.horizons[index]) return;
  if (f.horizons.length < 2) { f.horizons[index].epaisseur = Math.max(1, valeur); return; }
  const voisin = index + 1 < f.horizons.length ? index + 1 : index - 1;
  const total = f.horizons[index].epaisseur + f.horizons[voisin].epaisseur;
  const v = Math.max(1, Math.min(total - 1, valeur));
  f.horizons[index].epaisseur = v;
  f.horizons[voisin].epaisseur = total - v;
}

/// Ajoute un horizon sous `index` en coupant celui-ci en deux.
export function ajouterHorizon(f, index) {
  const source = f.horizons[index];
  if (!source) return;
  if (source.epaisseur >= 2) {
    const bas = Math.floor(source.epaisseur / 2);
    source.epaisseur -= bas;
    f.horizons.splice(index + 1, 0, horizon({ nom: 'H', epaisseur: bas, couleur: teintes[2].hex }));
  } else {
    // Horizon d'1 cm : on prend le centimètre au voisin du dessus si possible.
    if (index === 0 || f.horizons[index - 1].epaisseur < 2) return;
    f.horizons[index - 1].epaisseur -= 1;
    f.horizons.splice(index + 1, 0, horizon({ nom: 'H', epaisseur: 1, couleur: teintes[2].hex }));
  }
  renumeroter(f);
}

/// Supprime un horizon ; son épaisseur revient au voisin du dessous, sinon du dessus.
export function supprimerHorizon(f, index) {
  if (f.horizons.length < 2 || !f.horizons[index]) return;
  const receveur = index + 1 < f.horizons.length ? index + 1 : index - 1;
  f.horizons[receveur].epaisseur += f.horizons[index].epaisseur;
  f.horizons.splice(index, 1);
  renumeroter(f);
}

/// Recale toutes les fosses sur la profondeur du schéma : le dernier horizon
/// s'allonge ou se raccourcit ; s'il ne peut pas, on remet tout à l'échelle.
export function recaler(s) {
  const cible = Math.max(profondeurMin, Math.min(profondeurMax, s.profondeur));
  s.profondeur = cible;
  for (const f of s.fosses) {
    if (!f.horizons.length) { f.horizons = [horizon({ nom: 'H1', epaisseur: cible })]; continue; }
    const total = epaisseurTotale(f);
    if (total === cible) continue;
    const dernier = f.horizons[f.horizons.length - 1];
    const nouvelle = dernier.epaisseur + (cible - total);
    if (nouvelle >= 1) dernier.epaisseur = nouvelle;
    else remettreALEchelle(f, cible);
  }
}

function remettreALEchelle(f, cible) {
  const total = Math.max(1, epaisseurTotale(f));
  let cumul = 0;
  for (const h of f.horizons) {
    h.epaisseur = Math.max(1, Math.round(h.epaisseur * cible / total));
    cumul += h.epaisseur;
  }
  // Le reste de l'arrondi part sur le dernier horizon assez épais.
  let reste = cible - cumul;
  while (reste !== 0) {
    let bouge = false;
    for (let i = f.horizons.length - 1; i >= 0; i--) {
      if (reste > 0) { f.horizons[i].epaisseur += 1; reste -= 1; bouge = true; }
      else if (f.horizons[i].epaisseur > 1) { f.horizons[i].epaisseur -= 1; reste += 1; bouge = true; }
      if (reste === 0) break;
    }
    if (!bouge) break;
  }
}

/// Le découpage en lignes : six colonnes au plus, puis on revient à la ligne.
/// Chaque ligne est un intervalle [début, fin[.
export function lignes(n, parLigne = 6) {
  if (n <= 0 || parLigne <= 0) return [];
  const out = [];
  for (let d = 0; d < n; d += parLigne) out.push([d, Math.min(d + parLigne, n)]);
  return out;
}

/// Les teintes réellement employées, dans l'ordre d'apparition, avec leur libellé.
export function legende(s) {
  const vues = [];
  const libelles = new Map();
  for (const f of s.fosses) {
    for (const h of f.horizons) {
      const clef = String(h.couleur).toUpperCase();
      if (!vues.includes(clef)) vues.push(clef);
      if (!libelles.has(clef) || libelles.get(clef) == null) {
        const c = String(h.commentaire ?? '').trim();
        libelles.set(clef, nomDeTeinte(clef) ?? (c ? c : null));
      }
    }
  }
  return vues.map((hex) => ({ nom: libelles.get(hex) ?? '—', hex }));
}

/// Le libellé affiché dans la légende : celui qu'on a écrit, sinon celui que la teinte suggère.
export function libelleLegende(s, t) {
  return s.libellesLegende?.[t.hex] ?? t.nom;
}

/// Revenir au libellé suggéré efface la retouche plutôt que de la figer.
export function fixerLibelleLegende(s, t, nouveau) {
  const libelles = { ...(s.libellesLegende ?? {}) };
  if (nouveau === t.nom) delete libelles[t.hex];
  else libelles[t.hex] = nouveau;
  if (Object.keys(libelles).length) s.libellesLegende = libelles;
  else delete s.libellesLegende;
}

export function supprimerFosse(s, i) {
  if (s.fosses.length < 2 || !s.fosses[i]) return;
  s.fosses.splice(i, 1);
  renommerFosses(s);
}

export function dupliquerFosse(s, i) {
  if (!s.fosses[i]) return;
  const copie = structuredClone(s.fosses[i]);
  copie.id = uuid();
  copie.horizons.forEach((h) => { h.id = uuid(); });
  s.fosses.splice(i + 1, 0, copie);
  renommerFosses(s);
}

export function ajouterFosse(s) {
  s.fosses.push(fosseNeuve(s.fosses.length + 1, s.profondeur));
}

/// « Fosse 1 », « Fosse 2 »… se renumérotent ; un nom saisi à la main est gardé.
export function renommerFosses(s) {
  s.fosses.forEach((f, i) => { if (/^Fosse \d+$/.test(f.nom)) f.nom = `Fosse ${i + 1}`; });
}

// MARK: - Mise en page

export const mise = {
  colonnesParLigne: 6,
  largeurColonne: 150,
  largeurBarre: 92,
  largeurAxe: 34,
  hauteurBarre: 440,
  margeSchema: 30,
  /// La place laissée libre par la poignée de limite, à droite, pour que le petit « + »
  /// de l'horizon reste cliquable. Le texte, lui, garde toute la largeur.
  placeDuPlus: 14,
};

/// Combien de lignes de texte tiennent dans un horizon de cette hauteur.
export function lignesTenant(hauteur) {
  return Math.max(0, Math.min(3, Math.floor((hauteur - 3) / 11)));
}

/// Largeur totale du schéma pour `n` fosses (au plus 6 colonnes de large).
export function largeur(n) {
  return Math.min(Math.max(n, 1), mise.colonnesParLigne) * mise.largeurColonne + 2 * mise.margeSchema;
}

/// La même mise en page, à l'échelle du zoom : le zoom agrandit la MISE EN PAGE, pas
/// l'image ; chaque texte est composé à sa taille finale et reste donc net.
export function miseEnPage(z = 1) {
  return {
    z,
    colonne: mise.largeurColonne * z,
    barre: mise.largeurBarre * z,
    axe: mise.largeurAxe * z,
    hauteurBarre: mise.hauteurBarre * z,
    marge: mise.margeSchema * z,
    placeDuPlus: mise.placeDuPlus * z,
    p: (v) => v * z,
    t: (v) => v * z,
    /// On raisonne toujours sur la hauteur non zoomée : le texte affiché est le même
    /// quel que soit le grossissement.
    lignesTenant: (h) => lignesTenant(h / z),
  };
}

// MARK: - Zoom

export const zoomMin = 0.4;
export const zoomMax = 3;
export const bornerZoom = (v) => Math.min(zoomMax, Math.max(zoomMin, v));

// MARK: - Fichiers

/// Un nom de fichier propre : pas de barre oblique, pas d'espaces en trop.
export function nomDeFichier(nom) {
  const net = String(nom).replaceAll('/', '-').replaceAll(':', '-').trim();
  return net || 'profil-de-sol';
}

const texte = (v, defaut = '') => (typeof v === 'string' ? v : defaut);
const entier = (v, defaut) => (Number.isFinite(v) ? Math.round(v) : defaut);

/// Relit un schéma venu du disque (app Mac ou page web) en complétant ce qui manque.
/// Retourne null si ce n'est pas un schéma.
export function relireSchema(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.fosses)) return null;
  const s = schema({
    id: texte(o.id) || uuid(),
    titre: texte(o.titre),
    numeroSansTitre: entier(o.numeroSansTitre, 1),
    sousTitre: texte(o.sousTitre),
    basDePage: texte(o.basDePage),
    profondeur: entier(o.profondeur, 100),
    legende: o.legende !== false,
    modifie: texte(o.modifie) || maintenant(),
  });
  if (o.libellesLegende && typeof o.libellesLegende === 'object') {
    const l = {};
    for (const [k, v] of Object.entries(o.libellesLegende)) if (typeof v === 'string') l[k.toUpperCase()] = v;
    if (Object.keys(l).length) s.libellesLegende = l;
  }
  s.fosses = o.fosses.filter((f) => f && typeof f === 'object').map((f) => fosse({
    id: texte(f.id) || uuid(),
    nom: texte(f.nom, 'Fosse'),
    sousTitre: texte(f.sousTitre),
    note: texte(f.note),
    horizons: (Array.isArray(f.horizons) ? f.horizons : []).filter((h) => h && typeof h === 'object').map((h) => {
      const r = horizon({
        id: texte(h.id) || uuid(),
        nom: texte(h.nom, 'H'),
        libelle: texte(h.libelle),
        commentaire: texte(h.commentaire),
        epaisseur: Math.max(1, entier(h.epaisseur, 20)),
        couleur: /^#[0-9a-fA-F]{6}$/.test(h.couleur) ? h.couleur.toUpperCase() : teintes[2].hex,
      });
      if (typeof h.munsell === 'string' && h.munsell) r.munsell = h.munsell;
      return r;
    }),
  }));
  recaler(s);
  return s;
}

/// Un fichier ouvert : un schéma seul (enregistré par la page) ou l'historique entier de l'app Mac.
export function relireFichier(texteJSON) {
  let o;
  try { o = JSON.parse(texteJSON); } catch { return []; }
  const liste = Array.isArray(o) ? o : [o];
  return liste.map(relireSchema).filter(Boolean);
}

// MARK: - Historique (bibliothèque)

/// L'historique : tous les schémas déjà faits, plus celui qu'on est en train de modifier.
/// Le stockage est injecté (localStorage dans la page, un objet en mémoire dans les tests) ;
/// toute lecture ou écriture est protégée : un navigateur privé peut tout refuser.
export class Bibliotheque {
  constructor(stockage, clef = 'profils-sol.schemas') {
    this.stockage = stockage;
    this.clef = clef;
    this.schemas = [];   // du plus récent au plus ancien
    this.charger();
    if (this.schemas.length) this.courant = this.schemas[0];
    else { this.courant = schemaNeuf(1); this.schemas = [this.courant]; }
  }

  nouveau() {
    this.enregistrer();
    const s = schemaNeuf(this.prochainNumeroSansTitre());
    this.schemas.unshift(s);
    this.courant = s;
    this.enregistrer();
  }

  ouvrir(id) {
    const s = this.schemas.find((x) => x.id === id);
    if (!s || s === this.courant) return;
    this.enregistrer();
    this.courant = s;
  }

  supprimer(id) {
    this.schemas = this.schemas.filter((x) => x.id !== id);
    if (this.courant.id === id) {
      if (this.schemas.length) this.courant = this.schemas[0];
      else { this.courant = schemaNeuf(this.prochainNumeroSansTitre()); this.schemas = [this.courant]; }
    }
    this.enregistrer();
  }

  dupliquer() {
    this.enregistrer();
    const copie = structuredClone(this.courant);
    copie.id = uuid();
    copie.numeroSansTitre = this.prochainNumeroSansTitre();
    if (copie.titre) copie.titre += ' (copie)';
    for (const f of copie.fosses) { f.id = uuid(); for (const h of f.horizons) h.id = uuid(); }
    this.schemas.unshift(copie);
    this.courant = copie;
    this.enregistrer();
  }

  /// Des schémas venus d'un fichier : ils rejoignent l'historique, le premier s'ouvre.
  importer(liste) {
    if (!liste.length) return false;
    this.enregistrer();
    for (const s of liste.slice().reverse()) {
      const deja = this.schemas.findIndex((x) => x.id === s.id);
      if (deja >= 0) this.schemas.splice(deja, 1);
      this.schemas.unshift(s);
    }
    this.courant = this.schemas[0];
    this.enregistrer();
    return true;
  }

  prochainNumeroSansTitre() {
    const pris = new Set(this.schemas.filter((s) => !String(s.titre).trim()).map((s) => s.numeroSansTitre));
    let n = 1;
    while (pris.has(n)) n += 1;
    return n;
  }

  enregistrer() {
    this.courant.modifie = maintenant();
    if (!this.schemas.includes(this.courant)) {
      const i = this.schemas.findIndex((s) => s.id === this.courant.id);
      if (i >= 0) this.schemas[i] = this.courant; else this.schemas.unshift(this.courant);
    }
    this.schemas.sort((a, b) => (a.modifie < b.modifie ? 1 : a.modifie > b.modifie ? -1 : 0));
    // Le schéma courant reste en tête même si deux enregistrements tombent dans la même seconde.
    this.schemas.splice(this.schemas.indexOf(this.courant), 1);
    this.schemas.unshift(this.courant);
    try { this.stockage?.setItem(this.clef, JSON.stringify(this.schemas)); return true; } catch { return false; }
  }

  charger() {
    try {
      const t = this.stockage?.getItem(this.clef);
      if (t) this.schemas = relireFichier(t).sort((a, b) => (a.modifie < b.modifie ? 1 : a.modifie > b.modifie ? -1 : 0));
    } catch { this.schemas = []; }
  }
}

/// Un stockage en mémoire, pour les tests (même interface que localStorage).
export function stockageMemoire() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => m.delete(k) };
}

/// Le schéma d'exemple : celui du fichier d'origine, six fosses.
export function exemple() {
  const s = schema({
    titre: 'Valorisation des matériaux — 6 fosses — Site Poudrette',
    sousTitre: 'Profil schématique 0–100 cm · Criblage 0–20 mm',
    basDePage: 'S = Sableux · SL = Sablo-limoneux · EG = éléments grossiers > 2 mm',
  });
  const [vert, orange, beige, rouge] = [teintes[0].hex, teintes[1].hex, teintes[2].hex, teintes[3].hex];
  const f = (n, sous, h) => fosse({ nom: `Fosse ${n}`, sousTitre: sous,
    horizons: h.map(([nom, commentaire, epaisseur, couleur]) => horizon({ nom, commentaire, epaisseur, couleur })) });
  s.fosses = [
    f(1, 'Route / bitume', [['H1', '', 15, beige], ['H2', 'pollution ?', 10, rouge], ['H3', '', 20, beige], ['H4', 'briques', 55, beige]]),
    f(2, 'Parking bitumé', [['H1', 'Hz croissance', 50, vert], ['H2', 'Écarté', 50, beige]]),
    f(3, 'Friche', [['H1', 'Hz croissance', 20, vert], ['H2', 'Écarté', 20, rouge], ['H3', 'Hz développement', 60, orange]]),
    f(4, 'Friche / chemin', [['H1', 'Écarté', 50, beige], ['H2', 'Hz développement', 30, orange], ['H3', 'Hz développement', 20, orange]]),
    f(5, 'Friche', [['H1', '', 10, beige], ['H2', 'Écarté', 35, beige], ['H3', '', 5, rouge], ['H4', 'Hz développement', 50, orange]]),
    f(6, 'Friche', [['H1', '', 10, vert], ['H2', 'Hz croissance', 90, vert]]),
  ];
  s.fosses[0].note = '⚠ Ne pas prioriser';
  s.fosses[0].horizons[1].libelle = 'Btg';
  s.fosses[0].horizons[0].munsell = '10YR 4/3';
  return s;
}
