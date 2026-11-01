# Squid

Site : https://baptji.github.io/ — l'Atlas Sol est en `atlas/` (édition légère).

Mise à jour : `./publier.sh "message"` recopie l'édition légère de l'Atlas et envoie le site.

Licence : CC BY-NC 4.0, voir [LICENSE.md](LICENSE.md).

Accueil : les présentations sont classées de la dernière mise à jour à la plus ancienne, avec « Version N · mise à jour le … » dessous.
Ces chiffres viennent de `versions.js`, écrit par `outils/versions.py` d'après l'historique git (version = nombre de publications
du dossier). Chaque script de publication l'appelle avant de valider ; une nouvelle app = un `<article class="app" … data-app="dossier">`
dans `index.html` (copier un bloc voisin ; « En travaux » = classe `travaux` sur l'article + `<p class="chantier">`), et son script de publication doit appeler `outils/versions.py <dossier>` puis valider `versions.js` avec.

En-tête : la coupe de sol animée est dessinée par `outils/strates.py`, qui réécrit le bloc `<!-- strates -->` d'`index.html`.
