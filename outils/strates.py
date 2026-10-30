#!/usr/bin/env python3
"""Dessine les strates de l'en-tête de l'accueil : cinq couches de sol aux limites plissées, chacune dans son propre <svg>,
pour que le navigateur les anime sur la carte graphique (montée à l'ouverture, décalage au défilement) sans jamais les redessiner.
Détails : herbe et racines en surface, galets, une ammonite, un calmar fossile (le « Squid » du site) et des améthystes.
Chaque couche descend sous la suivante (chevauchement) : au défilement, les couches hautes glissent derrière les basses sans trou.
Réécrit le bloc compris entre <!-- strates --> et <!-- /strates --> d'index.html.   Usage : outils/strates.py"""
import math, pathlib, random, re

SITE = pathlib.Path(__file__).resolve().parent.parent
L, H = 2400, 420                      # boîte de dessin, recadrée au centre selon la largeur de l'écran (xMidYMax slice)
CHEVAUCHEMENT = 80
rnd = random.Random(7)                # même dessin à chaque passage


def pli(x):                           # plissement commun à toutes les limites
    t = 2 * math.pi * x
    return 16 * math.sin(t / 1500 + .9) + 9 * math.sin(t / 700 + 2.3) + 3.5 * math.sin(t / 330 + .4)


LIMITES = [  # profondeur moyenne, part du plissement, ondulation propre (amplitude, longueur d'onde, phase) ; la première = la surface
    (96, 1.15, 5, 420, 1.1), (150, .95, 4, 520, .2), (205, .8, 5, 610, 2.0),
    (262, .7, 4, 480, 1.3), (318, .6, 3, 550, 2.7), (372, .5, 3, 600, .8)]


def limite(k, x):
    p, a, b, lo, ph = LIMITES[k]
    return p + a * pli(x) + b * math.sin(2 * math.pi * x / lo + ph)


def pt(x, y): return "%g,%g" % (round(x, 1), round(y, 1))


def courbe(f, sens=1, pas=50):
    """Chemin lissé (Catmull-Rom → Bézier) qui suit f de -80 à L+80 ; renvoie (premier point, suite de « C »)."""
    xs = list(range(-80, L + 81, pas))[::sens]
    P = [(x, f(x)) for x in xs]
    d = []
    for i in range(len(P) - 1):
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
        d.append("C%s %s %s" % (pt(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6),
                                pt(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6), pt(*p2)))
    return pt(*P[0]), " ".join(d)


def bande(k):
    d0, d = courbe(lambda x: limite(k, x))
    if k + 1 < len(LIMITES):
        b0, b = courbe(lambda x: limite(k + 1, x) + CHEVAUCHEMENT, sens=-1)
        return "M%s %s L%s %s Z" % (d0, d, b0, b)
    return "M%s %s L%d,%d L-80,%d Z" % (d0, d, L + 80, H + 40, H + 40)


def dans(k, x, marge=10):             # une hauteur prise au hasard à l'intérieur de la bande k, loin des limites
    return rnd.uniform(limite(k, x) + marge, limite(k + 1, x) - marge)


def galets(k, n, x0=150, x1=L - 150):
    out = []
    for _ in range(n):
        x = rnd.uniform(x0, x1)
        y = dans(k, x, 12)
        out.append('<ellipse cx="%.0f" cy="%.0f" rx="%.1f" ry="%.1f" transform="rotate(%.0f %.0f %.0f)"/>'
                   % (x, y, rnd.uniform(4, 10), rnd.uniform(2.6, 5.5), rnd.uniform(-25, 25), x, y))
    return '<g class="galets">%s</g>' % "".join(out)


def surface():
    herbe = "M%s %s" % courbe(lambda x: limite(0, x))
    touffes, racines = [], []
    x = 20.0
    while x < L:
        y = limite(0, x) - 2
        h = rnd.uniform(9, 15)
        touffes.append("M%s l-5,-%.0f M%s l0,-%.0f M%s l5,-%.0f" % (pt(x, y), h * .75, pt(x, y), h, pt(x, y), h * .7))
        x += rnd.uniform(38, 90)
    x = 90.0
    while x < L:
        y = limite(0, x) + 6
        p = rnd.uniform(26, 42)
        racines.append("M%s c%.0f,%.0f %.0f,%.0f %.0f,%.0f m%.0f,-%.0f c6,4 9,9 10,15"
                       % (pt(x, y), rnd.uniform(-8, 8), p * .35, rnd.uniform(-10, 10), p * .7, rnd.uniform(-6, 6), p,
                          rnd.uniform(-3, 3), p * .55))
        x += rnd.uniform(140, 260)
    return ('<path class="herbe" d="%s"/><path class="touffes" d="%s"/><path class="racines" d="%s"/>'
            % (herbe, " ".join(touffes), " ".join(racines)))


