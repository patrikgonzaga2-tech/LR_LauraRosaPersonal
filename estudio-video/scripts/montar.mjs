// Monta o vídeo final 9:16: cortes com zoom por bloco, texto na tela, legenda
// da fala palavra a palavra, música opcional e volume padrão de redes sociais.
//
// Uso:
//   node estudio-video/scripts/montar.mjs criativo-04            (usa saida/<id>/avatar.mp4 da HeyGen)
//   node estudio-video/scripts/montar.mjs criativo-04 --simular  (prévia GRÁTIS: foto parada + voz.mp3 se houver)
//   --musica=arquivo.mp3   trilha de material/musica/ (opcional)
//
// Saída: saida/<id>/final.mp4 (ou previa.mp4), capa.jpg, legenda-anuncio.txt, ficha.json

import { existsSync } from 'node:fs'
import { writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import {
  args, lerConfig, lerRoteiro, textoFalado, lerJson, salvarJson, pastaSaida,
  duracao, caminhoFoto, p, falhar,
} from './_lib.mjs'

const semEmoji = (s) => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim()
const escAss = (s) => semEmoji(s).replace(/\\/g, '').replace(/[{}]/g, '')
const tempoAss = (t) => {
  const cs = Math.max(0, Math.round(t * 100))
  const h = Math.floor(cs / 360000)
  const m = Math.floor((cs % 360000) / 6000)
  const s = Math.floor((cs % 6000) / 100)
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`
}

// Sem voz gerada ainda (prévia): estima o tempo de cada letra pelo ritmo médio de fala.
function alinhamentoEstimado(texto) {
  const inicio = []
  const fim = []
  let t = 0.25
  for (const ch of texto) {
    const d = /[.!?…]/.test(ch) ? 0.45 : /[,;:]/.test(ch) ? 0.22 : 1 / 14
    inicio.push(t)
    t += d
    fim.push(t)
  }
  return { texto, caracteres: [...texto], inicio, fim }
}

// Converte um índice do texto do roteiro para o índice no alinhamento
// (iguais quase sempre; se a API normalizar algo, cai na proporção).
function mapeador(texto, al) {
  const igual = al.caracteres.join('') === texto
  const r = al.caracteres.length / texto.length
  return (i) => Math.min(al.caracteres.length - 1, igual ? i : Math.round(i * r))
}

function palavras(al) {
  const out = []
  let atual = null
  al.caracteres.forEach((c, i) => {
    if (/\s/.test(c)) { if (atual) { out.push(atual); atual = null } return }
    if (!atual) atual = { txt: '', ini: al.inicio[i], fim: al.fim[i] }
    atual.txt += c
    atual.fim = al.fim[i]
  })
  if (atual) out.push(atual)
  return out
}

function blocosDeLegenda(ps) {
  const grupos = []
  let g = []
  const fecha = () => { if (g.length) grupos.push(g); g = [] }
  for (const w of ps) {
    const chars = g.reduce((n, x) => n + x.txt.length + 1, 0) + w.txt.length
    if (g.length >= 3 || (g.length && chars > 20)) fecha()
    g.push(w)
    if (/[.,!?…;:]$/.test(w.txt)) fecha()
  }
  fecha()
  return grupos.map((ws, i) => ({
    txt: ws.map((w) => w.txt).join(' '),
    ini: ws[0].ini,
    fim: ws.at(-1).fim,
    i,
  }))
}

function gerarAss(cfg, r, al, total) {
  const { largura: W, altura: H, fonte } = cfg.montagem
  const { texto, faixas } = textoFalado(r)
  const idx = mapeador(texto, al)

  const inicioBloco = faixas.map((f) => {
    let i = f.ini
    while (i < f.fim && /\s/.test(texto[i])) i++
    return al.inicio[idx(i)]
  })

  const ev = []
  // Texto na tela: do começo do bloco até o começo do próximo.
  r.blocos.forEach((b, i) => {
    if (!b.texto_tela) return
    const ini = i === 0 ? 0 : inicioBloco[i]
    const fim = i + 1 < r.blocos.length ? inicioBloco[i + 1] : total
    ev.push(`Dialogue: 1,${tempoAss(ini)},${tempoAss(fim)},Tela,,0,0,0,,${escAss(b.texto_tela)}`)
  })
  // Legenda da fala, 1 a 3 palavras por vez.
  const leg = blocosDeLegenda(palavras(al))
  leg.forEach((c, i) => {
    const prox = leg[i + 1]?.ini ?? total
    const fim = Math.min(prox, c.fim + 0.5)
    ev.push(`Dialogue: 0,${tempoAss(c.ini)},${tempoAss(fim)},Fala,,0,0,0,,${escAss(c.txt)}`)
  })

  // Margens fora das zonas da interface do Reels (14% em cima, 20% embaixo).
  // "baixo" (padrão) põe o texto na altura do peito, para não cobrir o rosto.
  const alto = cfg.montagem.posicao_texto_tela === 'alto'
  const telaAlin = alto ? 8 : 2
  const telaMargem = Math.round(H * (alto ? 0.16 : 0.36))
  const ass = [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${W}`,
    `PlayResY: ${H}`,
    'WrapStyle: 0',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // Tela: texto preto em caixa laranja (#F57100 → &H000071F5 em BGR).
    `Style: Tela,${fonte},62,&H00141414,&H00141414,&H000071F5,&H000071F5,-1,0,0,0,100,100,0,0,3,16,0,${telaAlin},100,100,${telaMargem},1`,
    // Fala: branco com contorno preto, acima da faixa do botão.
    `Style: Fala,${fonte},68,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,6,2,2,80,80,${Math.round(H * 0.25)},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ...ev,
    '',
  ].join('\n')
  return { ass, inicioBloco }
}

async function main() {
  const { pos, flags } = args()
  const r = await lerRoteiro(pos[0])
  const cfg = await lerConfig()
  const { largura: W, altura: H, fps, zoom, foco_vertical: fv, volume_musica, loudness_lufs } = cfg.montagem
  const dir = pastaSaida(r.id)
  await mkdir(dir, { recursive: true })
  const simular = !!flags.simular

  const avatar = path.join(dir, 'avatar.mp4')
  const voz = path.join(dir, 'voz.mp3')
  const alArq = path.join(dir, 'alinhamento.json')

  let entradas
  let total
  let alinhamento
  if (simular) {
    const foto = caminhoFoto(r.foto)
    const al = existsSync(alArq) ? await lerJson(alArq) : null
    const temVoz = existsSync(voz)
    total = temVoz ? duracao(voz) : alinhamentoEstimado(textoFalado(r).texto).fim.at(-1) + 0.6
    entradas = [
      '-loop', '1', '-framerate', String(fps), '-t', total.toFixed(2), '-i', foto,
      ...(temVoz ? ['-i', voz] : ['-f', 'lavfi', '-t', total.toFixed(2), '-i', 'anullsrc=r=44100:cl=stereo']),
    ]
    console.log(`→ Prévia de ${r.id} com a foto ${r.foto} ${temVoz ? '+ voz gerada' : '(sem voz, tempos estimados)'}`)
    alinhamento = al || alinhamentoEstimado(textoFalado(r).texto)
  } else {
    if (!existsSync(avatar)) throw new Error(`Falta saida/${r.id}/avatar.mp4. Rode gerar-avatar.mjs antes (ou use --simular).`)
    if (!existsSync(alArq)) throw new Error(`Falta saida/${r.id}/alinhamento.json. Rode gerar-voz.mjs antes.`)
    total = duracao(avatar)
    entradas = ['-i', avatar]
    alinhamento = await lerJson(alArq)
  }
  const aIdx = simular ? 1 : 0

  const { ass, inicioBloco } = gerarAss(cfg, r, alinhamento, total)
  await writeFile(path.join(dir, 'legendas.ass'), ass)

  // Cortes: cada bloco vira um trecho com o zoom do seu enquadramento.
  const cortes = [0, ...inicioBloco.slice(1), total]
  const n = r.blocos.length
  const fil = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=${fps},split=${n}${r.blocos.map((_, i) => `[s${i}]`).join('')}`,
  ]
  r.blocos.forEach((b, i) => {
    const z = zoom[b.enquadramento] ?? 1
    const cw = Math.round(W / z / 2) * 2
    const ch = Math.round(H / z / 2) * 2
    fil.push(
      `[s${i}]trim=start=${cortes[i].toFixed(3)}:end=${cortes[i + 1].toFixed(3)},setpts=PTS-STARTPTS,` +
      `crop=${cw}:${ch}:(iw-ow)/2:(ih-oh)*${fv},scale=${W}:${H},setsar=1[v${i}]`,
    )
  })
  fil.push(`${r.blocos.map((_, i) => `[v${i}]`).join('')}concat=n=${n}:v=1:a=0[vc]`)
  fil.push(`[vc]ass=legendas.ass[vout]`)

  const musica = flags.musica ? p('material', 'musica', flags.musica) : null
  if (musica && !existsSync(musica)) throw new Error(`Música não encontrada: material/musica/${flags.musica}`)
  const mIdx = aIdx + 1
  fil.push(`[${aIdx}:a]aresample=44100,aformat=channel_layouts=stereo[voz]`)
  if (musica) {
    fil.push(`[${mIdx}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${volume_musica}[mus]`)
    fil.push(`[voz][mus]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mix]`)
  }
  fil.push(`[${musica ? 'mix' : 'voz'}]loudnorm=I=${loudness_lufs}:TP=-1.5:LRA=11[aout]`)

  const nome = simular ? 'previa.mp4' : 'final.mp4'
  const cmd = [
    '-y', '-hide_banner', '-loglevel', 'error',
    ...entradas,
    ...(musica ? ['-stream_loop', '-1', '-i', musica] : []),
    '-filter_complex', fil.join(';'),
    '-map', '[vout]', '-map', '[aout]',
    '-t', total.toFixed(2),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart',
    nome,
  ]
  execFileSync('ffmpeg', cmd, { cwd: dir, stdio: 'inherit' })
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', '1.0', '-i', nome, '-frames:v', '1', '-q:v', '3', 'capa.jpg'], { cwd: dir })

  await writeFile(path.join(dir, 'legenda-anuncio.txt'), `${r.legenda_anuncio}\n\nBotão: ${r.cta}\nDestino: ${r.destino}\n`)
  const final = path.join(dir, nome)
  await salvarJson(path.join(dir, 'ficha.json'), {
    id: r.id,
    titulo: r.titulo,
    arquivo: nome,
    duracao_s: +duracao(final).toFixed(2),
    blocos: r.blocos.map((b, i) => ({ inicio_s: +cortes[i].toFixed(2), texto_tela: b.texto_tela, enquadramento: b.enquadramento })),
    simulado: simular,
    gerado_em: new Date().toISOString(),
  })
  console.log(`✓ saida/${r.id}/${nome} (${duracao(final).toFixed(1)}s), capa.jpg e legenda-anuncio.txt`)
}

main().catch(falhar)
