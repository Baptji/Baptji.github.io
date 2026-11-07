'use strict';
/* Interface autour de la vue 3D : frise des saisons au bout de la barre du haut (les quatre saisons à leur durée réelle,
   la saison en cours en pleine couleur, un curseur à la date du jour) et panneau « Récoltes <année> » posé sur la vue,
   qui liste ce qui est rentré à la grange cette année, culture par culture, du plus lourd au plus léger.
   Les quantités ne montent qu'à l'arrivée à la ferme : ce qui roule encore (benne, caisses en vol) n'est pas compté. */

// ---------- Saisons (dates astronomiques) ----------
const Saison = (() => {
  const NOMS = { printemps: 'Printemps', ete: 'Été', automne: 'Automne', hiver: 'Hiver' }, ORDRE = ['printemps', 'ete', 'automne', 'hiver'];
  const ciel = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="-60" width="260" height="40" fill="url(#${id})"/>`;
  // Dessins de fond (250 × 40, calés à droite) : le nom de la saison se pose sur la gauche, plus calme.
  const DESSINS = {
    printemps: ciel('sf-ciel-p', '#a7daf0', '#e8f7ee')
      + '<path d="M-60 26 Q35 19 80 24 T200 20 V40 H-60Z" fill="#a9d77f"/><path d="M60 31 Q110 25 200 28 V40 H60Z" fill="#f2d93a"/><path d="M-60 32 Q50 28 95 33 T200 34 V40 H-60Z" fill="#7cbf57"/>'
      + '<g stroke="#8a5a3a" stroke-width="2" stroke-linecap="round" fill="none"><path d="M168 33 V20"/><path d="M168 24 L162 18"/><path d="M168 22 L174 16"/></g>'
      + '<g fill="#f6c4d4"><circle cx="160" cy="15" r="6"/><circle cx="168" cy="11" r="7"/><circle cx="176" cy="15" r="6"/><circle cx="168" cy="17" r="5"/></g>'
      + '<g fill="#ee9fbb"><circle cx="163" cy="12" r="1.6"/><circle cx="172" cy="9" r="1.6"/><circle cx="175" cy="16" r="1.6"/><circle cx="165" cy="17" r="1.6"/></g>'
      + '<g fill="#fff"><circle cx="112" cy="36" r="1.2"/><circle cx="126" cy="38" r="1.2"/><circle cx="141" cy="35.5" r="1.2"/><circle cx="188" cy="37" r="1.2"/></g>'
      + '<g fill="#f7d23a"><circle cx="119" cy="38" r="1.1"/><circle cx="134" cy="36.5" r="1.1"/><circle cx="182" cy="35" r="1.1"/></g>'
      + '<path d="M128 10 q3 -3 6 0 q3 -3 6 0" stroke="#3d5560" stroke-width="1.1" fill="none" stroke-linecap="round"/>',
    ete: ciel('sf-ciel-e', '#72bfeb', '#d8f0fa')
      + '<circle cx="172" cy="13" r="12" fill="#ffe48a" opacity=".6"/><circle cx="172" cy="13" r="7.5" fill="#ffc62a"/>'
      + '<g fill="#fff" opacity=".9"><ellipse cx="118" cy="11" rx="10" ry="3.6"/><ellipse cx="124" cy="8.5" rx="6" ry="3.4"/></g>'
      + '<path d="M-60 26 Q40 20 90 25 T200 22 V40 H-60Z" fill="#9cc46a"/><path d="M-60 30 Q60 25 120 29 T200 27 V40 H-60Z" fill="#e7bd4c"/>'
      + '<g stroke="#cf9f33" stroke-width="1" fill="none"><path d="M70 40 L96 28"/><path d="M95 40 L118 29"/><path d="M120 40 L140 29"/><path d="M146 40 L162 28"/><path d="M172 40 L184 27"/></g>'
      + '<g fill="#d8352a"><circle cx="104" cy="35" r="1.3"/><circle cx="131" cy="37" r="1.3"/><circle cx="157" cy="34" r="1.3"/><circle cx="190" cy="36" r="1.3"/></g>'
      + '<g fill="#f2dd9c" stroke="#c99a3c" stroke-width=".7"><rect x="140" y="30" width="7" height="4" rx=".8"/><rect x="176" y="31" width="7" height="4" rx=".8"/></g>',
    automne: ciel('sf-ciel-a', '#f2c992', '#fbecd6')
      + '<path d="M-60 26 Q45 20 95 25 T200 22 V40 H-60Z" fill="#c88c4f"/><path d="M-60 31 Q55 27 110 31 T200 29 V40 H-60Z" fill="#9a6943"/>'
      + '<g stroke="#7f5434" stroke-width="1" fill="none"><path d="M60 34 Q120 30 200 32"/><path d="M50 37 Q120 33 200 35.5"/><path d="M40 40 Q120 36 200 39"/></g>'
      + '<g stroke="#6b4a33" stroke-width="2" stroke-linecap="round"><path d="M160 31 V19"/><path d="M182 30 V21"/></g>'
      + '<g fill="#e07a2a"><circle cx="160" cy="15" r="7"/><circle cx="155" cy="19" r="4.5"/><circle cx="165" cy="19" r="4.5"/></g><g fill="#c4502a"><circle cx="182" cy="17" r="5.5"/><circle cx="186" cy="20" r="3.5"/></g>'
      + '<g fill="#e49a2e"><ellipse cx="132" cy="14" rx="2" ry="1" transform="rotate(30 132 14)"/><ellipse cx="143" cy="25" rx="2" ry="1" transform="rotate(-25 143 25)"/>'
      + '<ellipse cx="171" cy="27" rx="2" ry="1" transform="rotate(50 171 27)"/><ellipse cx="194" cy="11" rx="2" ry="1" transform="rotate(-40 194 11)"/></g>'
      + '<g fill="#c4502a"><ellipse cx="120" cy="22" rx="1.8" ry=".9" transform="rotate(-15 120 22)"/><ellipse cx="176" cy="8" rx="1.8" ry=".9" transform="rotate(35 176 8)"/></g>',
    hiver: ciel('sf-ciel-h', '#b5cadf', '#eaf1f7')
      + '<path d="M-60 26 Q45 20 95 25 T200 22 V40 H-60Z" fill="#dfe9f3"/><path d="M-60 31 Q60 26 120 30 T200 28 V40 H-60Z" fill="#f7fafd"/><path d="M90 40 Q130 33 200 35 V40Z" fill="#d7e3ef"/>'
      + '<g stroke="#5a4a40" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M170 32 V14"/><path d="M170 22 L162 15"/><path d="M170 19 L178 12"/>'
      + '<path d="M165 17 L163 12" stroke-width="1.1"/><path d="M175 14 L180 15" stroke-width="1.1"/><path d="M170 26 L177 22" stroke-width="1.3"/></g>'
      + '<g fill="#5a4a40"><path d="M140 31 l7 -6 l7 6 Z" /><rect x="142" y="30" width="10" height="6"/></g><path d="M139 31 l8 -7 l8 7 l-2 0 l-6 -5 l-6 5Z" fill="#fff"/>'
      + '<g fill="#fff"><circle cx="112" cy="9" r="1.4"/><circle cx="126" cy="18" r="1.1"/><circle cx="138" cy="7" r="1.3"/><circle cx="152" cy="15" r="1.1"/>'
      + '<circle cx="186" cy="8" r="1.4"/><circle cx="194" cy="20" r="1.1"/><circle cx="160" cy="6" r="1"/><circle cx="118" cy="24" r="1"/></g>',
  };
  // Printemps au 20 mars, été au 21 juin, automne au 22 septembre, hiver au 21 décembre
  const cle = (mois, jour) => { const j = (mois - 1) * 100 + jour; return j >= 220 && j < 521 ? 'printemps' : j >= 521 && j < 822 ? 'ete' : j >= 822 && j < 1121 ? 'automne' : 'hiver'; };
  const J = (a, m, d) => Date.UTC(a, m, d) / 864e5;
  function annee(d) {
    const x = J(d.an, d.mois - 1, d.jour), a = x >= J(d.an, 2, 20) ? d.an : d.an - 1;
    const b = [J(a, 2, 20), J(a, 5, 21), J(a, 8, 22), J(a, 11, 21), J(a + 1, 2, 20)];
    return { durees: ORDRE.map((k, i) => b[i + 1] - b[i]), position: (x - b[0] + 0.5) / (b[4] - b[0]), cle: cle(d.mois, d.jour) };
  }
  return {
    // d : { an, mois, jour } (dateDe)
    maj(d) {
      const el = document.getElementById('saison'); if (!el) return;
      const f = annee(d);
      if (!el.querySelector('.seg')) el.innerHTML = ORDRE.map(k => `<span class="seg" data-s="${k}"><svg viewBox="-50 0 250 40" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">${DESSINS[k]}</svg><b>${NOMS[k]}</b></span>`).join('') + '<i class="curseur"></i>';
      el.querySelectorAll('.seg').forEach((s, i) => { s.style.flexGrow = f.durees[i]; s.classList.toggle('en-cours', s.dataset.s === f.cle); });
      el.querySelector('.curseur').style.left = (f.position * 100).toFixed(2) + '%';
      el.dataset.saison = f.cle; el.setAttribute('aria-label', 'Saison : ' + NOMS[f.cle]);
    },
    cle, NOMS,
  };
})();

