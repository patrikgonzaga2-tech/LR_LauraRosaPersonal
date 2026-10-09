// Porta de entrada das páginas do painel: senha (cookie qd_auth) e Supabase.
import { cookies } from 'next/headers'
import Login from '../../efeito-lipo-quiz/dashboard/_login'
import { supabaseConfigured } from '@/lib/supabase'
import { PainelShell } from '../_shell'

/** Devolve a tela de bloqueio (login ou "sem Supabase") ou null se pode seguir. */
export async function bloqueio(active: string) {
  const jar = await cookies()
  const pw = process.env.QUIZ_DASHBOARD_PASSWORD
  if (!(Boolean(pw) && jar.get('qd_auth')?.value === pw)) return <Login configured={Boolean(pw)} />
  if (!supabaseConfigured()) return <PainelShell active={active}><p style={{ color: 'var(--sub)' }}>Supabase não configurado no servidor.</p></PainelShell>
  return null
}
