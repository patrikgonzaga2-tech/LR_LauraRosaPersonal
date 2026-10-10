// COCKPIT DO DIA — a primeira tela do Painel Corpo Feliz.
// Responde, nesta ordem: (1) vamos bater a meta de lucro do mês? (2) como foi
// hoje × ontem × 7 dias? (3) o que eu faço agora? (4) de onde veio o dinheiro?
import { GRUPOS, custosFixos, custosVariaveis, metaAtual, valorCusto, type BaseCusto } from './_config'
import EditarMeta from './_lib/editar-meta'
import { PainelShell } from './_shell'
import { bloqueio } from './_lib/acesso'
import {
  ATIVOS, PROBLEMA, assinantes, lerMeta, compras, contaCompras, historicoComunidade, metaAnuncios, metaAtualizadoEm, metaConjuntos,
  metaStatus, montarAnuncios, origemDe, ORIGEM_COR, pendentes, sessoes, sinal, vendasRaw, visitaAnuncio, sessaoTeste, type Compra, type MetaLinha,
} from './_lib/dados'
import { brl, brl0, diaBR, div, horaBR, int, pct, plural } from './_lib/fmt'
import { diaHoje, somaDias } from './_lib/periodo'
import { Barra, Caixa, Grade, Pill, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from './_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cockpit do dia — Painel Corpo Feliz', robots: { index: false, follow: false } }

const DIA = 86_400_000

