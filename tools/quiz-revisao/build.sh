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
bundle_js() {  # $1 = pasta do quiz, $2 = arquivo de saída, $3 = prefixo das imagens
  ./node_modules/.bin/esbuild entry.jsx --bundle --minify --format=iife --jsx=automatic \
    --alias:@quiz="$1" --alias:next/image="$PWD/image.jsx" \
    --define:process.env.NODE_ENV='"production"' --log-level=warning --outfile="$2"
  # Caminho das imagens: "/images/<nome com acento>" -> "<prefixo>images/<nome-sem-acento>"
  python3 - "$2" "$3" <<'PY'
import re,sys
p,pre=sys.argv[1],sys.argv[2];s=open(p).read()
s,n=re.subn(r"`/images/\$\{encodeURIComponent\((\w+)\)\}`",
  lambda m:'"'+pre+'images/"+'+m.group(1)+'.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^A-Za-z0-9.]+/g,"-")',s)
if n!=1: sys.exit(f"ERRO: esperava 1 caminho de imagem no bundle, achei {n}. O enc() de _data.ts mudou?")
open(p,'w').write(s)
PY
}
bundle_js "$QUIZ" out/quiz.js ""

# 2) CSS (Tailwind lendo as classes do quiz + globals.css do site)
build_css() {  # $1 = pasta do quiz, $2 = arquivo de saída
  { echo "@import 'tailwindcss' source(none);"; echo "@source \"$1\";"
    sed -n '2,$p' "$ROOT/app/globals.css"
    echo "html:root{--font-display:'Bricolage Grotesque',system-ui,sans-serif;--font-body:'DM Sans',system-ui,sans-serif}"; } > out/.quiz.in.css
  ./node_modules/.bin/tailwindcss -i out/.quiz.in.css -o "$2" --minify 2>/dev/null
  rm out/.quiz.in.css
}
build_css "$QUIZ" out/quiz.css
cp quiz.html out/quiz.html

# 2b) Versões do histórico (versoes.json): cada uma montada do seu commit em out/v/<id>/,
#     para o comparador e os cartões do painel.
python3 -c "import json;[print(v['id'],v['commit']) for v in json.load(open('versoes.json'))['versoes']]" | while read -r vid vcommit; do
  mkdir -p "out/.src-$vid" "out/v/$vid"
  git -C "$ROOT" archive "$vcommit" app/efeito-lipo-quiz | tar -x -C "out/.src-$vid"
  bundle_js "$PWD/out/.src-$vid/app/efeito-lipo-quiz" "out/v/$vid/quiz.js" "../../"
  build_css "$PWD/out/.src-$vid/app/efeito-lipo-quiz" "out/v/$vid/quiz.css"
  cp quiz.html "out/v/$vid/quiz.html"
  rm -rf "out/.src-$vid"
done

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
esc=lambda t: t.strip().replace('</','<\\/')
painel=open('painel.html').read().replace('__VERSOES__',esc(open('versoes.json').read())).replace('__MARCA__',esc(open('marca.json').read()))
body=body.replace('<!--PAINEL-->',painel)
open('out/index.html','w').write(open('page-head.html').read()+body)
PY
rm out/.screens.json

# 5) Mapa de arquivos para o Artifact (parâmetro `files`)
python3 -c "
import os,json;m={f:f for f in ['quiz.html','quiz.js','quiz.css']}
m.update({'images/'+f:'images/'+f for f in sorted(os.listdir('out/images'))})
m.update({f'v/{d}/{f}':f'v/{d}/{f}' for d in sorted(os.listdir('out/v')) for f in sorted(os.listdir(f'out/v/{d}'))})
json.dump(m,open('out/files.json','w'))"
echo "OK: $(du -sh out | cut -f1) em tools/quiz-revisao/out  |  versão: $VERSAO  |  copy: $COPY"
