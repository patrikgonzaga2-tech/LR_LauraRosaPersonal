// Carregadores de dados do Painel Corpo Feliz.
//
// Só LEITURA no Supabase de vendas (fjlbvoephhextnxemygf), pelo servidor, com a
// chave service_role (lib/supabase). Nada aqui cria tabela, função ou escreve.
// As contas são feitas aqui no Node, em cima de tabelas e views que já existem:
//   compras_aprovadas  → a verdade do dinheiro (venda viva, sem teste, 1 linha por transação)
//   vendas             → status crus (Pix pendente, telefone, código da oferta)
//   meta_insights      → Meta por CONJUNTO e dia (ad_id = id do conjunto), robô de hora em hora
//   meta_ads           → Meta por ANÚNCIO e dia
//   meta_status        → status de conjuntos e anúncios
//   quiz_sessions / quiz_events → o quiz
//   assinantes_norm    → a Comunidade (MRR, vencimento)
import { sbSelect, sbSelectAll, supabaseConfigured } from '@/lib/supabase'
import { META_PADRAO, validaMeta, type MetaCfg } from '../_config'
import { diaBR, N } from './fmt'

export { supabaseConfigured }

const q = (v: string) => encodeURIComponent(v)

// ─── Tipos ──────────────────────────────────────────────────────────
export type Compra = {
  transaction: string; email_norm: string | null; buyer_name: string | null; gateway: string; familia: string; produto: string; tipo: string
  approved_at: string; price: number; liquido: number; product_name: string; canal: string; src: string | null; sck: string | null; xcod: string | null
}
export type Reembolso = { transaction: string; refunded_at: string; price: number; liquido: number; familia: string }
export type VendaRaw = {
  received_at: string; status: string | null; event: string | null; transaction: string | null; product_name: string | null; offer_code: string | null
  price: number | null; producer_value: number | null; gateway: string | null; tracking_src: string | null; tracking_sck: string | null; tracking_xcod: string | null
  payment_method: string | null; buyer_name: string | null; buyer_phone: string | null; buyer_email: string | null
}
export type MetaLinha = {
  ad_id: string; date: string; ad_name?: string | null; adset_id: string | null; adset_name: string | null; campaign_id: string | null; campaign_name: string | null
  spend: number; impressions: number; link_clicks: number; lp_views: number; ic?: number; reach?: number
}
export type Status = { id: string; level: string; status: string }
export type Sessao = {
  id: string; created_at: string; status: string; reached_index: number | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null
  utm_content: string | null; utm_term: string | null; xcod: string | null; intro_ab: string | null; checkout_ab: string | null; checkout_clicked: boolean | null
  checkout_at: string | null; answers: Record<string, unknown> | null; referrer: string | null; peso: number | null; meta_peso: number | null
}
export type Assinante = { email: string; nome: string; cobrancas: number; total_pago: number; primeira: string; ultima: string; ultimo_valor: number; plano_dias: number; plano_nome: string; vence_em: string | null; mrr: number; status: string }

// ─── Carregadores ───────────────────────────────────────────────────
const COMPRA_COLS = 'transaction,email_norm,buyer_name,gateway,familia,produto,tipo,approved_at,price,liquido,product_name,canal,src,sck,xcod'

export async function compras(since: string, until: string): Promise<Compra[]> {
  const rows = await sbSelectAll<Compra>('compras_aprovadas', `select=${COMPRA_COLS}&approved_at=gte.${q(since)}&approved_at=lt.${q(until)}&viva=is.true&teste=is.false&order=transaction.asc`)
  return rows.map((r) => ({ ...r, price: N(r.price), liquido: N(r.liquido) }))
}

export async function reembolsos(since: string, until: string): Promise<Reembolso[]> {
  const rows = await sbSelectAll<Reembolso>('compras_aprovadas', `select=transaction,refunded_at,price,liquido,familia&refunded_at=gte.${q(since)}&refunded_at=lt.${q(until)}&teste=is.false&approved_at=not.is.null&order=transaction.asc`)
  return rows.map((r) => ({ ...r, price: N(r.price), liquido: N(r.liquido) }))
}