// ---------- Récoltes de l'année, à la grange ----------
// Couleur du produit mûr, ou du feuillage quand le produit est trop pâle pour se voir (betterave, chou-fleur…)
function teinteProduit(c) {
  const m = c.coul.m || c.coul.c, n = parseInt(m.slice(1), 16), l = (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
  return l > 0.78 ? c.coul.c || c.coul.f : m;
}
const Recoltes = {
  an: null, ferme: null, lignes: new Map(),
  // kg et kcal rentrés cette année par culture, moins ce qui roule encore (enRoute : id → { kg, kcal })
  donnees(f, an, enRoute) {
    const r = f.stats.recAn?.[an] || {};
    return Object.entries(r).map(([id, q]) => ({ id, kg: Math.max(0, q.kg - (enRoute[id]?.kg || 0)), kcal: Math.max(0, q.kcal - (enRoute[id]?.kcal || 0)) }))
      .filter(l => l.kg > 0.5).sort((a, b) => b.kg - a.kg);
  },
  maj(f, an, enRoute, eclat) {
    const el = document.getElementById('recoltes'); if (!el) return;
    const ol = el.querySelector('ol'), L = this.donnees(f, an, enRoute);
    el.querySelector('h2 span').textContent = an;
    if (this.an !== an || this.ferme !== f) { this.an = an; this.ferme = f; ol.innerHTML = ''; this.lignes.clear(); }
    for (const l of L) if (!this.lignes.has(l.id)) {
      const c = CULTURE[l.id], li = document.createElement('li');
      li.innerHTML = `<span class="pt" style="background:${teinteProduit(c)}"></span><span class="nom">${c.nom}</span><b class="q"></b><span class="e"></span><span class="barre"><i style="background:${teinteProduit(c)}"></i></span>`;
      ol.appendChild(li); this.lignes.set(l.id, li);
    }
    const max = Math.max(1, ...L.map(l => l.kg));
    for (const l of L) {
      const li = this.lignes.get(l.id);
      Compteur.animer(li.querySelector('.q'), l.kg, masse, 600);
      li.querySelector('.e').textContent = nf(l.kcal / 1e6, l.kcal < 1e7 ? 1 : 0) + ' Mkcal';
      li.querySelector('.barre i').style.width = (l.kg / max * 100).toFixed(1) + '%';
    }
    el.querySelector('.total b').textContent = nf(L.reduce((s, l) => s + l.kcal, 0) / 1e6, 0) + ' Mkcal';
    el.classList.toggle('vide', !L.length);
    // retri animé : chaque ligne glisse de son ancienne place vers la nouvelle
    const avant = new Map([...this.lignes].map(([id, li]) => [id, li.getBoundingClientRect().top]));
    for (const l of L) ol.appendChild(this.lignes.get(l.id));
    if (!Anim.reduit) for (const l of L) { const li = this.lignes.get(l.id), dy = avant.get(l.id) - li.getBoundingClientRect().top; if (Math.abs(dy) > 0.5) li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' }); }
    if (eclat && this.lignes.get(eclat) && !Anim.reduit) this.lignes.get(eclat).animate([{ background: 'rgba(224,179,58,.34)' }, { background: 'rgba(224,179,58,0)' }], { duration: 900, easing: 'ease-out' });
  },
  // Ligne d'une culture (créée vide si elle n'existe pas encore) : c'est là que la caisse vole
  cible(id) {
    const el = document.getElementById('recoltes'); if (!el) return document.body;
    if (!this.lignes.has(id)) {
      const c = CULTURE[id], li = document.createElement('li');
      li.innerHTML = `<span class="pt" style="background:${teinteProduit(c)}"></span><span class="nom">${c.nom}</span><b class="q">0 kg</b><span class="e"></span><span class="barre"><i style="background:${teinteProduit(c)}"></i></span>`;
      el.querySelector('ol').appendChild(li); this.lignes.set(id, li); el.classList.remove('vide');
    }
    return this.lignes.get(id).querySelector('.q');
  },
};
