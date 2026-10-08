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

### 3.2 Padrão para subir campanhas (definido pelo Patrik em 08/10/2026)

"Sempre que te pedir pra subir campanhas, aquele é o padrão." Modelo: campanha
`PTK - 08/10 - CONV - QUIZ VOLTA AO EIXO - CRIATIVOS A-D` (120252038480090200).

- **Campanha**: Vendas (OUTCOME_SALES), nome `PTK - DD/MM - CONV - QUIZ ... - CRIATIVOS X-Y`.
  **Orçamento no conjunto (ABO), R$ 20/dia por conjunto** — nunca orçamento na campanha.
- **Pixel/evento** (atualizado em 08/10, sugestão s1 aprovada no painel): pixel da **LP**
  (28090278990632923), evento **"Compra Realizada"**, que é onde o checkout Greenn do quiz
  (QN7gci) avisa as compras. O pixel oficial (944444744178548) recebeu só 2 compras em 7 dias.
  O Meta não deixa trocar o pixel de um conjunto publicado: para mudar, recriar o conjunto.
  Nome do conjunto termina em `· PIXEL LP`.
- **Público**: Brasil, mulheres, 18–65 como sugestão, Advantage+ público ligado. Nome do
  conjunto `... · MULHERES 25-55 · IG + FB`. Lance automático (menor custo), conversão no site.
- **Conjuntos**:
  - FEED: IG feed + Explorar + FB feed, só celular → peças 4:5 (1080×1350).
  - STORIES E REELS: posicionamentos Advantage+ **menos Audience Network e coluna direita**
    (sugestão s4 aprovada em 08/10) → peças 9:16 (e vídeo).
  - Criativos novos: 1 conjunto novo de +R$ 20 por lote, com as versões feed e stories de cada peça.
- **Anúncio**: nome `LETRA NOME · FEED|STORIES|REELS`; CTA Saiba mais; página Corpo Feliz +
  IG laurarosapersonal; link do quiz com as UTMs **exatamente nesta ordem** (Patrik, 08/10):
  `https://www.laurarosapersonal.com/efeito-lipo-quiz?utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`.
  A ferramenta do Meta não tem o campo "Parâmetros de URL": as UTMs vão no próprio link.
- **Anunciante (obrigatório, Patrik 08/10)**: todo conjunto novo com beneficiário e pagador
  **CORPO FELIZ LTDA** (`dsa_beneficiary` e `dsa_payor` = "CORPO FELIZ LTDA" no ads_create_ad_set
  ou logo depois com ads_update_entity, antes de ativar).
