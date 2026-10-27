'use strict';
/* Mécaniques de progression, simples et sans pénalité :
   - chaque récolte vaut 1 à 3 étoiles selon son rendement rapporté à la moyenne française ;
   - les étoiles font monter de niveau, et chaque niveau débloque deux cultures (cinq au départ) ;
   - le village passe des commandes (une culture, une quantité) qui rapportent étoiles et argent ;
   - le labour fait parfois remonter une trouvaille à ramasser sur le champ ;
   - un bilan s'affiche à chaque nouvel an ; quelques flèches guident les premiers gestes.
   État dans S, sauvegardé avec la partie. */

const etoilesRecolte = ratio => ratio >= 0.95 ? 3 : ratio >= 0.75 ? 2 : 1;
// Seuils : 4, 15, 35, 64, 103, 150, 208, 276, 353, 441… étoiles (le deuxième niveau vient dès la première récolte)
const seuilNiveau = n => n <= 1 ? 0 : Math.round(3.5 * Math.pow(n - 1, 2.1));
function niveauDe(e) { let n = 1; while (seuilNiveau(n + 1) <= e) n++; return n; }

// Ordre de découverte : la rotation de l'Artois d'abord (blé, orge, pomme de terre, betterave, pois)
const ORDRE = {
  champs: ['ble', 'orge', 'pdt', 'betsucre', 'pois', 'colza', 'feverole', 'avoine', 'lin', 'mais', 'epeautre', 'haricot', 'tournesol', 'carotte', 'seigle', 'lentille', 'oignon', 'triticale', 'soja', 'poischiche', 'sorgho', 'sarrasin', 'betterave', 'panais', 'haricotvert'],
  planches: ['laitue', 'radis', 'carotte', 'pdt', 'haricotvert', 'courgette', 'tomate', 'poireau', 'epinard', 'betterave', 'oignon', 'chou', 'pois', 'navet', 'potiron', 'fraise', 'echalote', 'ail', 'choufleur', 'melon', 'panais', 'artichaut', 'topinambour'],
};
const ordreMode = mode => ORDRE[MODES[mode].echelle].filter(id => cultureAutorisee(mode, CULTURE[id]));
const nbDebloquees = e => 5 + 2 * (niveauDe(e) - 1);
const culturesDebloquees = (mode, e = S.etoiles) => ordreMode(mode).slice(0, nbDebloquees(e));
const estDebloquee = (mode, id) => culturesDebloquees(mode).includes(id);
// Cultures qui arrivent au niveau n
function nouveautesNiveau(mode, n) {
  const o = ordreMode(mode), a = 5 + 2 * (n - 2);
  return n < 2 ? [] : o.slice(a, a + 2);
}

const CLIENTS = {
  ble: ['La boulangerie du village', 'Le moulin'], epeautre: ['La boulangerie du village'], orge: ['La brasserie', 'La malterie'],
  avoine: ['Le haras'], seigle: ['La boulangerie du village'], triticale: ['L’élevage voisin'], mais: ['La coopérative', 'L’élevage voisin'],
  sorgho: ['La coopérative'], sarrasin: ['La crêperie'], haricot: ['La conserverie'], lentille: ['L’épicerie'], poischiche: ['L’épicerie'],
  feverole: ['L’élevage voisin'], soja: ['La coopérative'], pois: ['La conserverie'], haricotvert: ['La conserverie', 'Le marché d’Arras'],
  colza: ['L’huilerie'], tournesol: ['L’huilerie'], lin: ['L’huilerie'], pdt: ['La friterie', 'La cantine de l’école', 'Le marché d’Arras'],
  betsucre: ['La sucrerie'], carotte: ['La cantine de l’école', 'Le marché d’Arras'],
};
const CLIENTS_DEFAUT = ['Le marché d’Arras', 'La cantine de l’école', 'L’épicerie', 'Le restaurant du bourg'];