/** Primeira compra da Comunidade de cada e-mail ANTES de `until` (para separar nova × renovação). */
export async function historicoComunidade(until: string): Promise<Map<string, string[]>> {
  const rows = await sbSelectAll<{ email_norm: string | null; approved_at: string }>('compras_aprovadas', `select=email_norm,approved_at&familia=eq.Comunidade&approved_at=lt.${q(until)}&teste=is.false&viva=is.true&order=approved_at.asc,transaction.asc`)
  const m = new Map<string, string[]>()
  for (const r of rows) {
    if (!r.email_norm || !r.approved_at) continue
    const l = m.get(r.email_norm) ?? []
    l.push(r.approved_at)
    m.set(r.email_norm, l)
  }
  return m
}

const VENDA_COLS = 'received_at,status,event,transaction,product_name,offer_code,price,producer_value,gateway,tracking_src,tracking_sck,tracking_xcod,payment_method,buyer_name,buyer_phone,buyer_email'
export async function vendasRaw(since: string, until: string): Promise<VendaRaw[]> {
  return sbSelectAll<VendaRaw>('vendas', `select=${VENDA_COLS}&received_at=gte.${q(since)}&received_at=lt.${q(until)}&order=received_at.desc,id.desc`)
}

const META_COLS = 'ad_id,date,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,link_clicks,lp_views,ic,reach'
/** Meta por conjunto e dia (meta_insights.ad_id = id do CONJUNTO). */
export async function metaConjuntos(diaIni: string, diaFim: string): Promise<MetaLinha[]> {
  const rows = await sbSelectAll<MetaLinha>('meta_insights', `select=${META_COLS}&date=gte.${diaIni}&date=lte.${diaFim}&order=date.asc,ad_id.asc`)
  return rows.map(numMeta)
}
/** Meta por anúncio e dia. */
export async function metaAnuncios(diaIni: string, diaFim: string): Promise<MetaLinha[]> {
  const rows = await sbSelectAll<MetaLinha>('meta_ads', `select=ad_id,date,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,link_clicks,lp_views,ic&date=gte.${diaIni}&date=lte.${diaFim}&order=date.asc,ad_id.asc`)
  return rows.map(numMeta)
}
const numMeta = (r: MetaLinha): MetaLinha => ({ ...r, spend: N(r.spend), impressions: N(r.impressions), link_clicks: N(r.link_clicks), lp_views: N(r.lp_views), ic: N(r.ic), reach: N(r.reach) })

export async function metaStatus(): Promise<Map<string, Status>> {
  const rows = await sbSelectAll<Status>('meta_status', 'select=id,level,status&order=id.asc')
  return new Map(rows.map((r) => [r.id, r]))
}
export async function metaAtualizadoEm(): Promise<string | null> {
  const r = await sbSelectAll<{ updated_at: string }>('meta_insights', 'select=updated_at&order=updated_at.desc&limit=1')
  return r[0]?.updated_at ?? null
}

const SESSAO_COLS = 'id,created_at,status,reached_index,utm_source,utm_medium,utm_campaign,utm_content,utm_term,xcod,intro_ab,checkout_ab,checkout_clicked,checkout_at,answers,referrer,peso,meta_peso'
export async function sessoes(since: string, until: string, cols = SESSAO_COLS): Promise<Sessao[]> {
  const rows = await sbSelectAll<Sessao>('quiz_sessions', `select=${cols}&created_at=gte.${q(since)}&created_at=lt.${q(until)}&order=created_at.desc,id.desc`)
  return rows.map((s) => ({ ...s, answers: typeof s.answers === 'string' ? safeJson(s.answers) : s.answers }))
}
const safeJson = (s: string) => { try { return JSON.parse(s) } catch { return {} } }

