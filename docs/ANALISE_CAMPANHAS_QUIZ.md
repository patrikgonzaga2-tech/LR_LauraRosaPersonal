# Análise de campanhas do quiz "De Volta ao Eixo" — próxima conversa

Objetivo: cruzar a conta de anúncios com o quiz (promessa nova) e o checkout Greenn, descobrir onde
as pessoas param e montar uma rotina de **vendas todos os dias com low ticket**.

---

## 1. Prompt para abrir a próxima conversa

Copie e cole no começo da conversa nova do Claude Code:

```
Vamos continuar de onde paramos no quiz "De Volta ao Eixo" da Laura Rosa
(https://www.laurarosapersonal.com/efeito-lipo-quiz). Responda sempre em português.

CONTEXTO — leia antes de qualquer coisa:
1. CLAUDE.md (regras: pagamento/checkout/preço só com aprovação do Patrik; nada de push ou
   deploy sem ele pedir).
2. docs/ANALISE_CAMPANHAS_QUIZ.md (este plano, o retrato de 07/10/2026 e o comando
   "status das campanhas de hoje").
3. docs/QUIZ_REVISAO.md (diário do quiz, mapa dos arquivos, página de revisão).
4. docs/CONTEXTO_COMERCIAL.md (CRM UMCLIQUE, vendedora, rotinas 23:59 e 08:00, bancos).
5. docs/PLAYBOOK-RASTREAMENTO-E-DASHBOARD.md (como venda ↔ anúncio se ligam; utm_term = id do
   CONJUNTO; tabelas meta_insights/meta_ads/vendas; dashboard).
Se algum desses docs não estiver na main: `git fetch origin` e
`git log --all --oneline -- docs/<arquivo>` mostra a branch onde ele está.

FONTES DE DADOS (todas só leitura, salvo pedido meu):
- Conta de anúncios Meta 1094091162588572 (conector META_ADS).
- Supabase vendas/funil fjlbvoephhextnxemygf: vendas (gateway greenn/hotmart, offer_code,
  price, full_price, tracking_src = id do conjunto, tracking_sck), quiz_sessions (utm_*,
  reached_index, answers), quiz_events (pageview/start/step/complete/checkout), meta_insights
  (por conjunto/dia), meta_ads (por anúncio/dia), meta_status.
- Supabase CRM ysgsyhmkixvlxpgbyqkl (leads do WhatsApp/Instagram) e o CRM UMCLIQUE (só leitura).
- Checkout Greenn: link de todos os botões do quiz =
  https://payfast.greenn.com.br/redirect/297430?utm_source=efeito-lipo-quiz → oferta QN7gci
  (R$ 37, até 12x de R$ 3,80, garantia 7 dias, 4 order bumps).
- Código do quiz em app/efeito-lipo-quiz/ e o dashboard em app/efeito-lipo-quiz/dashboard/
  (abas geral, funil, quiz, anuncios, utm, produtos, upsell, gateways) e app/painel/.

O QUE QUERO NESTA CONVERSA:
A) Rode o comando "status das campanhas de hoje" (seção 2 do doc) e me mostre o resultado.
B) Diagnóstico do funil do quiz desde 07/10/2026: em que tela as pessoas param (T1 a T26),
   por anúncio e por conjunto; quantas clicam em comprar; quantas compram; custo por etapa.
   Compare com as campanhas anteriores do Efeito Lipo (26/09, 30/09, 01/10) que iam para
   WhatsApp ou direto para o checkout.
C) Diga, com números, se o gargalo é criativo, copy do anúncio, promessa da T1, meio do quiz
   ou oferta/checkout, e o que ajustar primeiro. Leve em conta a quebra de promessa: a T1 fala
   de "recomeço/voltar ao eixo", mas os criativos falam de braços/Mounjaro/treinos hormonais e
   o resto do quiz fala de "secar a barriga / até 8kg em 21 dias".
D) Proponha um plano de vendas diárias com low ticket (R$ 27–37 e bumps): promessa, ângulos de
   criativo, estrutura de campanha, orçamento por dia, metas de CPA e o que medir todo dia.
   Use o que a Laura já vende (Efeito Lipo 21, upsell trimestral R$ 97, Comunidade Corpo Feliz,
   WhatsApp com a vendedora) e o que funcionou nas vendas da Greenn.

COMO TRABALHAR:
- Não altere anúncios, orçamento, quiz, preço ou checkout sem eu aprovar. Proponha com
  antes/depois e espere.
- Mudança de texto do quiz: use a página de revisão e o passo a passo de docs/QUIZ_REVISAO.md.
- No fim, registre uma linha no Diário (seção 4 deste doc) com o que foi visto e decidido.
```

