#!/bin/sh
# Gera cv-iago-vale-en.pdf (Letter) e cv-iago-vale-pt.pdf (A4) a partir do cv.html,
# que lê o content.js. Uso: sh tools/cv-pdf.sh   (ou CHROME=/caminho/do/chrome sh tools/cv-pdf.sh)
# Precisa de internet para baixar as fontes (Google Fonts) e de um Chrome/Chromium.
set -e
cd "$(dirname "$0")/.."

if [ -z "$CHROME" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Chromium.app/Contents/MacOS/Chromium" \
           google-chrome google-chrome-stable chromium chromium-browser chrome; do
    if [ -x "$c" ] || command -v "$c" >/dev/null 2>&1; then CHROME="$c"; break; fi
  done
fi
[ -n "$CHROME" ] || { echo "Chrome não encontrado; defina CHROME=/caminho/do/chrome" >&2; exit 1; }

for l in en pt; do
  "$CHROME" --headless --disable-gpu --hide-scrollbars --no-pdf-header-footer \
    --virtual-time-budget=10000 --run-all-compositor-stages-before-draw \
    --print-to-pdf="cv-iago-vale-$l.pdf" "file://$PWD/cv.html?lang=$l" 2>/dev/null
  echo "cv-iago-vale-$l.pdf"
done
