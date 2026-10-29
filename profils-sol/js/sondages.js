// Fiches sondages → Profils de sol. L'Excel de Fiches sondages (une ligne par sondage, colonnes EPAISSE_1,
// COULEUR_1… décrites dans son Regles.json) est lu tel quel, sans bibliothèque : le .xlsx est un ZIP
// de fichiers XML, décompressé par le navigateur (DecompressionStream). Un export .csv convient aussi.

import * as M from './modele.js?v=20261029212717';

// MARK: - ZIP et XML

const u16 = (o, i) => o[i] | (o[i + 1] << 8);
const u32 = (o, i) => (o[i] | (o[i + 1] << 8) | (o[i + 2] << 16) | (o[i + 3] << 24)) >>> 0;

/// Le sommaire d'une archive ZIP : nom → { methode, debut, taille }.
export function sommaireZip(octets) {
  const o = octets instanceof Uint8Array ? octets : new Uint8Array(octets);
  let fin = -1;
  for (let i = o.length - 22; i >= Math.max(0, o.length - 65557); i--) if (u32(o, i) === 0x06054b50) { fin = i; break; }
  if (fin < 0) throw new Error('pas une archive ZIP');
  const n = u16(o, fin + 10);
  let p = u32(o, fin + 16);
  const fichiers = new Map();
  const dec = new TextDecoder();
  for (let k = 0; k < n; k++) {
    if (u32(o, p) !== 0x02014b50) throw new Error('sommaire ZIP abîmé');
    const methode = u16(o, p + 10), taille = u32(o, p + 20);
    const ln = u16(o, p + 28), lx = u16(o, p + 30), lc = u16(o, p + 32), local = u32(o, p + 42);
    const nom = dec.decode(o.subarray(p + 46, p + 46 + ln));
    const debut = local + 30 + u16(o, local + 26) + u16(o, local + 28);
    fichiers.set(nom, { methode, debut, taille });
    p += 46 + ln + lx + lc;
  }
  return { o, fichiers };
}

