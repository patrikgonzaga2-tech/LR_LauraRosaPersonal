// Meses fechados, copiados da planilha "Gestão financeira Corpo feliz" (Drive, lida em 10/10/2026).
// faturamento = RECEITA BRUTA TOTAL · investimento = Tráfego total · lucro = LUCRO LIQUIDO.
// Na planilha, a aba "JANEIRO 2025" fica entre dezembro/2025 e fevereiro/2026: é janeiro/2026.
// Para atualizar: copiar os números da planilha para cá (ou pedir ao Claude).
export type MesFechado = { mes: string; faturamento: number; investimento: number; lucro: number; greenn?: number; hotmart?: number }

export const HISTORICO: MesFechado[] = [
  { mes: '2025-09', faturamento: 43235.94, investimento: 26643.0, lucro: 6455.09 },
  { mes: '2025-10', faturamento: 72281.61, investimento: 37390.09, lucro: 15249.45 },
  { mes: '2025-11', faturamento: 77306.88, investimento: 34908.43, lucro: 22200.04 },
  { mes: '2025-12', faturamento: 64253.79, investimento: 16431.99, lucro: 24200.49 },
  { mes: '2026-01', faturamento: 84576.06, investimento: 24048.47, lucro: 31784.77 },
  { mes: '2026-02', faturamento: 110812.83, investimento: 39019.96, lucro: 32764.32 },
  { mes: '2026-03', faturamento: 89545.33, investimento: 37625.85, lucro: 15857.85 },
  { mes: '2026-04', faturamento: 95349.11, investimento: 45865.64, lucro: 13555.86 },
  { mes: '2026-05', faturamento: 103460.95, investimento: 54394.46, lucro: 6068.48, greenn: 98719.26, hotmart: 4741.69 },
  { mes: '2026-06', faturamento: 93673.8, investimento: 43352.62, lucro: 17901.98, greenn: 53850.9, hotmart: 39822.9 },
  { mes: '2026-07', faturamento: 137743.3, investimento: 72274.29, lucro: 24364.96, greenn: 125788.95, hotmart: 11954.35 },
  { mes: '2026-08', faturamento: 73550.33, investimento: 29239.83, lucro: 15120.99, greenn: 71690.34, hotmart: 1859.99 },
  { mes: '2026-09', faturamento: 30734.66, investimento: 1800.0, lucro: 13102.85, greenn: 27178.95, hotmart: 3555.71 },
]