- **Localização (erro #1870194)**: o Meta removeu as opções "pessoas que moram" e "pessoas que
  estiveram" separadas. Criar conjunto com `geo_locations: {"countries":["BR"],"location_types":["home","recent"]}`
  ("moram ou estiveram recentemente"). Conjunto criado pela API sem isso fica com
  `["frequently_in","home"]` e dá o erro. Corrigir num conjunto ativo pausa o conjunto
  (o Meta força): reativar logo depois.
- **Complemento do navegador do WhatsApp (obrigatório, Patrik 08/10)**: todo anúncio com o botão
  do WhatsApp do número final **0948** no navegador. A ferramenta do Meta não tem esse campo:
  depois de criar o anúncio, o Patrik (ou quem estiver no Gerenciador) liga em Anúncio →
  Destino → Destinos personalizados → Editar → aba "Complementos do navegador" → ativar →
  WhatsApp → número final 0948. Avisar na mensagem final quais anúncios novos precisam disso.
- Sem antes e depois (regra do Meta). Subir só criativos aprovados no painel.
- Conjunto com post que já vendeu: usar o próprio post (mantém curtidas e comentários) e
  dar nome curto ao anúncio (`POST 3 PILARES · 7896`), nunca só o número do post.

### 3.3 Verificação de pixel e UTMs (08/10/2026)

Painel: https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN (seção "Verificação de pixel e UTMs").

| Onde | Pixel da LP (o da campanha) | Pixel oficial |
|---|---|---|
| Quiz (www.laurarosapersonal.com, via GTM-KFQ56MZ7) | **parou em 06/10 ~13h** (disparava no endereço sem www) | dispara desde 06/10 |
| Checkout Greenn, oferta QN7gci | configurado: visita, checkout, carrinho e Compra no pagamento, com API de conversões | fraco: só via GTM; 2 compras em 7 dias |
| Campanha 08/10 | otimiza aqui ("Compra Realizada") | – |

- **UTMs ok**: 100% das sessões do Meta chegam com `utm_source=FB`, id do conjunto, nome do
  anúncio e posicionamento. O link do quiz cai na QN7gci levando as UTMs e o webhook grava
  conjunto e xcod.
- **GTM (só o Patrik tem acesso)**: tagmanager.google.com → GTM-KFQ56MZ7 → Tags → tag do pixel
  28090278990632923 → Acionamento. Provável: "Page Hostname igual a laurarosapersonal.com".
  Trocar por "Page Hostname **contém** laurarosapersonal.com" (ou All Pages); despausar se
  estiver pausada → Visualizar com o www → Enviar → Publicar. Conferir depois no Gerenciador de
  Eventos (`ads_get_dataset_stats` do pixel com `aggregation=host`: tem que aparecer
  `www.laurarosapersonal.com`).
- **fbclid não vai para o checkout**: o quiz manda para a Greenn só `utm_source`, `utm_term` e
  `utm_content` (`checkoutHrefFor` em `app/efeito-lipo-quiz/_data.ts`). Sem o `fbclid` na URL,
  o pixel da LP na Greenn não cria o cookie de clique (`_fbc`) e a "Compra Realizada" só se liga
  ao anúncio por e-mail/telefone. Proposta de passar o `fbclid` aguardando o Patrik (regra D).
- O token da API de conversões do pixel da LP aparece no código da página da Greenn (é como a
  Greenn funciona). Se surgirem compras estranhas no pixel, gerar token novo e trocar na Greenn.
- "Compra Realizada" pode somar outros produtos Greenn no mesmo pixel (Comunidade). Para custo
  real por venda do quiz, sempre cruzar com as vendas da QN7gci.

---

## 4. Diário

- **08/10/2026 (9), noite**: Regras novas do Patrik para todo anúncio (seção 3.2): anunciante
  CORPO FELIZ LTDA, UTMs na ordem exata, complemento do WhatsApp final 0948 e localização sem
  as opções antigas. Corrigida a localização (erro #1870194) dos conjuntos FEED, STORIES E REELS,
  E-F-G, POST VENCEDOR (`· PIXEL LP`) e RMKT, e gravado CORPO FELIZ LTDA nos 7 conjuntos ativos.
  O Meta pausou os conjuntos na edição; todos reativados (o "STORIES E REELS · ... — Cópia",
  120252039206240200, com ok do Patrik às 21h). UTMs conferidas no
  Supabase: H e I chegam com campanha, posicionamento, anúncio e conjunto preenchidos.
- **08/10/2026 (3), 09h30**: Conferido o estado (só leitura). Meta: 4 conjuntos `· PIXEL LP`
  ativos (FEED, STORIES E REELS, E-F-G, POST VENCEDOR; R$ 20 cada), **R$ 0 gastos até 09h30**;
  "B CICLO · FEED" ainda em análise; os conjuntos antigos com o pixel oficial pausados. Quiz
  hoje: só 3 sessões reais (conjunto ABERTO da 03/10, madrugada; 1 chegou ao resultado) e 27
  cliques "Facebook_Right_Column" da revisão do Meta. Vendas QN7gci hoje: 0. **Pixel da LP
  continua sem eventos de laurarosapersonal.com desde 06/10 ~13h** (nem com www): GTM ainda não
  corrigido. Achado novo: o `fbclid` não é repassado ao checkout (seção 3.3), proposta aguardando
  o Patrik. Seções 3.2 e 3.3 atualizadas com o que estava só no painel (pixel LP, sem Audience
  Network). Próximo: ler os conjuntos em 10/10 (~R$ 40 cada).
- **08/10/2026 (2)**: Patrik ajustou a campanha nova no Power Editor (pixel oficial + Compra,
  conjuntos recriados, stories com Advantage+ posicionamentos) e ativou. A pedido dele:
  orçamento passou de R$ 60 na campanha para **R$ 20 por conjunto**; criado o conjunto
  `E-F-G · MULHERES 25-55 · IG + FB` (120252039299230200, R$ 20, mesmo padrão do conjunto de stories)
  com 6 anúncios (E, F, G em feed e stories); tudo ativado. Total: 3 conjuntos × R$ 20 = R$ 60/dia.
  Padrão registrado na seção 3.2.

- **08/10/2026**: Com aprovação do Patrik, **tirados Audience Network e coluna direita** do
  conjunto ABERTO 120251969455150200 (campanha 03/10 → quiz). Ficaram: Facebook (feed, stories,
  reels, marketplace, vídeo in-stream, busca, perfil, notificações), Instagram (todos), WhatsApp
  Status e Threads. Público, idade (18–65, BR), Advantage+ e orçamento iguais. O Meta pausou o
  conjunto ao salvar; foi reativado em seguida (ACTIVE). Conferir em 09/10 se as sessões do quiz
  pararam de vir com `utm_medium=an` e se a taxa de "passou da T1" subiu.
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
