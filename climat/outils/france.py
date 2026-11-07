#!/usr/bin/env python3
"""Données de la France entière pour l'appli Climat, toutes mailles SAFRAN d'un coup.

  climat/outils/france.py temperature 2025   -> data/france/temperature-2025.bin.gz + .json
  climat/outils/france.py altitudes          -> data/altitudes.js

Température : la moyenne du jour (T_Q) des 9 892 mailles, en UNE requête « cube » à l'API EDR
de GeoSAS (≈ 28 Mo de NetCDF, quelques secondes), réécrite en petit fichier pour le site :
  - entiers 16 bits (little-endian), en dixièmes de degré ;
  - rangés jour par jour, et dans chaque jour les mailles dans l'ordre de data/grid.js ;
  - le premier jour en valeurs, les suivants en écart à la veille (même maille), puis gzip.
  ≈ 2,6 Mo pour une année. Le .json décrit le fichier (premier jour, nombre de jours…).

Altitudes : moyenne, min et max du RGE ALTI de l'IGN sur 5 × 5 points semés dans chaque
maille, bords compris (le même semis que l'appli, voir `semis` dans app.js), par lots de
5 000 points à la Géoplateforme (≈ 50 requêtes). Hors de France (la grille déborde sur la
Suisse, l'Italie…), le Copernicus DEM d'Open-Meteo prend le relais, par lots de 100. Rien ne change d'une année à l'autre :
à ne relancer que si la grille change.

Il faut numpy et scipy (pip install numpy scipy)."""
import datetime, gzip, json, math, pathlib, re, sys, time, urllib.request, urllib.parse

import numpy as np

ICI = pathlib.Path(__file__).resolve().parent.parent          # climat/
CUBE = "https://api.geosas.fr/edr/collections/safran-isba/cube"
ALTI = "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json"
DEMI = 4000.0                                                 # demi-côté d'une maille, en m


def grille():
    """Les mailles de data/grid.js, dans leur ordre : c'est l'ordre de tous les fichiers."""
    texte = (ICI / "data" / "grid.js").read_text()
    return json.loads(texte[texte.index("{"):texte.rindex("}") + 1])


