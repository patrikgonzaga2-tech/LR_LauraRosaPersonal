// Configuração do Painel Corpo Feliz (um lugar só para o que muda à mão).
//
// A meta do mês e os custos fixos são EDITÁVEIS no Cockpit (botão "Editar meta e
// custos") e ficam na tabela public.painel_config (id = 'meta') do Supabase de
// vendas. Os valores abaixo são só o padrão, usados se a tabela estiver vazia.

// Tipos de custo (como na planilha "Gestão financeira Corpo feliz"):
//   fixo      → R$ por mês
//   pct_fat   → % do faturamento LÍQUIDO dos gateways (é o que a planilha chama de receita; ex.: DARF 11%)
//   pct_meta  → % do investimento no Meta (ex.: imposto Meta Ads 12,5%)
//   pct_aline → % das vendas da Aline (Comunidade nova pelo WhatsApp; ex.: comissão 10%)
export type TipoCusto = 'fixo' | 'pct_fat' | 'pct_meta' | 'pct_aline'
export const TIPOS: [TipoCusto, string][] = [['fixo', 'R$ por mês'], ['pct_fat', '% do faturamento'], ['pct_meta', '% do investimento Meta'], ['pct_aline', '% das vendas da Aline']]
// Grupos na ordem da planilha (a "conta do lucro" segue esta ordem).
export const GRUPOS = ['Impostos e contabilidade', 'Ferramentas de vendas', 'Comercial', 'Comissões e vendedoras', 'Estrutura e time', 'Capacitações'] as const
export type Custo = { nome: string; valor: number; tipo: TipoCusto; grupo: string }
export type MetaCfg = { texto: string; lucro: number; inicio: string; dias: number; custos: Custo[] }

export const META_PADRAO: MetaCfg = {
  // Meta de outubro/2026 (Patrik, 08/10): R$ 10 mil de LUCRO no mês, marca inteira
  // (low ticket + Comunidade). Lucro = líquido dos gateways − Meta Ads − custos.
  // Custos de outubro/2026 copiados da planilha "Gestão financeira Corpo feliz" (10/10).
  texto: 'Bater R$ 10 mil de lucro (low ticket + Comunidade)',
  lucro: 10_000,
  inicio: '2026-10-01',
  dias: 31,
  custos: [
    { grupo: 'Impostos e contabilidade', nome: 'Imposto DARF', valor: 11, tipo: 'pct_fat' },
    { grupo: 'Impostos e contabilidade', nome: 'Contabilidade + DARF', valor: 616, tipo: 'fixo' },
    { grupo: 'Ferramentas de vendas', nome: 'Chat UmClique', valor: 375.3, tipo: 'fixo' },
    { grupo: 'Ferramentas de vendas', nome: 'Speedy', valor: 249, tipo: 'fixo' },
    { grupo: 'Ferramentas de vendas', nome: 'Chip Flow', valor: 75, tipo: 'fixo' },
    { grupo: 'Ferramentas de vendas', nome: 'VTurb', valor: 97, tipo: 'fixo' },
    { grupo: 'Ferramentas de vendas', nome: 'Imposto Meta Ads', valor: 12.5, tipo: 'pct_meta' },
    { grupo: 'Comercial', nome: 'Recarga API', valor: 2000, tipo: 'fixo' },
    { grupo: 'Comercial', nome: 'Claude', valor: 550, tipo: 'fixo' },
    { grupo: 'Comercial', nome: 'Celular brdid', valor: 69.9, tipo: 'fixo' },
    { grupo: 'Comercial', nome: 'Supabase', valor: 100, tipo: 'fixo' },
    { grupo: 'Comercial', nome: 'Vercel', valor: 100, tipo: 'fixo' },
    { grupo: 'Comissões e vendedoras', nome: 'Comissão Aline', valor: 10, tipo: 'pct_aline' },
    { grupo: 'Comissões e vendedoras', nome: 'Bia', valor: 1500, tipo: 'fixo' },
    { grupo: 'Estrutura e time', nome: 'Metricool', valor: 150, tipo: 'fixo' },
    { grupo: 'Estrutura e time', nome: 'CapCut', valor: 20, tipo: 'fixo' },
    { grupo: 'Capacitações', nome: 'Consultoria Yan', valor: 3500, tipo: 'fixo' },
  ],
}

/** Base para os custos em %: faturamento líquido dos gateways (como na planilha), investimento no Meta e vendas da Aline (bruto). */
export type BaseCusto = { receita: number; gasto: number; brutoAline: number }
/** Valor em R$ de um custo num período. Custos fixos entram pela fração `fracFixo` do mês. */
export function valorCusto(c: Custo, b: BaseCusto, fracFixo = 1) {
  if (c.tipo === 'pct_fat') return (c.valor / 100) * b.receita
  if (c.tipo === 'pct_meta') return (c.valor / 100) * b.gasto
  if (c.tipo === 'pct_aline') return (c.valor / 100) * b.brutoAline
  return c.valor * fracFixo
}
export const custosFixos = (m: MetaCfg) => m.custos.filter((c) => c.tipo === 'fixo').reduce((a, c) => a + c.valor, 0)
/** Custos que variam com as vendas e com o investimento (os em %). */
export const custosVariaveis = (m: MetaCfg, b: BaseCusto) => m.custos.filter((c) => c.tipo !== 'fixo').reduce((a, c) => a + valorCusto(c, b), 0)