export default async function Cockpit() {
  const b = await bloqueio('hoje')
  if (b) return b

  const hoje = diaHoje()
  const ontem = somaDias(hoje, -1)
  const d7 = somaDias(hoje, -6)
  const d3 = somaDias(hoje, -2)
  const { cfg: META, atualizadoEm: metaEditadaEm } = await lerMeta()
  const MA = metaAtual(hoje, META)
  const mesIni = MA.inicio
  const desde = d7 < mesIni ? d7 : mesIni
  const agora = new Date().toISOString()

  const [cs, conj, ads, st, raw, ses, hist, assin, metaEm] = await Promise.all([
    compras(`${desde}T00:00:00-03:00`, agora),
    metaConjuntos(desde, hoje),
    metaAnuncios(d7, hoje),
    metaStatus(),
    vendasRaw(new Date(Date.now() - 3 * DIA).toISOString(), agora),
    sessoes(`${desde}T00:00:00-03:00`, agora),
    historicoComunidade(agora),
    assinantes(),
    metaAtualizadoEm(),
  ])

  // ── Origem de cada compra (para a comissão da Aline e o "de onde veio") ──
  const xcodsQuiz = new Set(ses.map((s) => s.xcod).filter(Boolean) as string[])
  const origemDaCompra = new Map(cs.map((c) => [c.transaction, origemDe(c, xcodsQuiz, hist)]))
  const ehAline = (c: Compra) => origemDaCompra.get(c.transaction) === 'WhatsApp (Aline)'

  // ── Recortes por dia ──
  // contrib = líquido − Meta − custos em % (imposto, imposto do Meta, comissão). Os fixos saem à parte.
  const noDia = (c: Compra, a: string, z: string) => { const d = diaBR(c.approved_at); return d >= a && d <= z }
  const gastoEntre = (a: string, z: string, rows: MetaLinha[] = conj) => rows.filter((r) => r.date >= a && r.date <= z).reduce((s, r) => s + r.spend, 0)
  const resumo = (a: string, z: string) => {
    const l = cs.filter((c) => noDia(c, a, z))
    const gasto = gastoEntre(a, z)
    const liquido = l.reduce((s, c) => s + c.liquido, 0)
    const receita = l.reduce((s, c) => s + c.price, 0)
    const brutoAline = l.filter(ehAline).reduce((s, c) => s + c.price, 0)
    const base: BaseCusto = { receita: liquido, gasto, brutoAline } // planilha: imposto sobre o líquido dos gateways
    const variaveis = custosVariaveis(META, base)
    return { itens: l.length, compras: contaCompras(l), receita, liquido, gasto, base, variaveis, lucroAds: liquido - gasto - variaveis }
  }
  const rHoje = resumo(hoje, hoje), rOntem = resumo(ontem, ontem), r7 = resumo(d7, hoje)
  const mesFim = somaDias(mesIni, MA.dias - 1)
  const rMes = resumo(mesIni, mesFim)

  // ── Meta do mês (lucro = líquido − Meta − custos em % − custos fixos) ──
  const custos = custosFixos(META)
  const custoDia = custos / MA.dias
  const t0 = new Date(`${mesIni}T00:00:00-03:00`).getTime()
  const passados = Math.min(MA.dias, Math.max(0, (Date.now() - t0) / DIA))
  const resta = Math.max(0, MA.dias - passados)
  const lucro = rMes.lucroAds - custos
  const lucroAteHoje = rMes.lucroAds - custoDia * passados // custos rateados até agora
  const pctTempo = passados / MA.dias
  const pctMeta = div(Math.max(0, lucroAteHoje), META.lucro)
  const ritmoMes = passados >= 1 ? rMes.lucroAds / passados : 0
  const r7c = resumo(somaDias(hoje, -7), ontem) // 7 dias completos (sem o hoje parcial)
  const ritmo7 = r7c.lucroAds / 7
  const projMes = rMes.lucroAds + ritmoMes * resta - custos
  const proj7 = rMes.lucroAds + ritmo7 * resta - custos
  const falta = Math.max(0, META.lucro - lucro)
  const precisaDia = resta > 0.01 ? falta / resta : falta // líquido − Meta − custos em %, por dia
  const estado: ['ok' | 'wait' | 'no' | 'n', string] =
    lucro >= META.lucro ? ['ok', 'Meta batida'] : pctTempo < 0.03 ? ['n', 'Começando'] : pctMeta >= pctTempo ? ['ok', 'No ritmo'] : pctMeta >= pctTempo * 0.6 ? ['wait', 'Abaixo do ritmo'] : ['no', 'Bem abaixo do ritmo']

  // Meta diária reversa em vendas: quantas anuais (ou Comunidade) por dia fecham a conta.
  const comMes = cs.filter((c) => c.familia === 'Comunidade' && noDia(c, mesIni, mesFim))
  // Quanto sobra de cada venda da Comunidade depois do imposto e da comissão (se for da Aline).
  const pctDe = (t: string) => META.custos.filter((c) => c.tipo === t).reduce((a, c) => a + c.valor / 100, 0)
  const liqCom = div(comMes.reduce((s, c) => s + c.liquido - c.liquido * pctDe('pct_fat') - (ehAline(c) ? c.price * pctDe('pct_aline') : 0), 0), comMes.length)
  const elMes = cs.filter((c) => c.familia === 'Efeito Lipo' && noDia(c, mesIni, mesFim))
  const liqEl = div(elMes.reduce((s, c) => s + c.liquido, 0), contaCompras(elMes))
  const comPorDia = liqCom > 0 ? precisaDia / liqCom : null

  // ── Origem do dinheiro no mês ──
  const origens = new Map<string, { itens: number; liquido: number }>()
  for (const c of cs.filter((c) => noDia(c, mesIni, mesFim))) {
    const o = origemDaCompra.get(c.transaction) || 'Sem rastreio'
    const x = origens.get(o) ?? { itens: 0, liquido: 0 }
    x.itens++; x.liquido += c.liquido
    origens.set(o, x)
  }
  const origensL = [...origens.entries()].sort((a, b) => b[1].liquido - a[1].liquido)

  // ── O que fazer agora (regras, sem IA) ──
  const acoes: { tipo: 'ok' | 'wait' | 'no' | 'n'; titulo: string; texto: string; href?: string }[] = []
  const pend = pendentes(raw).filter((p) => Date.now() - new Date(p.quando).getTime() < 2 * DIA)
  if (pend.length) acoes.push({ tipo: 'no', titulo: `Chamar ${plural(pend.length, 'pessoa', 'pessoas')} com pagamento parado (${brl0(pend.reduce((s, p) => s + p.valor, 0))})`, texto: `Pix/boleto gerado e não pago${pend.some((p) => p.tipo === 'atrasada') ? ' ou assinatura com cobrança atrasada' : ''} nas últimas 48 h. Chamar no WhatsApp em até 1 hora recupera boa parte.`, href: '/painel/recuperar' })

  const conj3 = conj.filter((r) => r.date >= d3)
  const ads3 = ads.filter((r) => r.date >= d3)
  const ses3 = ses.filter((s) => diaBR(s.created_at) >= d3)
  const cs3 = cs.filter((c) => diaBR(c.approved_at) >= d3)
  const { conjuntos: L3 } = montarAnuncios(conj3, ads3, st, ses3, cs3)
  for (const l of L3.filter((l) => ATIVOS.has(l.status))) {
    const s = sinal(l)
    if (s.rotulo === 'Pausar?') acoes.push({ tipo: 'no', titulo: `Pausar? conjunto "${l.nome}"`, texto: `${s.motivo} (3 dias).`, href: '/painel/anuncios?p=3d&nivel=conjunto' })
    if (s.rotulo === 'Escalar') acoes.push({ tipo: 'ok', titulo: `Escalar conjunto "${l.nome}"`, texto: `${s.motivo} (3 dias). Custo por compra ${brl(div(l.gasto, l.vendas))}.`, href: '/painel/anuncios?p=3d&nivel=conjunto' })
    const cr = div(l.lp, l.cliques)
    if (l.cliques >= 20 && cr < 0.7) acoes.push({ tipo: 'wait', titulo: `Página lenta? "${l.nome}"`, texto: `Só ${pct(l.lp, l.cliques, 0)} de quem clicou abriu a página (bom é acima de 70%). Conferir velocidade e link.` })
  }
  const adSet = new Map<string, string>()
  for (const r of ads) if (r.adset_id) adSet.set(r.ad_id, r.adset_id)
  const comProblema = [...new Set(ads.map((r) => r.ad_id))].filter((id) => PROBLEMA.has(st.get(id)?.status || '') && ATIVOS.has(st.get(adSet.get(id) || '')?.status || ''))
  if (comProblema.length) acoes.push({ tipo: 'no', titulo: `${plural(comProblema.length, 'anúncio reprovado ou com problema', 'anúncios reprovados ou com problema')} em conjunto ativo`, texto: 'Abrir no Gerenciador do Meta e corrigir ou trocar o criativo.', href: '/painel/anuncios?p=7d&nivel=anuncio' })

  const sesHoje = ses.filter((s) => diaBR(s.created_at) === hoje && visitaAnuncio(s) && !sessaoTeste(s))
  const ses7 = ses.filter((s) => diaBR(s.created_at) >= d7 && visitaAnuncio(s) && !sessaoTeste(s))
  const comecou7 = ses7.filter((s) => s.status !== 'pageview').length
  if (ses7.length >= 40 && div(comecou7, ses7.length) < 0.32) acoes.push({ tipo: 'wait', titulo: 'A 1ª tela do quiz está perdendo gente', texto: `Nos últimos 7 dias só ${pct(comecou7, ses7.length, 0)} das visitas do anúncio começaram o quiz (régua: 32%). O teste T1 mede a tela nova.`, href: '/painel/testes' })

  const em7 = Date.now() + 7 * DIA
  const vencendo = assin.filter((a) => a.status === 'ativo' && a.vence_em && new Date(a.vence_em).getTime() <= em7 && new Date(a.vence_em).getTime() >= Date.now() - DIA)
  if (vencendo.length) acoes.push({ tipo: 'wait', titulo: `${plural(vencendo.length, 'assinatura vence', 'assinaturas vencem')} nos próximos 7 dias`, texto: `Valem ${brl0(vencendo.reduce((s, a) => s + a.ultimo_valor, 0))}. Uma mensagem antes do vencimento segura a renovação (e evita cancelamento por cartão recusado).`, href: '/painel/recorrencia' })

  if (estado[0] === 'no' || estado[0] === 'wait') acoes.push({ tipo: estado[0], titulo: `Meta: ${estado[1].toLowerCase()}`, texto: `Para fechar R$ ${int(META.lucro)} faltam ${brl0(falta)}: ${brl0(precisaDia)} de lucro dos anúncios por dia${comPorDia ? ` (≈ ${comPorDia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vendas da Comunidade por dia)` : ''}.` })
  if (!acoes.length) acoes.push({ tipo: 'ok', titulo: 'Nada urgente agora', texto: 'Sem Pix parado, sem anúncio com problema e nenhum conjunto pedindo pausa ou escala.' })

  // ── Conta do lucro (DRE) no formato da planilha ──
  const doMes = cs.filter((c) => noDia(c, mesIni, mesFim))
  const porGw = (g: string) => doMes.filter((c) => c.gateway === g).reduce((a, c) => a + c.price, 0)
  const vc = (c: (typeof META.custos)[number]) => valorCusto(c, rMes.base, 1)
  const grupo = (g: string) => META.custos.filter((c) => c.grupo === g)
  const somaG = (gs: readonly string[]) => gs.reduce((a, g) => a + grupo(g).reduce((x, c) => x + vc(c), 0), 0)
  const linhasGrupo = (g: string): [string, number, 'grupo' | 'item' | 'total'][] =>
    grupo(g).length ? [[`− ${g}`, -grupo(g).reduce((a, c) => a + vc(c), 0), 'grupo'], ...grupo(g).map((c) => [`${c.nome}${c.tipo === 'fixo' ? '' : ` (${c.valor.toLocaleString('pt-BR')}% ${c.tipo === 'pct_fat' ? 'do líquido' : c.tipo === 'pct_meta' ? 'do Meta' : 'das vendas da Aline'})`}`, -vc(c), 'item'] as [string, number, 'item'])] : []
  const ANTES_MARGEM = ['Impostos e contabilidade', 'Ferramentas de vendas', 'Comercial', 'Comissões e vendedoras'] as const
  const DEPOIS_MARGEM = GRUPOS.filter((g) => !(ANTES_MARGEM as readonly string[]).includes(g))
  const taxas = rMes.receita - rMes.liquido
  const margem = rMes.liquido - rMes.gasto - somaG(ANTES_MARGEM)
  const lucroDre = margem - somaG(DEPOIS_MARGEM)
  const dre: [string, number, 'grupo' | 'item' | 'total'][] = [
    ['Faturamento bruto', rMes.receita, 'total'],
    ['Greenn', porGw('greenn'), 'item'],
    ['Hotmart', porGw('hotmart'), 'item'],
    ['− Taxas da Greenn e da Hotmart', -taxas, 'grupo'],
    ['= Líquido dos gateways', rMes.liquido, 'total'],
    ['− Tráfego (Meta Ads)', -rMes.gasto, 'grupo'],
    ...ANTES_MARGEM.flatMap(linhasGrupo),
    ['= Margem de contribuição', margem, 'total'],
    ...DEPOIS_MARGEM.flatMap(linhasGrupo),
    ['= Lucro líquido', lucroDre, 'total'],
  ]

  const varia = (a: number, b: number) => (b ? `${a >= b ? '▲' : '▼'} ${pct(Math.abs(a - b), Math.abs(b), 0)} vs ontem` : 'ontem: —')
  const lucroDia = (r: typeof rHoje) => r.lucroAds - custoDia

  return (
    <PainelShell active="hoje">
      <Titulo titulo="Cockpit do dia" sub={<>Meta, resultado de hoje e o que fazer agora. Dinheiro = vendas aprovadas e vivas da Greenn e da Hotmart (sem reembolso nem teste). Meta Ads atualizado {metaEm ? horaBR(metaEm) : '—'} (robô de hora em hora).</>} />

      {/* META DO MÊS */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 4px 16px rgba(0,0,0,.04)' }}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="font-display" style={{ fontSize: 17, fontWeight: 800 }}>{META.texto}</div>
          <Pill tipo={estado[0]}>{estado[1]}</Pill>
          <div style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--mute)' }}>dia {Math.min(MA.dias, Math.floor(passados) + 1)} de {MA.dias} · faltam {Math.ceil(resta)} dias</div>
        </div>
        <Barra valor={pctMeta} marca={pctTempo} cor={estado[0] === 'ok' ? 'var(--g)' : estado[0] === 'wait' ? '#b9770e' : '#c0392b'} />
        <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 6 }}>Lucro até agora, com os custos fixos rateados pelos dias: <strong>{brl0(lucroAteHoje)}</strong> ({pct(Math.max(0, lucroAteHoje), META.lucro, 0)} da meta). A linha preta é onde deveria estar hoje ({pct(passados, MA.dias, 0)}).</div>
        {MA.desatualizada && <div className="mt-2"><Caixa tom="alerta">A meta e os custos salvos são de outro período. Estou usando os mesmos valores para este mês: confira em “Editar meta e custos” e salve os do mês novo.</Caixa></div>}
        <div className="mt-4"><Grade min={175}>
          <Tile label="Lucro final do mês, hoje" value={brl0(lucro)} sub={`líquido ${brl0(rMes.liquido)} − Meta ${brl0(rMes.gasto)} − custos em % ${brl0(rMes.variaveis)} − fixos ${brl0(custos)}`} cor={lucro >= 0 ? 'var(--g)' : '#c0392b'} />
          <Tile label="Se continuar como no mês" value={brl0(projMes)} sub={`ritmo ${brl0(ritmoMes)}/dia antes dos custos fixos`} cor={projMes >= META.lucro ? 'var(--g)' : '#c0392b'} />
          <Tile label="Se continuar como em 7 dias" value={brl0(proj7)} sub={`ritmo ${brl0(ritmo7)}/dia (7 dias completos)`} cor={proj7 >= META.lucro ? 'var(--g)' : '#c0392b'} />
          <Tile destaque label="Precisa por dia" value={brl0(precisaDia)} sub={comPorDia ? `≈ ${comPorDia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} vendas da Comunidade/dia (líquido médio ${brl0(liqCom)})` : 'de líquido − Meta − custos em %, até o fim do mês'} />
        </Grade></div>
      </div>

      <EditarMeta inicial={META} editadoEm={metaEditadaEm} />

      {/* HOJE × ONTEM × 7 DIAS */}
      <Secao titulo="Hoje" sub={`Lucro do dia = líquido − Meta − custos em % (impostos, comissão) − custos fixos do dia (${brl0(custoDia)}). Compras = carrinho (principal + bumps contam 1).`}>
        <Grade min={160}>
          <Tile label="Gasto no Meta" value={brl0(rHoje.gasto)} sub={`ontem ${brl0(rOntem.gasto)} · 7d ${brl0(r7.gasto / 7)}/dia`} />
          <Tile label="Compras" value={int(rHoje.compras)} sub={`${int(rHoje.itens)} itens · ${varia(rHoje.compras, rOntem.compras)}`} cor="var(--g)" />
          <Tile label="Líquido" value={brl0(rHoje.liquido)} sub={`ontem ${brl0(rOntem.liquido)} · 7d ${brl0(r7.liquido / 7)}/dia`} cor="var(--g)" />
          <Tile label="Lucro do dia" value={brl0(lucroDia(rHoje))} sub={`ontem ${brl0(lucroDia(rOntem))}`} cor={lucroDia(rHoje) >= 0 ? 'var(--g)' : '#c0392b'} />
          <Tile label="ROI dos 7 dias" value={r7.gasto ? (r7.liquido / r7.gasto).toFixed(2).replace('.', ',') : '—'} sub="líquido total ÷ gasto (1 = empate)" cor={r7.liquido >= r7.gasto ? 'var(--g)' : '#c0392b'} />
          <Tile label="Visitas do anúncio no quiz" value={int(sesHoje.length)} sub={`${pct(sesHoje.filter((s) => s.status !== 'pageview').length, sesHoje.length, 0)} começaram · ${int(sesHoje.filter((s) => s.checkout_clicked).length)} clicaram comprar`} />
        </Grade>
      </Secao>

      {/* O QUE FAZER AGORA */}
      <Secao titulo="O que fazer agora" sub="Regras fixas, em ordem de dinheiro na mesa. Mudança em preço, oferta, checkout ou verba passa pelo Patrik.">
        <div className="grid gap-2">
          {acoes.map((a, i) => (
            <div key={i} className="rounded-xl p-3 flex gap-3 items-start" style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}>
              <div style={{ fontWeight: 800, color: 'var(--mute)', minWidth: 18 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}><Pill tipo={a.tipo}>{a.tipo === 'ok' ? 'oportunidade' : a.tipo === 'no' ? 'urgente' : a.tipo === 'wait' ? 'atenção' : 'info'}</Pill> <span style={{ marginLeft: 6 }}>{a.titulo}</span></div>
                <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>{a.texto}</div>
              </div>
              {a.href && <a href={a.href} style={{ fontSize: 13, fontWeight: 800, color: 'var(--o)', whiteSpace: 'nowrap' }}>abrir →</a>}
            </div>
          ))}
        </div>
      </Secao>

      {/* A CONTA DO LUCRO (DRE) — mesma ordem da planilha "Gestão financeira Corpo feliz" */}
      <Secao titulo="A conta do lucro do mês" sub={<>Mesmo formato da planilha <strong>Gestão financeira Corpo feliz</strong>. Vendas reais do mês até agora; custos fixos inteiros (são do mês); custos em % calculados sobre o que já entrou. Para mudar os custos: <strong>Editar meta e custos</strong>, no topo.</>}>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px,100%),1fr))' }}>
          <Tabela min={340}>
            <thead><tr><th style={thL}>Mês até agora</th><th style={th}>R$</th><th style={th}>% fat.</th></tr></thead>
            <tbody>
              {dre.map(([k, v, tipo], i) => (
                <tr key={i} style={{ background: tipo === 'total' ? 'rgba(0,72,17,.05)' : undefined }}>
                  <td style={{ ...tdL, fontWeight: tipo === 'item' ? 500 : 800, paddingLeft: tipo === 'item' ? 26 : 10, color: tipo === 'item' ? 'var(--sub)' : 'var(--ink)' }}>{k}</td>
                  <td style={{ ...td, fontWeight: tipo === 'item' ? 500 : 800, color: v < 0 ? '#c0392b' : tipo === 'total' && v > 0 ? 'var(--g)' : 'var(--ink)' }}>{brl(v)}</td>
                  <td style={{ ...td, color: 'var(--mute)' }}>{pct(Math.abs(v), rMes.receita)}</td>
                </tr>
              ))}
            </tbody>
          </Tabela>
          <div>
            <Tabela min={300}>
              <thead><tr><th style={thL}>De onde veio (mês)</th><th style={th}>Itens</th><th style={th}>Líquido</th><th style={th}>%</th></tr></thead>
              <tbody>
                {origensL.map(([o, v]) => (
                  <tr key={o}><td style={tdL}><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 9, background: ORIGEM_COR[o] || 'var(--mute)', marginRight: 7 }} />{o}</td><td style={td}>{int(v.itens)}</td><td style={{ ...td, fontWeight: 700, color: 'var(--g)' }}>{brl0(v.liquido)}</td><td style={td}>{pct(v.liquido, rMes.liquido, 0)}</td></tr>
                ))}
              </tbody>
            </Tabela>
            <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 6, lineHeight: 1.5 }}>&quot;WhatsApp (Aline)&quot; = Comunidade nova na Greenn sem rastreio (é por onde ela vende; provável). &quot;Hotmart (link direto)&quot; = vendas da Hotmart sem rastreio, de fora do WhatsApp. Detalhe em <a href="/painel/comercial" style={{ color: 'var(--o)', fontWeight: 700 }}>Origem e comercial</a>.</p>
          </div>
        </div>
      </Secao>

      <Secao titulo="Números que decidem a verba" sub="CPA máximo = quanto posso pagar por uma compra de anúncio sem perder dinheiro no dia da compra (o lucro vem da Comunidade depois).">
        <Grade min={190}>
          <Tile label="Líquido médio por compra do Efeito Lipo" value={elMes.length ? brl(liqEl) : '—'} sub={`${int(contaCompras(elMes))} compras no mês (com bumps)`} />
          <Tile label="Líquido médio da Comunidade" value={comMes.length ? brl0(liqCom) : '—'} sub={`${int(comMes.length)} vendas no mês`} cor="var(--g)" />
          <Tile label="Custo por compra (7 dias, todas)" value={r7.compras ? brl(div(r7.gasto, r7.compras)) : '—'} sub={`${brl0(r7.gasto)} ÷ ${int(r7.compras)} compras de todas as origens`} />
          <Tile label="Custos fixos por dia" value={brl0(custoDia)} sub={`${brl0(custos)} no mês · ${metaEditadaEm ? `editados em ${horaBR(metaEditadaEm)}` : 'valores padrão do código'}`} />
        </Grade>
        <div className="mt-3"><Caixa>💡 Regra de escala: só subir a verba de um conjunto com 2+ compras e ROI acima de 1 nos últimos 3 dias, no máximo 20% a cada 2–3 dias (subir mais reinicia o aprendizado do Meta). Pausar o que gastou R$ 40 sem ninguém clicar em comprar.</Caixa></div>
      </Secao>

    </PainelShell>
  )
}
