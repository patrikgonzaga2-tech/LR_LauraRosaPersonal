#!/usr/bin/env bash
# Monta a página de revisão do quiz em tools/quiz-revisao/out/ a partir do
# código ATUAL de app/efeito-lipo-quiz/. Passo a passo em docs/QUIZ_REVISAO.md.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(git rev-parse --show-toplevel)"
QUIZ="$ROOT/app/efeito-lipo-quiz"
[ -d node_modules ] || npm install --no-audit --no-fund --silent
export NODE_PATH="$PWD/node_modules"  # os arquivos do quiz acham o react daqui
rm -rf out && mkdir -p out/images

# 1) JS do quiz (React + componentes do app, next/image trocado por <img>)
./node_modules/.bin/esbuild entry.jsx --bundle --minify --format=iife --jsx=automatic \
  --alias:@quiz="$QUIZ" --alias:next/image="$PWD/image.jsx" \
  --define:process.env.NODE_ENV='"production"' --log-level=warning --outfile=out/quiz.js
# Caminho das imagens: "/images/<nome com acento>" -> "images/<nome-sem-acento>"
python3 - out/quiz.js <<'PY'
import re,sys
p=sys.argv[1];s=open(p).read()
s,n=re.subn(r"`/images/\$\{encodeURIComponent\((\w+)\)\}`",
  r'"images/"+\1.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^A-Za-z0-9.]+/g,"-")',s)
if n!=1: sys.exit(f"ERRO: esperava 1 caminho de imagem no bundle, achei {n}. O enc() de _data.ts mudou?")
open(p,'w').write(s)
PY

# 2) CSS (Tailwind lendo as classes do quiz + globals.css do site)
{ echo "@import 'tailwindcss' source(none);"; echo "@source \"$QUIZ\";"
  sed -n '2,$p' "$ROOT/app/globals.css"
  echo "html:root{--font-display:'Bricolage Grotesque',system-ui,sans-serif;--font-body:'DM Sans',system-ui,sans-serif}"; } > out/.quiz.in.css
./node_modules/.bin/tailwindcss -i out/.quiz.in.css -o out/quiz.css --minify 2>/dev/null
rm out/.quiz.in.css
cp quiz.html out/quiz.html

# 3) Imagens usadas pelo quiz (renomeadas sem acento/espaço)
python3 - "$QUIZ/_data.ts" "$ROOT/public/images" out/images <<'PY'
import re,sys,unicodedata,shutil,os
data,src,dst=sys.argv[1:]
for n in sorted(set(re.findall(r"enc\('([^']+)'\)",open(data).read()))):
    s=re.sub(r'[^A-Za-z0-9.]+','-',''.join(c for c in unicodedata.normalize('NFD',n) if not unicodedata.combining(c)))
    shutil.copy(os.path.join(src,n),os.path.join(dst,s))
PY

# 4) Textos editáveis + versão (commit) -> index.html
./node_modules/.bin/esbuild dump.mjs --bundle --platform=node --alias:@quiz="$QUIZ" --log-level=warning --outfile=out/.dump.cjs
node out/.dump.cjs > out/.screens.json && rm out/.dump.cjs
BR="$(git rev-parse --abbrev-ref HEAD)"
VERSAO="$BR · $(git log -1 --date=format:%d/%m/%Y --format='%h de %ad' -- "$QUIZ")"
COPY="$(git log -1 --date=format:%d/%m/%Y --format='%h de %ad' -- "$QUIZ/_data.ts")"
[ -z "$(git status --porcelain -- "$QUIZ")" ] || VERSAO="$VERSAO + edições não commitadas"
python3 - "$VERSAO" "$COPY" <<'PY'
import sys
v,c=sys.argv[1:]
scr=open('out/.screens.json').read().strip().replace('</','<\\/')
body=open('page-body.html').read().replace('__SCREENS__',scr).replace('__VERSAO__',v).replace('__COPY__',c)
open('out/index.html','w').write(open('page-head.html').read()+body)
PY
rm out/.screens.json

# 5) Mapa de arquivos para o Artifact (parâmetro `files`)
python3 -c "
import os,json;m={f:f for f in ['quiz.html','quiz.js','quiz.css']}
m.update({'images/'+f:'images/'+f for f in sorted(os.listdir('out/images'))})
json.dump(m,open('out/files.json','w'))"
echo "OK: $(du -sh out | cut -f1) em tools/quiz-revisao/out  |  versão: $VERSAO  |  copy: $COPY"
