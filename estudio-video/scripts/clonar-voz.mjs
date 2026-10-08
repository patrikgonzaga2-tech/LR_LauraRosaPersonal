// Alternativa à Parte 5 do GUIA.md: cria a voz da Laura pela API em vez do site.
// Uso: node estudio-video/scripts/clonar-voz.mjs
// Lê os áudios (MP3/WAV/M4A) de material/audio/ e grava o voice_id em config.json.
// Exige a autorização escrita da Laura para clonagem de voz.

import { readdirSync, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { lerConfig, salvarConfig, p, headersEleven, api, mimeDe, falhar } from './_lib.mjs'

async function main() {
  const pasta = p('material', 'audio')
  if (!existsSync(pasta)) throw new Error('Crie estudio-video/material/audio/ e coloque 1 a 3 minutos de áudio limpo da Laura.')
  const arquivos = readdirSync(pasta).filter((f) => /\.(mp3|wav|m4a)$/i.test(f))
  if (!arquivos.length) throw new Error('Nenhum áudio em material/audio/.')

  const form = new FormData()
  form.append('name', 'Laura Rosa')
  form.append('description', 'Voz da Laura Rosa para anúncios do Efeito Lipo 21 (uso autorizado por escrito).')
  form.append('remove_background_noise', 'true')
  for (const f of arquivos) {
    const arq = path.join(pasta, f)
    form.append('files', new Blob([await readFile(arq)], { type: mimeDe(arq) }), f)
  }
  console.log(`→ Enviando ${arquivos.length} áudio(s) para a ElevenLabs…`)
  const r = await api('https://api.elevenlabs.io/v1/voices/add', { method: 'POST', headers: headersEleven(), body: form }, 'ElevenLabs clonar voz')
  const cfg = await lerConfig()
  cfg.elevenlabs.voice_id = r.voice_id
  await salvarConfig(cfg)
  console.log(`✓ Voz criada: ${r.voice_id} (gravada em config.json)`)
  if (r.requires_verification) console.warn('⚠ A ElevenLabs pediu verificação da voz — a Laura precisa concluir no site.')
}

main().catch(falhar)
