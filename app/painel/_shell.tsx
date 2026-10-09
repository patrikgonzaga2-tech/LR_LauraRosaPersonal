// Shell do PAINEL CORPO FELIZ: o painel único da marca (tráfego, quiz, vendas,
// comercial e recorrência). Junta o antigo "Painel da Marca" com o que vivia no
// "Painel Volta ao Eixo" do claude.ai. O que depende do Claude (aprovar,
// conversar, roteiros, editar textos do quiz) continua no claude.ai e fica
// linkado no grupo "Claude".
import type { ReactNode } from 'react'
import { LINKS } from './_config'

const P = '/painel'
const EL = '/efeito-lipo-quiz/dashboard'

type Tab = { key: string; label: string; href: string; ext?: boolean }
const GROUPS: { label: string; tabs: Tab[] }[] = [
  { label: 'Hoje', tabs: [{ key: 'hoje', label: 'Cockpit do dia', href: P }] },
  {
    label: 'Tráfego',
    tabs: [
      { key: 'anuncios', label: 'Anúncios e ROI', href: `${P}/anuncios` },
      { key: 'criativos', label: 'Criativos', href: `${P}/anuncios?nivel=anuncio` },
    ],
  },
  {
    label: 'Quiz e oferta',
    tabs: [
      { key: 'quiz', label: 'Funil do quiz', href: `${P}/quiz` },
      { key: 'testes', label: 'Testes A/B', href: `${P}/testes` },
      { key: 'recuperar', label: 'Recuperar vendas', href: `${P}/recuperar` },
    ],
  },
  {
    label: 'Vendas',
    tabs: [
      { key: 'comercial', label: 'Origem e comercial', href: `${P}/comercial` },
      { key: 'marca-geral', label: 'Visão da marca', href: `${P}/marca` },
      { key: 'marca-canais', label: 'Canais', href: `${P}/canais` },
      { key: 'marca-cross', label: 'Cross-sell', href: `${P}/cross-sell` },
      { key: 'marca-mrr', label: 'Recorrência', href: `${P}/recorrencia` },
    ],
  },
  {
    label: 'Detalhes',
    tabs: [
      { key: 'el-produtos', label: 'Produtos e bumps', href: `${EL}/produtos` },
      { key: 'el-gateways', label: 'Hotmart × Greenn', href: `${EL}/gateways` },
      { key: 'el-upsell', label: 'Upsell', href: `${EL}/upsell` },
    ],
  },
  {
    label: 'Claude',
    tabs: [
      { key: 'claude', label: 'Aprovar e conversar ↗', href: LINKS.painelClaude, ext: true },
      { key: 'leads', label: 'Leads da Aline ↗', href: LINKS.leadsAline, ext: true },
      { key: 'quiz-no-ar', label: 'Quiz no ar ↗', href: LINKS.quiz, ext: true },
    ],
  },
]

export function PainelShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] md:flex" style={{ background: 'var(--pale)' }}>
      <aside className="md:w-56 md:shrink-0 md:h-[100dvh] md:sticky md:top-0 md:overflow-y-auto z-20" style={{ background: 'var(--gd)', color: '#fff' }}>
        <a href={P} className="block px-5 pt-4 pb-3 font-display" style={{ fontWeight: 800, fontSize: 18, color: '#fff', textDecoration: 'none' }}>
          Painel <span style={{ color: 'var(--o)' }}>Corpo Feliz</span>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>tráfego · quiz · vendas · comercial</div>
        </a>
        <nav className="px-3 pb-3 flex md:block gap-1 overflow-x-auto">
          {GROUPS.map((g) => (
            <div key={g.label} className="md:mb-2 flex md:block gap-1 shrink-0">
              <div className="hidden md:block px-2 pt-2 pb-1" style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,.45)' }}>{g.label}</div>
              {g.tabs.map((t) => {
                const on = active === t.key
                return (
                  <a
                    key={t.key}
                    href={t.href}
                    target={t.ext ? '_blank' : undefined}
                    rel={t.ext ? 'noopener noreferrer' : undefined}
                    className="block rounded-lg px-3 py-2 whitespace-nowrap transition-colors"
                    style={{ fontSize: 13.5, fontWeight: 700, color: on ? '#000' : 'rgba(255,255,255,.82)', background: on ? 'var(--o)' : 'transparent', textDecoration: 'none' }}
                  >
                    {t.label}
                  </a>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6">
        <div className="mx-auto" style={{ maxWidth: 1240 }}>{children}</div>
      </main>
    </div>
  )
}
