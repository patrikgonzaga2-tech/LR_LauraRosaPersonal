// Leitura do CRM da Aline (Supabase "CRM Corpo Feliz", ysgsyhmkixvlxpgbyqkl).
// Opcional: só funciona se a Vercel tiver CRM_SUPABASE_URL e CRM_SUPABASE_KEY
// (chave de leitura). Sem elas, o painel mostra como ligar e o link do Painel de
// Leads do claude.ai. Só SELECT; nunca escreve.
const URL = (process.env.CRM_SUPABASE_URL || '').replace(/\s/g, '').replace(/\/+$/, '')
const KEY = (process.env.CRM_SUPABASE_KEY || '').replace(/\s/g, '')
export const crmLigado = () => Boolean(URL && KEY)

export type ConversaCrm = {
  chegou_em: string; tipo: string; origem: string | null; resultado: string | null
  atendimento_humano: boolean | null; chegou_na_oferta: boolean | null; recebeu_link: boolean | null
  tempo_primeira_resposta_min: number | null; plano: string | null; valor: number | null; motivo_nao_compra: string | null
}

export async function conversas(diaIni: string, diaFim: string): Promise<ConversaCrm[] | null> {
  if (!crmLigado()) return null
  const base = /^https?:\/\//.test(URL) ? URL : `https://${URL}`
  const cols = 'chegou_em,tipo,origem,resultado,atendimento_humano,chegou_na_oferta,recebeu_link,tempo_primeira_resposta_min,plano,valor,motivo_nao_compra'
  const out: ConversaCrm[] = []
  try {
    for (let from = 0; from < 50_000; from += 1000) {
      const r = await fetch(`${base}/rest/v1/conversas_lidas?select=${cols}&chegou_em=gte.${diaIni}&chegou_em=lte.${diaFim}&tipo=eq.lead`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Range-Unit': 'items', Range: `${from}-${from + 999}` },
        cache: 'no-store',
      })
      if (!r.ok) { console.error('[crm] HTTP', r.status, await r.text().catch(() => '')); return out.length ? out : null }
      const b = (await r.json()) as ConversaCrm[]
      out.push(...b)
      if (b.length < 1000) break
    }
  } catch (e) {
    console.error('[crm] falhou:', e)
    return out.length ? out : null
  }
  return out
}
