#!/bin/bash
# Autotest du noyau JavaScript avec le moteur JavaScriptCore de macOS (pas besoin de Node).
set -euo pipefail
RACINE="$(cd "$(dirname "$0")/../.." && pwd)"
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
cd "$RACINE/reference/attendus"
"$JSC" "$RACINE/web/test/autotest-jsc.js" -- "$RACINE/reference/attendus" $(ls *.json)