async function extraire(zip, nom) {
  const f = zip.fichiers.get(nom);
  if (!f) return null;
  const brut = zip.o.subarray(f.debut, f.debut + f.taille);
  if (f.methode === 0) return new TextDecoder().decode(brut);
  if (f.methode !== 8) throw new Error(`compression ${f.methode} non prise en charge`);
  const flux = new Blob([brut]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new TextDecoder().decode(await new Response(flux).arrayBuffer());
}

const xml = (texte) => new DOMParser().parseFromString(texte, 'application/xml');
const tous = (n, nom) => [...n.getElementsByTagNameNS('*', nom)];
const enfants = (n, nom) => [...n.children].filter((e) => e.localName === nom);

/// « AB12 » → 27 (colonne, à partir de 0).
function colonne(ref) {
  let c = 0;
  for (const ch of String(ref).match(/^[A-Z]+/i)?.[0].toUpperCase() ?? 'A') c = c * 26 + ch.charCodeAt(0) - 64;
  return c - 1;
}

/// Toutes les feuilles d'un classeur .xlsx, chacune en tableau de lignes de textes.
export async function lireXLSX(octets) {
  const zip = sommaireZip(octets);
  const partages = [];
  const ss = await extraire(zip, 'xl/sharedStrings.xml');
  if (ss) {
    for (const si of tous(xml(ss), 'si')) {
      // Le texte de la cellule, sans les indications phonétiques (rPh).
      partages.push(tous(si, 't').filter((t) => t.parentNode.localName !== 'rPh').map((t) => t.textContent).join(''));
    }
  }
  const classeur = xml(await extraire(zip, 'xl/workbook.xml') ?? '<workbook/>');
  const rels = xml(await extraire(zip, 'xl/_rels/workbook.xml.rels') ?? '<Relationships/>');
  const cibles = new Map(tous(rels, 'Relationship').map((r) => [r.getAttribute('Id'), r.getAttribute('Target')]));
  const date1904 = tous(classeur, 'workbookPr').some((w) => ['1', 'true'].includes(w.getAttribute('date1904')));
  const feuilles = [];
  for (const sh of tous(classeur, 'sheet')) {
    const rid = sh.getAttribute('r:id') ?? [...sh.attributes].find((a) => a.localName === 'id')?.value;
    let cible = cibles.get(rid) ?? '';
    cible = cible.startsWith('/') ? cible.slice(1) : `xl/${cible.replace(/^\.\//, '')}`;
    const texte = await extraire(zip, cible);
    if (!texte) continue;
    const lignes = [];
    for (const row of tous(xml(texte), 'row')) {
      const r = Number(row.getAttribute('r')) - 1;
      const ligne = [];
      let suivante = 0;
      for (const c of enfants(row, 'c')) {
        const ref = c.getAttribute('r');
        const j = ref ? colonne(ref) : suivante;
        suivante = j + 1;
        const t = c.getAttribute('t');
        const v = enfants(c, 'v')[0]?.textContent ?? '';
        let val = '';
        if (t === 's') val = partages[Number(v)] ?? '';
        else if (t === 'inlineStr') val = tous(c, 't').map((x) => x.textContent).join('');
        else if (t === 'b') val = v === '1' ? 'VRAI' : 'FAUX';
        else if (t === 'e') val = '';
        else val = v;
        ligne[j] = val;
      }
      lignes[Number.isFinite(r) && r >= 0 ? r : lignes.length] = Array.from(ligne, (x) => x ?? '');
    }
    feuilles.push({ nom: sh.getAttribute('name') ?? `Feuille ${feuilles.length + 1}`, lignes: Array.from(lignes, (x) => x ?? []), date1904 });
  }
  return feuilles;
}

/// Un export .csv (séparateur ; , ou tabulation, guillemets à la manière d'Excel).
export function lireCSV(texte) {
  const t = String(texte).replace(/^﻿/, '');
  const premiere = t.split(/\r?\n/, 1)[0] ?? '';
  const sep = [';', '\t', ','].map((s) => [s, premiere.split(s).length]).sort((a, b) => b[1] - a[1])[0][0];
  const lignes = [];
  let ligne = [], champ = '', guillemets = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (guillemets) {
      if (c === '"' && t[i + 1] === '"') { champ += '"'; i++; }
      else if (c === '"') guillemets = false;
      else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === sep) { ligne.push(champ); champ = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      ligne.push(champ); lignes.push(ligne); ligne = []; champ = '';
    } else champ += c;
  }
  if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return [{ nom: 'CSV', lignes, date1904: false }];
}

// MARK: - Les sondages

const sansAccents = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const cle = (s) => sansAccents(s).trim().toUpperCase().replace(/\s+/g, '_');