export async function eventosOferta(since: string): Promise<{ session_id: string; answer: string; created_at: string }[]> {
  return sbSelectAll('quiz_events', `select=session_id,answer,created_at&event=eq.oferta&created_at=gte.${q(since)}&order=created_at.asc,id.asc`)
}

export async function assinantes(): Promise<Assinante[]> {
  const rows = await sbSelectAll<Assinante>('assinantes_norm', 'select=email,nome,cobrancas,total_pago,primeira,ultima,ultimo_valor,plano_dias,plano_nome,vence_em,mrr,status&order=email.asc')
  return rows.map((r) => ({ ...r, total_pago: N(r.total_pago), ultimo_valor: N(r.ultimo_valor), mrr: N(r.mrr), cobrancas: N(r.cobrancas), plano_dias: N(r.plano_dias) }))
}

/** Meta e custos editados no Cockpit (tabela painel_config). Sem linha válida, usa o padrão do código. */
export async function lerMeta(): Promise<{ cfg: MetaCfg; atualizadoEm: string | null; doBanco: boolean }> {
  const r = await sbSelect<{ valor: unknown; atualizado_em: string }>('painel_config', 'select=valor,atualizado_em&id=eq.meta&limit=1')
  const v = r[0] ? validaMeta(r[0].valor) : null
  return v && typeof v !== 'string' ? { cfg: v, atualizadoEm: r[0].atualizado_em, doBanco: true } : { cfg: META_PADRAO, atualizadoEm: null, doBanco: false }
}

// ─── Regras (uma definição só para o painel inteiro) ─────────────────

/** Venda que veio de anúncio: id do conjunto no src (quiz/LP) ou "FB|campanha" no sck. */
export const ehAnuncio = (src?: string | null, sck?: string | null) => /^[0-9]{6,}$/.test(src || '') || (sck || '').startsWith('FB|')

/** Visita real de anúncio: sem a revisão e os robôs do Meta (coluna da direita, Others, audience network). */
export const MEDIUM_ROBO = new Set(['Facebook_Right_Column', 'Others', '{{placement}}', 'an', 'audience_network'])
export const visitaAnuncio = (s: Pick<Sessao, 'utm_source' | 'utm_medium'>) =>
  ['FB', 'FACEBOOK', 'IG', 'INSTAGRAM'].includes((s.utm_source || '').toUpperCase()) && !MEDIUM_ROBO.has(s.utm_medium || '')
/** Visita de robô/revisão do Meta (nunca é gente). */
export const ehRobo = (s: Pick<Sessao, 'utm_medium'>) => MEDIUM_ROBO.has(s.utm_medium || '')
/** utm_content vem codificado com "+" no lugar do espaço (ex.: G+QUANTAS+VEZES+·+FEED). */
export const decUtm = (v: string | null | undefined) => { const t = String(v || '').replace(/\+/g, ' '); try { return decodeURIComponent(t) } catch { return t } }
/** sck do link direto da LP: FB|campanha|id campanha|conjunto|id conjunto|anúncio|id anúncio|posicionamento|fbclid */
export function sckFB(sck?: string | null) {
  if (!(sck || '').startsWith('FB|')) return null
  const p = (sck || '').split('|')
  const id = (x?: string) => (/^[0-9]{6,}$/.test(x || '') ? x! : null)
  return { campanha: id(p[2]), conjunto: id(p[4]), anuncio: id(p[6]) }
}
export const sessaoTeste = (s: Pick<Sessao, 'utm_source' | 'referrer'>) =>
  (s.utm_source || '') === 'qa-painel' || /tagassistant/i.test(s.utm_source || '') || /tagassistant/i.test(s.referrer || '')