const TROUVAILLES = [
  { id: 'silex', nom: 'Silex taillé', quand: 'il y a environ 6 000 ans' },
  { id: 'tesson', nom: 'Tesson de poterie gauloise', quand: 'il y a environ 2 100 ans' },
  { id: 'tegula', nom: 'Morceau de tuile romaine', quand: 'il y a environ 1 900 ans' },
  { id: 'monnaie', nom: 'Monnaie romaine', quand: 'IIIᵉ siècle' },
  { id: 'fibule', nom: 'Fibule en bronze', quand: 'IVᵉ siècle' },
  { id: 'liard', nom: 'Liard de Louis XIV', quand: 'XVIIᵉ siècle' },
  { id: 'cle', nom: 'Clé de grange', quand: 'XVIIIᵉ siècle' },
  { id: 'de', nom: 'Dé à coudre', quand: 'XVIIIᵉ siècle' },
  { id: 'pipe', nom: 'Pipe en terre', quand: 'XIXᵉ siècle' },
  { id: 'fer', nom: 'Fer à cheval', quand: 'XIXᵉ siècle' },
  { id: 'bille', nom: 'Bille en terre cuite', quand: 'vers 1900' },
  { id: 'bouton', nom: 'Bouton d’uniforme', quand: '1917' },
];

