// Tira prints de algumas telas da cópia de revisão para conferir antes de publicar.
// Uso: node check.mjs 0,3,24,25  -> out/shot-<tela>.png  (telas começam em 0)
import { chromium } from 'playwright-core'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), 'out')
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css' }
const srv = http.createServer((q, r) => {
  const f = path.join(dir, decodeURIComponent(q.url.split('?')[0]))
  fs.readFile(f, (e, d) => { r.writeHead(e ? 404 : 200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d) })
}).listen(8765)
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 390, height: 844 } })
p.on('pageerror', (e) => console.log('ERRO na página:', e.message))
for (const s of (process.argv[2] || '0').split(',')) {
  await p.goto(`http://localhost:8765/quiz.html?step=${s}`); await p.waitForTimeout(1200)
  await p.screenshot({ path: path.join(dir, `shot-${s}.png`) })
}
await b.close(); srv.close()
console.log('prints em tools/quiz-revisao/out/')