/** Confere e limpa uma meta vinda do formulário (ou do banco). Devolve a meta ou o motivo do erro. */
export function validaMeta(x: unknown): MetaCfg | string {
  const o = (x || {}) as Record<string, unknown>
  const texto = String(o.texto ?? '').trim().slice(0, 140)
  const lucro = Number(o.lucro)
  const inicio = String(o.inicio ?? '')
  const dias = Math.round(Number(o.dias))
  if (!texto) return 'Escreva a meta.'
  if (!isFinite(lucro) || lucro <= 0 || lucro > 10_000_000) return 'Meta de lucro inválida.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio) || isNaN(Date.parse(inicio))) return 'Data de início inválida.'
  if (!isFinite(dias) || dias < 1 || dias > 366) return 'Número de dias inválido (1 a 366).'
  if (!Array.isArray(o.custos) || o.custos.length > 60) return 'Lista de custos inválida (até 60).'
  const custos: Custo[] = []
  for (const c of o.custos as Record<string, unknown>[]) {
    const nome = String(c?.nome ?? '').trim().slice(0, 60)
    const valor = Number(String(c?.valor ?? '').replace(',', '.'))
    if (!nome && !valor) continue
    if (!nome) return 'Todo custo precisa de nome.'
    const tipo = (TIPOS.map(([t]) => t) as string[]).includes(String(c?.tipo)) ? (String(c?.tipo) as TipoCusto) : 'fixo'
    const grupo = (GRUPOS as readonly string[]).includes(String(c?.grupo)) ? String(c?.grupo) : 'Estrutura e time'
    if (!isFinite(valor) || valor < 0 || valor > (tipo === 'fixo' ? 10_000_000 : 100)) return `Valor inválido em "${nome}"${tipo === 'fixo' ? '' : ' (porcentagem de 0 a 100)'}.`
    custos.push({ nome, valor: Math.round(valor * 100) / 100, tipo, grupo })
  }
  return { texto, lucro: Math.round(lucro * 100) / 100, inicio, dias, custos }
}

/** Mês da meta. Se hoje está fora do período configurado, usa o mês corrente (mesma meta
 *  e custos) e avisa que precisa confirmar os valores do mês novo. */
export function metaAtual(hoje: string, m: MetaCfg): { inicio: string; dias: number; desatualizada: boolean } {
  const fim = new Date(new Date(`${m.inicio}T12:00:00Z`).getTime() + m.dias * 86_400_000).toISOString().slice(0, 10)
  if (hoje >= m.inicio && hoje < fim) return { inicio: m.inicio, dias: m.dias, desatualizada: false }
  const [y, mes] = hoje.split('-').map(Number)
  return { inicio: `${hoje.slice(0, 7)}-01`, dias: new Date(Date.UTC(y, mes, 0)).getUTCDate(), desatualizada: true }
}

// Conta de anúncios e pixels (só referência na tela).
export const META_ADS = {
  conta: '1094091162588572',
  pixelLP: '28090278990632923',
  pixelOficial: '944444744178548',
}

// Ofertas que o painel reconhece pelo código da oferta (vendas.offer_code).
export const OFERTAS: Record<string, string> = {
  QN7gci: 'Efeito Lipo R$ 37 (quiz, braço A)',
  gLO7Gm: 'Efeito Lipo R$ 47 (quiz, braço B)',
  WOqOSI: 'Comunidade R$ 37/mês (quiz)',
  O8j7nc: 'Comunidade trimestral R$ 97 (upsell)',
  s97oneau: 'Comunidade anual (Hotmart, renovação da base)',
  f01f1zpy: 'Comunidade 30+ (Hotmart, renovação da base)',
  L4SSxY: 'Comunidade R$ 27/mês (teste C)',
  // Links que a Aline manda (Greenn), pelo valor visto nas vendas de outubro.
  ij3kFo: 'Comunidade anual (R$ 479)',
  hq2eWU: 'Comunidade anual (R$ 429)',
  mhl4tN: 'Comunidade anual (R$ 397)',
  omiNl7: 'Comunidade anual (R$ 297)',
  M3DUOL: 'Comunidade anual (parcelada)',
  YaHnMW: 'Comunidade trimestral (R$ 210)',
  TCRlbK: 'Comunidade trimestral (R$ 210)',
  O6NiB7: 'Comunidade mensal (R$ 97)',
  zVvw8v: 'Comunidade mensal (R$ 59)',
}

// Links das ferramentas que dependem do Claude (continuam no claude.ai).
export const LINKS = {
  painelClaude: 'https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN',
  leadsAline: 'https://claude.ai/artifact/8Ys79EhBMSiRkDqm3n6QbG',
  quiz: 'https://www.laurarosapersonal.com/efeito-lipo-quiz',
}

// Quiz novo (v6+) no ar desde 08/10 08h10: antes disso as telas eram outras.
export const QUIZ_NOVO = '2026-10-08T11:10:00Z'

// Testes A/B contam a partir daqui (pedido do Patrik, 09/10).
export const TESTES_DESDE = '2026-10-09T16:30:00-03:00'
export const TESTE_MIN = 100 // mínimo no braço menor para decidir
export const TESTE_CHANCE = 0.95 // chance mínima para decidir

// Faixas de referência (pesquisa de mercado, 09/10; são pontos de partida, não regra).
export const REGUA = {
  connectRate: 0.7, // abriram a página ÷ cliques; abaixo disso, problema de página/velocidade
  ctrBom: 1.0, // % CTR de link em campanha de vendas no Brasil (0,95–1,6%)
  ctrRuim: 0.6,
  comecaQuiz: 0.32, // régua da 1ª tela (histórico do quiz)
  clicaComprar: 0.187, // clicaram comprar ÷ viram a 1ª tela
  bumpTake: 0.25,
  escalaPasso: 0.2, // subir verba 20% a cada 2–3 dias
}