const Meca = {
  // Étoiles et argent déjà gagnés mais encore en vol vers leur compteur
  attente: { etoiles: 0 },

  // État ajouté aux parties (nouvelles ou anciennes)
  completer(S) {
    S.etoiles ??= 0; S.niveauVu ??= niveauDe(S.etoiles); S.commandes ??= []; S.prochaineCommande ??= S.jour;
    S.trouvailles ??= {}; S.trouvaille ??= null; S.annee ??= { an: dateDe(S.jour).an, etoiles: 0, meilleure: null };
    S.guide ??= 4; S.recentes ??= [];
  },

  // ---------- Étoiles ----------
  noterRecolte(c, ha) {
    const ratio = ha / c.rdt, n = etoilesRecolte(ratio);
    S.etoiles += n; S.annee.etoiles += n;
    if (!S.annee.meilleure || ratio > S.annee.meilleure.ratio) S.annee.meilleure = { c: c.id, ha, ratio };
    return n;
  },
  gagner(n, de) {
    S.etoiles += n; S.annee.etoiles += n;
    this.envoyerEtoiles(n, de);
  },
  // Les étoiles volent jusqu'à la pastille du niveau, qui se met à jour à leur arrivée
  envoyerEtoiles(n, de, retard = 0) {
    this.attente.etoiles += n;
    Anim.etoiles(de, n, document.getElementById('niveau'), retard, () => { this.attente.etoiles -= n; this.majNiveau(true); });
  },
  majNiveau(rebond) {
    const e = S.etoiles - this.attente.etoiles, n = niveauDe(e), a = seuilNiveau(n), b = seuilNiveau(n + 1);
    const el = document.getElementById('niveau');
    el.querySelector('.niv').textContent = n;
    Compteur.animer(el.querySelector('.etoiles b'), e, v => nf(Math.round(v)));
    el.style.setProperty('--avance', ((e - a) / (b - a)).toFixed(3));
    el.title = `Niveau ${n} · ${nf(e)} étoiles · prochain niveau à ${nf(b)}`;
    if (rebond) Compteur.rebond(el);
    if (n > S.niveauVu) { for (let k = S.niveauVu + 1; k <= n; k++) this.annoncerNiveau(k); S.niveauVu = n; }
  },
  annoncerNiveau(n) {
    const f = F(), neuves = nouveautesNiveau(f.mode, n).map(id => CULTURE[id]);
    this.bandeau(`Niveau ${n}`, neuves.length ? `Nouvelles cultures : ${neuves.map(c => c.nom.toLowerCase()).join(' et ')}` : 'Toutes les cultures sont déjà ouvertes.', neuves, null);
    noter(`Niveau ${n} atteint${neuves.length ? ` : ${neuves.map(c => c.nom.toLowerCase()).join(' et ')} à semer` : ''}.`);
    ongletSale = true;
  },

  // ---------- Commandes ----------
  moisAvantSemis: (c, mois) => Math.min(...c.semis.map(m => (m - mois + 12) % 12)),
  nouvelleCommande() {
    const f = F(), mois = dateDe(S.jour).mois, mode = MODES[f.mode];
    const enCours = new Set(Object.values(f.cases).filter(c => c.cult).map(c => c.cult));
    const deja = new Set(S.commandes.map(o => o.c));
    let choix = culturesDebloquees(f.mode).map(id => CULTURE[id]).filter(c => !deja.has(c.id) && (this.moisAvantSemis(c, mois) <= 4 || enCours.has(c.id)));
    const neuves = choix.filter(c => !S.recentes.includes(c.id));
    if (neuves.length) choix = neuves;
    if (!choix.length) return null;
    // les cultures proches de leur semis passent d'abord
    choix.sort((a, b) => (enCours.has(a.id) ? -1 : this.moisAvantSemis(a, mois)) - (enCours.has(b.id) ? -1 : this.moisAvantSemis(b, mois)));
    const c = choix[Math.floor(Math.random() * Math.min(choix.length, 3))];
    const possedees = Object.keys(f.cases).length;
    const n = Math.max(2, Math.min(12, Math.round(possedees * (0.08 + Math.random() * 0.1))));
    const kg = arrondiKg(c.rdt * 0.85 * 1000 * mode.caseHa * n);
    const clients = CLIENTS[c.id] || CLIENTS_DEFAUT;
    const jamais = !Object.values(S.fermes).some(fe => fe.stats.parCulture[c.id]);
    S.recentes = [c.id, ...S.recentes].slice(0, 4);
    return { id: 'c' + Math.random().toString(36).slice(2, 8), client: clients[Math.floor(Math.random() * clients.length)], c: c.id, kg, fait: 0,
      etoiles: 2 + (n >= 6 ? 1 : 0) + (jamais ? 1 : 0), argent: Math.max(50, Math.round(kg * c.prix * 0.5 / 10) * 10), depuis: S.jour };
  },
  // Chaque jour : une commande arrive quand une place se libère
  unJour() {
    if (S.trouvaille && S.jour > (S.trouvaille.jusque ?? Infinity)) S.trouvaille = null;   // la terre la recouvre
    if (S.commandes.length >= 3 || S.jour < S.prochaineCommande) return;
    const o = this.nouvelleCommande();
    S.prochaineCommande = S.jour + 10 + Math.floor(Math.random() * 16);
    if (!o) return;
    S.commandes.push(o); this.nouvelles = (this.nouvelles || 0) + 1;
    toast(`Nouvelle commande : ${o.client.replace(/^./, m => m.toLowerCase())} demande ${masse(o.kg)} de ${CULTURE[o.c].nom.toLowerCase()}.`);
    majBadge(); if (onglet === 'commandes') ongletSale = true;
  },
  // Une récolte remplit les commandes de la même culture (la plus ancienne d'abord)
  versCommandes(cId, kg) {
    const servies = [];
    for (const o of S.commandes) {
      if (o.c !== cId || o.fait >= o.kg || kg <= 0) continue;
      const q = Math.min(kg, o.kg - o.fait); o.fait += q; kg -= q; servies.push(o.id);
    }
    if (servies.length) majBadge();
    return servies;
  },
  livrer(id, bouton) {
    const i = S.commandes.findIndex(o => o.id === id), o = S.commandes[i];
    if (!o || o.fait < o.kg) return;
    S.commandes.splice(i, 1);
    S.argent += o.argent; S.livraisons = (S.livraisons || 0) + 1;
    S.prochaineCommande = Math.min(S.prochaineCommande, S.jour + 4 + Math.floor(Math.random() * 6));
    const r = bouton.getBoundingClientRect(), de = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    this.gagner(o.etoiles, de);
    Anim.pieces(de, document.getElementById('argent'), 8, 120, () => { majEntete(); Compteur.rebond(document.getElementById('argent')); });
    Anim.texte(de, `+${euros(o.argent)}`, '#ffe08a');
    Vie.livraison();
    noter(`Livré ${aClient(o.client)} : ${masse(o.kg)} de ${CULTURE[o.c].nom.toLowerCase()}, ${euros(o.argent)}.`);
    majBadge();
  },
  refuser(id) {
    S.commandes = S.commandes.filter(o => o.id !== id);
    S.prochaineCommande = Math.max(S.prochaineCommande, S.jour + 8);
    majBadge();
  },
  pretes: () => S.commandes.filter(o => o.fait >= o.kg).length,

  // ---------- Trouvailles ----------
  tirerTrouvaille(f, cases) {
    if (S.trouvaille || !cases.length || Math.random() > 0.07) return;
    const reste = TROUVAILLES.filter(t => !S.trouvailles[t.id]);
    if (!reste.length) return;
    const [x, y] = cases[Math.floor(Math.random() * cases.length)];
    S.trouvaille = { id: reste[Math.floor(Math.random() * reste.length)].id, ferme: f.id, x, y, jusque: S.jour + 90 };
  },
  ramasser() {
    const tr = S.trouvaille, t = TROUVAILLES.find(o => o.id === tr.id);
    S.trouvaille = null; S.trouvailles[t.id] = S.jour;
    const de = Rendu.centre(tr.x, tr.y);
    Anim.trouvaille(de, t.id, document.querySelector('[data-onglet="commandes"]'), () => Compteur.rebond(document.querySelector('[data-onglet="commandes"]')));
    this.bandeau('Trouvaille', `${t.nom} · ${t.quand}`, null, t.id);
    this.gagner(1, de);
    const n = Object.keys(S.trouvailles).length;
    noter(`Trouvaille dans un champ : ${t.nom.toLowerCase()} (${t.quand}). ${n} sur ${TROUVAILLES.length}.`);
    if (n === TROUVAILLES.length) { this.gagner(10, de); noter('Collection de trouvailles complète : dix étoiles de plus.'); }
    ongletSale = true;
  },

  // ---------- Bilan de l'année ----------
  finAnnee(an) {
    const f = F(), pa = f.stats.parAn[an], ca = f.climatAn[an], r = region(f), A = S.annee;
    S.annee = { an: an + 1, etoiles: 0, meilleure: null };
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
        <div><b data-vers="${A.etoiles}" data-f="ent">0</b><span>étoiles</span></div>
      </div>
      ${meilleure ? `<p class="bilan-ligne"><canvas width="38" height="34" data-caisse="${meilleure.id}"></canvas>Plus belle récolte : ${meilleure.nom.toLowerCase()}, ${nf(A.meilleure.ha, A.meilleure.ha < 10 ? 1 : 0)} t/ha <span class="or">${'★'.repeat(etoilesRecolte(A.meilleure.ratio))}</span></p>` : ''}
      ${temps ? `<p class="bilan-temps">${temps}${pluie != null ? ` · ${nf(pluie)} mm de pluie` : ''}</p>` : ''}`;
    for (const cv of el.querySelectorAll('canvas[data-caisse]')) cv.getContext('2d').drawImage(Anim.spriteCaisse(CULTURE[cv.dataset.caisse]), 0, 0);
    el.hidden = false; Compteur.rebond(el, 'entree');
    const fmt = { masse: v => masse(v), pers: v => nf(v, v < 10 ? 1 : 0), ent: v => nf(Math.round(v)) };
    el.querySelectorAll('[data-vers]').forEach((b, i) => setTimeout(() => { b._valeur = 0; Compteur.animer(b, +b.dataset.vers, fmt[b.dataset.f], 1100); }, 250 + i * 180));
    clearTimeout(this._bilan); this._bilan = setTimeout(() => this.fermerBilan(), 7500);
  },
  fermerBilan() { const el = document.getElementById('bilan'); if (el.hidden) return; el.classList.add('sortie'); setTimeout(() => { el.hidden = true; el.classList.remove('sortie', 'entree'); }, 320); },

  // ---------- Bandeau (niveau, trouvaille) ----------
  file: [], bandeauOccupe: false,
  bandeau(titre, texte, cultures, trouvaille) {
    this.file.push({ titre, texte, cultures, trouvaille });
    if (!this.bandeauOccupe) this.suivant();
  },
  suivant() {
    const b = this.file.shift(), el = document.getElementById('bandeau');
    if (!b) { this.bandeauOccupe = false; return; }
    this.bandeauOccupe = true;
    el.innerHTML = `<div class="bandeau-icones">${(b.cultures || []).map(c => `<canvas width="48" height="48" data-icone="${c.id}"></canvas>`).join('')}${b.trouvaille ? `<canvas width="16" height="16" data-trouvaille="${b.trouvaille}"></canvas>` : ''}</div>
      <div><b>${b.titre}</b><span>${b.texte}</span></div>`;
    for (const cv of el.querySelectorAll('canvas[data-icone]')) icone(cv, CULTURE[cv.dataset.icone]);
    for (const cv of el.querySelectorAll('canvas[data-trouvaille]')) trouvailleIcone(cv.getContext('2d'), 0, 0, cv.dataset.trouvaille);
    el.hidden = false; el.classList.remove('sortie'); Compteur.rebond(el, 'entree');
    const r = el.getBoundingClientRect();
    if (b.cultures) Anim.confettis(r.left + r.width / 2, r.top + r.height / 2, 70);
    setTimeout(() => { el.classList.add('sortie'); setTimeout(() => { el.hidden = true; this.suivant(); }, 380); }, 3600);
  },

  // ---------- Premiers pas ----------
  // 0 choisir une commande, 1 semer un champ, 2 accélérer le temps, 3 récolter, 4 fini
  guide() {
    const el = document.getElementById('guide');
    if (S.guide >= 4 || !install.hidden) { el.hidden = true; return; }
    let cible = null, txt = '';
    if (S.guide === 0) { cible = document.querySelector('.commande:not(.attente)'); txt = 'Choisissez une commande'; if (!cible || onglet !== 'commandes') { cible = document.querySelector('[data-onglet="commandes"]'); } }
    else if (S.guide === 1) {
      const f = F(), pl = planDe(f);
      const libre = Object.keys(f.cases).find(k => !f.cases[k].cult);
      if (libre) { const [x, y] = libre.split(',').map(Number), p = Rendu.centre(x, y); this.placer(el, p.x, p.y - 10, 'Cliquez un champ pour semer'); return; }
      S.guide = 2;
    }
    if (S.guide === 2) { cible = document.querySelector('[data-vitesse="10"]'); txt = 'Accélérez le temps'; }
    if (S.guide === 3) {
      const m = Rendu.murs[0];
      if (m) { const p = Rendu.centre(m[0], m[1]); this.placer(el, p.x, p.y - 10, 'Cliquez pour récolter'); return; }
      el.hidden = true; return;
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
  avancerGuide(etape) { if (S.guide === etape) { S.guide = etape + 1; this.guide(); } },

  // ---------- Onglet « Commandes » ----------
  vue() {
    const f = F(), jours = Math.max(0, S.prochaineCommande - S.jour);
    let html = '<h3>Commandes du village</h3><div class="commandes">';
    for (const o of S.commandes) {
      const c = CULTURE[o.c], pret = o.fait >= o.kg, part = Math.min(1, o.fait / o.kg);
      html += `<article class="commande${pret ? ' prete' : ''}" data-commande="${o.id}" title="Cliquez pour semer : ${c.nom.toLowerCase()}">
        <canvas width="38" height="34" data-caisse="${o.c}"></canvas>
        <div class="cmd-corps">
          <span class="client">${o.client}</span>
          <b>${masse(o.kg)} de ${c.nom.toLowerCase()}</b>
          <span class="barre"><span style="--part:${part.toFixed(3)}"></span></span>
          <span class="cmd-bas"><span>${pret ? 'Prête à livrer' : `${masseBas(o.fait)} sur ${masse(o.kg)}`}</span><span class="gain"><span class="or">+${o.etoiles} ★</span> · ${euros(o.argent)}</span></span>
        </div>
        ${pret ? '<button class="livrer" data-action="livrer">Livrer</button>' : '<button class="refuser" data-action="refuser" title="Refuser cette commande" aria-label="Refuser">×</button>'}
      </article>`;
    }
    if (S.commandes.length < 3) html += `<div class="commande attente"><span class="sablier"></span>${jours > 0 ? `Prochaine commande dans ${jours} jour${jours > 1 ? 's' : ''}` : 'Une commande arrive bientôt'}</div>`;
    html += '</div>';
    const prochaines = ordreMode(f.mode).slice(nbDebloquees(S.etoiles), nbDebloquees(S.etoiles) + 2);
    if (prochaines.length) html += `<p class="ligne2 prochain">Au niveau ${niveauDe(S.etoiles) + 1} : ${prochaines.map(id => CULTURE[id].nom.toLowerCase()).join(' et ')}.</p>`;
    html += '<h3>Objectifs</h3><ul class="objectifs">';
    for (const o of OBJECTIFS) html += `<li class="${S.objectifs[o.id] ? 'fait' : ''}"><span class="coche">${S.objectifs[o.id] ? '✓' : ''}</span>${o.txt}<span class="or petit">+3 ★</span></li>`;
    html += `</ul><h3>Trouvailles <span class="compte">${Object.keys(S.trouvailles).length} sur ${TROUVAILLES.length}</span></h3><div class="trouvailles">`;
    for (const t of TROUVAILLES) html += `<span class="trouvaille${S.trouvailles[t.id] ? ' vue' : ''}" title="${S.trouvailles[t.id] ? `${t.nom} · ${t.quand}` : 'Pas encore trouvée'}"><canvas width="16" height="16" data-trouvaille="${t.id}"></canvas></span>`;
    html += '</div>';
    const tt = total();
    html += `<h3>Toutes les fermes</h3><p class="ligne2">${masse(tt.kg)} récoltées, ${energie(tt.kcal)}, de quoi nourrir ${nf(personnesAn(tt.kcal), 1)} personnes pendant un an.</p>
      <h3>Journal</h3><ol class="journal-complet">${S.journal.map(n => `<li><span>${n.d}</span> ${n.txt}</li>`).join('')}</ol>`;
    return html;
  },
  apresVue(vue) {
    for (const cv of vue.querySelectorAll('canvas[data-caisse]')) { const g = cv.getContext('2d'); g.clearRect(0, 0, 38, 34); g.drawImage(Anim.spriteCaisse(CULTURE[cv.dataset.caisse]), 0, 0); }
    for (const cv of vue.querySelectorAll('canvas[data-trouvaille]')) trouvailleIcone(cv.getContext('2d'), 0, 0, cv.dataset.trouvaille);
  },
};

// « à » + client : au marché, à la sucrerie, à l'huilerie, aux…
const aClient = c => c.replace(/^Les /, 'aux ').replace(/^Le /, 'au ').replace(/^La /, 'à la ').replace(/^L’/, 'à l’');
// Masse arrondie par défaut, pour ne jamais afficher « 18 t sur 18 t » avant que la commande soit remplie
const masseBas = kg => kg >= 1e4 ? nf(Math.floor(kg / 1000)) + ' t' : kg >= 1000 ? nf(Math.floor(kg / 100) / 10, 1) + ' t' : nf(Math.floor(kg)) + ' kg';
function arrondiKg(kg) {
  const pas = kg >= 50000 ? 5000 : kg >= 10000 ? 1000 : kg >= 2000 ? 500 : kg >= 500 ? 100 : 20;
  return Math.max(pas, Math.round(kg / pas) * pas);
}
// Pastille sur l'onglet des commandes : commandes prêtes à livrer, ou nouvelles
function majBadge() {
  const b = document.querySelector('[data-onglet="commandes"] .pastille'); if (!b || !S) return;
  const n = Meca.pretes(), neuves = onglet === 'commandes' ? 0 : (Meca.nouvelles || 0);
  b.textContent = n || neuves || ''; b.hidden = !(n || neuves); b.classList.toggle('prete', n > 0);
}
