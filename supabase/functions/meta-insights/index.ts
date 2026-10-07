// ════════════════════════════════════════════════════════════════════
// Edge Function: meta-insights
// Busca na Marketing API do Meta o gasto da conta META_AD_ACCOUNT_ID, por DIA, e
// grava (upsert) em:
//   • public.meta_insights  → nível CONJUNTO (adset). A coluna `ad_id` guarda o
//                             adset.id (chave de junção com vendas.tracking_src).
//   • public.meta_ads       → nível ANÚNCIO (ad_id = id do anúncio).
//   • public.meta_status    → ativo/pausado de conjuntos e anúncios.
// Roda de hora em hora (cron). ?days=N controla a janela (padrão 4; grande p/ backfill).
//
// FONTE DOS DADOS: o relatório de insights da PRÓPRIA CONTA (level=adset e level=ad),
// sem depender do utm_term. Assim entram também campanhas que não levam ao site
// (ex.: conversa no WhatsApp). O Meta devolve tudo que teve gasto no período,
// independente de a campanha estar hoje ativa ou pausada.
//
// CONFERÊNCIA: o relatório agregado da conta já omitiu anúncios (ver
// docs/PLAYBOOK-RASTREAMENTO-E-DASHBOARD.md, 2.3). Por isso comparamos a soma gravada
// com o total diário da conta (level=account) e devolvemos a diferença na resposta.
// Para ids rastreados (view tracked_ad_ids) da conta atual que o agregado não
// trouxe, consultamos o conjunto direto (método antigo) como complemento.
//
// Nunca apaga nada: só upsert. O histórico de contas antigas permanece nas tabelas.
//
// ORÇAMENTO DE TEMPO: a Edge Function é morta aos 150s. Paramos de paginar/consultar
// ao passar de TIME_BUDGET_MS e gravamos o que já veio (resposta traz `incompleto`).
//
// Segredos: META_ACCESS_TOKEN (ads_read), META_AD_ACCOUNT_ID (conta; com ou sem
// act_). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY do ambiente.
// ════════════════════════════════════════════════════════════════════

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const META_TOKEN = (Deno.env.get('META_ACCESS_TOKEN') ?? '').trim()
const META_ACCOUNT_RAW = (Deno.env.get('META_AD_ACCOUNT_ID') ?? '').trim()
const META_ACCOUNT = META_ACCOUNT_RAW.startsWith('act_') ? META_ACCOUNT_RAW : `act_${META_ACCOUNT_RAW}`
const API = 'https://graph.facebook.com/v25.0'

// Conjuntos consultados ao mesmo tempo no complemento, e quando desistimos.
const CONCURRENCY = 10
const TIME_BUDGET_MS = 110_000
const UPSERT_CHUNK = 500

function spDate(offsetDays = 0): string {
  const d = new Date(Date.now() - offsetDays * 86400000)
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}
const num = (v: unknown) => (v === undefined || v === null || v === '' ? null : Number(v))
const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