def temperature(annee):
    from scipy.io import netcdf_file
    g = grille()
    cells = g["cells"]
    xs = [c["x"] for c in cells]
    ys = [c["y"] for c in cells]
    bbox = f"{min(xs) - DEMI},{min(ys) - DEMI},{max(xs) + DEMI},{max(ys) + DEMI}"
    q = urllib.parse.urlencode({
        "bbox": bbox, "bbox-crs": "IGNF:LAMBE",
        "datetime": f"{annee}-01-01T00:00:00Z/{annee}-12-31T00:00:00Z",
        "parameter-name": "T_Q", "f": "netCDF4",
    })
    print(f"Téléchargement du cube {annee}…", flush=True)
    brut = urllib.request.urlopen(f"{CUBE}?{q}", timeout=600).read()
    print(f"  {len(brut) / 1e6:.1f} Mo reçus")
    tmp = ICI / "outils" / f".cube-{annee}.nc"
    tmp.write_bytes(brut)
    try:
        f = netcdf_file(str(tmp), "r", mmap=False)
        t = f.variables["T_Q"].data.astype(np.float64)          # (jour, y, x)
        gx = {round(v): i for i, v in enumerate(f.variables["x"].data)}
        gy = {round(v): i for i, v in enumerate(f.variables["y"].data)}
        jours = f.variables["time"].data.astype(int)
        origine = re.search(r"\d{4}-\d{2}-\d{2}", f.variables["time"].units.decode()).group()
        f.close()
    finally:
        tmp.unlink()

    iy = np.array([gy[round(c["y"])] for c in cells])
    ix = np.array([gx[round(c["x"])] for c in cells])
    v = t[:, iy, ix]                                            # (jour, maille)
    manque = (v == -999) | ~np.isfinite(v)
    if manque.any():
        raise SystemExit(f"{int(manque.sum())} valeurs manquantes : la grille et le cube ne collent pas")
    if len(jours) > 1 and not np.all(np.diff(jours) == 1):
        raise SystemExit("jours non consécutifs dans le cube")

    dixiemes = np.round(v * 10).astype(np.int32)
    ecarts = np.diff(dixiemes, axis=0, prepend=0)              # 1re ligne = valeurs du 1er jour
    if np.abs(ecarts).max() > 32767:
        raise SystemExit("écart hors des 16 bits")
    corps = gzip.compress(ecarts.astype("<i2").tobytes(), 9, mtime=0)

    debut = (datetime.date.fromisoformat(origine) + datetime.timedelta(days=int(jours[0]))).isoformat()
    sortie = ICI / "data" / "france"
    sortie.mkdir(parents=True, exist_ok=True)
    (sortie / f"temperature-{annee}.bin.gz").write_bytes(corps)
    meta = {
        "variable": "T_Q", "libelle": "Température moyenne du jour", "unite": "°C",
        "annee": annee, "debut": debut, "jours": int(v.shape[0]), "mailles": len(cells),
        "echelle": 0.1, "type": "int16le",
        "ordre": "jour par jour ; dans chaque jour, les mailles dans l'ordre de data/grid.js",
        "codage": "1er jour en valeurs, puis écart à la veille de la même maille ; gzip",
        "min": round(float(v.min()), 1), "max": round(float(v.max()), 1),
        "source": "SAFRAN-ISBA (Météo-France), via l'API EDR de GeoSAS",
        "telecharge": datetime.date.today().isoformat(),
    }
    (sortie / f"temperature-{annee}.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1) + "\n")
    print(f"  {v.shape[0]} jours × {len(cells)} mailles -> {len(corps) / 1e6:.2f} Mo "
          f"(de {meta['min']} à {meta['max']} °C)")


# --- Lambert II étendu -> WGS84 : la même formule que projection.js ---
N, C, XS, YS, E = 0.7289686274, 11745793.39, 600000.0, 8199695.768, 0.08248325676
LAMBDA_C = math.radians(2.337229167)


def wgs84(x, y):
    dx, dy = x - XS, y - YS
    r = math.hypot(dx, dy)
    gamma = math.atan(dx / -dy)
    lon = LAMBDA_C + gamma / N
    lat_iso = -math.log(abs(r / C)) / N
    lat = 2 * math.atan(math.exp(lat_iso)) - math.pi / 2
    for _ in range(8):
        s = E * math.sin(lat)
        lat = 2 * math.atan(((1 + s) / (1 - s)) ** (E / 2) * math.exp(lat_iso)) - math.pi / 2
    return math.degrees(lat), math.degrees(lon)


def altitudes():
    cells = grille()["cells"]
    pts = []
    for c in cells:
        for i in range(5):
            for j in range(5):
                pts.append(wgs84(c["x"] - DEMI + 2 * DEMI * i / 4, c["y"] - DEMI + 2 * DEMI * j / 4))
    z = []
    lot = 5000
    for k in range(0, len(pts), lot):
        morceau = pts[k:k + lot]
        corps = json.dumps({
            "lon": "|".join(f"{p[1]:.5f}" for p in morceau),
            "lat": "|".join(f"{p[0]:.5f}" for p in morceau),
            "resource": "ign_rge_alti_wld", "zonly": "true",
        }).encode()
        for essai in range(4):
            try:
                req = urllib.request.Request(ALTI, data=corps, headers={"Content-Type": "application/json"})
                z += json.load(urllib.request.urlopen(req, timeout=180))["elevations"]
                break
            except Exception as err:   # le service coupe parfois : on retente un peu plus tard
                if essai == 3:
                    raise
                print(f"  lot {k // lot + 1} : {err}, nouvel essai", flush=True)
                time.sleep(5 * (essai + 1))
        print(f"  {min(k + lot, len(pts))} / {len(pts)} points", flush=True)

    # La grille SAFRAN déborde de la France (Suisse, Italie, Allemagne, Belgique, mer) et
    # le RGE ALTI s'arrête à la frontière (-99999) : ces points-là prennent le Copernicus
    # DEM à 90 m servi par Open-Meteo, comme les mailles du Royaume-Uni dans l'appli.
    # En mer, le RGE ALTI répond parfois une profondeur (jusqu'à -900 m au large de la
    # Vendée) et Copernicus 0,0 tout rond : ni l'un ni l'autre ne compte.
    hors = [k for k, e in enumerate(z) if not isinstance(e, (int, float)) or e <= -1000]
    print(f"  {len(hors)} points hors du RGE ALTI : Copernicus (Open-Meteo)", flush=True)
    for k in range(0, len(hors), 100):
        morceau = hors[k:k + 100]
        q = urllib.parse.urlencode({
            "latitude": ",".join(f"{pts[i][0]:.4f}" for i in morceau),
            "longitude": ",".join(f"{pts[i][1]:.4f}" for i in morceau),
        })
        for essai in range(6):
            try:
                rep = json.load(urllib.request.urlopen(f"https://api.open-meteo.com/v1/elevation?{q}", timeout=60))
                break
            except Exception as err:
                if essai == 5:
                    raise
                time.sleep(10 * (essai + 1))
        for i, e in zip(morceau, rep["elevation"]):
            z[i] = e if isinstance(e, (int, float)) and e != 0 else None
        time.sleep(0.15)   # Open-Meteo : 600 appels par minute au plus
    print("  Copernicus : fait", flush=True)

    moy, bas, haut = [], [], []
    for n in range(len(cells)):
        v = [e for e in z[25 * n:25 * n + 25] if isinstance(e, (int, float)) and e > -20]
        if not v:   # maille toute en mer
            v = [0.0]
        moy.append(round(sum(v) / len(v)))
        bas.append(round(min(v)))
        haut.append(round(max(v)))
    texte = ("// Écrit par climat/outils/france.py altitudes -- ne pas éditer à la main.\n"
             "// Altitude (m) de chaque maille de data/grid.js, dans le même ordre : moyenne, min et max\n"
             "// du RGE ALTI (IGN) sur 5 × 5 points semés dans la maille, bords compris ; hors de\n"
             "// France, Copernicus DEM 90 m (via Open-Meteo). Les points en mer ne comptent pas.\n"
             "window.SAFRAN_ALTITUDES = " + json.dumps({"moyenne": moy, "min": bas, "max": haut},
                                                       separators=(",", ":")) + ";\n")
    (ICI / "data" / "altitudes.js").write_text(texte)
    print(f"  altitudes : de {min(moy)} à {max(moy)} m ({len(texte) / 1e3:.0f} ko)")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "temperature":
        temperature(int(sys.argv[2]))
    elif len(sys.argv) == 2 and sys.argv[1] == "altitudes":
        altitudes()
    else:
        sys.exit(__doc__)
