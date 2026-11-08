'use strict';
/* Progression et marché, simples et sans pénalité :
   - la récolte rejoint le stock de la ferme, en lots qui se gardent la durée de leur culture ;
   - la vente, culture par culture, rapporte l'argent et l'expérience (seule source d'expérience) ;
   - un lot invendu part seul la veille de sa péremption ; le prix de chaque culture est tiré au 1er janvier pour l'année ;
   - l'expérience fait monter de niveau, et chaque niveau débloque deux cultures (cinq au départ) ;
   - un bilan s'affiche à chaque nouvel an ; quelques flèches guident les premiers gestes.
   État dans S, sauvegardé avec la partie. */

// Expérience : 10 pour un hectare à rendement moyen vendu. Seuils : 40, 150, 350, 640, 1 030, 1 500…
const gainExp = (c, t) => Math.max(1, Math.round(t * 10 / c.rdt));
const seuilNiveau = n => n <= 1 ? 0 : Math.round(3.5 * Math.pow(n - 1, 2.1)) * 10;
function niveauDe(e) { let n = 1; while (seuilNiveau(n + 1) <= e) n++; return n; }

// Ordre de découverte : la rotation de l'Artois d'abord (blé, orge, pomme de terre, betterave, pois)
const ORDRE = {
  champs: ['ble', 'orge', 'pdt', 'betsucre', 'pois', 'prairie', 'colza', 'feverole', 'miscanthus', 'avoine', 'luzerne', 'lin', 'escourgeon', 'mais', 'epeautre', 'bledur', 'haricot', 'tournesol', 'maisfourrage', 'carotte', 'poisprot', 'seigle', 'lentille', 'chanvre', 'oignon', 'triticale', 'linfibre', 'soja', 'moutarde', 'poischiche', 'sorgho', 'chicoree', 'sarrasin', 'betterave', 'lupin', 'panais', 'haricotvert'],
  planches: ['laitue', 'radis', 'carotte', 'pdt', 'haricotvert', 'courgette', 'tomate', 'poireau', 'epinard', 'betterave', 'oignon', 'chou', 'pois', 'navet', 'potiron', 'fraise', 'echalote', 'ail', 'choufleur', 'melon', 'panais', 'artichaut', 'topinambour'],
};
const ordreMode = mode => ORDRE[MODES[mode].ordre].filter(id => cultureAutorisee(mode, CULTURE[id]));
const nbDebloquees = e => 5 + 2 * (niveauDe(e) - 1);
const culturesDebloquees = (mode, e = S.exp) => ordreMode(mode).slice(0, nbDebloquees(e));
const estDebloquee = (mode, id) => culturesDebloquees(mode).includes(id);
// Cultures qui arrivent au niveau n
function nouveautesNiveau(mode, n) {
  const o = ordreMode(mode), a = 5 + 2 * (n - 2);
  return n < 2 ? [] : o.slice(a, a + 2);
}

