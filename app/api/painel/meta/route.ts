// Grava a meta do mês e os custos fixos editados no Cockpit do Painel Corpo Feliz.
// Só com a senha do painel (cookie qd_auth). Escreve SÓ na tabela painel_config (id = 'meta').
import { cookies } from 'next/headers'
import { sbUpsertOk } from '@/lib/supabase'
import { validaMeta } from '../../../painel/_config'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const pw = process.env.QUIZ_DASHBOARD_PASSWORD
  const jar = await cookies()
  if (!pw || jar.get('qd_auth')?.value !== pw) return Response.json({ ok: false, erro: 'Entre no painel de novo.' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return Response.json({ ok: false, erro: 'Dados inválidos.' }, { status: 400 }) }
  const v = validaMeta(body)
  if (typeof v === 'string') return Response.json({ ok: false, erro: v }, { status: 400 })

  const ok = await sbUpsertOk('painel_config', { id: 'meta', valor: v, atualizado_em: new Date().toISOString() })
  if (!ok) return Response.json({ ok: false, erro: 'Não consegui salvar agora. Tente de novo.' }, { status: 500 })
  return Response.json({ ok: true })
}