---

## 2. Comando: "status das campanhas de hoje"

Quando o Patrik pedir **"status das campanhas de hoje"**, o Claude faz, nesta ordem, só leitura:

1. **Meta (conta 1094091162588572)**, `date_preset=today` e também `last_3d`:
   campanhas e conjuntos ativos, status (ativo, reprovado, com problema), gasto, impressões,
   cliques no link, CTR, CPC, CPM. Liste os anúncios reprovados ou com problema.
2. **Quiz (`quiz_sessions` / `quiz_events`)**, desde 00:00 de hoje (fuso São Paulo):
   sessões por `utm_campaign` / `utm_term` (conjunto) / `utm_content` (anúncio), quantas passaram
   da T1 (`reached_index > 0`), quantas chegaram ao resultado (≥ 24) e à oferta (25), e quantos
   cliques em comprar (evento `checkout`).
3. **Vendas (`vendas`)** de hoje: Greenn e Hotmart, `offer_code`, valor (`price` e
   `full_price`), cupom (em `raw->'sale'->'coupon'`), e quais vieram do quiz
   (`tracking_sck = 'efeito-lipo-quiz'`) ou de anúncio (`tracking_src` = id do conjunto).
4. **Junta tudo numa tabela por campanha → conjunto → anúncio**:
   gasto | cliques | sessões no quiz | passou da T1 | chegou na oferta | clicou comprar | vendas |
   receita | CPA | ROAS.
5. **Fecha com 3 linhas:** o que está bom, o que está ruim e a ação mais rápida sugerida
   (sem executar).

Cuidados: o mesmo nome de campanha chega com codificações diferentes (`+`, `%2F`); normalize
antes de agrupar. `utm_term` é o id do **conjunto**. O cupom EFEITOLIPO20 baixa a venda para R$ 29,60.

---

## 3. Retrato em 07/10/2026 (onde paramos)

