# Painel Corpo Feliz (laurarosapersonal.com/painel)

Painel único da marca: junta o antigo "Painel da Marca" (Next.js, /painel) com a parte
analítica do "Painel Volta ao Eixo" (artefato do claude.ai). Publicado em 09/10/2026.
Senha: a mesma do dashboard (variável `QUIZ_DASHBOARD_PASSWORD` na Vercel).

## Menu

| Grupo | Aba | Rota | O que responde |
|---|---|---|---|
| Hoje | Cockpit do dia | `/painel` | Meta de lucro do mês (ritmo, projeção, quanto falta por dia em R$ e em vendas da Comunidade), hoje × ontem × 7 dias, "O que fazer agora" (regras fixas), conta do lucro (DRE) e de onde veio o dinheiro |
| Tráfego | Anúncios e ROI | `/painel/anuncios` | Campanha / conjunto / anúncio: gasto, CTR, CPM, cliques, % que abriu a página, visitas e início do quiz, clique em comprar, compras reais, líquido, ROI, custo por compra, sinal (Escalar, Lucrando, Prejuízo, Pausar?, Trocar criativo) e "Como melhorar" |
| Tráfego | Criativos | `/painel/anuncios?nivel=anuncio` | A mesma tabela no nível anúncio |
| Quiz e oferta | Funil do quiz | `/painel/quiz` | Tela a tela (onde as pessoas param), perfil de recomeço, anúncio de origem com valor por visita, respostas que mais compram, últimas sessões |
| Quiz e oferta | Testes A/B | `/painel/testes` | T1, T4, T2 com a chance de cada braço ser o melhor (duas proporções) + ideias T3, T5, T6 |
| Quiz e oferta | Recuperar vendas | `/painel/recuperar` | Pix/boleto sem pagar e cartão recusado (com botão de WhatsApp), quem clicou comprar e não comprou, e "Por que não compram" |
| Vendas | Origem e comercial | `/painel/comercial` | De onde veio cada venda (Quiz, Anúncio direto, WhatsApp da Aline, Hotmart direto, Renovação), Comunidade nova × renovação, plano, oferta, dia a dia e funil da Aline (CRM, se ligado) |
| Vendas | Visão da marca, Canais, Cross-sell, Recorrência | `/painel/marca`, `/canais`, `/cross-sell`, `/recorrencia` | As abas antigas do Painel da Marca. A Recorrência ganhou a lista de assinaturas a vencer e vencidas (14 dias) |
| Detalhes | Produtos e bumps, Hotmart × Greenn, Upsell | `/efeito-lipo-quiz/dashboard/...` | Abas antigas do dashboard do Efeito Lipo, agora com o menu do painel |
| Claude | Aprovar e conversar, Leads da Aline, Quiz no ar | links externos | O que depende do Claude (notificações, propostas, chat, roteiros, editar textos do quiz) continua no artefato do claude.ai |

## Regras (uma definição só para o painel inteiro)

- **Dinheiro** = view `compras_aprovadas`, venda viva (sem reembolso/chargeback) e sem e-mail de teste. Líquido = o que cai na conta.
- **Compra** = carrinho: e-mail + dia de Brasília (principal + bumps contam 1, decisão do Vinicius). **Itens** = transações.
- **Lucro** = líquido − Meta Ads − outros custos do mês. Nos cards diários os custos são rateados por dia.
- **ROI** = líquido ÷ gasto (1 = empate).
- **Venda de anúncio** = id do conjunto no `src` (quiz/LP) ou `FB|campanha` no `sck`. O anúncio é achado pela sessão do quiz com o mesmo `xcod`.
- **Visita real de anúncio** = utm FB/IG, sem `utm_medium` de revisão e robôs (Facebook_Right_Column, Others, {{placement}}, an, audience_network). Sessões `qa-painel` e Tag Assistant ficam fora.
- **Origem** de cada venda (`origemDe` em `app/painel/_lib/dados.ts`):
  1. Renovação: o e-mail já comprou a Comunidade há mais de 20 dias.
  2. Quiz: o xcod bate com uma sessão do quiz.
  3. Anúncio direto.
  4. WhatsApp (Aline): Comunidade nova na Greenn sem rastreio. É provável, porque não há rastreio no link.
  5. Hotmart (link direto).
  6. Sem rastreio.
- **Pix/boleto pendente** = a transação nunca aprovou nem foi recusada ou cancelada, o último status é WAITING_PAYMENT, DELAYED, BILLET_PRINTED ou CREATED, e o e-mail não comprou depois.
- **Testes**: contam desde 09/10 16h30 e decidem com 100+ no braço menor e 95% de chance.

## Onde mudar

- **Meta do mês, custos fixos e ofertas conhecidas:** `app/painel/_config.ts`. Mudar é editar e publicar.
- **Dados:** todas as leituras ficam em `app/painel/_lib/dados.ts`.
  - É **só leitura** no Supabase de vendas, pelo servidor: nenhuma tabela ou função nova no banco.
  - O cálculo é feito no Node.
- **CRM da Aline:** opcional. Exige `CRM_SUPABASE_URL` e `CRM_SUPABASE_KEY` na Vercel (`app/painel/_lib/crm.ts`). Sem elas, a aba mostra o link do Painel de Leads.

## Limites conhecidos

- O banco não tem verba diária, objetivo de otimização nem motivo de reprovação do Meta. Isso continua só no Gerenciador.
- As compras das campanhas usam as vendas reais dos gateways, não o pixel.
- Até haver `sck` nos links da Aline, a origem "WhatsApp (Aline)" é uma inferência.
