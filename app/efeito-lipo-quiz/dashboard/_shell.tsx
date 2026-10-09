// As abas antigas do dashboard do Efeito Lipo agora vivem dentro do Painel Corpo
// Feliz (mesmo menu). As de detalhe (Produtos, Gateways, Upsell) seguem neste
// endereço; Geral, Funil, Quiz, Anúncios e UTM foram substituídas pelas abas novas
// do /painel, mas continuam abrindo por link direto.
import type { ReactNode } from 'react'
import { PainelShell } from '../../painel/_shell'

const MAPA: Record<string, string> = { produtos: 'el-produtos', gateways: 'el-gateways', upsell: 'el-upsell', quiz: 'quiz', anuncios: 'anuncios', funil: 'quiz', geral: 'marca-geral', utm: 'comercial' }

export function DashboardShell({ active, children }: { active: string; children: ReactNode }) {
  return <PainelShell active={MAPA[active] || ''}>{children}</PainelShell>
}
