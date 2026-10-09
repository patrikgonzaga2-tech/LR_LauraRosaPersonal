// ORIGEM E COMERCIAL — de onde vem cada venda (inclusive as que nenhum anúncio
// "vê": WhatsApp da Aline e links diretos da Hotmart), Comunidade nova × renovação,
// mix de planos e o funil da Aline (se o CRM estiver ligado).
import { LINKS, OFERTAS } from '../_config'
import { PainelShell } from '../_shell'
import { bloqueio } from '../_lib/acesso'
import { conversas, crmLigado } from '../_lib/crm'
import { compras, historicoComunidade, origemDe, ORIGEM_COR, sessoes, vendasRaw } from '../_lib/dados'
import { brl0, diaBR, div, int, pct } from '../_lib/fmt'
import { FiltroPeriodo, periodo, type SP } from '../_lib/periodo'
import { Barra, Caixa, Grade, Secao, Tabela, Tile, Titulo, td, tdL, th, thL } from '../_lib/ui'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Origem e comercial — Painel Corpo Feliz', robots: { index: false, follow: false } }

const plano = (p: string) => {
  const n = (p || '').toLowerCase()
  if (n.includes('anual') || n.includes('12x')) return 'Anual'
  if (n.includes('semestral')) return 'Semestral'
  if (n.includes('trimestral')) return 'Trimestral'
  if (n.includes('mensal')) return 'Mensal'
  return 'Sem plano no nome'
}
const ORIGEM_CRM: Record<string, string> = { manychat: 'ManyChat', bio: 'Bio do Instagram', story: 'Stories', anuncio: 'Anúncio (WhatsApp)', seguidor: 'Novo seguidor', texto_livre: 'Texto livre', outro: 'Outro' }

