#!/usr/bin/env bash
# Monta o ESBOÇO T25+T26 (Efeito Lipo em destaque) numa cópia do quiz, sem tocar
# em app/. Saída: tools/quiz-revisao/esbocos/out/quiz.html?step=25&oferta=A..E
# (T25 = ?step=24). Passo a passo em docs/RETOMAR_OFERTA_EL.md.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(git rev-parse --show-toplevel)"
[ -d node_modules ] || npm install --no-audit --no-fund --silent
export NODE_PATH="$PWD/node_modules"
SRC=esbocos/.src; OUT=esbocos/out
rm -rf "$SRC" "$OUT"; mkdir -p "$OUT/images"
cp -r "$ROOT/app/efeito-lipo-quiz/." "$SRC"; rm -rf "$SRC/dashboard"
(cd "$SRC" && patch -p1 -s < ../t25-t26-efeito-lipo.patch)
./node_modules/.bin/esbuild entry.jsx --bundle --minify --format=iife --jsx=automatic \
  --alias:@quiz="$PWD/$SRC" --alias:next/image="$PWD/image.jsx" \
  --define:process.env.NODE_ENV='"production"' --log-level=warning --outfile="$OUT/quiz.js"
python3 - "$OUT/quiz.js" <<'PY'
import re,sys
p=sys.argv[1];s=open(p).read()
s,n=re.subn(r"`/images/\$\{encodeURIComponent\((\w+)\)\}`",lambda m:'"images/"+'+m.group(1)+'.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^A-Za-z0-9.]+/g,"-")',s)
open(p,'w').write(s)
PY
{ echo "@import 'tailwindcss' source(none);"; echo "@source \"$PWD/$SRC\";"
  sed -n '2,$p' "$ROOT/app/globals.css"
  echo "html:root{--font-display:'Bricolage Grotesque',system-ui,sans-serif;--font-body:'DM Sans',system-ui,sans-serif}"; } > "$OUT/.in.css"
./node_modules/.bin/tailwindcss -i "$OUT/.in.css" -o "$OUT/quiz.css" --minify 2>/dev/null; rm "$OUT/.in.css"
cp quiz.html "$OUT/"
python3 - "$SRC/_data.ts" "$ROOT/public/images" "$OUT/images" <<'PY'
import re,sys,unicodedata,shutil,os
data,src,dst=sys.argv[1:]
for n in sorted(set(re.findall(r"enc\('([^']+)'\)",open(data).read()))):
    s=re.sub(r'[^A-Za-z0-9.]+','-',''.join(c for c in unicodedata.normalize('NFD',n) if not unicodedata.combining(c)))
    shutil.copy(os.path.join(src,n),os.path.join(dst,s))
PY
rm -rf "$SRC"
echo "ok: $OUT/quiz.html?step=25&oferta=A (B, C, D, E) · T25: ?step=24"