/** Compra = carrinho (e-mail + dia de Brasília): principal + bumps contam 1 (decisão do Vinicius). */
export const chaveCompra = (c: Pick<Compra, 'email_norm' | 'transaction' | 'approved_at'>) => `${c.email_norm || c.transaction}|${diaBR(c.approved_at)}`
export const contaCompras = (cs: Compra[]) => new Set(cs.map(chaveCompra)).size

/** Perfil de recomeço (igual a _data.ts perfilRecomeco do quiz). */
export function perfil(a: Record<string, unknown> | null): string {
  const g = (k: string) => String((a || {})[k] ?? '')
  if (['ansiedade', 'noite'].includes(g('sabotador'))) return 'A Emocional'
  if (['corrida', 'casa'].includes(g('rotina')) || g('tempo-dia') === '10-15') return 'A Sem Tempo'
  if (['exagero', 'dieta'].includes(g('alimentacao'))) return 'A Tudo ou Nada'
  return 'A Cansada de Recomeçar'
}

export type Origem = 'Quiz' | 'Anúncio direto' | 'WhatsApp (Aline)' | 'Hotmart (link direto)' | 'Renovação' | 'Sem rastreio'
export const ORIGEM_COR: Record<string, string> = {
  Quiz: 'var(--o)', 'Anúncio direto': '#d35400', 'WhatsApp (Aline)': 'var(--g)', 'Hotmart (link direto)': '#8e44ad', Renovação: '#2c7be5', 'Sem rastreio': 'var(--mute)',
}

/**
 * De onde veio cada compra. A view classifica toda Comunidade sem rastreio como
 * "recorrência", o que esconde as vendas NOVAS da Aline e da Hotmart. Aqui:
 *  1. xcod casa com uma sessão do quiz → Quiz
 *  2. id de conjunto no src / FB| no sck → Anúncio direto
 *  3. Comunidade com compra viva anterior do mesmo e-mail há 20+ dias → Renovação
 *  4. Comunidade nova na Greenn sem rastreio → WhatsApp (Aline) (é por onde ela vende; provável)
 *  5. Hotmart sem rastreio → Hotmart (link direto)
 *  6. resto → Sem rastreio
 */
export function origemDe(c: Compra, xcodsQuiz: Set<string>, hist?: Map<string, string[]>): Origem {
  if (c.xcod && xcodsQuiz.has(c.xcod)) return 'Quiz'
  if ((c.sck || '') === 'efeito-lipo-quiz') return 'Quiz'
  if (ehAnuncio(c.src, c.sck)) return 'Anúncio direto'
  if (c.familia === 'Comunidade' && c.email_norm && hist) {
    const t = new Date(c.approved_at).getTime()
    const antes = (hist.get(c.email_norm) || []).some((d) => t - new Date(d).getTime() > 20 * 86_400_000)
    if (antes) return 'Renovação'
  }
  if (c.familia === 'Comunidade' && c.gateway === 'greenn') return 'WhatsApp (Aline)'
  if (c.gateway === 'hotmart') return 'Hotmart (link direto)'
  return 'Sem rastreio'
}

/** Status de pagamento que ainda pode virar venda. */
export const PENDENTE = new Set(['WAITING_PAYMENT', 'DELAYED', 'BILLET_PRINTED', 'CREATED', 'PRINTED_BILLET'])
const FECHADO = ['APPROVED', 'COMPLETED', 'REFUNDED', 'CHARGEBACK', 'CANCELED', 'CANCELLED', 'REFUSED']

export type Pendente = {
  tx: string; quando: string; nome: string | null; tel: string | null; email: string | null; produto: string; valor: number; itens: number
  metodo: string | null; gateway: string | null; xcod: string | null; tipo: 'pix' | 'atrasada' | 'criado'
}
const pessoa = (v: Pick<VendaRaw, 'buyer_email' | 'buyer_phone' | 'transaction'>) =>
  (v.buyer_email || '').trim().toLowerCase() || String(v.buyer_phone || '').replace(/\D/g, '').slice(-11) || `tx:${v.transaction}`
