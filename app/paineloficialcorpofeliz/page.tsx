import { cookies } from 'next/headers'
import Login from '../efeito-lipo-quiz/dashboard/_login'

// Painel oficial Corpo Feliz: índice de TODOS os links da operação (sites,
// painéis do site, painéis no Claude, planilhas e ferramentas). Só links e
// descrições — nenhum número de venda. Mesma senha do /painel (cookie qd_auth).
// Para atualizar: edite as listas abaixo e publique pela main.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Painel Oficial — Corpo Feliz', robots: { index: false, follow: false } }

const ATUALIZADO = '08/10/2026'

type Status = 'ok' | 'senha' | 'privado' | 'verificar' | 'parado'
type Item = { nome: string; url: string; oque: string; status?: Status; obs?: string }
type Grupo = { titulo: string; sub?: string; itens: Item[] }

const SITE = 'https://www.laurarosapersonal.com'

const GRUPOS: Grupo[] = [
  {
    titulo: 'Site laurarosapersonal.com',
    sub: 'Vercel, projeto efeito-lipo-21 · código no GitHub LR_LauraRosaPersonal · publica a cada envio na main',
    itens: [
      { nome: 'Quiz De Volta ao Eixo', url: `${SITE}/efeito-lipo-quiz`, oque: 'Quiz de 26 telas → oferta Efeito Lipo 21 (Greenn QN7gci, R$ 37). Destino da campanha ativa de 08/10.', status: 'ok' },
      { nome: 'Efeito Lipo (teste A/B)', url: `${SITE}/efeito-lipo`, oque: 'Sorteia 50/50 entre a versão A e a B e guarda a escolha por 30 dias. A raiz do site cai aqui.', status: 'ok' },
      { nome: 'Efeito Lipo · versão A', url: `${SITE}/efeito-lipo-a`, oque: 'Página de venda com VSL (vídeo).', status: 'ok' },
      { nome: 'Efeito Lipo · versão B', url: `${SITE}/efeito-lipo-b`, oque: 'Página de venda sem VSL.', status: 'ok' },
      { nome: 'Upsell pós-compra', url: `${SITE}/acompanhamento-up`, oque: 'Oferta de acompanhamento com cobrança em 1 clique.', status: 'ok' },
      { nome: 'Upsell pelo WhatsApp', url: `${SITE}/up-cf-whats`, oque: 'Mesma oferta de upsell, versão enviada pelo WhatsApp.', status: 'ok' },
      { nome: 'Obrigado Efeito Lipo', url: `${SITE}/obg-gp-efeito-lipo`, oque: 'Pós-compra: leva a cliente para o grupo.', status: 'ok' },
      { nome: 'Presente de casamento', url: `${SITE}/presente-casamento`, oque: 'Campanha do convite de casamento.', status: 'ok' },
    ],
  },
  {
    titulo: 'Painéis e dashboards do site',
    sub: 'Todos com a mesma senha (variável QUIZ_DASHBOARD_PASSWORD na Vercel). Números ao vivo do Supabase de vendas.',
    itens: [
      { nome: 'Painel oficial (esta página)', url: `${SITE}/paineloficialcorpofeliz`, oque: 'Índice de todos os links da operação.', status: 'senha' },
      { nome: 'Painel da Marca · Visão Geral', url: `${SITE}/painel`, oque: 'Receita, vendas e reembolsos por gateway, canal e produto, com filtro de período.', status: 'senha' },
      { nome: 'Painel da Marca · Canais', url: `${SITE}/painel/canais`, oque: 'Vendas por canal: anúncios, comercial/WhatsApp, orgânico, direto.', status: 'senha' },
      { nome: 'Painel da Marca · Cross-sell', url: `${SITE}/painel/cross-sell`, oque: 'Quem comprou um produto e depois outro.', status: 'senha' },
      { nome: 'Painel da Marca · Recorrência', url: `${SITE}/painel/recorrencia`, oque: 'Assinaturas da Comunidade e receita recorrente.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Geral', url: `${SITE}/efeito-lipo-quiz/dashboard/geral`, oque: 'Resumo do funil do Efeito Lipo: gasto, vendas, CPA, ROAS.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Funil', url: `${SITE}/efeito-lipo-quiz/dashboard/funil`, oque: 'Visita → quiz → checkout → venda.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Quiz', url: `${SITE}/efeito-lipo-quiz/dashboard/quiz`, oque: 'Em que tela (T1 a T26) as pessoas param e o que respondem.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Anúncios', url: `${SITE}/efeito-lipo-quiz/dashboard/anuncios`, oque: 'Gasto e vendas por campanha, conjunto e anúncio do Meta.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Origem (UTM)', url: `${SITE}/efeito-lipo-quiz/dashboard/utm`, oque: 'Sessões e vendas por utm_source, campanha, posicionamento e anúncio.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Produtos', url: `${SITE}/efeito-lipo-quiz/dashboard/produtos`, oque: 'Produto principal, order bumps e reembolsos.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Upsell', url: `${SITE}/efeito-lipo-quiz/dashboard/upsell`, oque: 'Conversão do upsell pós-compra.', status: 'senha' },
      { nome: 'Dashboard Efeito Lipo · Gateways', url: `${SITE}/efeito-lipo-quiz/dashboard/gateways`, oque: 'Greenn × Hotmart.', status: 'senha' },
    ],
  },
  {
    titulo: 'Outros sites e domínios',
    sub: 'Domínios na Hostinger (conta u339177558). "Verificar" = o DNS aponta para lá, mas o conteúdo não foi conferido.',
    itens: [
      { nome: 'Comunidade Corpo Feliz · candidatura', url: 'https://teamcorpofeliz.com.br', oque: 'Candidatura por WhatsApp, sem preço (/cf-whats). Variações /cf-whats/b e /c com planos e /cf-whats/d com VSL. Vercel, projeto lr-cf-pagina-de-vendas-vsl, GitHub LR_TeamCorpoFeliz.', status: 'ok', obs: 'Domínio registrado fora da Hostinger.' },
      { nome: 'App Desafio Volta ao Eixo 7D', url: 'https://laurarosapersonal.site', oque: 'Jornada guiada de 7 dias (página única para celular). GitHub 7diasdevolta.', status: 'verificar', obs: 'DNS aponta para a Vercel.' },
      { nome: 'Team Laura Rosa (WordPress)', url: 'https://teamlaurarosa.com.br', oque: 'Site WordPress na Hostinger, criado em 07/10/2026.', status: 'verificar' },
      { nome: 'Quiz Team Laura Rosa', url: 'https://quiz.teamlaurarosa.com.br', oque: 'Subdomínio apontado para a xQuiz (xquiz.click).', status: 'verificar' },
      { nome: 'Projeto Recomeço', url: 'https://projetorecomeco.com', oque: 'Domínio apontado para a Vercel.', status: 'verificar' },
      { nome: 'team.laurarosapersonal.com', url: 'https://team.laurarosapersonal.com', oque: 'Subdomínio apontado para a Vercel.', status: 'verificar' },
      { nome: 'quiz.laurarosapersonal.com', url: 'https://quiz.laurarosapersonal.com', oque: 'Subdomínio apontado para a Vercel.', status: 'verificar' },
      { nome: 'Time Líbia Intensivão', url: 'https://timelibiaintensivao.com.br', oque: 'Site WordPress hospedado na mesma conta Hostinger.', status: 'verificar' },
      { nome: 'Activa Trainning', url: 'https://activatrainning.com', oque: 'Domínio no portfólio da Hostinger com DNS gerenciado fora dela.', status: 'verificar' },
      { nome: 'quizmetodomcb.com.br', url: 'https://quizmetodomcb.com.br', oque: 'Transferência para a Hostinger falhou.', status: 'parado' },
    ],
  },
  {
    titulo: 'Painéis e documentos no Claude',
    sub: 'Privados: abrem com a conta do Patrik no claude.ai (ou de quem ele compartilhar pelo menu Share).',
    itens: [
      { nome: 'Painel Volta ao Eixo', url: 'https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN', oque: 'Funil de hoje ao vivo, campanhas, criativos e sugestões com aprovação, verificação de pixel.', status: 'privado' },
      { nome: 'Painel de Leads', url: 'https://claude.ai/artifact/8Ys79EhBMSiRkDqm3n6QbG', oque: 'Leads do WhatsApp/Instagram (CRM UMCLIQUE), atualizado pela rotina das 23:59.', status: 'privado' },
      { nome: 'Revisão do Quiz (fila de pedidos)', url: 'https://claude.ai/artifact/1CpgLoG6JcvucRM21TPfiQ', oque: 'Quiz funcionando + textos editáveis + fila de pedidos de alteração.', status: 'privado' },
      { nome: 'Revisão Volta ao Eixo (copy)', url: 'https://claude.ai/artifact/FmQj4sLw6aAM6oifASt1qK', oque: 'Aprovação da copy "perfil de recomeço" e da T26.', status: 'privado' },
      { nome: 'Roteiros de vídeo da Laura', url: 'https://claude.ai/artifact/Br7unX3TmXKevyrEoZD1EY', oque: 'Roteiros e storyboards (R1 a R3) para a Laura gravar.', status: 'privado' },
      { nome: 'Quiz Efeito Lipo 21', url: 'https://claude.ai/artifact/N8Mm5s4D65sZJcy5bzDBu1', oque: 'Versão do quiz no Claude (07/10).', status: 'privado' },
      { nome: 'Quiz Volta ao Eixo · Telas', url: 'https://claude.ai/artifact/768H14r7dhDznP3LeZLZFx', oque: 'Desenho das telas do quiz (05/10).', status: 'privado' },
      { nome: 'Desafio Volta ao Eixo 7D', url: 'https://claude.ai/artifact/J56RSR2jXzvFqbAoLSZgwa', oque: 'Conceito do desafio de 7 dias.', status: 'privado' },
      { nome: 'Desafio 7D · App', url: 'https://claude.ai/artifact/EQWEKVakN8DMmBgCp9pbAf', oque: 'Protótipo do app de entrega.', status: 'privado' },
      { nome: 'Desafio 7D · Especificação do app', url: 'https://claude.ai/artifact/45Bam4SZbAhr2L9gf6kXhg', oque: 'Regras, telas e dados do app.', status: 'privado' },
      { nome: 'Desafio 7D · Página de vendas + funil', url: 'https://claude.ai/artifact/3o4NwprVbjb1F3DWBjSMfh', oque: 'Página de vendas e funil do desafio.', status: 'privado' },
      { nome: 'Manual de Operação Corpo Feliz', url: 'https://claude.ai/artifact/7DnJQMM7EEFHf4ZCx29SYh', oque: 'Como usar, publicar e ler o painel, explicado do zero.', status: 'privado', obs: 'Também em claude.ai/code/artifact/325faca1-d6e4-42ce-9ebe-de225b822722' },
    ],
  },
  {
    titulo: 'Planilhas',
    itens: [
      { nome: 'Planilha que atualiza sozinha', url: 'https://docs.google.com/spreadsheets/d/1OSPiYkXZGpnac7CPlX3-r_agwZX2Otomq8n1PBxjJd8/edit', oque: 'Leads e vendas, gerada pela função "planilha" do Supabase do CRM.', status: 'privado' },
      { nome: 'Planilha da Aline', url: 'https://docs.google.com/spreadsheets/d/11eG71MZo0lms74PwOfrbEVN-FGyPk8Di1g8Y6pI6JhY/edit', oque: 'Vendas da vendedora, aba "VENDAS <MÊS> <ANO>". Só leitura para o Claude.', status: 'privado' },
    ],
  },
  {
    titulo: 'Ferramentas e contas',
    itens: [
      { nome: 'Gerenciador de Anúncios', url: 'https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=1094091162588572', oque: 'Conta 1094091162588572. Campanha ativa: PTK - 08/10 - CONV - QUIZ VOLTA AO EIXO.', status: 'privado' },
      { nome: 'Gerenciador de Eventos · pixel da LP', url: 'https://business.facebook.com/events_manager2/list/dataset/28090278990632923', oque: 'Pixel 28090278990632923 ("Compra Realizada", usado pela campanha).', status: 'privado' },
      { nome: 'Gerenciador de Eventos · pixel oficial', url: 'https://business.facebook.com/events_manager2/list/dataset/944444744178548', oque: 'Pixel Oficial - Corpo Feliz - Laura (944444744178548).', status: 'privado' },
      { nome: 'Google Tag Manager', url: 'https://tagmanager.google.com/', oque: 'Contêiner GTM-KFQ56MZ7 do site. Pendente: pixel da LP parado desde 06/10 (www).', status: 'parado' },
      { nome: 'Supabase · vendas e funil', url: 'https://supabase.com/dashboard/project/fjlbvoephhextnxemygf', oque: 'Tabelas vendas, quiz_sessions, quiz_events, meta_insights, meta_ads. Nunca escrever.', status: 'privado' },
      { nome: 'Supabase · CRM Corpo Feliz', url: 'https://supabase.com/dashboard/project/ysgsyhmkixvlxpgbyqkl', oque: 'Leads, conversas lidas, relatórios diários, instruções das rotinas.', status: 'privado' },
      { nome: 'Greenn', url: 'https://greenn.com.br', oque: 'Checkout do quiz: oferta QN7gci, link payfast.greenn.com.br/redirect/297430.', status: 'privado' },
      { nome: 'Hostinger (hPanel)', url: 'https://hpanel.hostinger.com', oque: 'Domínios, DNS e os sites WordPress.', status: 'privado' },
      { nome: 'Vercel', url: 'https://vercel.com/dashboard', oque: 'Projetos efeito-lipo-21 (este site) e lr-cf-pagina-de-vendas-vsl (teamcorpofeliz).', status: 'privado' },
      { nome: 'GitHub · site da Laura', url: 'https://github.com/patrikgonzaga2-tech/LR_LauraRosaPersonal', oque: 'Código deste site. Está público: recomendado deixar privado.', status: 'verificar' },
      { nome: 'GitHub · Comunidade', url: 'https://github.com/patrikgonzaga2-tech/LR_TeamCorpoFeliz', oque: 'Código do teamcorpofeliz.com.br. Está público.', status: 'verificar' },
      { nome: 'GitHub · App 7D', url: 'https://github.com/patrikgonzaga2-tech/7diasdevolta', oque: 'Código do app do desafio de 7 dias. Está público.', status: 'verificar' },
    ],
  },
]

