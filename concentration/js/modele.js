// Les règles du minuteur, sans rien d'affiché : reprises de Minuteur.swift et Application.swift.

/// Le compte à rebours. On ne compte pas les tics (ça dérive, et un onglet en arrière-plan est ralenti) :
/// on garde une échéance absolue et on en déduit le temps restant à chaque rafraîchissement.
export class Minuteur {
  constructor(secondes, horloge = Date.now) {
    this.total = secondes;
    this.horloge = horloge;
    this.echeance = horloge() + secondes * 1000;
    this.enPause = false;
    this.gele = secondes;
  }

  /// Secondes restantes (figées pendant la pause).
  restant() {
    return this.enPause ? this.gele : Math.max(0, (this.echeance - this.horloge()) / 1000);
  }

  progression() {
    if (this.total <= 0) return 1;
    return Math.max(0, Math.min(1, 1 - this.restant() / this.total));
  }

  get termine() {
    return !this.enPause && this.restant() <= 0;
  }

  basculerPause() {
    if (this.enPause) {
      this.echeance = this.horloge() + this.gele * 1000;
      this.enPause = false;
    } else {
      this.gele = this.restant();
      this.enPause = true;
    }
  }
}

/// « 24:59 » ou « 1:04:59 » au-delà de l'heure.
export function texte(restant) {
  const s = Math.ceil(restant - 1e-9);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const deux = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${deux(m)}:${deux(sec)}` : `${m}:${deux(sec)}`;
}

/// La durée dans le message de fin : « 1 heure », « 25 minutes ».
export function libelle(minutes) {
  if (minutes === 60) return '1 heure';
  return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

/// La durée sous le curseur « Autre durée » : « 20 min », « 1 h », « 1 h 30 ».
export function libelleCurseur(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), reste = minutes % 60;
  return reste === 0 ? `${h} h` : `${h} h ${reste}`;
}