def ammonite(cx, cy, r=21, rot=-30):
    """Spirale logarithmique de deux tours et demi, côtes rayonnantes sur le dernier tour."""
    g = math.log(2.3) / (2 * math.pi)
    a = r / math.exp(g * 5 * math.pi)
    rr = lambda t: a * math.exp(g * t)
    spire = " ".join(("M" if i == 0 else "L") + pt(rr(t) * math.cos(t), rr(t) * math.sin(t))
                     for i, t in enumerate(i * math.pi / 14 for i in range(0, 71)))
    cotes = " ".join("M%s L%s" % (pt(rr(t - 2 * math.pi) * math.cos(t), rr(t - 2 * math.pi) * math.sin(t)),
                                   pt(rr(t) * math.cos(t), rr(t) * math.sin(t)))
                     for t in (3 * math.pi + i * math.pi / 9 for i in range(19)))
    return ('<g class="fossile" transform="translate(%.0f %.0f) rotate(%d)"><circle r="%.1f"/><path d="%s %s"/></g>'
            % (cx, cy, rot, r * 1.02, spire, cotes))


def calmar(cx, cy, rot=-82, s=.76):
    """Calmar couché dans la roche : manteau et nageoires, yeux, huit bras et deux tentacules à massue."""
    bras = ["M-7,28 C-12,38 -6,46 -11,56", "M-4,29 C-6,40 -1,48 -5,60", "M-1,29 C-1,41 2,50 -1,62", "M2,29 C3,41 -1,50 3,62",
            "M5,29 C7,40 2,48 6,60", "M8,28 C13,38 7,46 12,56", "M-2,29 C-9,50 6,64 -4,80", "M2,29 C9,50 -6,64 4,80"]
    return ('<g class="fossile" transform="translate(%.0f %.0f) rotate(%d) scale(%.2f)">'
            '<path d="M0,-46 C9,-36 13,-16 12,4 C11,14 7,19 0,19 C-7,19 -11,14 -12,4 C-13,-16 -9,-36 0,-46 Z'
            ' M0,-44 C9,-44 20,-38 22,-27 C14,-25 8,-28 4,-33 Z M0,-44 C-9,-44 -20,-38 -22,-27 C-14,-25 -8,-28 -4,-33 Z'
            ' M-8,19 C-9,24 -7,29 0,29 C7,29 9,24 8,19"/>'
            '<path class="sans-fond" d="%s"/><circle cx="-5" cy="23" r="2.2"/><circle cx="5" cy="23" r="2.2"/>'
            '<circle cx="-4" cy="81" r="2.6"/><circle cx="4" cy="81" r="2.6"/></g>' % (cx, cy, rot, s, " ".join(bras)))


def amethystes(cx, cy):
    prisme = '<g transform="translate(%d 0) rotate(%d) scale(%.2f)"><path class="am1" d="M-5,0 L-5,-22 L0,-30 L5,-22 L5,0 Z"/>' \
             '<path class="am2" d="M0,-30 L5,-22 L5,0 L0,0 Z"/></g>'
    return ('<g class="amethystes" transform="translate(%.0f %.0f)">%s%s%s</g>'
            % (cx, cy, prisme % (-9, -24, .8), prisme % (10, 22, .78), prisme % (0, 0, 1.08)))


COULEURS = ["--s1", "--s2", "--s3", "--s4", "--s5", "--fond"]
DECALAGE = [110, 84, 60, 38, 18, 0]          # px parcourus au défilement de l'en-tête : les couches hautes s'éloignent davantage
DETAILS = {
    0: lambda: surface(),
    1: lambda: galets(1, 16) + ammonite(1000, (limite(1, 1000) + limite(2, 1000)) / 2),
    2: lambda: galets(2, 14) + calmar(1470, (limite(2, 1470) + limite(3, 1470)) / 2),
    3: lambda: galets(3, 12) + amethystes(1235, limite(4, 1235) - 9),
    4: lambda: galets(4, 8),
}

couches = []
for k in range(len(LIMITES)):
    fixe = k == len(LIMITES) - 1
    style = "--c:var(%s)" % COULEURS[k] + ("" if fixe else ";--k:%d;--p:%dpx" % (len(LIMITES) - 2 - k, DECALAGE[k]))
    couches.append('<svg class="couche%s" style="%s" viewBox="0 0 %d %d" preserveAspectRatio="xMidYMax slice" focusable="false">'
                   '<path class="sol" d="%s"/>%s</svg>' % (" fixe" if fixe else "", style, L, H, bande(k), DETAILS.get(k, str)()))
bloc = '<!-- strates -->\n  <div class="strates" aria-hidden="true">\n    %s\n  </div>\n  <!-- /strates -->' % "\n    ".join(couches)

page = SITE / "index.html"
texte = page.read_text()
nouveau, n = re.subn(r"<!-- strates -->.*?<!-- /strates -->", lambda m: bloc, texte, flags=re.S)
if n != 1: raise SystemExit("bloc <!-- strates --> introuvable dans index.html")
page.write_text(nouveau)
print("strates écrites :", len(bloc) // 1024, "Ko")
