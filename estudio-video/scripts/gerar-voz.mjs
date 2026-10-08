// Gera a fala da Laura (voz clonada na ElevenLabs) com o tempo de cada letra.
// Uso: node estudio-video/scripts/gerar-voz.mjs criativo-04 [--teste]
// Saída: saida/<id>/voz.mp3 e saida/<id>/alinhamento.json

import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import {
  args, lerConfig, lerRoteiro, exigirAprovado, textoFalado, headersEleven,
  api, salvarJson, pastaSaida, duracao, falhar,
} from './_lib.mjs'

async function main() {
  const { pos, flags } = args()
  const r = await lerRoteiro(pos[0])
  exigirAprovado(r, flags)
  const cfg = await lerConfig()
  const voz = flags.voz || cfg.elevenlabs.voice_id
  if (!voz) throw new Error('Falta o voice_id da Laura em config.json (elevenlabs.voice_id). Veja a Parte 5 do GUIA.md.')

  const { texto } = textoFalado(r)
  console.log(`→ ${r.id}: ${texto.length} caracteres para a ElevenLabs (modelo ${cfg.elevenlabs.model_id})`)

  const resp = await api(
    `https://api.elevenlabs.io/v1/text-to-speech/${voz}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: headersEleven({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text: texto, model_id: cfg.elevenlabs.model_id, voice_settings: cfg.elevenlabs.voice_settings }),
    },
    'ElevenLabs TTS',
  )

  const al = resp.alignment || resp.normalized_alignment
  if (!resp.audio_base64 || !al) throw new Error('Resposta da ElevenLabs sem áudio ou sem alinhamento.')

  const dir = pastaSaida(r.id)
  await mkdir(dir, { recursive: true })
  const mp3 = path.join(dir, 'voz.mp3')
  await writeFile(mp3, Buffer.from(resp.audio_base64, 'base64'))
  await salvarJson(path.join(dir, 'alinhamento.json'), {
    texto,
    caracteres: al.characters,
    inicio: al.character_start_times_seconds,
    fim: al.character_end_times_seconds,
  })
  const d = duracao(mp3)
  console.log(`✓ voz.mp3 (${d.toFixed(1)}s) e alinhamento.json em saida/${r.id}/`)
  const [min, max] = r.duracao_alvo_s || []
  if (max && d > max + 3) console.warn(`⚠ Ficou ${d.toFixed(0)}s, acima do alvo de ${min}–${max}s. Peça ao roteirista para enxugar.`)
}

main().catch(falhar)
