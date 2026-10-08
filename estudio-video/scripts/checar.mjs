// Confere se o estúdio está pronto: ffmpeg, acesso às APIs, créditos, voz e fotos.
// Uso: node estudio-video/scripts/checar.mjs
// Não gasta crédito nenhum (só consultas de saldo).

import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { lerConfig, lerJson, p, headersHeygen, headersEleven, api, caminhoFoto } from './_lib.mjs'

let problemas = 0
const ok = (m) => console.log(`✓ ${m}`)
const ruim = (m, como) => { problemas++; console.log(`✗ ${m}\n    → ${como}`) }

async function main() {
  const cfg = await lerConfig()

  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' })
    ok('ffmpeg instalado')
  } catch {
    ruim('ffmpeg não encontrado', 'Adicione ao Setup script do ambiente: apt-get update && apt-get install -y ffmpeg')
  }

  // ElevenLabs
  try {
    const s = await api('https://api.elevenlabs.io/v1/user/subscription', { headers: headersEleven() }, 'ElevenLabs')
    ok(`ElevenLabs conectada — plano ${s.tier}, ${s.character_count}/${s.character_limit} créditos usados no mês`)
    if (s.can_use_instant_voice_cloning === false) ruim('Plano sem clonagem de voz', 'Assine pelo menos o Starter (Parte 1 do GUIA.md)')
  } catch (e) {
    ruim(e.message, 'Confira a chave ELEVENLABS_API_KEY e o domínio api.elevenlabs.io (Parte 3 do GUIA.md)')
  }
  if (cfg.elevenlabs.voice_id) ok(`Voz da Laura configurada (${cfg.elevenlabs.voice_id})`)
  else ruim('Voz da Laura ainda não configurada', 'Crie a voz e cole o Voice ID em config.json (Parte 5 do GUIA.md)')

  // HeyGen
  try {
    const u = (await api('https://api.heygen.com/v3/users/me', { headers: headersHeygen() }, 'HeyGen')).data ?? {}
    const saldo =
      u.wallet?.remaining_balance != null ? `saldo US$ ${u.wallet.remaining_balance}` :
      u.remaining_credits != null ? `${u.remaining_credits} créditos` :
      `cobrança: ${u.billing_type ?? 'desconhecida'}`
    ok(`HeyGen conectada — ${saldo}`)
    if (u.wallet?.remaining_balance != null && u.wallet.remaining_balance < 3) {
      ruim('Saldo da API HeyGen baixo', 'Recarregue a carteira da API (Parte 1 do GUIA.md)')
    }
  } catch (e) {
    ruim(e.message, 'Confira a chave HEYGEN_API_KEY e os domínios da HeyGen (Parte 3 do GUIA.md)')
  }

  // Roteiros e fotos
  for (const f of readdirSync(p('roteiros')).filter((x) => x.endsWith('.json'))) {
    const r = await lerJson(p('roteiros', f))
    try {
      caminhoFoto(r.foto)
      ok(`${r.id}: status "${r.status}", foto ${r.foto}`)
    } catch (e) {
      ruim(`${r.id}: ${e.message}`, 'Suba a foto em estudio-video/fotos/ (Parte 4 do GUIA.md)')
    }
  }

  console.log(problemas ? `\n${problemas} pendência(s).` : '\nTudo pronto para produzir.')
  process.exit(problemas ? 1 : 0)
}

main()
