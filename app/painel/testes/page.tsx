// TESTES A/B do quiz e da oferta. Contam a partir de 09/10 16h30 (pedido do Patrik);
// o T4 com 3 braços conta de T4_DESDE. O T2 foi encerrado em 10/10 (T2_FIM).
// Estatística: teste de duas proporções contra o braço A; "chance de ser melhor" = Φ(z).
// Decide com ≥ 100 no braço menor e chance ≥ 95%.
import { T2_FIM, T4_DESDE, TESTE_CHANCE, TESTE_MIN, TESTES_DESDE } from '../_config'
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { compras, ehRobo, eventosOferta, sessaoTeste, sessoes, visitaAnuncio, type Compra, type Sessao } from '../_lib/dados'
import { brl0, horaBR, int, pct } from '../_lib/fmt'
import { Barra, Caixa, Grade, Pill, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Testes A/B — Painel Corpo Feliz', robots: { index: false, follow: false } }

function normCdf(z: number) { // Abramowitz & Stegun 26.2.17
  const x = Math.abs(z), t = 1 / (1 + 0.2316419 * x), d = 0.3989423 * Math.exp(-x * x / 2)
  const tail = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z >= 0 ? 1 - tail : tail
}
/** Chance de B ser melhor que A (duas proporções, p combinado). */
function chanceB(posA: number, baseA: number, posB: number, baseB: number) {
  const pa = baseA ? posA / baseA : 0, pb = baseB ? posB / baseB : 0
  const p = (posA + posB) / ((baseA + baseB) || 1)
  const se = Math.sqrt(p * (1 - p) * (1 / (baseA || 1) + 1 / (baseB || 1)))
  return se ? normCdf((pb - pa) / se) : 0.5
}

type Braco = { nome: string; base: number; pos: number; cols: [string, string][] }
type Teste = { id: string; nome: string; sobre: string; status: string; baseRot: string; posRot: string; bracos: Braco[] } // bracos[0] = A (controle)

export default async function Testes() {
  const b = await bloqueio('testes')
  if (b) return b
  const agora = new Date().toISOString()
  const [ses0, evs, cs] = await Promise.all([sessoes(TESTES_DESDE, agora), eventosOferta(TESTES_DESDE), compras(TESTES_DESDE, agora)])
  const ses = ses0.filter((s) => !sessaoTeste(s) && !ehRobo(s)) // sem teste do painel e sem robôs/revisão do Meta
  const xc = new Map<string, Compra[]>()
  for (const c of cs) if (c.xcod) xc.set(c.xcod, [...(xc.get(c.xcod) || []), c])
  const comprou = (s: Sessao) => !!(s.xcod && xc.has(s.xcod))
  const receita = (s: Sessao) => (s.xcod ? (xc.get(s.xcod) || []).reduce((a, c) => a + c.price, 0) : 0)

  // T1 — 1ª tela (intro_ab)
  const t1 = (arm: string, nome: string): Braco => {
    const l = ses.filter((s) => s.intro_ab === arm)
    const c = l.filter((s) => s.status !== 'pageview').length
    return { nome, base: l.length, pos: c, cols: [['Visitas', int(l.length)], ['Começaram', `${int(c)} (${pct(c, l.length, 0)})`], ['Viram o perfil', int(l.filter((s) => (s.reached_index || 0) >= 24).length)], ['Clicaram comprar', int(l.filter((s) => s.checkout_clicked).length)], ['Compraram', int(l.filter(comprou).length)]] }
  }
  // T2 — preço do Efeito Lipo (checkout_ab greenn × greenn-B), encerrado em T2_FIM
  const t2 = (arm: string, nome: string): Braco => {
    const l = ses.filter((s) => s.checkout_ab === arm && s.created_at < new Date(T2_FIM).toISOString())
    const v = l.filter(comprou).length
    return { nome, base: l.length, pos: v, cols: [['Clicaram comprar', int(l.length)], ['Compraram', `${int(v)} (${pct(v, l.length, 0)})`], ['Receita', brl0(l.reduce((a, s) => a + receita(s), 0))]] }
  }
  // T4 — oferta com Efeito Lipo × só Comunidade (evento "oferta": E-A:A / E-B / E-C), desde T4_DESDE
  const primeiro = new Map<string, string>()
  for (const e of evs) if (!primeiro.has(e.session_id)) primeiro.set(e.session_id, e.answer)
  const sesPorId = new Map(ses.map((s) => [s.id, s]))
  const t4Desde = new Date(T4_DESDE).toISOString()
  const t4 = (arm: string, nome: string): Braco => {
    const l = [...primeiro.entries()].filter(([, a]) => a.split(':')[0] === arm).map(([id]) => sesPorId.get(id)).filter((s): s is Sessao => !!s && s.created_at >= t4Desde)
    const v = l.filter(comprou).length, r = l.reduce((a, s) => a + receita(s), 0)
    return { nome, base: l.length, pos: v, cols: [['Viram a oferta', int(l.length)], ['Clicaram comprar', int(l.filter((s) => s.checkout_clicked).length)], ['Compraram', `${int(v)} (${pct(v, l.length, 1)})`], ['Receita', brl0(r)], ['Receita por visita', l.length ? `R$ ${(r / l.length).toFixed(2).replace('.', ',')}` : '—']] }
  }

  const testes: Teste[] = [
    { id: 'T1', nome: '1ª tela do quiz: tela atual × título de recomeço', status: 'no ar desde 09/10 13h40', baseRot: 'visitas', posRot: 'começaram', sobre: 'Metade vê a tela atual; metade vê "Descubra seu perfil de recomeço em 2 minutos…". Mede quantas começam o quiz. É o teste que mais recebe gente.', bracos: [t1('G-A', 'A · tela atual'), t1('G-B', 'B · título de recomeço')] },
    { id: 'T4', nome: 'Oferta: com Efeito Lipo × só a Comunidade (mensal ou trimestral)', status: `3 braços desde ${horaBR(T4_DESDE)}`, baseRot: 'visitas na oferta', posRot: 'compraram', sobre: 'Um terço vê Efeito Lipo R$ 37 + Comunidade; um terço vê só a Comunidade a R$ 37/mês (Pix ou cartão); um terço vê só a Comunidade trimestral a R$ 97 a cada 3 meses. Decida pela receita por visita: o braço que vende menos pode faturar mais.', bracos: [t4('E-A', 'A · Efeito Lipo + Comunidade'), t4('E-B', 'B · só Comunidade R$ 37/mês'), t4('E-C', 'C · só Comunidade R$ 97/trimestre')] },
  ]
  const t2Fim = [t2('greenn', 'A · R$ 37 (QN7gci)'), t2('greenn-B', 'B · R$ 47 (gLO7Gm)')]

  const reais = ses.filter(visitaAnuncio).length
  const ideias = [
    ['T3', 'Comunidade R$ 37 × R$ 27 por mês', 'Falta criar na Greenn a assinatura de R$ 27/mês. Cuidado: fica perto da anual (R$ 297 = R$ 24,75/mês), que é a que mais vende.'],
    ['T6', 'Oferta logo depois da compra do Efeito Lipo', 'Quem acabou de comprar vê a Comunidade na /acompanhamento-up, com "não, obrigada" levando ao grupo. Pega todas as compradoras, não só as do quiz.'],
  ]

  return (
    <PainelShell active="testes">
      <Titulo titulo="Testes A/B" sub={<>Contam desde {horaBR(TESTES_DESDE)} (sessões de teste do painel e robôs do Meta ficam de fora). Decide com <strong>{TESTE_MIN}+ no braço menor</strong> e <strong>{Math.round(TESTE_CHANCE * 100)}% de chance</strong>. Os testes são em camadas: toda visita passa pelo T1; quem chega à oferta cai no T4 (3 braços, um terço cada).</>} />
      <Grade min={160}>
        <Tile label="Visitas desde o início" value={int(ses.length)} sub={`${int(reais)} reais do anúncio`} />
        <Tile label="Chegaram à oferta" value={int(primeiro.size)} sub="entraram no T4" />
        <Tile label="Compras ligadas ao quiz" value={int(ses.filter(comprou).length)} sub="mesmo código da sessão" cor="var(--g)" />
      </Grade>

      {testes.map((t) => {
        const a = t.bracos[0]
        // Desafiante = o braço com a maior taxa; a chance é dele contra o A.
        const desafiantes = t.bracos.slice(1)
        const taxa = (x: Braco) => (x.base ? x.pos / x.base : 0)
        const b = desafiantes.reduce((m, x) => (taxa(x) > taxa(m) ? x : m), desafiantes[0])
        const pB = chanceB(a.pos, a.base, b.pos, b.base)
        const menor = Math.min(...t.bracos.map((x) => x.base))
        const empate = Math.abs(pB - 0.5) < 0.02 || t.bracos.some((x) => !x.base)
        const lider = pB >= 0.5 ? b : a
        const chance = Math.max(pB, 1 - pB)
        const decide = menor >= TESTE_MIN && chance >= TESTE_CHANCE
        return (
          <Secao key={t.id} titulo={`${t.id} · ${t.nome}`} sub={<>{t.status}. {t.sobre}</>}>
            <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Pill tipo={decide ? 'ok' : menor < TESTE_MIN ? 'n' : 'wait'}>{decide ? 'Já dá para decidir' : menor < TESTE_MIN ? 'Juntando dados' : 'Ainda sem certeza'}</Pill>
                <span style={{ fontSize: 13.5 }}>{menor < TESTE_MIN ? <>Faltam {int(TESTE_MIN - menor)} {t.baseRot} no braço menor. {empate ? 'Por enquanto, empate.' : <>Na frente hoje: <strong>{lider.nome}</strong>.</>}</> : <>Vencendo: <strong>{lider.nome}</strong>, com {Math.round(chance * 100)}% de chance de ser a melhor ({t.posRot} ÷ {t.baseRot}).</>}</span>
              </div>
              <div className="mb-3"><div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 4 }}>Chance de {desafiantes.length > 1 ? b.nome.split(' · ')[0] : 'B'} ser melhor que A: {Math.round(pB * 100)}%</div><Barra valor={pB} marca={0.5} cor={pB >= 0.5 ? 'var(--g)' : 'var(--o)'} /></div>
              <Tabela min={480}>
                <thead><tr><th style={thL}>Braço</th>{a.cols.map(([k]) => <th key={k} style={th}>{k}</th>)}</tr></thead>
                <tbody>{t.bracos.map((x) => <tr key={x.nome}><td style={{ ...tdL, fontWeight: 700 }}>{x.nome}</td>{x.cols.map(([k, v]) => <td key={k} style={td}>{v}</td>)}</tr>)}</tbody>
              </Tabela>
            </div>
          </Secao>
        )
      })}

      <Secao titulo="Testes encerrados" sub="Ficam aqui com o resultado final.">
        <Caixa>
          <strong>T2 · Preço do Efeito Lipo: R$ 37 × R$ 47.</strong> Encerrado em {horaBR(T2_FIM)} pelo Patrik: só recebia quem caía no A do T4 e clicava em comprar (≈ 2 por dia), então levaria meses para decidir. Ficou R$ 37 para todos.{' '}
          {t2Fim.map((x) => `${x.nome}: ${x.cols.map(([k, v]) => `${k.toLowerCase()} ${v}`).join(', ')}`).join(' · ')}.
        </Caixa>
      </Secao>

      <Secao titulo="Ideias para os próximos testes" sub="Mexem em preço ou oferta: só entram no ar com o ok do Patrik.">
        <div className="grid gap-2">{ideias.map(([id, n, s]) => <Caixa key={id}><strong>{id} · {n}.</strong> {s}</Caixa>)}</div>
      </Secao>
    </PainelShell>
  )
}