/// « 45 », « 45,5 », « 45 cm » → nombre ; vide ou texte → NaN.
export function nombre(v) {
  const m = String(v ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}
const booleen = (v) => /^(oui|vrai|true|1|x)$/i.test(String(v ?? '').trim());

/// Codes d'arrêt de Fiches sondages (Regles.json, « arretSondage »).
export const causesArret = { 1: 'Horizon C atteint', 2: 'Horizon M, R ou D atteint', 3: 'Nappe atteinte', 5: 'Autre contrainte', 6: 'Trop sec',
  7: 'Trop fluant ou boulant', 8: 'Trop graveleux ou caillouteux', 9: 'Trop compact' };

/// Date Excel (nombre de jours depuis 1899-12-30, ou 1904-01-01) → « 12/05/2024 ».
function dateTexte(v, date1904) {
  const n = Number(v);
  if (!String(v).trim() || !Number.isFinite(n) || n < 1000) return String(v ?? '').trim();
  const d = new Date(Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 30) + Math.round(n) * 86400000);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/// La feuille des sondages : celle dont l'en-tête contient le plus de colonnes de Fiches sondages.
export function choisirFeuille(feuilles) {
  const connues = ['ID', 'ARRET_PROF', 'EPAISSE_1', 'COULEUR_1', 'PROJET', 'NAPPE_APPA', 'REDOX_DEB'];
  let meilleure = null;
  for (const f of feuilles) {
    const tete = (f.lignes.find((l) => l.some((x) => String(x).trim())) ?? []).map(cle);
    const score = connues.filter((c) => tete.includes(c)).length;
    if (!meilleure || score > meilleure.score) meilleure = { feuille: f, score };
  }
  return meilleure && meilleure.score >= 2 ? meilleure.feuille : null;
}

/// Une ligne par sondage, avec ses horizons (EPAISSE_n, COULEUR_n…).
export function lireSondages(feuille) {
  const debut = feuille.lignes.findIndex((l) => l.some((x) => String(x).trim()));
  if (debut < 0) return [];
  const tete = feuille.lignes[debut].map(cle);
  const index = new Map(tete.map((t, i) => [t, i]));
  const n = Math.max(0, ...tete.map((t) => Number(t.match(/^EPAISSE_(\d+)$/)?.[1] ?? 0)));
  const sondages = [];
  for (const l of feuille.lignes.slice(debut + 1)) {
    const v = (nom) => String(l[index.get(cle(nom))] ?? '').trim();
    const horizons = [];
    for (let k = 1; k <= n; k++) {
      const epaisseur = nombre(v(`EPAISSE_${k}`));
      if (!(epaisseur > 0)) continue;
      horizons.push({
        rang: k, epaisseur: Math.round(epaisseur), couleur: v(`COULEUR_${k}`), texture: v(`TEXTURE_${k}`),
        designation: v(`HORIZON_${k}`) || v(`NOM_${k}`) || v(`LIBELLE_${k}`) || v(`HZ_${k}`),
        hydromorphie: v(`HYDROMOR_${k}`), eg: nombre(v(`EG_ABOND_${k}`)), hcl: v(`EFFV_HCL_${k}`), commentaire: v(`COM_${k}`),
      });
    }
    const id = v('ID');
    if (!id && !horizons.length) continue;
    const cause = v('ARRET_CAUS');
    sondages.push({
      id, lot: v('LOT'), projet: v('PROJET'), mission: v('MISSION'), commune: v('COMMUNE'), date: dateTexte(v('DATE'), feuille.date1904),
      type: v('TYPE_OBS'), arret: nombre(v('ARRET_PROF')), cause: causesArret[nombre(cause)] ?? (cause === '4' || cause === '-' ? '' : cause),
      nappe: nombre(v('NAPPE_APPA')), redox: [nombre(v('REDOX_DEB')), nombre(v('REDOX_FIN'))], intensifie: booleen(v('INT_TREDOX')),
      reduc: [nombre(v('REDUC_DEB')), nombre(v('REDUC_FIN'))], geppa: v('CLASSE_GEP'), statut: v('SOL_ZH'), commentaire: v('COM_SOL'),
      horizons,
    });
  }
  return sondages;
}

export const nomSondage = (s) => (s.lot ? s.lot : s.id ? `Sondage ${s.id}` : 'Sondage');
export const profondeurSondage = (s) => Math.max(s.horizons.reduce((t, h) => t + h.epaisseur, 0), Number.isFinite(s.arret) ? s.arret : 0);

// MARK: - Des sondages aux schémas

/// La fosse d'un sondage, sur `profondeur` cm : horizons, couleurs Munsell, éléments grossiers, taches, nappe.
export function fosseDuSondage(s, profondeur) {
  const tariere = !/fosse/i.test(s.type);
  const f = M.fosse({ nom: nomSondage(s), sousTitre: [tariere ? 'Tarière' : 'Fosse', s.geppa && `GEPPA ${s.geppa}`].filter(Boolean).join(' · ') });
  for (const h of s.horizons) {
    const puce = h.couleur ? M.trouverMunsell(h.couleur) : null;
    const hz = M.horizon({ nom: `H${h.rang}`, libelle: h.designation, commentaire: h.texture, epaisseur: h.epaisseur,
      couleur: puce ? puce.hex : M.teintes[2].hex });
    if (puce) hz.munsell = puce.notation;
    f.horizons.push(hz);
    if (h.eg > 0) (f.elementsGrossiers ??= []).push(M.elementGrossier({ horizon: hz.id, abondance: Math.min(100, Math.round(h.eg)), taille: 'graviers' }));
    // HYDROMOR_n : un pourcentage écrit dans la case (« 5 % », « 40 ») devient des taches dans l'horizon.
    const pct = nombre(h.hydromorphie);
    if (pct > 0) {
      const reduit = /r[ée]duc|gley|gris/i.test(h.hydromorphie);
      (f.taches ??= []).push(M.tache({ horizon: hz.id, abondance: Math.min(100, Math.round(pct)), gris: reduit ? 90 : 50, forme: 'tachete' }));
    }
  }
  const decrit = M.epaisseurTotale(f);
  // Traits rédoxiques et horizon réductique (REDOX_deb/fin, REDUC_deb/fin), si les horizons n'en disent rien.
  if (!f.taches) {
    const plage = ([de, a]) => (Number.isFinite(de) ? [de, Number.isFinite(a) ? a : decrit] : null);
    const redox = plage(s.redox), reduc = plage(s.reduc);
    if (redox && redox[1] > redox[0]) (f.taches ??= []).push(M.tache({ de: redox[0], a: redox[1], abondance: s.intensifie ? 40 : 5, gris: 50, forme: 'marbrure' }));
    if (reduc && reduc[1] > reduc[0]) (f.taches ??= []).push(M.tache({ de: reduc[0], a: reduc[1], abondance: 100, gris: 90, forme: 'marbrure' }));
  }
  if (Number.isFinite(s.nappe)) M.fixerNappe(f, s.nappe);
  // Sous le dernier horizon décrit : non observé, hachuré.
  if (!f.horizons.length) f.horizons.push(M.horizon({ nom: 'H1', epaisseur: profondeur, couleur: '#F4F1EA', commentaire: 'non observé', nonObserve: true }));
  else if (decrit < profondeur) {
    f.horizons.push(M.horizon({ nom: `H${f.horizons.length + 1}`, epaisseur: profondeur - decrit, couleur: '#F4F1EA',
      commentaire: s.cause && Number.isFinite(s.arret) && s.arret <= decrit ? s.cause.toLowerCase() : 'non observé', nonObserve: true }));
  }
  return f;
}

const borneProfondeur = (p) => Math.max(M.profondeurMin, Math.min(M.profondeurMax, Math.round(p) || 100));

/// `mode` : 'fiches' (un schéma par sondage) ou 'ensemble' (tous les sondages sur un même schéma).
export function schemasDepuisSondages(sondages, mode = 'fiches') {
  const date = new Set(sondages.map((s) => s.date).filter(Boolean));
  if (mode === 'ensemble') {
    const profondeur = borneProfondeur(Math.max(...sondages.map(profondeurSondage)));
    const projet = sondages.find((s) => s.projet)?.projet ?? '', mission = sondages.find((s) => s.mission)?.mission ?? '';
    const s = M.schema({ titre: projet || mission || 'Sondages', profondeur,
      sousTitre: [projet && mission, `${sondages.length} sondage${sondages.length > 1 ? 's' : ''}`, date.size === 1 ? [...date][0] : ''].filter(Boolean).join(' · '),
      basDePage: 'Profils tirés de Fiches sondages' });
    s.fosses = sondages.map((x) => fosseDuSondage(x, profondeur));
    M.recaler(s);
    return [s];
  }
  return sondages.map((x) => {
    const profondeur = borneProfondeur(profondeurSondage(x));
    const s = M.schema({ titre: [nomSondage(x), x.projet].filter(Boolean).join(' · '), profondeur,
      sousTitre: [x.mission, x.commune, x.date].filter(Boolean).join(' · '),
      basDePage: [Number.isFinite(x.arret) && `Arrêt à ${x.arret} cm${x.cause ? ` : ${x.cause.toLowerCase()}` : ''}`, x.statut, x.commentaire].filter(Boolean).join('. ') });
    s.fosses = [fosseDuSondage(x, profondeur)];
    M.recaler(s);
    return s;
  });
}

/// Un fichier choisi ou déposé → { feuille, sondages } (feuille = nom de la feuille lue).
export async function lireFichierSondages(fichier) {
  const nom = fichier.name ?? '';
  const feuilles = /\.(csv|txt)$/i.test(nom) ? lireCSV(await fichier.text()) : await lireXLSX(await fichier.arrayBuffer());
  const feuille = choisirFeuille(feuilles);
  if (!feuille) throw new Error('Aucune feuille ne ressemble à un Excel de Fiches sondages (colonnes ID, ARRET_PROF, EPAISSE_1, COULEUR_1…).');
  return { feuille: feuille.nom, sondages: lireSondages(feuille) };
}