/** Última aprovação de cada pessoa (e-mail/telefone). */
function ultimaAprovacao(raw: VendaRaw[]) {
  const m = new Map<string, number>()
  for (const v of raw) if (['APPROVED', 'COMPLETED'].includes(v.status || '')) { const k = pessoa(v); m.set(k, Math.max(new Date(v.received_at).getTime(), m.get(k) || 0)) }
  return m
}
/**
 * Pagamentos parados, UMA linha por pessoa (bump e Pix gerado de novo são outras
 * transações): a transação nunca aprovou nem foi recusada/cancelada, o último status
 * é pendente e a pessoa não comprou depois. DELAYED = cobrança de assinatura atrasada.
 */
export function pendentes(raw: VendaRaw[]): Pendente[] {
  const porTx = new Map<string, VendaRaw[]>()
  for (const v of raw) { if (!v.transaction) continue; porTx.set(v.transaction, [...(porTx.get(v.transaction) || []), v]) }
  const aprov = ultimaAprovacao(raw)
  const porPessoa = new Map<string, Pendente>()
  for (const [tx, l] of porTx) {
    l.sort((a, b) => b.received_at.localeCompare(a.received_at))
    const ult = l[0]
    if (l.some((x) => FECHADO.includes(x.status || ''))) continue
    if (!PENDENTE.has(ult.status || '')) continue
    const k = pessoa(ult)
    if ((aprov.get(k) || 0) >= new Date(ult.received_at).getTime()) continue
    const tipo = ult.status === 'DELAYED' ? 'atrasada' : ult.status === 'CREATED' ? 'criado' : 'pix'
    const atual = porPessoa.get(k)
    if (!atual) porPessoa.set(k, { tx, quando: ult.received_at, nome: ult.buyer_name, tel: ult.buyer_phone, email: ult.buyer_email, produto: ult.product_name || '—', valor: N(ult.price), itens: 1, metodo: ult.payment_method, gateway: ult.gateway, xcod: ult.tracking_xcod, tipo })
    else {
      atual.valor += N(ult.price); atual.itens++
      if (ult.received_at > atual.quando) Object.assign(atual, { tx, quando: ult.received_at, produto: ult.product_name || atual.produto, metodo: ult.payment_method, tipo, xcod: ult.tracking_xcod || atual.xcod })
      atual.tel = atual.tel || ult.buyer_phone; atual.nome = atual.nome || ult.buyer_name
    }
  }
  return [...porPessoa.values()].sort((a, b) => b.quando.localeCompare(a.quando))
}

export type Recusado = { tx: string; quando: string; nome: string | null; tel: string | null; produto: string; valor: number; itens: number }
/** Cartão recusado, uma linha por pessoa, só se a pessoa não comprou DEPOIS da recusa. */
export function recusados(raw: VendaRaw[]): Recusado[] {
  const aprov = ultimaAprovacao(raw)
  const m = new Map<string, Recusado>()
  const visto = new Set<string>()
  for (const v of raw) {
    if (v.status !== 'REFUSED' || !v.transaction || visto.has(v.transaction)) continue
    visto.add(v.transaction)
    const k = pessoa(v)
    if ((aprov.get(k) || 0) >= new Date(v.received_at).getTime()) continue
    const a = m.get(k)
    if (!a) m.set(k, { tx: v.transaction, quando: v.received_at, nome: v.buyer_name, tel: v.buyer_phone, produto: v.product_name || '—', valor: N(v.price), itens: 1 })
    else { a.itens++; if (v.received_at > a.quando) Object.assign(a, { quando: v.received_at, produto: v.product_name || a.produto, valor: N(v.price) }); a.tel = a.tel || v.buyer_phone }
  }
  return [...m.values()].sort((a, b) => b.quando.localeCompare(a.quando))
}

