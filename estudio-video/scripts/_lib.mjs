// Utilitários compartilhados do Estúdio de Vídeo da Laura.
// Sem dependências externas: só Node 18+ (fetch nativo) e ffmpeg/ffprobe no PATH.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// No ambiente do Claude toda saída para a internet passa por um proxy, e o
// fetch nativo do Node só o respeita com NODE_USE_ENV_PROXY=1 (Node >= 22.21).
// Se faltar, o script reinicia a si mesmo com a variável ligada.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, ['--disable-warning=UNDICI-EHPA', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  })
  process.exit(r.status ?? 1)
}

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const p = (...partes) => path.join(RAIZ, ...partes)
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function lerJson(arquivo) {
  return JSON.parse(await readFile(arquivo, 'utf8'))
}

export async function salvarJson(arquivo, dados) {
  await mkdir(path.dirname(arquivo), { recursive: true })
  await writeFile(arquivo, JSON.stringify(dados, null, 2) + '\n')
}

export const lerConfig = () => lerJson(p('config.json'))
export const salvarConfig = (c) => salvarJson(p('config.json'), c)

// Argumentos: posicionais + --chave=valor / --flag
export function args() {
  const pos = []
  const flags = {}
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/)
    if (m) flags[m[1]] = m[2] ?? true
    else pos.push(a)
  }
  return { pos, flags }
}

export async function lerRoteiro(id) {
  if (!id) throw new Error('Informe o id do roteiro. Ex.: criativo-04')
  const arq = p('roteiros', `${id}.json`)
  if (!existsSync(arq)) throw new Error(`Roteiro não encontrado: roteiros/${id}.json`)
  const r = await lerJson(arq)
  if (!Array.isArray(r.blocos) || r.blocos.length === 0) throw new Error(`${id}: roteiro sem blocos`)
  for (const [i, b] of r.blocos.entries()) {
    if (!b.fala?.trim()) throw new Error(`${id}: bloco ${i + 1} sem fala`)
  }
  return r
}

// Etapas que gastam crédito só rodam com roteiro aprovado pelo Patrik
// (regra do CLAUDE.md para textos de oferta e valores).
export function exigirAprovado(r, flags = {}) {
  if (r.status === 'aprovado') return
  if (flags.teste) {
    console.warn(`⚠ ${r.id} não está aprovado — rodando em modo --teste.`)
    return
  }
  throw new Error(
    `${r.id} está com status "${r.status}". Só o Patrik aprova (status "aprovado") antes de gastar créditos.`,
  )
}

export const pastaSaida = (id) => p('saida', id)

// Texto falado completo + onde cada bloco começa/termina dentro dele.
// O alinhamento da ElevenLabs é por caractere desse mesmo texto.
export function textoFalado(r) {
  let texto = ''
  const faixas = []
  for (const b of r.blocos) {
    if (texto) texto += ' '
    const ini = texto.length
    texto += b.fala.trim()
    faixas.push({ ini, fim: texto.length })
  }
  return { texto, faixas }
}

// Credenciais: se o ambiente tiver a variável, mandamos o header. Se a chave
// estiver em "Network secrets", o proxy do ambiente injeta sozinho e a
// variável fica vazia — por isso o header é opcional.
export function headersHeygen(extra = {}) {
  const k = process.env.HEYGEN_API_KEY
  return { ...(k ? { 'X-Api-Key': k } : {}), ...extra }
}
export function headersEleven(extra = {}) {
  const k = process.env.ELEVENLABS_API_KEY
  return { ...(k ? { 'xi-api-key': k } : {}), ...extra }
}

export async function api(url, opcoes = {}, rotulo = url) {
  let r
  try {
    r = await fetch(url, opcoes)
  } catch (e) {
    throw new Error(`${rotulo}: sem conexão (${e.cause?.code || e.message}). O domínio está liberado em Network access?`)
  }
  const bruto = await r.text()
  let corpo
  try { corpo = JSON.parse(bruto) } catch { corpo = bruto }
  if (!r.ok) {
    const det = typeof corpo === 'string' ? corpo : JSON.stringify(corpo)
    const dica =
      r.status === 401 ? ' (chave ausente ou inválida)' :
      r.status === 403 ? ' (bloqueado: domínio não liberado ou chave sem permissão)' :
      r.status === 402 || r.status === 429 ? ' (sem créditos ou limite atingido)' : ''
    throw new Error(`${rotulo}: HTTP ${r.status}${dica} — ${det.slice(0, 600)}`)
  }
  return corpo
}

export async function baixar(url, destino) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Download falhou (HTTP ${r.status}): ${url}`)
  await mkdir(path.dirname(destino), { recursive: true })
  await writeFile(destino, Buffer.from(await r.arrayBuffer()))
  return destino
}

export function duracao(arquivo) {
  const s = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', arquivo])
  return parseFloat(String(s).trim())
}

// Foto do roteiro: primeiro em fotos/ do estúdio, depois em public/images/ do site.
export function caminhoFoto(nome) {
  const candidatos = [p('fotos', nome), path.join(RAIZ, '..', 'public', 'images', nome)]
  const achado = candidatos.find((c) => existsSync(c))
  if (!achado) throw new Error(`Foto "${nome}" não encontrada em estudio-video/fotos/ nem em public/images/`)
  return achado
}

export function mimeDe(arquivo) {
  const ext = path.extname(arquivo).toLowerCase()
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.wav': 'audio/wav' }[ext]
    || 'application/octet-stream'
}

export function falhar(e) {
  console.error(`\n✗ ${e.message}`)
  process.exit(1)
}