export default async function Comercial({ searchParams }: { searchParams: Promise<SP> }) {
  const b = await bloqueio('comercial')
  if (b) return b
  const sp = await searchParams
  const per = periodo(sp, 'mes')
  const agora = new Date().toISOString()

  const [cs, hist, raw, ses, crm] = await Promise.all([
    compras(per.since, per.until),
    historicoComunidade(agora),
    vendasRaw(per.since, agora),
    sessoes(new Date(new Date(per.since).getTime() - 2 * 86_400_000).toISOString(), per.until, 'id,created_at,status,xcod,utm_source,utm_medium,referrer'),
    conversas(per.diaIni, per.diaFim),
  ])
  const xq = new Set(ses.map((s) => s.xcod).filter(Boolean) as string[])
  const oferta = new Map<string, string>()
  for (const v of raw) if (v.transaction && v.offer_code && !oferta.has(v.transaction)) oferta.set(v.transaction, v.offer_code)

  const linhas = cs.map((c) => ({ c, o: origemDe(c, xq, hist) }))
  const tot = { itens: cs.length, liq: cs.reduce((a, c) => a + c.liquido, 0), bruto: cs.reduce((a, c) => a + c.price, 0) }
  const porOrig = new Map<string, { itens: number; liq: number; bruto: number }>()
  for (const { c, o } of linhas) { const x = porOrig.get(o) ?? { itens: 0, liq: 0, bruto: 0 }; x.itens++; x.liq += c.liquido; x.bruto += c.price; porOrig.set(o, x) }

  const com = linhas.filter(({ c }) => c.familia === 'Comunidade')
  const novas = com.filter(({ o }) => o !== 'Renovação')
  const renov = com.filter(({ o }) => o === 'Renovação')
  const liqNovas = novas.reduce((a, { c }) => a + c.liquido, 0)
  const planos = new Map<string, { n: number; liq: number }>()
  for (const { c } of novas) { const p = plano(c.product_name); const x = planos.get(p) ?? { n: 0, liq: 0 }; x.n++; x.liq += c.liquido; planos.set(p, x) }
  const anuais = planos.get('Anual')?.n || 0

  // Comunidade nova por origem × plano.
  const origCom = new Map<string, Map<string, number>>()
  for (const { c, o } of novas) { const m = origCom.get(o) ?? new Map(); const p = plano(c.product_name); m.set(p, (m.get(p) || 0) + 1); origCom.set(o, m) }
  const planosCols = ['Anual', 'Semestral', 'Trimestral', 'Mensal', 'Sem plano no nome'].filter((p) => planos.has(p))

  // Ofertas (código) das vendas novas.
  const porOferta = new Map<string, { n: number; liq: number }>()
  for (const { c } of novas) { const k = oferta.get(c.transaction) || '—'; const x = porOferta.get(k) ?? { n: 0, liq: 0 }; x.n++; x.liq += c.liquido; porOferta.set(k, x) }

  // Dia a dia (Comunidade nova).
  const dias = new Map<string, Map<string, number>>()
  for (const { c, o } of novas) { const d = diaBR(c.approved_at); const m = dias.get(d) ?? new Map(); m.set(o, (m.get(o) || 0) + 1); dias.set(d, m) }
  const origDias = [...new Set(novas.map(({ o }) => o))]

  // CRM (Aline).
  const crmTot = crm ? {
    leads: crm.length,
    atend: crm.filter((x) => x.atendimento_humano).length,
    oferta: crm.filter((x) => x.chegou_na_oferta).length,
    link: crm.filter((x) => x.recebeu_link).length,
    comprou: crm.filter((x) => x.resultado === 'comprou').length,
    tempo: div(crm.reduce((a, x) => a + (x.tempo_primeira_resposta_min || 0), 0), crm.filter((x) => x.tempo_primeira_resposta_min != null).length),
  } : null
  const crmOrig = new Map<string, { n: number; cp: number }>()
  for (const x of crm || []) { const k = ORIGEM_CRM[x.origem || ''] || x.origem || '—'; const y = crmOrig.get(k) ?? { n: 0, cp: 0 }; y.n++; if (x.resultado === 'comprou') y.cp++; crmOrig.set(k, y) }

  return (
    <PainelShell active="comercial">
      <Titulo titulo="Origem e comercial" sub="De onde vem o dinheiro, inclusive o que nenhum anúncio enxerga: as vendas da Aline no WhatsApp e os links diretos da Hotmart." />
      <FiltroPeriodo per={per} />

      <Grade min={165}>
        <Tile label="Comunidade nova" value={int(novas.length)} sub={`${brl0(liqNovas)} líquido · ticket ${brl0(div(liqNovas, novas.length))}`} cor="var(--g)" />
        <Tile label="Renovações" value={int(renov.length)} sub={`${brl0(renov.reduce((a, { c }) => a + c.liquido, 0))} líquido`} />
        <Tile label="% anual nas novas" value={pct(anuais, novas.length, 0)} sub={`${int(anuais)} anuais`} />
        <Tile label="Líquido total" value={brl0(tot.liq)} sub={`${int(tot.itens)} itens · todas as famílias`} />
      </Grade>

      <Secao titulo="De onde veio cada venda" sub="Todas as vendas vivas do período. Barra = participação no líquido.">
        <Tabela min={620}>
          <thead><tr><th style={thL}>Origem</th><th style={{ ...thL, width: '28%' }}></th><th style={th}>Itens</th><th style={th}>Bruto</th><th style={th}>Líquido</th><th style={th}>%</th></tr></thead>
          <tbody>
            {[...porOrig.entries()].sort((a, b) => b[1].liq - a[1].liq).map(([o, x]) => (
              <tr key={o}><td style={{ ...tdL, fontWeight: 700 }}><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 9, background: ORIGEM_COR[o], marginRight: 7 }} />{o}</td><td style={tdL}><Barra valor={div(x.liq, tot.liq)} cor={ORIGEM_COR[o]} altura={8} /></td><td style={td}>{int(x.itens)}</td><td style={td}>{brl0(x.bruto)}</td><td style={{ ...td, fontWeight: 800, color: 'var(--g)' }}>{brl0(x.liq)}</td><td style={td}>{pct(x.liq, tot.liq, 0)}</td></tr>
            ))}
          </tbody>
        </Tabela>
        <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 8, lineHeight: 1.55 }}>
          Regras: <strong>Renovação</strong> = mesmo e-mail já comprou a Comunidade há mais de 20 dias. <strong>Quiz</strong> = o código da compra bate com uma sessão do quiz. <strong>Anúncio direto</strong> = o link levou o id do conjunto. <strong>WhatsApp (Aline)</strong> = Comunidade nova na Greenn sem rastreio (é o link que ela manda; provável). <strong>Hotmart (link direto)</strong> = Hotmart sem rastreio: não passou pelo WhatsApp da Aline nem por anúncio rastreado. Para ter certeza, os links da Aline precisam levar <code>sck=whatsapp-aline</code> (depende do ok do Patrik).
        </p>
      </Secao>

      <Secao titulo="Comunidade nova: origem × plano" sub="Só vendas novas (sem renovação).">
        <Tabela min={560}>
          <thead><tr><th style={thL}>Origem</th>{planosCols.map((p) => <th key={p} style={th}>{p}</th>)}<th style={th}>Total</th></tr></thead>
          <tbody>
            {[...origCom.entries()].map(([o, m]) => (
              <tr key={o}><td style={{ ...tdL, fontWeight: 700 }}>{o}</td>{planosCols.map((p) => <td key={p} style={td}>{m.get(p) ? int(m.get(p)!) : '—'}</td>)}<td style={{ ...td, fontWeight: 800 }}>{int([...m.values()].reduce((a, v) => a + v, 0))}</td></tr>
            ))}
            {!origCom.size && <tr><td colSpan={planosCols.length + 2} style={{ ...tdL, color: 'var(--mute)' }}>Nenhuma venda nova da Comunidade no período.</td></tr>}
          </tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Ofertas das vendas novas" sub="Código da oferta na Greenn/Hotmart. A s97oneau (Hotmart) vende sem passar pelo WhatsApp: vale descobrir de onde vem esse link e pôr rastreio nele.">
        <Tabela min={480}>
          <thead><tr><th style={thL}>Oferta</th><th style={thL}>O que é</th><th style={th}>Vendas</th><th style={th}>Líquido</th></tr></thead>
          <tbody>{[...porOferta.entries()].sort((a, b) => b[1].liq - a[1].liq).map(([k, x]) => <tr key={k}><td style={{ ...tdL, fontWeight: 700 }}>{k}</td><td style={tdL}>{OFERTAS[k] || '—'}</td><td style={td}>{int(x.n)}</td><td style={{ ...td, color: 'var(--g)', fontWeight: 700 }}>{brl0(x.liq)}</td></tr>)}</tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Dia a dia (Comunidade nova)">
        <Tabela min={480}>
          <thead><tr><th style={thL}>Dia</th>{origDias.map((o) => <th key={o} style={th}>{o}</th>)}<th style={th}>Total</th></tr></thead>
          <tbody>{[...dias.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, m]) => <tr key={d}><td style={tdL}>{d.split('-').reverse().slice(0, 2).join('/')}</td>{origDias.map((o) => <td key={o} style={td}>{m.get(o) ? int(m.get(o)!) : '—'}</td>)}<td style={{ ...td, fontWeight: 800 }}>{int([...m.values()].reduce((a, v) => a + v, 0))}</td></tr>)}</tbody>
        </Tabela>
      </Secao>

      <Secao titulo="Funil da Aline (CRM)" sub="Conversas classificadas pela rotina das 11:59 e 23:59.">
        {crmTot ? (
          <>
            <Grade min={150}>
              <Tile label="Leads" value={int(crmTot.leads)} />
              <Tile label="Atendidos por humano" value={pct(crmTot.atend, crmTot.leads, 0)} sub={int(crmTot.atend)} />
              <Tile label="Chegaram na oferta" value={pct(crmTot.oferta, crmTot.leads, 0)} sub={int(crmTot.oferta)} />
              <Tile label="Receberam o link" value={pct(crmTot.link, crmTot.leads, 0)} sub={int(crmTot.link)} />
              <Tile label="Compraram" value={int(crmTot.comprou)} sub={`${pct(crmTot.comprou, crmTot.link, 0)} de quem recebeu o link`} cor="var(--g)" />
              <Tile label="1ª resposta" value={crmTot.tempo ? `${Math.round(crmTot.tempo)} min` : '—'} sub="média" />
            </Grade>
            <div className="mt-3"><Tabela min={380}>
              <thead><tr><th style={thL}>Origem do lead</th><th style={th}>Leads</th><th style={th}>Compraram</th><th style={th}>Fechamento</th></tr></thead>
              <tbody>{[...crmOrig.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, x]) => <tr key={k}><td style={tdL}>{k}</td><td style={td}>{int(x.n)}</td><td style={{ ...td, color: 'var(--g)', fontWeight: 700 }}>{int(x.cp)}</td><td style={td}>{pct(x.cp, x.n)}</td></tr>)}</tbody>
            </Tabela></div>
          </>
        ) : (
          <Caixa tom="alerta">
            {crmLigado() ? 'Não consegui ler o CRM agora.' : <>O CRM da Aline está em outro banco e ainda não está ligado aqui. Para ligar: na Vercel (projeto efeito-lipo-21), criar <code>CRM_SUPABASE_URL</code> e <code>CRM_SUPABASE_KEY</code> (chave de leitura do projeto &quot;CRM Corpo Feliz&quot;) e publicar de novo.</>} Enquanto isso, o funil completo da Aline está no <a href={LINKS.leadsAline} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--o)', fontWeight: 800 }}>Painel de Leads ↗</a>.
          </Caixa>
        )}
      </Secao>
    </PainelShell>
  )
}