// ─── Anúncios: junta Meta + vendas reais + quiz ─────────────────────
export type Linha = {
  nivel: 'campanha' | 'conjunto' | 'anuncio'; id: string; nome: string; pai: string; status: string
  gasto: number; impressoes: number; cliques: number; lp: number
  visitas: number; sessoes: number; t1: number; resultado: number; comprar: number
  vendas: number; receita: number; liquido: number
}
export const linhaVazia = (nivel: Linha['nivel'], id: string, nome: string, pai: string, status: string): Linha =>
  ({ nivel, id, nome, pai, status, gasto: 0, impressoes: 0, cliques: 0, lp: 0, visitas: 0, sessoes: 0, t1: 0, resultado: 0, comprar: 0, vendas: 0, receita: 0, liquido: 0 })

export const ATIVOS = new Set(['ACTIVE', 'WITH_ISSUES', 'PENDING_REVIEW', 'IN_PROCESS', 'PREAPPROVED'])
export const PROBLEMA = new Set(['WITH_ISSUES', 'DISAPPROVED'])

export type Sinal = { tipo: 'ok' | 'wait' | 'no' | 'n'; rotulo: string; motivo: string }
/** Sinal para decidir rápido (mesmas regras do painel do claude.ai). ROI = líquido ÷ gasto. */
export function sinal(r: Linha): Sinal {
  const roi = r.gasto > 0 ? r.liquido / r.gasto : null
  const ctr = r.impressoes > 0 ? (r.cliques / r.impressoes) * 100 : 0
  if (r.vendas > 0 && r.gasto === 0) return { tipo: 'ok', rotulo: 'Lucrando', motivo: `${r.vendas} compra(s) sem gasto registrado no período` }
  if (r.vendas > 0 && roi != null && roi >= 1)
    return r.vendas >= 2
      ? { tipo: 'ok', rotulo: 'Escalar', motivo: `${r.vendas} compras com ROI ${roi.toFixed(2).replace('.', ',')}: subir a verba 20% a cada 2–3 dias` }
      : { tipo: 'ok', rotulo: 'Lucrando', motivo: `1 compra com ROI ${roi.toFixed(2).replace('.', ',')}; com 2 vira "Escalar"` }
  if (r.vendas > 0) return { tipo: 'wait', rotulo: 'Prejuízo', motivo: `vendeu, mas cada R$ 1 voltou R$ ${(roi ?? 0).toFixed(2).replace('.', ',')}` }
  if (r.gasto >= 40 && r.comprar === 0) return { tipo: 'no', rotulo: 'Pausar?', motivo: `R$ ${Math.round(r.gasto)} gastos e ninguém clicou em comprar` }
  if (r.nivel === 'anuncio' && r.gasto >= 8 && ctr > 0 && ctr < 0.8) return { tipo: 'no', rotulo: 'Trocar criativo', motivo: `CTR de ${ctr.toFixed(1).replace('.', ',')}% (bom é acima de 1%)` }
  if (r.gasto < 10) return { tipo: 'n', rotulo: 'Pouco dado', motivo: 'menos de R$ 10 gastos' }
  return { tipo: 'n', rotulo: 'Acompanhar', motivo: r.comprar ? `${r.comprar} clicaram em comprar, sem compra ainda` : 'ainda sem clique em comprar' }
}

