// ANÚNCIOS E ROI — gerenciador próprio: Meta (gasto, cliques) + quiz (sessões,
// clique em comprar) + vendas REAIS dos gateways, por campanha, conjunto e anúncio.
// ROI = líquido ÷ gasto (pedido do Patrik): 1 = empate, acima de 1 = lucro.
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { ATIVOS, PROBLEMA, compras, metaAnuncios, metaAtualizadoEm, metaConjuntos, metaStatus, montarAnuncios, sessoes, sinal, type Linha } from '../_lib/dados'
import { brl, brl0, div, horaBR, int, num2, pct } from '../_lib/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_lib/periodo'
import { Abas, Caixa, Grade, Pill, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Anúncios e ROI — Painel Corpo Feliz', robots: { index: false, follow: false } }

const ST_ROT: Record<string, string> = { ACTIVE: 'ativo', PAUSED: 'pausado', ADSET_PAUSED: 'conjunto pausado', CAMPAIGN_PAUSED: 'campanha pausada', ARCHIVED: 'arquivado', DISAPPROVED: 'reprovado', WITH_ISSUES: 'com problema', PENDING_REVIEW: 'em análise', IN_PROCESS: 'processando' }

export default async function Anuncios({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const nivel = (['campanha', 'conjunto', 'anuncio'].includes(sp.nivel || '') ? sp.nivel : 'campanha') as Linha['nivel']
  const b = await bloqueio(nivel === 'anuncio' ? 'criativos' : 'anuncios')
  if (b) return b
  const per = periodo(sp, '7d')
  const todos = sp.ver === 'todos'

  const [conj, ads, st, ses, cs, metaEm] = await Promise.all([
    metaConjuntos(per.diaIni, per.diaFim),
    metaAnuncios(per.diaIni, per.diaFim),
    metaStatus(),
    sessoes(per.since, per.until, 'id,created_at,status,reached_index,utm_source,utm_medium,utm_term,utm_content,xcod,checkout_clicked,referrer'),
    compras(per.since, per.until),
    metaAtualizadoEm(),
  ])
  const M = montarAnuncios(conj, ads, st, ses, cs)
  const linhasTodas = nivel === 'campanha' ? M.campanhas : nivel === 'conjunto' ? M.conjuntos : M.anuncios
  const linhas = linhasTodas.filter((l) => todos || l.gasto > 0 || ATIVOS.has(l.status)).sort((a, b) => b.gasto - a.gasto)

  const T = M.campanhas.reduce((t, c) => ({ gasto: t.gasto + c.gasto, imp: t.imp + c.impressoes, cli: t.cli + c.cliques, lp: t.lp + c.lp, ses: t.ses + c.sessoes, vis: t.vis + c.visitas, comprar: t.comprar + c.comprar, vendas: t.vendas + c.vendas, liq: t.liq + c.liquido, rec: t.rec + c.receita }), { gasto: 0, imp: 0, cli: 0, lp: 0, ses: 0, vis: 0, comprar: 0, vendas: 0, liq: 0, rec: 0 })
  const roi = div(T.liq, T.gasto)

  // "Como melhorar" (regras do painel do claude.ai, só itens ativos).
  const dicas: { tipo: 'ok' | 'wait' | 'no' | 'n'; t: string }[] = []
  const ativosConj = M.conjuntos.filter((l) => ATIVOS.has(l.status))
  ativosConj.filter((l) => l.vendas > 0 && l.liquido >= l.gasto).sort((a, b) => div(b.liquido, b.gasto) - div(a.liquido, a.gasto)).slice(0, 2)
    .forEach((l) => dicas.push({ tipo: 'ok', t: `Subir a verba do conjunto "${l.nome}" em 20% (ROI ${num2(div(l.liquido, l.gasto))}, ${l.vendas} compras). Olhar de novo em 2 dias.` }))
  ativosConj.filter((l) => l.vendas > 0 && l.liquido < l.gasto).forEach((l) => dicas.push({ tipo: 'wait', t: `"${l.nome}" vende, mas dá prejuízo: custo por compra ${brl(div(l.gasto, l.vendas))} para ${brl(div(l.liquido, l.vendas))} de líquido por compra.` }))
  ativosConj.filter((l) => l.vendas === 0 && l.gasto >= 40 && l.comprar === 0).forEach((l) => dicas.push({ tipo: 'no', t: `Pausar? "${l.nome}": ${brl0(l.gasto)} gastos e ninguém clicou em comprar.` }))
  const adsAtivos = M.anuncios.filter((l) => ATIVOS.has(l.status))
  const melhorCtr = [...adsAtivos].filter((l) => l.gasto >= 3).sort((a, b) => div(b.cliques, b.impressoes) - div(a.cliques, a.impressoes))[0]
  adsAtivos.filter((l) => l.gasto >= 8 && l.impressoes > 0 && div(l.cliques, l.impressoes) < 0.008).forEach((l) => dicas.push({ tipo: 'no', t: `Trocar o criativo "${l.nome}": CTR ${pct(l.cliques, l.impressoes)}${melhorCtr ? ` (o melhor, "${melhorCtr.nome}", faz ${pct(melhorCtr.cliques, melhorCtr.impressoes)})` : ''}.` }))
  if (T.cli >= 20 && T.vis < T.cli * 0.5) dicas.push({ tipo: 'wait', t: `Metade dos cliques não chega ao quiz (${int(T.vis)} visitas para ${int(T.cli)} cliques): conferir UTMs e velocidade da página.` })
  const problemas = M.anuncios.filter((l) => PROBLEMA.has(l.status))
  if (problemas.length) dicas.push({ tipo: 'no', t: `${problemas.length} anúncio(s) reprovado(s) ou com problema: ${problemas.slice(0, 4).map((l) => `"${l.nome}"`).join(', ')}.` })
  if (!dicas.length) dicas.push({ tipo: 'ok', t: 'Nada para mexer agora.' })

  const keep = { nivel, ver: todos ? 'todos' : undefined }
  const href = (n: string) => '?' + new URLSearchParams(Object.entries({ p: per.chave, de: per.chave === 'datas' ? per.diaIni : '', ate: per.chave === 'datas' ? per.diaFim : '', nivel: n, ver: todos ? 'todos' : '' }).filter(([, v]) => v) as [string, string][]).toString()

  return (
    <PainelShell active={nivel === 'anuncio' ? 'criativos' : 'anuncios'}>
      <Titulo titulo={nivel === 'anuncio' ? 'Criativos' : 'Anúncios e ROI'} sub={<>Gasto e cliques do Meta (atualizado {metaEm ? horaBR(metaEm) : '—'}) com as <strong>vendas reais</strong> da Greenn e da Hotmart. Uma venda é do anúncio quando o link levou o id do conjunto (quiz e LP) ou &quot;FB|campanha&quot;. O anúncio é achado pela sessão do quiz com o mesmo código da compra.</>} />
      <FiltroPeriodo per={per} extra={keep} />

      <Grade min={140}>
        <Tile label="Gasto" value={brl0(T.gasto)} sub={`${int(T.imp)} impressões · CPM ${brl(div(T.gasto, T.imp) * 1000)}`} />
        <Tile label="Cliques no link" value={int(T.cli)} sub={`CTR ${pct(T.cli, T.imp)} · ${brl(div(T.gasto, T.cli))}/clique`} />
        <Tile label="Abriram a página" value={pct(T.lp, T.cli, 0)} sub={`${int(T.lp)} de ${int(T.cli)} cliques (bom: 70%+)`} cor={div(T.lp, T.cli) >= 0.7 ? 'var(--g)' : '#b9770e'} />
        <Tile label="Clicaram comprar" value={int(T.comprar)} sub={`${pct(T.comprar, T.vis)} das ${int(T.vis)} visitas do quiz`} />
        <Tile label="Compras de anúncio" value={int(T.vendas)} sub={T.vendas ? `custo por compra ${brl(div(T.gasto, T.vendas))}` : 'nenhuma no período'} cor="var(--g)" />
        <Tile label="Líquido de anúncio" value={brl0(T.liq)} sub={`bruto ${brl0(T.rec)} · lucro ${brl0(T.liq - T.gasto)}`} cor={T.liq >= T.gasto ? 'var(--g)' : '#c0392b'} />
        <Tile destaque label="ROI" value={T.gasto ? num2(roi) : '—'} sub="líquido ÷ gasto · 1 = empate" />
      </Grade>

      <Secao titulo="Como melhorar" sub="Regras fixas sobre os itens ativos do período. Verba e pausa: só com o ok do Patrik.">
        <div className="grid gap-2">{dicas.map((d, i) => <Caixa key={i} tom={d.tipo === 'ok' ? 'ok' : d.tipo === 'no' ? 'erro' : 'alerta'}>{d.t}</Caixa>)}</div>
      </Secao>

      <Secao titulo={nivel === 'campanha' ? 'Campanhas' : nivel === 'conjunto' ? 'Conjuntos' : 'Anúncios (criativos)'} sub="Clique no nível para trocar. Ordenado pelo gasto. ROI e custo por compra usam só vendas reais.">
        <div className="flex flex-wrap items-center gap-2"><Abas ativo={nivel} itens={[['campanha', 'Campanhas', href('campanha')], ['conjunto', 'Conjuntos', href('conjunto')], ['anuncio', 'Anúncios', href('anuncio')]]} />
          <a href={'?' + new URLSearchParams(Object.entries({ p: per.chave, de: per.chave === 'datas' ? per.diaIni : '', ate: per.chave === 'datas' ? per.diaFim : '', nivel, ver: todos ? '' : 'todos' }).filter(([, v]) => v) as [string, string][]).toString()} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--o)', marginBottom: 16, marginLeft: 'auto' }}>{todos ? 'só com gasto ou ativos' : 'mostrar todos'}</a></div>
        <Tabela min={1100}>
          <thead><tr>
            <th style={thL}>{nivel === 'campanha' ? 'Campanha' : nivel === 'conjunto' ? 'Conjunto' : 'Anúncio'}</th>
            <th style={th}>Gasto</th><th style={th}>CTR</th><th style={th}>CPM</th><th style={th}>Cliques</th><th style={th}>Abriu pág.</th>
            <th style={th}>Visitas quiz</th><th style={th}>Começaram</th><th style={th}>Comprar</th><th style={th}>Compras</th><th style={th}>Líquido</th><th style={th}>ROI</th><th style={th}>Custo/compra</th><th style={thL}>Sinal</th>
          </tr></thead>
          <tbody>
            {linhas.map((l) => {
              const s = sinal(l)
              const r = l.gasto > 0 ? l.liquido / l.gasto : null
              return (
                <tr key={l.id}>
                  <td style={{ ...tdL, minWidth: 230, maxWidth: 320 }}>
                    <div style={{ fontWeight: 700 }}>{l.nome}</div>
                    <div style={{ fontSize: 11.5, color: PROBLEMA.has(l.status) ? '#c0392b' : 'var(--mute)' }}>{ST_ROT[l.status] || l.status.toLowerCase()}{l.pai ? ` · ${l.pai}` : ''}</div>
                  </td>
                  <td style={td}>{brl0(l.gasto)}</td>
                  <td style={td}>{pct(l.cliques, l.impressoes)}</td>
                  <td style={td}>{l.impressoes ? brl0(div(l.gasto, l.impressoes) * 1000) : '—'}</td>
                  <td style={td}>{int(l.cliques)}</td>
                  <td style={{ ...td, color: l.cliques >= 10 && div(l.lp, l.cliques) < 0.7 ? '#c0392b' : undefined }}>{pct(l.lp, l.cliques, 0)}</td>
                  <td style={td}>{int(l.visitas)}</td>
                  <td style={{ ...td, color: l.visitas >= 10 && div(l.sessoes, l.visitas) < 0.32 ? '#c0392b' : undefined }}>{pct(l.sessoes, l.visitas, 0)}</td>
                  <td style={td}>{int(l.comprar)}</td>
                  <td style={{ ...td, fontWeight: 800, color: l.vendas ? 'var(--g)' : undefined }}>{int(l.vendas)}</td>
                  <td style={td}>{brl0(l.liquido)}</td>
                  <td style={{ ...td, fontWeight: 800, color: r == null ? undefined : r >= 1 ? 'var(--g)' : '#c0392b' }}>{num2(r)}</td>
                  <td style={td}>{l.vendas ? brl(div(l.gasto, l.vendas)) : '—'}</td>
                  <td style={tdL}><Pill tipo={s.tipo} title={s.motivo}>{s.rotulo}</Pill><div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2, maxWidth: 220 }}>{s.motivo}</div></td>
                </tr>
              )
            })}
            {!linhas.length && <tr><td colSpan={14} style={{ ...tdL, color: 'var(--mute)', padding: 18 }}>Nada com gasto neste período.</td></tr>}
          </tbody>
        </Tabela>
        <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 8, lineHeight: 1.5 }}>
          &quot;Visitas quiz&quot; conta só visitas reais do anúncio (sem a revisão e os robôs do Meta); &quot;Começaram&quot; = % dessas que começaram o quiz (régua 32%). Compra no anúncio só aparece quando a cliente passou pelo quiz; compra feita direto na LP fica no conjunto e na campanha. Verba diária e motivo de reprovação estão só no Gerenciador do Meta.
        </p>
      </Secao>
    </PainelShell>
  )
}