// Upsert com merge por chave, em lotes. Devolve o erro (texto) ou null.
// Linhas repetidas na mesma chave são deduplicadas (o Postgres recusa duplicata no lote).
async function upsert(table: string, onConflict: string, body: Record<string, unknown>[]): Promise<string | null> {
  if (body.length === 0) return null
  const keys = onConflict.split(',')
  const unicas = new Map<string, Record<string, unknown>>()
  for (const r of body) unicas.set(keys.map((k) => String(r[k])).join('|'), r)
  const linhas = [...unicas.values()]
  try {
    for (let i = 0; i < linhas.length; i += UPSERT_CHUNK) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=${onConflict}`, {
        method: 'POST',
        headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(linhas.slice(i, i + UPSERT_CHUNK)),
      })
      if (!res.ok) return await res.text()
    }
    return null
  } catch (e) {
    return String(e)
  }
}

type Linha = Record<string, any>

// Lê todas as páginas de uma chamada da Graph API. Para cedo se passar do prazo.
async function paginar(url: string, prazo: number): Promise<{ data: Linha[]; incompleto: boolean }> {
  const data: Linha[] = []
  let proximo: string | null = url
  while (proximo) {
    if (Date.now() > prazo) return { data, incompleto: true }
    const res = await fetch(proximo)
    const j = await res.json()
    if (!res.ok || j.error) throw new Error(JSON.stringify(j.error ?? `HTTP ${res.status}`))
    data.push(...(j.data ?? []))
    proximo = j.paging?.next ?? null
  }
  return { data, incompleto: false }
}

// Extrai o valor de uma ação (ex: landing_page_view) do array do Meta.
const act = (arr: { action_type?: string; value?: string }[] | undefined, type: string): number | null => {
  const a = (arr ?? []).find((x) => x.action_type === type)
  return a ? Number(a.value) : null
}

const FIELDS_ADSET = 'adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,inline_link_clicks,reach,ctr,cpc,cpm,actions,action_values,date_start'
const FIELDS_AD = 'ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,inline_link_clicks,ctr,cpc,cpm,actions,action_values,date_start'

Deno.serve(async (req) => {
  if (!META_TOKEN) {
    return Response.json({ ok: false, error: 'falta META_ACCESS_TOKEN' }, { status: 500 })
  }
  if (!META_ACCOUNT_RAW) {
    return Response.json({ ok: false, error: 'falta META_AD_ACCOUNT_ID' }, { status: 500 })
  }
  const t0 = Date.now()
  const prazo = t0 + TIME_BUDGET_MS
  const days = Math.min(Math.max(Number(new URL(req.url).searchParams.get('days')) || 4, 1), 400)
  const since = spDate(days - 1)
  const until = spDate(0)
  const timeRange = encodeURIComponent(JSON.stringify({ since, until }))
  const token = `&access_token=${encodeURIComponent(META_TOKEN)}`
  const periodo = `&time_range=${timeRange}&time_increment=1&limit=500`
  const nowIso = new Date().toISOString()
  const falhasGravacao: string[] = []
  let incompleto = false

  const linhaConjunto = (d: Linha, adsetId: string) => ({
    ad_id: adsetId, // = adset.id (chave de junção com vendas.tracking_src)
    date: d.date_start,
    ad_name: d.adset_name ?? null, // rótulo legível (nome do conjunto)
    adset_id: adsetId,
    adset_name: d.adset_name ?? null,
    campaign_id: d.campaign_id ?? null,
    campaign_name: d.campaign_name ?? null,
    spend: num(d.spend),
    impressions: num(d.impressions),
    clicks: num(d.clicks),
    link_clicks: num(d.inline_link_clicks) ?? act(d.actions, 'link_click'),
    lp_views: act(d.actions, 'landing_page_view'),
    ic: act(d.actions, 'initiate_checkout'),
    purchases: act(d.actions, 'purchase'),
    purchase_value: act(d.action_values, 'purchase'),
    reach: num(d.reach),
    ctr: num(d.ctr),
    cpc: num(d.cpc),
    cpm: num(d.cpm),
    currency: 'BRL',
    updated_at: nowIso,
  })
  const linhaAnuncio = (a: Linha, adsetFallback: string | null) => ({
    ad_id: a.ad_id,
    date: a.date_start,
    ad_name: a.ad_name ?? null,
    adset_id: a.adset_id ?? adsetFallback,
    adset_name: a.adset_name ?? null,
    campaign_id: a.campaign_id ?? null,
    campaign_name: a.campaign_name ?? null,
    spend: num(a.spend),
    impressions: num(a.impressions),
    link_clicks: num(a.inline_link_clicks) ?? act(a.actions, 'link_click'),
    lp_views: act(a.actions, 'landing_page_view'),
    ic: act(a.actions, 'initiate_checkout'),
    purchases: act(a.actions, 'purchase'),
    purchase_value: act(a.action_values, 'purchase'),
    ctr: num(a.ctr),
    cpc: num(a.cpc),
    cpm: num(a.cpm),
    updated_at: nowIso,
  })

  // 1) Insights da conta, nível CONJUNTO → meta_insights.
  let conjuntos: Linha[] = []
  try {
    const r = await paginar(`${API}/${META_ACCOUNT}/insights?level=adset&fields=${FIELDS_ADSET}${periodo}${token}`, prazo)
    conjuntos = r.data
    incompleto ||= r.incompleto
  } catch (e) {
    return Response.json({ ok: false, step: 'insights-conjuntos', conta: META_ACCOUNT, error: String(e) }, { status: 502 })
  }
  const rows = conjuntos.map((d) => linhaConjunto(d, String(d.adset_id)))

  // 2) Insights da conta, nível ANÚNCIO → meta_ads.
  let anunciosApi: Linha[] = []
  try {
    const r = await paginar(`${API}/${META_ACCOUNT}/insights?level=ad&fields=${FIELDS_AD}${periodo}${token}`, prazo)
    anunciosApi = r.data
    incompleto ||= r.incompleto
  } catch (e) {
    return Response.json({ ok: false, step: 'insights-anuncios', conta: META_ACCOUNT, error: String(e) }, { status: 502 })
  }
  const adRows = anunciosApi.map((a) => linhaAnuncio(a, null))

  // 3) Status (ativo/pausado) de todos os conjuntos e anúncios da conta.
  //    Acessório: se falhar, não derruba o run.
  const statusRows: Record<string, unknown>[] = []
  const idsConjuntosConta = new Set<string>()
  let erroStatus: string | null = null
  const lista = (v: string[]) => encodeURIComponent(JSON.stringify(v))
  const stConjuntos = lista(['ACTIVE', 'PAUSED', 'ARCHIVED', 'CAMPAIGN_PAUSED', 'IN_PROCESS', 'WITH_ISSUES', 'PENDING_REVIEW', 'DISAPPROVED'])
  const stAnuncios = lista(['ACTIVE', 'PAUSED', 'ARCHIVED', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED', 'IN_PROCESS', 'WITH_ISSUES', 'PENDING_REVIEW', 'DISAPPROVED'])
  try {
    const cs = await paginar(`${API}/${META_ACCOUNT}/adsets?fields=id,effective_status&limit=500&effective_status=${stConjuntos}${token}`, prazo)
    for (const a of cs.data) {
      idsConjuntosConta.add(String(a.id))
      statusRows.push({ id: String(a.id), level: 'adset', status: a.effective_status ?? null, updated_at: nowIso })
    }
    const as = await paginar(`${API}/${META_ACCOUNT}/ads?fields=id,effective_status&limit=500&effective_status=${stAnuncios}${token}`, prazo)
    for (const a of as.data) {
      statusRows.push({ id: String(a.id), level: 'ad', status: a.effective_status ?? null, updated_at: nowIso })
    }
  } catch (e) {
    erroStatus = String(e)
  }

  // 4) Complemento: ids rastreados da conta atual que o agregado não trouxe.
  //    Só roda se conseguimos listar os conjuntos da conta (senão não dá p/ saber de qual conta são).
  const vistos = new Set(rows.map((r) => r.ad_id))
  let complemento = 0
  if (idsConjuntosConta.size > 0) {
    let rastreados: string[] = []
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tracked_ad_ids?select=ad_id`, { headers: sbHeaders, cache: 'no-store' })
      if (res.ok) rastreados = ((await res.json()) as { ad_id: string }[]).map((r) => r.ad_id).filter(Boolean)
    } catch (_) { /* complemento é opcional */ }
    const faltando = rastreados.filter((id) => idsConjuntosConta.has(id) && !vistos.has(id))
    const coletar = async (adsetId: string) => {
      try {
        const r1 = await paginar(`${API}/${adsetId}/insights?fields=${FIELDS_ADSET}${periodo}${token}`, prazo)
        for (const d of r1.data) { rows.push(linhaConjunto(d, adsetId)); complemento++ }
        const r2 = await paginar(`${API}/${adsetId}/insights?level=ad&fields=${FIELDS_AD}${periodo}${token}`, prazo)
        for (const a of r2.data) adRows.push(linhaAnuncio(a, adsetId))
      } catch (_) { /* conjunto sem acesso/sem dados: ignora */ }
    }
    for (let i = 0; i < faltando.length; i += CONCURRENCY) {
      if (Date.now() > prazo) { incompleto = true; break }
      await Promise.all(faltando.slice(i, i + CONCURRENCY).map(coletar))
    }
  }

  // 5) Conferência: total diário da conta x soma gravada em meta_insights.
  let totalConta: number | null = null
  let erroTotal: string | null = null
  try {
    const r = await paginar(`${API}/${META_ACCOUNT}/insights?level=account&fields=spend,date_start${periodo}${token}`, Date.now() + 20_000)
    totalConta = r.data.reduce((s, d) => s + (Number(d.spend) || 0), 0)
  } catch (e) {
    erroTotal = String(e)
  }
  const dedupConj = new Map<string, number>()
  for (const r of rows) dedupConj.set(`${r.ad_id}|${r.date}`, Number(r.spend) || 0)
  const totalGravado = [...dedupConj.values()].reduce((s, v) => s + v, 0)

  // 6) Gravação (só upsert).
  const [a, b] = await Promise.all([
    upsert('meta_insights', 'ad_id,date', rows),
    upsert('meta_ads', 'ad_id,date', adRows),
  ])
  if (a) falhasGravacao.push(`meta_insights: ${a}`)
  if (b) falhasGravacao.push(`meta_ads: ${b}`)
  const sErr = await upsert('meta_status', 'id', statusRows)
  if (sErr) erroStatus = erroStatus ? `${erroStatus} | ${sErr}` : sErr

  return Response.json({
    ok: falhasGravacao.length === 0,
    since,
    until,
    conta: META_ACCOUNT,
    conjuntos: dedupConj.size,
    gravadas: a ? 0 : dedupConj.size,
    anuncios: b ? 0 : new Set(adRows.map((r) => `${r.ad_id}|${r.date}`)).size,
    status: statusRows.length,
    complemento_linhas: complemento,
    total_conta: totalConta === null ? null : Math.round(totalConta * 100) / 100,
    total_gravado: Math.round(totalGravado * 100) / 100,
    diferenca: totalConta === null ? null : Math.round((totalConta - totalGravado) * 100) / 100,
    incompleto,
    erro_status: erroStatus,
    erro_total_conta: erroTotal,
    falhas_gravacao: falhasGravacao,
    segundos: Math.round((Date.now() - t0) / 1000),
  })
})