**Quiz publicado** (PRs #2, #3 e #4 na main):
- T1 com a promessa nova: "Você começa toda segunda e na sexta já saiu do plano?" / "Descubra o
  porquê em 2 minutos" / "Quiz Volta ao Eixo… perfil de recomeço e primeiro passo".
- Logo "DE VOLTA AO EIXO" no cabeçalho de todas as telas e no topo da T26.
- T26 (oferta): 5 entregáveis (Plano Efeito Lipo, 21 Treinos Hormonais, Guia Alimentar "Sem
  Neura", Áudios "Quebra de Sabotagem", Planner de Progresso) + 2 bônus (Guia do Ciclo Menstrual,
  Protocolo Anti-Pelanquinha). Quadro de valores R$ 4.535 → hoje R$ 37 ou 12x de R$ 3,80.
  Garantia de 7 dias.
- Ainda com "Efeito Lipo": o título da T26, o rodapé, as perguntas T2–T25, o título do
  Google/WhatsApp (`page.tsx`) e o botão "Garantir minha vaga" da T1.

**Checkout:** os 3 botões da T26 → Greenn `redirect/297430` → oferta QN7gci. A Hotmart ainda é o
checkout de reserva se o navegador bloquear o `sessionStorage` (decisão pendente de tirar).
Vendas QN7gci: R$ 37 até meados de setembro; desde 28/09 aparecem a R$ 29,60 (cupom EFEITOLIPO20,
campanha de 30/09).

**Conta de anúncios 1094091162588572 (últimos 30 dias):**

| Campanha | Status em 07/10 | Destino |
|---|---|---|
| PTK - 03/10 - CONV - ABERTO - POSTS (conjunto ABERTO 120251969455150200) | ativa | **quiz** (desde 07/10) |
| PTK - 01/10 - CONV - ABERTO M - POST EFEITO LIPO (conjunto INTERESSES) | ativa, R$ 141 gastos | WhatsApp |
| PTK - 30/09 - CONV - ABERTO M - POST EFEITO LIPO | pausada | checkout Greenn (cupom) |
| PTK - 26/09 - CONV - ABERTO M - POST EFEITO LIPO | pausada | sem sessões no quiz |

**Primeiro sinal do quiz (07/10, 36 sessões vindas do Meta):** 33 não passaram da 1ª pergunta
(`reached_index` 0), 1 foi até a T8, 2 chegaram ao resultado e nenhuma comprou ainda. Eventos de
todas as origens em 06–07/10: 45 pageviews → 12 cliques em "começar" → 3 quizzes completos →
2 cliques em comprar. Ou seja, a maior perda está **antes do clique no botão da T1**. Anúncios que mais mandaram gente: "MOUNJARO"
(19, ativo) e "18020167145946874" (11, **reprovado**). Como o Meta não devolve o link de destino
dos anúncios de vídeo, o destino de cada campanha foi deduzido pelas sessões e pelas vendas.

**Hipóteses para testar:**
1. A T1 nova não conversa com o criativo (Mounjaro/braços → "começa toda segunda…").
2. Botão da T1 "Garantir minha vaga" + barra "vagas acabando" soam como venda, não como quiz.
3. A T1 promete "perfil de recomeço", mas o resultado e a oferta falam de "até 8kg em 21 dias".

### 3.1 Régua de comparação e diagnóstico de 07/10 (noite, 20h41)

**Régua (quiz antigo, T1 "Bora secar a barriga e definir os braços juntas?", 06/07–23/08/2026):**
R$ 87,5 mil gastos, 62 mil sessões, 2.347 vendas QN7gci. Por sessão: **32% passam da T1**,
**18,7% clicam em comprar**, **3,8% compram**. Clique em comprar → venda: **20%**. CPC ~R$ 1,41.
**CPA R$ 37** (melhor semana R$ 30, pior R$ 44). Reembolso ~2%.
Por comprador (2.489 compradores QN7gci desde jun): bumps Vitalício R$ 37 (8,8%), Cinturinha
R$ 19,90 (7,4%), Dieta Metabólica R$ 19,90 (6,0%), Receitas que Secam R$ 19,90 (4,4%); upsell
Trimestral R$ 97 em 0,6%; ~2% compram a Comunidade depois. Ticket médio até 2h ≈ **R$ 44**
(= CPA de empate, antes da taxa Greenn). Vendas QN7gci por mês: jul 1.704, ago 769, set 17, out 1.

**07/10, quiz com a T1 "Volta ao Eixo" (36 sessões do Meta, testes internos fora):**
| Origem | Sessões | Clicou "Garantir minha vaga" | Respondeu T2 | Resultado | Clicou comprar | Venda |
|---|---|---|---|---|---|---|
| Instagram (feed/stories/reels) | 15 | 3 | 2 | 2 | 1 | 0 |
| Audience Network + "Others" | 17 | 4 | 1 (parou na T8) | 0 | 0 | 0 |
| Facebook coluna direita | 4 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **36** | **7 (19%)** | **3 (8%)** | **2** | **1** | **0** |
Meta no conjunto ABERTO hoje: R$ 20,20, sendo **R$ 10,94 (54%) na Audience Network** (47
impressões, CPM R$ 233, CTR 34% = clique acidental). 15 das 19 sessões do "MOUNJARO" vieram de lá.
Por anúncio: MOUNJARO 19 sessões → 1 passou da T1; 18020167145946874 (reprovado) 11 → 1 → 1
clicou comprar; 18083988689237896 (reprovado) 3 → 1 → resultado; cópias 3 → 0.

**Texto dos anúncios que vão para o quiz:** todos vendem a *Comunidade Corpo Feliz* e pedem
"Comenta QUERO" / "Toque em SEGUIR" (são posts impulsionados com botão "Ver detalhes").
Cadeia atual = 4 promessas: anúncio (Comunidade/braços/Mounjaro) → T1 (recomeço) → T2–T25
(secar barriga, 8 kg) → T26 (Efeito Lipo R$ 37).

**Campanhas anteriores (Meta, 20/09–07/10):**
| Campanha | Destino | Gasto | Cliques | Vendas reais | CPA |
|---|---|---|---|---|---|
| 26/09 | checkout (deduzido) | R$ 115,50 | 134 | 1 provável (28/09, cupom, sem src) | ~R$ 115 |
| 30/09 | checkout Greenn c/ cupom | R$ 56,78 | 45 | **2 × R$ 29,60 + 1 bump Vitalício R$ 37** (anúncio 18029278661850078, "gordura do braço") | **R$ 28,39** |
| 01/10 | WhatsApp (Aline) | R$ 168,48 | 59 | 14 leads "anuncio" no CRM (01–06/10), 1 fechado | ~R$ 141 |
| 03/10 | site até 06/10, quiz em 07/10 | R$ 70,73 | 80 | 0 | — |
O "Compra Realizada" do pixel marca compras em 03/10 e 01/10 que não aparecem em `vendas` com o
src desses conjuntos: provavelmente são compras da Comunidade contadas pelo pixel. Não usar para
decidir.

**Conclusão de 07/10:** o gargalo é **antes da T2** (8% contra 32% da régua). Metade do dinheiro
foi para a Audience Network. No Instagram, que é tráfego bom, passaram 13% (2/15): ainda é metade
da régua, o que aponta para anúncio e T1 desalinhados. O meio do quiz e o checkout ainda não
dão para julgar (amostra de 1 clique em comprar); na régua estavam bons (80% de quem passa da T1
chega ao resultado; 20% de quem clica compra).

---

## 4. Diário

- **07/10/2026 (2)**: Rodado o "status de hoje" + diagnóstico (seção 3.1). Gasto hoje R$ 47,48
  (03/10 quiz R$ 20,20; 01/10 WhatsApp R$ 27,28). Quiz: 36 sessões Meta → 3 passaram da T1 →
  1 clicou comprar → 0 vendas. Greenn hoje: 0 Efeito Lipo; 4 Comunidade Anual aprovadas
  (WhatsApp, sem atribuição). Achados: 54% do gasto do quiz na Audience Network; textos dos
  anúncios vendem a Comunidade ("Comenta QUERO"); 2 anúncios do quiz reprovados; o criativo
  que mais vendeu (18029278661850078, braço) está "com problema" na campanha 30/09 pausada.
  **Propostas aguardando o Patrik** (nada alterado): (1) tirar Audience Network e coluna direita
  do conjunto ABERTO; (2) T1 de volta para a promessa "secar barriga + braços" (ou A/B com a
  "Volta ao Eixo"); (3) anúncio próprio para o quiz, com a mesma promessa da T1; (4) plano
  low ticket com CPA alvo ≤ R$ 37 e régua acima.
- **07/10/2026**: Plano criado. Próximo passo: rodar "status das campanhas de hoje" e o
  diagnóstico do funil em ~09/10/2026, com 2 dias de dados da promessa nova.