const ROTINAS = [
  { nome: 'Painel de Leads 23:59', oque: 'Lê o CRM UMCLIQUE, classifica as conversas, grava no Supabase do CRM e republica o Painel de Leads.' },
  { nome: 'Relatório no grupo Vendas Aline 8h', oque: 'Manda 1 mensagem no grupo "Vendas Aline" com o dia anterior e o total do mês (sem nomes nem telefones).' },
]

// Tema escuro (só nesta página; o login segue o padrão do /painel).
const C = {
  bg: '#121110',
  card: '#1C1B19',
  line: 'rgba(255,255,255,.08)',
  ink: '#F1EEE9',
  sub: '#BDB7AE',
  mute: '#8D877E',
  o: '#FF8A26',
}

const STATUS: Record<Status, { txt: string; bg: string; fg: string }> = {
  ok: { txt: 'No ar', bg: '#15301F', fg: '#86DCA2' },
  senha: { txt: 'Com senha', bg: '#3A2614', fg: '#FFB070' },
  privado: { txt: 'Login', bg: '#2A2826', fg: '#BDB7AE' },
  verificar: { txt: 'Verificar', bg: '#3A2F17', fg: '#E6B24F' },
  parado: { txt: 'Atenção', bg: '#3B1D1A', fg: '#F07B6E' },
}

