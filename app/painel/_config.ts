// Configuração do Painel Corpo Feliz (um lugar só para o que muda à mão).
//
// A meta e os "outros custos" viviam no banco do painel do claude.ai
// (config/meta). Aqui ficam no código: mudar = editar este arquivo e publicar.

export const META = {
  // Meta de outubro/2026 (Patrik, 08/10): R$ 10 mil de LUCRO no mês, marca inteira
  // (low ticket + Comunidade). Lucro = líquido dos gateways − Meta Ads − outros custos.
  texto: 'Bater R$ 10 mil de lucro (low ticket + Comunidade)',
  lucro: 10_000,
  inicio: '2026-10-01',
  dias: 31,
  // Custos fixos do mês (valores de 08/10). Rateados por dia nos cards diários.
  custos: [
    { nome: 'Mentoria', valor: 3500 },
    { nome: 'Social mídia', valor: 1500 },
    { nome: 'IA', valor: 600 },
    { nome: 'Comercial', valor: 500 },
    { nome: 'WhatsApp', valor: 200 },
  ],
  custosAtualizadosEm: '2026-10-08',
}

export const custosDoMes = () => META.custos.reduce((a, c) => a + c.valor, 0)

/** Mês da meta. Se hoje já passou do mês configurado, usa o mês corrente (mesma meta
 *  e custos) e avisa que precisa confirmar os valores do mês novo. */
export function metaAtual(hoje: string): { inicio: string; dias: number; desatualizada: boolean } {
  const fim = new Date(new Date(`${META.inicio}T12:00:00Z`).getTime() + META.dias * 86_400_000).toISOString().slice(0, 10)
  if (hoje >= META.inicio && hoje < fim) return { inicio: META.inicio, dias: META.dias, desatualizada: false }
  const [y, m] = hoje.split('-').map(Number)
  return { inicio: `${hoje.slice(0, 7)}-01`, dias: new Date(Date.UTC(y, m, 0)).getUTCDate(), desatualizada: true }
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
  s97oneau: 'Comunidade (Hotmart)',
  f01f1zpy: 'Comunidade (Hotmart)',
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
