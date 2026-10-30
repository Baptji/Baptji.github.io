#!/usr/bin/env python3
"""Écrit versions.js : numéro de version et date de dernière mise à jour de chaque app du site, tirés de l'historique git.
Version = nombre de publications (commits) qui ont touché le dossier de l'app ; date = celle de la dernière.
Les dossiers passés en argument (ceux qu'on est en train de publier) comptent une publication de plus, datée de maintenant ;
sans argument, ce sont les dossiers dont des modifications sont indexées (git add).
L'accueil s'en sert pour classer les fenêtres de la plus récente à la plus ancienne et écrire « Version N · mise à jour le … ».
Usage (depuis n'importe où) : outils/versions.py [dossier…]   puis valider versions.js avec le reste."""
import datetime, json, pathlib, re, subprocess, sys

SITE = pathlib.Path(__file__).resolve().parent.parent
def git(*a): return subprocess.run(["git", "-C", str(SITE), *a], capture_output=True, text=True, check=True).stdout

apps = re.findall(r'data-app="([^"]+)"', (SITE / "index.html").read_text())
publies = set(sys.argv[1:]) or {a for a in apps if git("diff", "--cached", "--name-only", "--", a).strip()}
maintenant = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
versions = {}
for a in apps:
    dates = git("log", "--format=%aI", "--", a).split()
    if a in publies: dates.insert(0, maintenant)
    if dates: versions[a] = {"version": len(dates), "date": dates[0]}
(SITE / "versions.js").write_text("// Écrit par outils/versions.py à chaque publication : ne pas modifier à la main.\nwindow.VERSIONS = "
                                  + json.dumps(versions, ensure_ascii=False, indent=1) + ";\n")
for a, v in sorted(versions.items(), key=lambda x: x[1]["date"], reverse=True): print(f"{a:12} v{v['version']:<3} {v['date'][:10]}")