/** Monta as linhas de campanha, conjunto e anúncio de um período. */
export function montarAnuncios(conj: MetaLinha[], ads: MetaLinha[], st: Map<string, Status>, ses: Sessao[], cs: Compra[]) {
  const C = new Map<string, Linha>(), S = new Map<string, Linha>(), A = new Map<string, Linha>()
  const stOf = (id: string, nivel: string) => st.get(id)?.status || (nivel === 'campanha' ? '' : '—')
  for (const r of conj) {
    const cid = r.campaign_id || 'sem'
    const c = C.get(cid) ?? linhaVazia('campanha', cid, r.campaign_name || '(sem campanha)', '', '')
    const s = S.get(r.ad_id) ?? linhaVazia('conjunto', r.ad_id, r.adset_name || r.ad_id, r.campaign_name || '', stOf(r.ad_id, 'conjunto'))
    for (const x of [c, s]) { x.gasto += r.spend; x.impressoes += r.impressions; x.cliques += r.link_clicks; x.lp += r.lp_views }
    C.set(cid, c); S.set(r.ad_id, s)
  }
  const adPorNome = new Map<string, string>() // conjunto|nome → id do anúncio
  for (const r of ads) {
    const a = A.get(r.ad_id) ?? linhaVazia('anuncio', r.ad_id, r.ad_name || r.ad_id, r.adset_name || '', stOf(r.ad_id, 'anuncio'))
    a.gasto += r.spend; a.impressoes += r.impressions; a.cliques += r.link_clicks; a.lp += r.lp_views
    A.set(r.ad_id, a)
    adPorNome.set(`${r.adset_id || ''}|${r.ad_name || ''}`, r.ad_id)
  }
  // Status da campanha = ativa se algum conjunto dela está ativo.
  const setCamp = new Map<string, string>()
  for (const r of conj) setCamp.set(r.ad_id, r.campaign_id || 'sem')
  for (const r of ads) if (r.adset_id && !setCamp.has(r.adset_id)) setCamp.set(r.adset_id, r.campaign_id || 'sem')
  for (const [sid, s] of S) { const c = C.get(setCamp.get(sid) || ''); if (c && ATIVOS.has(s.status)) c.status = 'ACTIVE' }
  for (const c of C.values()) if (!c.status) c.status = 'PAUSED'

  // Quiz: sessões por conjunto (utm_term) e anúncio (utm_content).
  const adDaSessao = (x: Sessao) => adPorNome.get(`${x.utm_term || ''}|${decUtm(x.utm_content)}`)
  const sesPorXcod = new Map<string, Sessao>()
  for (const s of ses) {
    if (!visitaAnuncio(s) || sessaoTeste(s)) continue
    if (s.xcod) sesPorXcod.set(s.xcod, s)
    const conjunto = S.get(s.utm_term || '')
    const adId = adDaSessao(s)
    const anuncio = adId ? A.get(adId) : undefined
    const camp = conjunto ? C.get(setCamp.get(conjunto.id) || '') : undefined
    for (const x of [conjunto, anuncio, camp]) {
      if (!x) continue
      x.visitas++
      if (s.status !== 'pageview') x.sessoes++
      if ((s.reached_index || 0) >= 1) x.t1++
      if ((s.reached_index || 0) >= 24) x.resultado++
      if (s.checkout_clicked) x.comprar++
    }
  }
  // Vendas reais: pelo conjunto no src; anúncio pela sessão do quiz com o mesmo xcod.
  const pedidos = new Map<Linha, Set<string>>()
  const soma = (x: Linha | undefined, c: Compra) => {
    if (!x) return
    x.receita += c.price; x.liquido += c.liquido
    const p = pedidos.get(x) ?? new Set<string>()
    p.add(c.xcod || chaveCompra(c)); pedidos.set(x, p)
  }
  for (const c of cs) {
    if (!ehAnuncio(c.src, c.sck)) continue
    const fb = sckFB(c.sck)
    const setId = /^[0-9]{6,}$/.test(c.src || '') ? c.src! : fb?.conjunto || ''
    soma(S.get(setId), c)
    soma(C.get(setCamp.get(setId) || fb?.campanha || ''), c)
    const ses1 = c.xcod ? sesPorXcod.get(c.xcod) : undefined
    const adId = fb?.anuncio || (ses1 ? adDaSessao(ses1) : undefined)
    soma(adId ? A.get(adId) : undefined, c)
  }
  for (const [x, p] of pedidos) x.vendas = p.size
  return { campanhas: [...C.values()], conjuntos: [...S.values()], anuncios: [...A.values()] }
}