function Pill({ s }: { s: Status }) {
  const st = STATUS[s]
  return (
    <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '2px 9px', background: st.bg, color: st.fg, whiteSpace: 'nowrap' }}>{st.txt}</span>
  )
}

function curto(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default async function PainelOficialPage() {
  const jar = await cookies()
  const pw = process.env.QUIZ_DASHBOARD_PASSWORD
  if (!(Boolean(pw) && jar.get('qd_auth')?.value === pw)) return <Login configured={Boolean(pw)} />

  const total = GRUPOS.reduce((n, g) => n + g.itens.length, 0)

  return (
    <main className="min-h-[100dvh]" style={{ background: C.bg, color: C.ink, colorScheme: 'dark' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 16px 64px', display: 'flex', flexDirection: 'column', gap: 36 }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: C.o }}>Laura Rosa · Comunidade Corpo Feliz</span>
          <h1 className="font-display" style={{ fontSize: 'clamp(28px,4.5vw,40px)', fontWeight: 800, lineHeight: 1.05, margin: 0 }}>Painel oficial Corpo Feliz</h1>
          <p style={{ fontSize: 15, color: C.sub, maxWidth: '70ch', margin: 0 }}>
            Todos os sites, painéis, dashboards, planilhas e ferramentas da operação num só lugar ({total} links). Atualizado em {ATUALIZADO}.
          </p>
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {GRUPOS.map((g, i) => (
              <a key={g.titulo} href={`#g${i}`} style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: C.card, border: `1px solid ${C.line}`, color: C.ink, textDecoration: 'none' }}>{g.titulo}</a>
            ))}
            <a href="#rotinas" style={{ fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: C.card, border: `1px solid ${C.line}`, color: C.ink, textDecoration: 'none' }}>Rotinas</a>
          </nav>
        </header>

        {GRUPOS.map((g, i) => (
          <section key={g.titulo} id={`g${i}`} style={{ display: 'flex', flexDirection: 'column', gap: 12, scrollMarginTop: 16 }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{g.titulo}</h2>
              {g.sub && <p style={{ fontSize: 13.5, color: C.mute, margin: '2px 0 0' }}>{g.sub}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: 12 }}>
              {g.itens.map((it) => (
                <a
                  key={it.url + it.nome}
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', flexDirection: 'column', gap: 6, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px', textDecoration: 'none', color: 'inherit', minWidth: 0 }}
                >
                  <span style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <b className="font-display" style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>{it.nome}</b>
                    {it.status && <Pill s={it.status} />}
                  </span>
                  <span style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.5 }}>{it.oque}</span>
                  {it.obs && <span style={{ fontSize: 12.5, color: C.mute }}>{it.obs}</span>}
                  <span style={{ fontSize: 12.5, color: C.o, fontWeight: 600, overflowWrap: 'anywhere', marginTop: 'auto' }}>{curto(it.url)}</span>
                </a>
              ))}
            </div>
          </section>
        ))}

        <section id="rotinas" style={{ display: 'flex', flexDirection: 'column', gap: 12, scrollMarginTop: 16 }}>
          <div>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Rotinas automáticas</h2>
            <p style={{ fontSize: 13.5, color: C.mute, margin: '2px 0 0' }}>Rodam sozinhas no Claude (Routines). Instruções na tabela rotina_instrucoes do Supabase do CRM.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(300px,100%),1fr))', gap: 12 }}>
            {ROTINAS.map((r) => (
              <div key={r.nome} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' }}>
                <b className="font-display" style={{ fontSize: 16, fontWeight: 800 }}>{r.nome}</b>
                <p style={{ fontSize: 13.5, color: C.sub, margin: '6px 0 0', lineHeight: 1.5 }}>{r.oque}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ fontSize: 12.5, color: C.mute, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
          Página com senha e fora do Google. Os links do Claude, das planilhas e das ferramentas pedem login na conta de cada serviço.
          Para atualizar esta lista, peça ao Claude: &quot;atualiza o painel oficial&quot;.
        </footer>
      </div>
    </main>
  )
}
