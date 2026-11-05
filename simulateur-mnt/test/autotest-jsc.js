// jsc web/test/autotest-jsc.js -- <dossier des attendus> <cas1.json> <cas2.json> …
load(arguments[0] + "/../../web/noyau.js");
load(arguments[0] + "/../../web/test/verifier.js");
const dossier = arguments[0];
const noms = arguments.slice(1);
const r = verifierTout(noms, n => JSON.parse(readFile(dossier + "/" + n)), print);
print("");
if (r.echecs.length === 0) print("✅ " + r.reussis + " vérifications réussies (noyau JavaScript)");
else { print("❌ " + r.echecs.length + " échec(s) sur " + (r.reussis + r.echecs.length) + " vérifications (noyau JavaScript)"); quit(1); }
