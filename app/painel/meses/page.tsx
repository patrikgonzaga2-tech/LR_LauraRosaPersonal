// COMPARAR MESES — faturamento, investimento, lucro, margem e ROI mês a mês.
// Meses fechados: planilha "Gestão financeira Corpo feliz". Mês atual: ao vivo, pela
// mesma conta do Cockpit (vendas reais − Meta − custos em % − custos fixos do mês).
import { HISTORICO } from '../_historico'
import { custosFixos, custosVariaveis, metaAtual } from '../_config'
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { compras, historicoComunidade, lerMeta, metaConjuntos, origemDe, sessoes } from '../_lib/dados'
import { brl0, diaBR, div, num2, pct } from '../_lib/fmt'
import { diaHoje, somaDias } from '../_lib/periodo'
import { Barra, Caixa, Grade, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Comparar meses — Painel Corpo Feliz', robots: { index: false, follow: false } }

const NOME_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const rotMes = (m: string) => `${NOME_MES[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`
const BANCO_DESDE = '2026-07' // a partir daqui o banco tem Greenn + Hotmart completos o bastante para conferir

type Linha = { mes: string; faturamento: number; investimento: number; lucro: number; fonte: 'planilha' | 'painel'; greenn?: number; hotmart?: number; banco?: number; parcial?: boolean }

export default async function Meses() {
  const b = await bloqueio('meses')
  if (b) return b
  const hoje = diaHoje()
  const agora = new Date().toISOString()
  const { cfg: META } = await lerMeta()
  const MA = metaAtual(hoje, META)
  const mesAtual = MA.inicio.slice(0, 7)

  // Vendas do banco desde jul/2026 (conferência) e o mês atual completo.
  const desde = `${BANCO_DESDE}-01T00:00:00-03:00`
  const [cs, conj, ses, hist] = await Promise.all([
    compras(desde, agora),
    metaConjuntos(MA.inicio, hoje),
    sessoes(`${MA.inicio}T00:00:00-03:00`, agora, 'id,created_at,status,xcod,utm_source,utm_medium,referrer'),
    historicoComunidade(agora),
  ])
  // A planilha registra o valor LÍQUIDO dos gateways como "receita" (a Hotmart de out/26 bate exato: R$ 3.371).
  const liqBanco = new Map<string, number>()
  for (const c of cs) { const m = diaBR(c.approved_at).slice(0, 7); liqBanco.set(m, (liqBanco.get(m) || 0) + c.liquido) }

  // Mês atual ao vivo (mesma conta do Cockpit).
  const xq = new Set(ses.map((s) => s.xcod).filter(Boolean) as string[])
  const doMes = cs.filter((c) => { const d = diaBR(c.approved_at); return d >= MA.inicio && d <= somaDias(MA.inicio, MA.dias - 1) })
  const liquido = doMes.reduce((a, c) => a + c.liquido, 0)
  const gasto = conj.reduce((a, r) => a + r.spend, 0)
  const brutoAline = doMes.filter((c) => origemDe(c, xq, hist) === 'WhatsApp (Aline)').reduce((a, c) => a + c.price, 0)
  const lucroAtual = liquido - gasto - custosVariaveis(META, { receita: liquido, gasto, brutoAline }) - custosFixos(META)

  const linhas: Linha[] = [
    ...HISTORICO.filter((h) => h.mes !== mesAtual).map((h) => ({ ...h, fonte: 'planilha' as const, banco: h.mes >= BANCO_DESDE ? liqBanco.get(h.mes) || 0 : undefined })),
    { mes: mesAtual, faturamento: liquido, investimento: gasto, lucro: lucroAtual, fonte: 'painel' as const, greenn: doMes.filter((c) => c.gateway === 'greenn').reduce((a, c) => a + c.liquido, 0), hotmart: doMes.filter((c) => c.gateway === 'hotmart').reduce((a, c) => a + c.liquido, 0), parcial: true },
  ].sort((a, b) => a.mes.localeCompare(b.mes))

  const fechados = linhas.filter((l) => !l.parcial)
  const ult12 = fechados.slice(-12)
  const soma = (k: 'faturamento' | 'investimento' | 'lucro') => ult12.reduce((a, l) => a + l[k], 0)
  const melhor = [...fechados].sort((a, b) => b.lucro - a.lucro)[0]
  const maxFat = Math.max(...linhas.map((l) => l.faturamento), 1)
  const maxLucro = Math.max(...linhas.map((l) => Math.abs(l.lucro)), 1)

  return (
    <PainelShell active="meses">
      <Titulo titulo="Comparar meses" sub={<>Meses fechados vêm da planilha <strong>Gestão financeira Corpo feliz</strong> (lida em 10/10/2026). O mês atual ({rotMes(mesAtual)}) é ao vivo, pela mesma conta do Cockpit, e ainda está pela metade.</>} />

      <Grade min={170}>
        <Tile label={`Faturamento (${ult12.length} meses)`} value={brl0(soma('faturamento'))} sub={`média ${brl0(div(soma('faturamento'), ult12.length))}/mês`} />
        <Tile label="Investimento no Meta" value={brl0(soma('investimento'))} sub={`ROI ${num2(div(soma('faturamento'), soma('investimento')))} (faturamento ÷ investimento)`} />
        <Tile label="Lucro líquido" value={brl0(soma('lucro'))} sub={`${pct(soma('lucro'), soma('faturamento'))} do faturamento`} cor="var(--g)" />
        <Tile label="Melhor mês em lucro" value={melhor ? rotMes(melhor.mes) : '—'} sub={melhor ? `${brl0(melhor.lucro)} · ${pct(melhor.lucro, melhor.faturamento, 0)} de margem` : ''} />
      </Grade>

      <Secao titulo="Mês a mês" sub="Faturamento = o que cai na conta da Greenn e da Hotmart (líquido das taxas), como na planilha. ROI = faturamento ÷ investimento. Lucro por R$ 1 = lucro ÷ investimento. Margem = lucro ÷ faturamento.">
        <Tabela min={980}>
          <thead><tr>
            <th style={thL}>Mês</th><th style={th}>Faturamento</th><th style={th}>Investimento</th><th style={th}>Custos</th><th style={th}>Lucro</th><th style={th}>Margem</th><th style={th}>ROI</th><th style={th}>Lucro por R$ 1</th><th style={th}>Lucro vs mês anterior</th><th style={thL}>Fonte</th>
          </tr></thead>
          <tbody>
            {linhas.map((l, i) => {
              const ant = linhas[i - 1]
              const custos = l.faturamento - l.investimento - l.lucro
              const varL = ant && ant.lucro ? (l.lucro - ant.lucro) / Math.abs(ant.lucro) : null
              return (
                <tr key={l.mes} style={{ background: l.parcial ? 'rgba(245,113,0,.06)' : undefined }}>
                  <td style={{ ...tdL, fontWeight: 800 }}>{rotMes(l.mes)}{l.parcial ? ' (até hoje)' : ''}</td>
                  <td style={td}>{brl0(l.faturamento)}</td>
                  <td style={td}>{brl0(l.investimento)}</td>
                  <td style={{ ...td, color: 'var(--sub)' }}>{brl0(custos)}</td>
                  <td style={{ ...td, fontWeight: 800, color: l.lucro >= 0 ? 'var(--g)' : '#c0392b' }}>{brl0(l.lucro)}</td>
                  <td style={td}>{pct(l.lucro, l.faturamento, 1)}</td>
                  <td style={td}>{l.investimento ? num2(l.faturamento / l.investimento) : '—'}</td>
                  <td style={td}>{l.investimento ? num2(l.lucro / l.investimento) : '—'}</td>
                  <td style={{ ...td, color: varL == null ? undefined : varL >= 0 ? 'var(--g)' : '#c0392b' }}>{varL == null || l.parcial ? '—' : `${varL >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(varL * 100))}%`}</td>
                  <td style={{ ...tdL, color: 'var(--mute)', fontSize: 12 }}>{l.fonte === 'planilha' ? 'planilha' : 'painel (ao vivo)'}</td>
                </tr>
              )
            })}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Faturamento e lucro por mês">
        <div className="rounded-2xl p-4 grid gap-2" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}>
          {linhas.map((l) => (
            <div key={l.mes} className="grid items-center gap-3" style={{ gridTemplateColumns: '70px 1fr 1fr' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{rotMes(l.mes)}</div>
              <div><Barra valor={l.faturamento / maxFat} cor="var(--o)" altura={10} /><div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 2 }}>fat. {brl0(l.faturamento)}</div></div>
              <div><Barra valor={Math.abs(l.lucro) / maxLucro} cor={l.lucro >= 0 ? 'var(--g)' : '#c0392b'} altura={10} /><div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 2 }}>lucro {brl0(l.lucro)}</div></div>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Conferência: planilha × banco do painel" sub="Faturamento líquido dos gateways por mês. Quando o banco fica abaixo da planilha, há vendas que os webhooks não gravaram; acima, a planilha pode ter usado outro corte de data (criação × pagamento) ou ter vendas reembolsadas depois.">
        <Tabela min={560}>
          <thead><tr><th style={thL}>Mês</th><th style={th}>Greenn (planilha)</th><th style={th}>Hotmart (planilha)</th><th style={th}>Total planilha</th><th style={th}>Banco do painel</th><th style={th}>Diferença</th></tr></thead>
          <tbody>
            {linhas.filter((l) => l.banco != null).map((l) => (
              <tr key={l.mes}><td style={{ ...tdL, fontWeight: 700 }}>{rotMes(l.mes)}</td><td style={td}>{l.greenn != null ? brl0(l.greenn) : '—'}</td><td style={td}>{l.hotmart != null ? brl0(l.hotmart) : '—'}</td><td style={td}>{brl0(l.faturamento)}</td><td style={td}>{brl0(l.banco!)}</td><td style={{ ...td, fontWeight: 800, color: Math.abs(l.faturamento - l.banco!) > l.faturamento * 0.05 ? '#c0392b' : 'var(--g)' }}>{brl0(l.banco! - l.faturamento)} ({pct(l.banco!, l.faturamento, 0)})</td></tr>
            ))}
          </tbody>
        </Tabela>
        <div className="mt-3"><Caixa tom="alerta">O mês atual não entra nesta conferência porque a planilha ainda não está fechada. Neste mês, o banco tem Greenn {brl0(linhas[linhas.length - 1].greenn || 0)} e Hotmart {brl0(linhas[linhas.length - 1].hotmart || 0)}: confira com o relatório da Greenn e da Hotmart.</Caixa></div>
      </Secao>
    </PainelShell>
  )
}