// [amplitude du tirage annuel du prix (± %), conservation (mois)], maquette validée du 8 novembre
const MARCHE = {
  ble: [25, 48], epeautre: [25, 48], orge: [25, 48], avoine: [25, 36], seigle: [25, 48], triticale: [25, 48], mais: [25, 36], sorgho: [25, 36], sarrasin: [25, 24],
  haricot: [20, 30], lentille: [20, 30], poischiche: [20, 30], feverole: [20, 30], soja: [20, 24], pois: [15, 0.1], haricotvert: [15, 0.2],
  colza: [25, 24], tournesol: [25, 12], lin: [25, 24],
  pdt: [45, 7], betsucre: [10, 2], topinambour: [35, 5], carotte: [35, 6], panais: [35, 5], betterave: [35, 6], radis: [35, 0.25], navet: [35, 3], oignon: [35, 7], echalote: [35, 9], ail: [35, 9],
  laitue: [35, 0.2], epinard: [35, 0.15], poireau: [35, 5], chou: [35, 4], choufleur: [35, 0.5], artichaut: [35, 0.3],
  tomate: [30, 0.4], courgette: [30, 0.3], potiron: [30, 5], melon: [30, 0.3], fraise: [30, 0.07],
  bledur: [25, 48], escourgeon: [25, 48], poisprot: [20, 30], lupin: [20, 30], moutarde: [25, 24], chicoree: [20, 2], chanvre: [20, 24], linfibre: [25, 24],
  maisfourrage: [15, 12], prairie: [15, 12], luzerne: [15, 12], miscanthus: [15, 24],
};
// Suite pseudo-aléatoire reproductible : même partie, même année, même culture, même prix
function suiteDe(texte) {
  let h = 2166136261;
  for (const ch of texte) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Prix de l'année en €/t : tirage triangulaire autour du prix moyen ; e = écart relatif à la moyenne
function prixAnnee(c, an = dateDe(S.jour).an) {
  const r = suiteDe(`${S.fermes[0].graine}:${an}:${c.id}`), e = (r() + r() - 1) * MARCHE[c.id][0] / 100;
  return { p: Math.round(c.prix * 1000 * (1 + e)), e };
}
// Ce qui est en grange (kg) : ce qui roule encore vers la ferme ne compte pas
const stockTotal = (f, id) => (f.lots[id] || []).reduce((s, l) => s + l.kg, 0);
const vendable = (f, id) => Math.max(0, stockTotal(f, id) - (f === F() ? attente.parC[id]?.kg || 0 : 0));
const culturesEnGrange = f => Object.keys(f.lots).filter(id => vendable(f, id) >= 0.5);

const Meca = {
  // Expérience déjà gagnée mais encore en vol vers son compteur
  attente: { exp: 0 },

  // État ajouté aux parties neuves
  completer(S) {
    S.exp ??= 0; S.niveauVu ??= niveauDe(S.exp);
    S.annee ??= { an: dateDe(S.jour).an, exp: 0, meilleure: null };
    S.guide ??= 1;
  },

  // ---------- Récolte et stock ----------
  noterRecolte(c, ha) {
    const ratio = ha / c.rdt;
    if (!S.annee.meilleure || ratio > S.annee.meilleure.ratio) S.annee.meilleure = { c: c.id, ha, ratio };
  },
  dureeGarde: c => Math.max(1, Math.round(MARCHE[c.id][1] * 30.4)),
  // route : le lot roule encore vers la ferme ; sa conservation ne commence qu'à l'arrivée
  ajouterLot(f, c, kg, route) {
    const fin = S.jour + this.dureeGarde(c), L = f.lots[c.id] ??= [], m = L.find(l => l.fin === fin && !l.route === !route);
    if (m) m.kg += kg; else L.push(route ? { kg, fin, route } : { kg, fin });
    (f.produits ??= {})[c.id] = 1;
  },
  arrivee(f, c) {
    const encore = (attente.parC[c.id]?.kg || 0) > 0.5;
    for (const l of f.lots[c.id] || []) if (l.route) { l.fin = S.jour + this.dureeGarde(c); if (!encore) delete l.route; }
  },
  // Temps de conservation restant du lot le plus ancien
  resteGarde(f, id) {
    const r = Math.min(...f.lots[id].map(l => l.fin)) - S.jour;
    return { court: r <= 15, txt: r <= 1 ? 'dernier jour' : r < 60 ? `encore ${r} jours` : r < 730 ? `encore ${Math.round(r / 30)} mois` : `encore ${nf(r / 365)} ans` };
  },

  // ---------- Vente ----------
  // Les lots les plus anciens partent d'abord ; argent et expérience sont acquis tout de suite (l'affichage suit)
  vendre(f, id, kg) {
    const c = CULTURE[id], t = kg / 1000, val = Math.round(t * prixAnnee(c).p), g = gainExp(c, t), L = f.lots[id];
    for (let r = kg; r > 1e-6 && L.length;) { const q = Math.min(r, L[0].kg); L[0].kg -= q; r -= q; if (L[0].kg <= 1e-6) L.shift(); }
    if (!L.length) delete f.lots[id];
    S.argent += val; S.exp += g; S.annee.exp += g; f.ventes = (f.ventes || 0) + val;
    if (S.guide < 5) S.guide = 5;
    return { val, g };
  },
  // Bouton « Vendre » : tout ce qui est en grange pour cette culture
  vendreTout(id, bouton) {
    const f = F(), kg = vendable(f, id);
    if (kg < 0.5) return;
    const { g } = this.vendre(f, id, kg), r = bouton.getBoundingClientRect(), de = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    this.attente.exp += g;
    Anim.experience(de, g, document.getElementById('niveau'), () => { this.attente.exp -= g; this.majNiveau(true); });
    Anim.pieces(de, document.getElementById('argent'), 8, 120, () => { majEntete(); Compteur.rebond(document.getElementById('argent')); });
    Vie.livraison();
  },
  // Chaque jour : ce qui se perdrait demain part au prix de l'année
  unJour() {
    let vendu = false;
    for (const f of S.fermes) for (const id of Object.keys(f.lots)) {
      const aVendre = f.lots[id].reduce((s, l) => l.fin - 1 <= S.jour ? s + l.kg : s, 0);
      if (!aVendre) continue;
      const kg = Math.min(aVendre, vendable(f, id));
      if (kg < 0.5) { if (stockTotal(f, id) < 0.5) delete f.lots[id]; continue; }   // encore sur la route : ce sera pour demain
      const { val } = this.vendre(f, id, kg);
      vendu = true;
      if (f === F()) toast(`Vente automatique : ${masse(kg)} ${deCulture(CULTURE[id])}, ${euros(val)}`);
    }
    if (vendu) { this.majNiveau(true); recolteChangee(); }
  },

  // ---------- Niveau ----------
  majNiveau(rebond) {
    const e = S.exp - this.attente.exp, n = niveauDe(e), a = seuilNiveau(n), b = seuilNiveau(n + 1);
    const el = document.getElementById('niveau');
    el.querySelector('.niv').textContent = n;
    Compteur.animer(el.querySelector('.exp b'), e, v => nf(Math.round(v)));
    el.style.setProperty('--avance', ((e - a) / (b - a)).toFixed(3));
    el.title = `Niveau ${n} · ${nf(e)} d’exp. · prochain niveau à ${nf(b)}`;
    if (rebond) Compteur.rebond(el);
    if (n > S.niveauVu) { for (let k = S.niveauVu + 1; k <= n; k++) this.annoncerNiveau(k); S.niveauVu = n; }
  },
  annoncerNiveau(n) {
    const f = F(), neuves = [...new Set([...new Set(Object.values(f.cases).map(t => t.mode))].flatMap(m => nouveautesNiveau(m, n)))].map(id => CULTURE[id]);
    this.bandeau(`Niveau ${n}`, neuves.length ? `Nouvelles cultures : ${neuves.map(c => c.nom.toLowerCase()).join(' et ')}` : 'Toutes les cultures sont déjà ouvertes.', neuves);
    ongletSale = true;
  },

  // ---------- Bilan de l'année ----------
  finAnnee(an) {
    const f = F(), pa = f.stats.parAn[an], ca = f.climatAn[an], r = region(f), A = S.annee;
    S.annee = { an: an + 1, exp: 0, meilleure: null };
    if (!pa || !pa.kg) return;
    const meilleure = A.meilleure && CULTURE[A.meilleure.c];
    const complet = ca && ca.n >= 360, pluie = complet ? ca.pluie : null, tmoy = complet ? ca.t / ca.n : null;
    let temps = '';
    if (pluie != null) temps = pluie < r.pRef * 0.8 ? 'Année sèche' : pluie > r.pRef * 1.2 ? 'Année humide' : 'Pluie dans la normale';
    if (tmoy != null) temps += ` · ${tmoy - r.tRef >= 0 ? '+' : '−'}${nf(Math.abs(tmoy - r.tRef), 1)} °C par rapport à 1961-1990`;
    const el = document.getElementById('bilan');
    el.innerHTML = `<div class="bilan-an">${an}</div>
      <div class="bilan-chiffres">
        <div><b data-vers="${pa.kg}" data-f="masse">0</b><span>récoltées</span></div>
        <div><b data-vers="${personnesAn(pa.kcal)}" data-f="pers">0</b><span>personnes nourries un an</span></div>
        <div><b data-vers="${A.exp}" data-f="ent">0</b><span>d’expérience</span></div>
      </div>
      ${meilleure ? `<p class="bilan-ligne"><canvas width="38" height="34" data-caisse="${meilleure.id}"></canvas>Plus belle récolte : ${meilleure.nom.toLowerCase()}, ${nf(A.meilleure.ha, A.meilleure.ha < 10 ? 1 : 0)} t/ha</p>` : ''}
      ${temps ? `<p class="bilan-temps">${temps}${pluie != null ? ` · ${nf(pluie)} mm de pluie` : ''}</p>` : ''}`;
    for (const cv of el.querySelectorAll('canvas[data-caisse]')) cv.getContext('2d').drawImage(Anim.spriteCaisse(CULTURE[cv.dataset.caisse]), 0, 0);
    el.hidden = false; Compteur.rebond(el, 'entree');
    const fmt = { masse: v => masse(v), pers: v => nf(v, v < 10 ? 1 : 0), ent: v => nf(Math.round(v)) };
    el.querySelectorAll('[data-vers]').forEach((b, i) => setTimeout(() => { b._valeur = 0; Compteur.animer(b, +b.dataset.vers, fmt[b.dataset.f], 1100); }, 250 + i * 180));
    clearTimeout(this._bilan); this._bilan = setTimeout(() => this.fermerBilan(), 7500);
  },
  fermerBilan() { const el = document.getElementById('bilan'); if (el.hidden) return; el.classList.add('sortie'); setTimeout(() => { el.hidden = true; el.classList.remove('sortie', 'entree'); }, 320); },

  // ---------- Bandeau (niveau, champ débloqué) ----------
  file: [], bandeauOccupe: false,
  bandeau(titre, texte, cultures) {
    this.file.push({ titre, texte, cultures });
    if (!this.bandeauOccupe) this.suivant();
  },
  suivant() {
    const b = this.file.shift(), el = document.getElementById('bandeau');
    if (!b) { this.bandeauOccupe = false; return; }
    this.bandeauOccupe = true;
    el.innerHTML = `<div class="bandeau-icones">${(b.cultures || []).map(c => `<canvas width="48" height="48" data-icone="${c.id}"></canvas>`).join('')}</div>
      <div><b>${b.titre}</b><span>${b.texte}</span></div>`;
    for (const cv of el.querySelectorAll('canvas[data-icone]')) icone(cv, CULTURE[cv.dataset.icone]);
    el.hidden = false; el.classList.remove('sortie'); Compteur.rebond(el, 'entree');
    const r = el.getBoundingClientRect();
    if (b.cultures) Anim.confettis(r.left + r.width / 2, r.top + r.height / 2, 70);
    setTimeout(() => { el.classList.add('sortie'); setTimeout(() => { el.hidden = true; this.suivant(); }, 380); }, 3600);
  },

  // ---------- Premiers pas ----------
  // 1 semer un champ, 2 accélérer le temps, 3 récolter, 4 vendre, 5 fini
  guide() {
    const el = document.getElementById('guide');
    if (S.guide >= 5 || !install.hidden) { el.hidden = true; return; }
    let cible = null, txt = '';
    if (S.guide === 1) {
      const f = F();
      const libre = Object.keys(f.cases).find(k => !creneaux(f.cases[k]).some(s => s.cult));
      if (libre) { const [x, y] = libre.split(',').map(Number), p = Rendu.centre(x, y); this.placer(el, p.x, p.y - 10, 'Cliquez un champ, puis Semer'); return; }
      S.guide = 2;
    }
    if (S.guide === 2) { cible = document.querySelector('[data-vitesse="10"]'); txt = 'Accélérez le temps'; }
    if (S.guide === 3) {
      const m = Rendu.murs[0];
      if (m) { const p = Rendu.centre(m[0], m[1]); this.placer(el, p.x, p.y - 10, 'Cliquez le champ, puis Récolter'); return; }
      if (culturesEnGrange(F()).length) S.guide = 4; else { el.hidden = true; return; }
    }
    if (S.guide === 4) {
      if (!culturesEnGrange(F()).length) { el.hidden = true; return; }
      cible = (onglet === 'recolte' && !carnetOuvert && document.querySelector('.vente')) || document.querySelector('[data-onglet="recolte"]');
      txt = 'Vendez votre récolte';
    }
    if (!cible) { el.hidden = true; return; }
    const r = cible.getBoundingClientRect();
    this.placer(el, r.left + r.width / 2, r.top - 4, txt);
  },
  placer(el, x, y, txt) {
    if (el.firstChild?.textContent !== txt) el.innerHTML = `<span>${txt}</span>`;
    el.hidden = false;
    el.style.left = Math.max(70, Math.min(innerWidth - 70, x)) + 'px'; el.style.top = y + 'px';
  },
};
