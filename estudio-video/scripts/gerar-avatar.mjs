// Anima a foto da Laura falando o áudio gerado (HeyGen API v3 — Avatar IV).
// Uso: node estudio-video/scripts/gerar-avatar.mjs criativo-04 [--teste]
// Precisa de saida/<id>/voz.mp3 (rode gerar-voz.mjs antes).
// Saída: saida/<id>/avatar.mp4 e saida/<id>/heygen.json
//
// Atenção: a HeyGen encerra o suporte às rotas v1/v2 em 31/10/2026. Este script
// usa só a v3 (POST /v3/assets, POST /v3/videos, GET /v3/videos/{id}).

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  args, lerConfig, salvarConfig, lerRoteiro, exigirAprovado, headersHeygen, api,
  baixar, salvarJson, pastaSaida, duracao, caminhoFoto, mimeDe, sleep, falhar,
} from './_lib.mjs'

const BASE = 'https://api.heygen.com'
const dados = (r) => r?.data ?? r

async function subir(arquivo) {
  const form = new FormData()
  const blob = new Blob([await readFile(arquivo)], { type: mimeDe(arquivo) })
  form.append('file', blob, path.basename(arquivo))
  const r = dados(await api(`${BASE}/v3/assets`, { method: 'POST', headers: headersHeygen(), body: form }, 'HeyGen upload'))
  const id = r.asset_id || r.id
  if (!id) throw new Error(`Upload sem asset_id: ${JSON.stringify(r).slice(0, 300)}`)
  return id
}

// A documentação mostra a imagem como objeto { type, asset_id }; integrações
// antigas mandam o campo "achatado" image_asset_id. Tentamos o oficial e, se a
// API recusar o formato, o alternativo — e lembramos qual funcionou.
async function criarVideo(cfg, corpoBase, fotoId) {
  const formatos = {
    objeto: { image: { type: 'asset_id', asset_id: fotoId } },
    achatado: { image_asset_id: fotoId },
  }
  const ordem = cfg.heygen.formato_imagem === 'achatado' ? ['achatado', 'objeto'] : ['objeto', 'achatado']
  let ultimoErro
  for (const f of ordem) {
    try {
      const r = dados(await api(`${BASE}/v3/videos`, {
        method: 'POST',
        headers: headersHeygen({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ ...corpoBase, ...formatos[f] }),
      }, 'HeyGen criar vídeo'))
      if (cfg.heygen.formato_imagem !== f) { cfg.heygen.formato_imagem = f; await salvarConfig(cfg) }
      return r.video_id || r.id
    } catch (e) {
      ultimoErro = e
      if (!/HTTP (400|422)/.test(e.message)) throw e
      console.warn(`… formato "${f}" recusado, tentando o outro`)
    }
  }
  throw ultimoErro
}

async function main() {
  const { pos, flags } = args()
  const r = await lerRoteiro(pos[0])
  exigirAprovado(r, flags)
  const cfg = await lerConfig()
  const dir = pastaSaida(r.id)
  const voz = path.join(dir, 'voz.mp3')
  if (!existsSync(voz)) throw new Error(`Falta saida/${r.id}/voz.mp3. Rode gerar-voz.mjs antes.`)

  const segundos = duracao(voz)
  const custo = segundos * cfg.heygen.custo_usd_por_segundo
  console.log(`→ ${r.id}: ${segundos.toFixed(1)}s de vídeo ≈ US$ ${custo.toFixed(2)} na carteira da API HeyGen`)

  // A foto sobe uma vez e o asset_id fica guardado no config.json (não é segredo).
  const foto = caminhoFoto(r.foto)
  cfg.heygen.assets ||= {}
  let fotoId = cfg.heygen.assets[r.foto]
  if (!fotoId) {
    console.log(`→ Enviando foto ${r.foto}…`)
    fotoId = await subir(foto)
    cfg.heygen.assets[r.foto] = fotoId
    await salvarConfig(cfg)
  }
  console.log('→ Enviando áudio…')
  const audioId = await subir(voz)

  const corpo = {
    type: 'image',
    audio_asset_id: audioId,
    aspect_ratio: '9:16',
    resolution: cfg.heygen.resolucao,
    fit: 'cover',
    expressiveness: cfg.heygen.expressividade,
    motion_prompt: r.motion_prompt || cfg.heygen.motion_prompt,
    title: `${r.id} — ${r.titulo}`,
    output_format: 'mp4',
  }
  const videoId = await criarVideo(cfg, corpo, fotoId)
  console.log(`→ Vídeo na fila da HeyGen: ${videoId}. Acompanhando (pode levar alguns minutos)…`)

  const limite = Date.now() + 30 * 60 * 1000
  let st
  while (Date.now() < limite) {
    await sleep(15000)
    st = dados(await api(`${BASE}/v3/videos/${videoId}`, { headers: headersHeygen() }, 'HeyGen status'))
    process.stdout.write(`  status: ${st.status}\n`)
    if (st.status === 'completed') break
    if (st.status === 'failed') throw new Error(`HeyGen falhou: ${st.failure_code || ''} ${st.failure_message || JSON.stringify(st.error || st).slice(0, 300)}`)
  }
  if (st?.status !== 'completed') throw new Error(`Tempo esgotado. Consulte depois: GET /v3/videos/${videoId}`)

  const destino = path.join(dir, 'avatar.mp4')
  try {
    await baixar(st.video_url, destino)
  } catch (e) {
    const host = new URL(st.video_url).host
    throw new Error(`${e.message}\nLibere o domínio "${host}" em Network access e rode de novo.`)
  }
  await salvarJson(path.join(dir, 'heygen.json'), {
    video_id: videoId, foto: r.foto, foto_asset_id: fotoId, audio_asset_id: audioId,
    duracao_s: st.duration ?? segundos, custo_estimado_usd: +custo.toFixed(2),
    host_download: new URL(st.video_url).host, concluido_em: new Date().toISOString(),
  })
  console.log(`✓ saida/${r.id}/avatar.mp4 (${duracao(destino).toFixed(1)}s)`)
}

main().catch(falhar)
