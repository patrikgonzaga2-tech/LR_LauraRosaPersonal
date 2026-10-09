// FUNIL DO QUIZ — tela a tela, perfis, respostas que mais compram e anúncio de origem.
// Compra = qualquer venda aprovada com o mesmo código (xcod) da sessão: Efeito Lipo,
// bump ou Comunidade.
import { STEPS } from '../../efeito-lipo-quiz/_data'
import { QUIZ_NOVO, REGUA } from '../_config'
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { compras, decUtm, eventosOferta, perfil, sessaoTeste, sessoes, visitaAnuncio, type Compra, type Sessao } from '../_lib/dados'
import { brl, brl0, div, horaBR, int, pct } from '../_lib/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_lib/periodo'
import { Abas, Barra, Caixa, Grade, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Funil do quiz — Painel Corpo Feliz', robots: { index: false, follow: false } }

const NOME_TELA: Record<string, string> = { intro: '1ª tela', laura: 'Laura', prova: 'Prova social', insight: 'Insight', result: 'Resultado (perfil)', sales: 'Oferta', altura: 'Altura', peso: 'Peso' }
// reached_index = índice da última tela RESPONDIDA (só perguntas gravam; a conclusão grava 24).
// "Chegou na tela i" = respondeu a última pergunta antes de i. A oferta (25) vem do evento "oferta"
// (gravado desde 09/10 ~16h40); antes disso, quem viu o resultado conta como quem viu a oferta.
const GRAVA = STEPS.map((st, j) => (st.kind === 'single' || st.kind === 'multi' ? j : -1)).filter((j) => j >= 0)
const OFERTA_EVENTO_DESDE = '2026-10-09T19:40:00Z'
const antesDe = (i: number) => GRAVA.filter((j) => j < i).pop()
function chegou(s: Sessao, i: number, viuOferta: Set<string>) {
  const r = s.reached_index || 0
  if (i === 0) return true
  if (s.status === 'pageview') return false
  if (i === 1) return true
  if (i === 24) return r >= 24
  if (i >= 25) return s.created_at >= OFERTA_EVENTO_DESDE ? viuOferta.has(s.id) || !!s.checkout_clicked : r >= 24
  const p = antesDe(i)
  return p == null ? true : r >= p
}
function rotuloTela(i: number) {
  const s = STEPS[i] as { id: string; kind: string; headline?: string; title?: string }
  if (!s) return `Tela ${i + 1}`
  const base = NOME_TELA[s.id] || s.headline || s.title || s.id
  return `T${i + 1} · ${String(base).replace(/\s+/g, ' ').slice(0, 70)}`
}

export default async function Quiz({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await bloqueio('quiz')
  if (b) return b
  const sp = await searchParams
  const per = periodo(sp, '7d')
  const since = per.since < QUIZ_NOVO ? new Date(QUIZ_NOVO).toISOString() : per.since
  const soAnuncio = sp.orig !== 'todas'

  const [todas, cs, evs] = await Promise.all([sessoes(since, per.until), compras(since, new Date().toISOString()), eventosOferta(since)])
  const viuOferta = new Set(evs.map((e) => e.session_id))
  const ses = todas.filter((s) => !sessaoTeste(s) && (!soAnuncio || visitaAnuncio(s)))
  const porXcod = new Map<string, Compra[]>()
  for (const c of cs) if (c.xcod) porXcod.set(c.xcod, [...(porXcod.get(c.xcod) || []), c])
  const comprou = (s: Sessao) => !!(s.xcod && porXcod.has(s.xcod))
  const receitaDe = (s: Sessao) => (s.xcod ? (porXcod.get(s.xcod) || []).reduce((a, c) => a + c.liquido, 0) : 0)

  const n = ses.length
  const comecou = ses.filter((s) => s.status !== 'pageview')
  const resultado = ses.filter((s) => (s.reached_index || 0) >= 24)
  const comprar = ses.filter((s) => s.checkout_clicked)
  const compraram = ses.filter(comprou)
  const liquido = compraram.reduce((a, s) => a + receitaDe(s), 0)

  // Funil tela a tela.
  const passos: { rot: string; n: number }[] = []
  for (let i = 0; i < STEPS.length; i++) passos.push({ rot: rotuloTela(i), n: ses.filter((s) => chegou(s, i, viuOferta)).length })
  const ateOnde = (s: Sessao) => { let k = 0; for (let i = 0; i < STEPS.length; i++) if (chegou(s, i, viuOferta)) k = i; return k }
  passos.push({ rot: 'Clicou comprar', n: comprar.length }, { rot: 'Comprou', n: compraram.length })
  const quedas = passos.map((p, i) => (i < passos.length - 1 ? Math.max(0, p.n - passos[i + 1].n) : 0)) // saíram NESTA tela
  const top3 = new Set([...quedas.map((q, i) => [q, i] as const)].sort((a, b) => b[0] - a[0]).slice(0, 3).filter(([q]) => q > 0).map(([, i]) => i))

  // Perfis (quem viu o resultado).
  const perfis = new Map<string, { n: number; ck: number; cp: number }>()
  for (const s of resultado) {
    const p = perfil(s.answers)
    const x = perfis.get(p) ?? { n: 0, ck: 0, cp: 0 }
    x.n++; if (s.checkout_clicked) x.ck++; if (comprou(s)) x.cp++
    perfis.set(p, x)
  }

  // Respostas: para cada pergunta, quem respondeu cada opção e quanto clicou comprar/comprou.
  type Op = { rot: string; n: number; ck: number; cp: number }
  const perguntas: { tela: string; total: number; ops: Op[] }[] = []
  STEPS.forEach((st, i) => {
    if (st.kind !== 'single' && st.kind !== 'multi') return
    const ops = new Map<string, Op>(st.options.map((o) => [o.id, { rot: o.label, n: 0, ck: 0, cp: 0 }]))
    let total = 0
    for (const s of ses) {
      const v = (s.answers || {})[st.id]
      if (v == null || v === '') continue
      total++
      for (const id of Array.isArray(v) ? v : [v]) {
        const o = ops.get(String(id))
        if (!o) continue
        o.n++; if (s.checkout_clicked) o.ck++; if (comprou(s)) o.cp++
      }
    }
    if (total) perguntas.push({ tela: rotuloTela(i), total, ops: [...ops.values()].filter((o) => o.n).sort((a, b) => b.n - a.n) })
  })

  // Por anúncio de origem.
  const porAd = new Map<string, { n: number; c: number; r: number; ck: number; cp: number; liq: number }>()
  for (const s of ses) {
    const k = decUtm(s.utm_content) || (visitaAnuncio(s) ? '(sem nome)' : 'Sem anúncio')
    const x = porAd.get(k) ?? { n: 0, c: 0, r: 0, ck: 0, cp: 0, liq: 0 }
    x.n++; if (s.status !== 'pageview') x.c++; if ((s.reached_index || 0) >= 24) x.r++; if (s.checkout_clicked) x.ck++; if (comprou(s)) { x.cp++; x.liq += receitaDe(s) }
    porAd.set(k, x)
  }
  const ads = [...porAd.entries()].sort((a, b) => b[1].n - a[1].n)

  const extra = { orig: soAnuncio ? undefined : 'todas' }
  const hrefOrig = (o: string) => '?' + new URLSearchParams(Object.entries({ p: per.chave, de: per.chave === 'datas' ? per.diaIni : '', ate: per.chave === 'datas' ? per.diaFim : '', orig: o }).filter(([, v]) => v) as [string, string][]).toString()

  return (
    <PainelShell active="quiz">
      <Titulo titulo="Funil do quiz" sub={<>Quiz &quot;De Volta ao Eixo&quot; (26 telas). Conta a partir do quiz novo (08/10). Compra = venda aprovada com o mesmo código da sessão (Efeito Lipo, bump ou Comunidade).</>} />
      <FiltroPeriodo per={per} extra={extra} presets={[['hoje', 'Hoje'], ['ontem', 'Ontem'], ['7d', '7 dias'], ['30d', 'Desde o quiz novo']]} />
      <Abas ativo={soAnuncio ? 'fb' : 'todas'} itens={[['fb', 'Só visitas reais do anúncio', hrefOrig('')], ['todas', 'Todas as origens', hrefOrig('todas')]]} />

      <Grade min={150}>
        <Tile label="Viram a 1ª tela" value={int(n)} sub={soAnuncio ? 'sem robôs e revisão do Meta' : 'todas as origens'} />
        <Tile label="Começaram" value={pct(comecou.length, n, 0)} sub={`${int(comecou.length)} · régua ${Math.round(REGUA.comecaQuiz * 100)}%`} cor={div(comecou.length, n) >= REGUA.comecaQuiz ? 'var(--g)' : '#c0392b'} />
        <Tile label="Viram o perfil" value={pct(resultado.length, comecou.length, 0)} sub={`${int(resultado.length)} de quem começou`} />
        <Tile label="Clicaram comprar" value={pct(comprar.length, n, 1)} sub={`${int(comprar.length)} · régua ${(REGUA.clicaComprar * 100).toLocaleString('pt-BR')}% de quem viu`} cor={div(comprar.length, n) >= REGUA.clicaComprar ? 'var(--g)' : '#b9770e'} />
        <Tile label="Compraram" value={int(compraram.length)} sub={`${pct(compraram.length, comprar.length, 0)} de quem clicou`} cor="var(--g)" />
        <Tile destaque label="Valor por visita" value={n ? brl(div(liquido, n)) : '—'} sub={`${brl0(liquido)} líquido ÷ ${int(n)} visitas · é o máximo que dá para pagar por visita`} />
      </Grade>

      <Secao titulo="Tela a tela" sub="Quantas pessoas chegaram em cada tela e quantas pararam nela (não foram para a próxima). Em “Clicou comprar”, parar = clicou e não comprou. As 3 maiores quedas em vermelho: é onde mexer primeiro (mudança no quiz só com o ok do Patrik).">
        <Tabela min={620}>
          <thead><tr><th style={thL}>Tela</th><th style={{ ...thL, width: '34%' }}></th><th style={th}>Chegaram</th><th style={th}>% de quem viu</th><th style={th}>Pararam nesta tela</th></tr></thead>
          <tbody>
            {passos.map((p, i) => (
              <tr key={i}>
                <td style={{ ...tdL, fontWeight: top3.has(i) ? 800 : 500, color: top3.has(i) ? '#c0392b' : undefined }}>{p.rot}</td>
                <td style={tdL}><Barra valor={div(p.n, n)} cor={top3.has(i) ? '#c0392b' : i >= passos.length - 2 ? 'var(--g)' : 'var(--o)'} altura={9} /></td>
                <td style={td}>{int(p.n)}</td>
                <td style={td}>{pct(p.n, n, 0)}</td>
                <td style={{ ...td, color: top3.has(i) ? '#c0392b' : 'var(--mute)', fontWeight: top3.has(i) ? 800 : 400 }}>{quedas[i] ? `−${int(quedas[i])}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Perfil de recomeço" sub="Só quem viu o resultado. Mostra qual perfil mais compra (alimenta criativo e copy).">
        <Tabela min={480}>
          <thead><tr><th style={thL}>Perfil</th><th style={th}>Viram</th><th style={th}>Clicaram comprar</th><th style={th}>Compraram</th><th style={th}>Conversão</th></tr></thead>
          <tbody>
            {[...perfis.entries()].sort((a, b) => b[1].n - a[1].n).map(([p, x]) => (
              <tr key={p}><td style={{ ...tdL, fontWeight: 700 }}>{p}</td><td style={td}>{int(x.n)}</td><td style={td}>{int(x.ck)} ({pct(x.ck, x.n, 0)})</td><td style={{ ...td, color: 'var(--g)', fontWeight: 700 }}>{int(x.cp)}</td><td style={td}>{pct(x.cp, x.n)}</td></tr>
            ))}
            {!perfis.size && <tr><td colSpan={5} style={{ ...tdL, color: 'var(--mute)' }}>Ninguém viu o resultado neste período.</td></tr>}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Anúncio de origem" sub="Qualidade da visita por criativo: quem começa, quem chega ao fim, quem compra.">
        <Tabela min={760}>
          <thead><tr><th style={thL}>Anúncio</th><th style={th}>Visitas</th><th style={th}>Começaram</th><th style={th}>Viram perfil</th><th style={th}>Clicaram comprar</th><th style={th}>Compraram</th><th style={th}>Líquido</th><th style={th}>Valor/visita</th></tr></thead>
          <tbody>
            {ads.map(([k, x]) => (
              <tr key={k}><td style={{ ...tdL, fontWeight: 700, maxWidth: 320 }}>{k}</td><td style={td}>{int(x.n)}</td><td style={td}>{pct(x.c, x.n, 0)}</td><td style={td}>{pct(x.r, x.n, 0)}</td><td style={td}>{int(x.ck)}</td><td style={{ ...td, color: x.cp ? 'var(--g)' : undefined, fontWeight: 700 }}>{int(x.cp)}</td><td style={td}>{brl0(x.liq)}</td><td style={td}>{x.n ? brl(div(x.liq, x.n)) : '—'}</td></tr>
            ))}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Respostas que mais compram" sub="Para cada pergunta: quem marcou cada opção e quantas dessas clicaram comprar e compraram. Respostas com mais compra são o público e a dor certos para os próximos criativos.">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px,100%),1fr))' }}>
          {perguntas.map((q) => (
            <Tabela key={q.tela} min={340}>
              <thead><tr><th style={{ ...thL, textTransform: 'none', fontSize: 12.5, color: 'var(--ink)' }} colSpan={4}>{q.tela} <span style={{ color: 'var(--mute)', fontWeight: 500 }}>· {int(q.total)} responderam</span></th></tr>
                <tr><th style={thL}>Opção</th><th style={th}>Marcaram</th><th style={th}>Comprar</th><th style={th}>Compraram</th></tr></thead>
              <tbody>
                {q.ops.map((o) => (
                  <tr key={o.rot}><td style={{ ...tdL, fontSize: 13 }}>{o.rot}</td><td style={td}>{int(o.n)} <span style={{ color: 'var(--mute)' }}>({pct(o.n, q.total, 0)})</span></td><td style={td}>{pct(o.ck, o.n, 0)}</td><td style={{ ...td, color: o.cp ? 'var(--g)' : undefined, fontWeight: o.cp ? 800 : 400 }}>{int(o.cp)}</td></tr>
                ))}
              </tbody>
            </Tabela>
          ))}
        </div>
      </Secao>

      <Secao titulo="Últimas sessões" sub="As 30 mais recentes que começaram o quiz.">
        <Tabela min={680}>
          <thead><tr><th style={thL}>Quando</th><th style={thL}>Anúncio</th><th style={th}>Até onde</th><th style={thL}>Perfil</th><th style={th}>Clicou comprar</th><th style={th}>Comprou</th></tr></thead>
          <tbody>
            {comecou.slice(0, 30).map((s) => (
              <tr key={s.id}><td style={tdL}>{horaBR(s.created_at)}</td><td style={{ ...tdL, maxWidth: 260 }}>{decUtm(s.utm_content) || '—'}</td><td style={td}>T{ateOnde(s) + 1}</td><td style={tdL}>{(s.reached_index || 0) >= 24 ? perfil(s.answers) : '—'}</td><td style={td}>{s.checkout_clicked ? 'sim' : '—'}</td><td style={{ ...td, color: comprou(s) ? 'var(--g)' : undefined, fontWeight: 700 }}>{comprou(s) ? 'sim' : '—'}</td></tr>
            ))}
          </tbody>
        </Tabela>
        <div className="mt-3"><Caixa>Testes A/B da 1ª tela e da oferta: aba <a href="/painel/testes" style={{ color: 'var(--o)', fontWeight: 800 }}>Testes A/B</a>. Quem clicou e não comprou: <a href="/painel/recuperar" style={{ color: 'var(--o)', fontWeight: 800 }}>Recuperar vendas</a>.</Caixa></div>
      </Secao>
    </PainelShell>
  )
}
