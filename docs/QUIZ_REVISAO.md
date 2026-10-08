# Quiz Efeito Lipo — revisão e alterações

Página pública: https://www.laurarosapersonal.com/efeito-lipo-quiz
Revisão do quiz (como está, versões, comparar, marca, editar textos + fila de pedidos): **dentro do Painel de
anúncios**, grupo "Ajuste do quiz" do menu — **https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN**.
Desde 08/10/2026 (noite) o antigo https://claude.ai/artifact/1CpgLoG6JcvucRM21TPfiQ só mostra um aviso apontando
para o painel; não publique mais nada nele. Fila de pedidos (`pedidos`), decisões (`aprovacoes`) e números
(`metricas`) ficam no banco do painel. Fonte da página: `tools/painel-anuncios/index.html` (as telas do quiz,
`window.SCREENS`, e os dados de versões, `DATA.versoes`, estão dentro dela).

---

## 1. Prompt para começar uma sessão nova

Copie e cole isto no começo de qualquer sessão nova do Claude Code:

```
Responda sempre em português. Vamos continuar o trabalho do quiz "De Volta ao Eixo" da
Laura Rosa (https://www.laurarosapersonal.com/efeito-lipo-quiz) de onde paramos.

LEIA ANTES DE QUALQUER COISA (todos na main):
1. CLAUDE.md — regras: preço, checkout, oferta, garantia e links de compra só mudam com
   aprovação do Patrik; nada de push na main nem deploy sem ele pedir; UMCLIQUE só leitura.
2. docs/QUIZ_REVISAO.md — guia do quiz: passo a passo de alteração, mapa dos arquivos,
   como o painel "Ajuste do Quiz" é montado e o DIÁRIO (o que foi feito, dia e hora).
3. docs/ANALISE_CAMPANHAS_QUIZ.md — anúncios × quiz × vendas e o comando
   "status das campanhas de hoje".
4. docs/PAINEL_ANUNCIOS.md — painel de anúncios do Meta (rotina das 7h, propostas, aprovações).
5. docs/CONTEXTO_COMERCIAL.md e docs/PLAYBOOK-RASTREAMENTO-E-DASHBOARD.md — CRM, rotinas,
   bancos e como venda ↔ anúncio se ligam (utm_term = id do CONJUNTO).

ONDE ESTAMOS (08/10/2026, 17h40):
- Quiz no ar = v6 (desde 08/10 16h23): T1 "Você começa toda segunda e na sexta já saiu do
  plano?", botão "Quero descobrir meu perfil" no topo, foto da Laura; copy "Volta ao Eixo" no
  quiz inteiro; T25 com perfil de recomeço; T26 "roteiro de 21 dias", 5 entregáveis + 2 bônus,
  quadro R$ 4.535 → R$ 37 ou 12x de R$ 3,80, garantia de 7 dias, logo "DE VOLTA AO EIXO".
- Patrik decidiu MANTER a v6 e reavaliar em 11/10 com ~30 visitas reais (feed/stories).
- Melhor versão medida: v4 (08/10 08h10–16h02): 42% das visitas reais passaram da T1
  (meta 32%) e 1 venda. Última venda aprovada pelo quiz: 08/10 11h40, v4, R$ 29,60 Pix
  (cupom EFEITOLIPO20). Às 17h22 (v6) entrou uma compra aguardando pagamento (R$ 29,60 + bump R$ 37).
- Cuidado com os números: cliques da "coluna da direita" do Facebook (revisão do Meta),
  "Others", prévias {{placement}} e Audience Network NÃO são visitas reais.
- Checkout dos 3 botões da T26: https://payfast.greenn.com.br/redirect/297430?utm_source=efeito-lipo-quiz
  (oferta QN7gci). A Hotmart ainda é checkout de reserva em casos raros (decisão pendente).
- Pendências: escolher a estratégia de marca no painel (recomendação A: "De Volta ao Eixo" na
  frente, "Efeito Lipo" só como nome do método); 17 lugares ainda dizem "Efeito Lipo";
  tirar a coluna da direita da campanha "08/10 · QUIZ VOLTA AO EIXO · CRIATIVOS A-D".

AJUSTE DO QUIZ = grupo "Ajuste do quiz" do PAINEL DE ANÚNCIOS
(https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN). A página antiga 1CpgLoG6JcvucRM21TPfiQ só tem
um aviso apontando para lá: não publique mais nada nela.
- Telas: Como está o quiz (números da versão no ar, gráfico por versão, botão "Atualizar números
  agora", cartão "Última venda pelo quiz" com o caminho completo da cliente), Versões (um cartão
  por versão com data, hora, o que mudou, motivo, sugestão e decisão), Comparar versões, Marca e
  Editar textos (fila de pedidos). Junto com o resto do painel de anúncios (Meta, Otimizar,
  Clicou e não comprou, Criativos…).
- Fonte: tools/painel-anuncios/index.html (versões em DATA.versoes, telas em window.SCREENS).
  As cópias do quiz de cada versão (v/<id>/quiz.*) saem de `bash tools/quiz-revisao/build.sh`.
  Sempre ler a versão publicada antes de republicar: outras sessões também mexem no painel.
  Decisões na coleção "aprovacoes", pedidos em "pedidos", números em "metricas".
- REGRA: toda mudança do quiz que for ao ar ganha uma versão nova em DATA.versoes (data e hora de
  Brasília, commit do merge, PR, o que mudou, motivo e sugestão).

PRIMEIRO, SEM ALTERAR NADA:
1. Pelo Diário de docs/QUIZ_REVISAO.md e docs/ANALISE_CAMPANHAS_QUIZ.md, me diga em até 6 linhas
   onde paramos e o que está pendente.
2. Veja no git o que mudou em app/efeito-lipo-quiz/ e no painel desde a última entrada do Diário.
3. Leia no Painel de anúncios as coleções "aprovacoes" e "pedidos" e me diga o que eu decidi ou
   pedi e ainda não foi aplicado.
4. Rode o "status das campanhas de hoje".
Depois espere eu dizer o que fazer.
```

---

## 2. Passo a passo para alterar o quiz

### A. Mudar um texto (pergunta, subtítulo, opção, bônus, marcos do resultado…)
1. Abra a página de revisão.
2. Escolha a tela no seletor (ou pelas setas). O celular da esquerda mostra a tela como está no ar.
3. Na direita, edite o texto no próprio campo. O que mudou fica laranja e mostra o original.
4. Clique em **Salvar pedidos**. O pedido vai para a "Fila de pedidos" no fim da página.
5. No chat, peça: **"aplica a fila do quiz"**.

### B. Mudar outra coisa (foto, layout, botão, cor, ordem das telas, nova pergunta, lógica)
1. Na página de revisão, abra a tela e escreva no **Pedido livre para esta tela**, depois
   **Salvar pedidos**. Ou descreva direto no chat, sempre dizendo o número da tela (T1 a T26).
2. Para coisas fora das telas (rastreio, pixel, título no Google): peça direto no chat.

### C. O que o Claude faz com o pedido (sempre nesta ordem)
1. Lê o pedido e mostra **antes → depois** (arquivo e trecho).
2. Espera o "pode fazer".
3. Edita o código numa branch `claude/...`.
4. Roda `bash tools/quiz-revisao/build.sh` (cópias do quiz) e atualiza o grupo "Ajuste do quiz" do
   Painel de anúncios (`tools/painel-anuncios/index.html`), lendo a versão publicada antes.
5. Você confere no celular da esquerda.
6. Com o seu ok: commit + push na branch e Pull Request para a `main`.
7. Depois do merge na `main` o site é atualizado. Confira o link público.
8. O Claude marca os pedidos como `aplicado` na fila e escreve uma linha no Diário (seção 5).
9. **Toda versão nova ganha um cartão no painel:** acrescentar no fim de `DATA.versoes` (Painel de
   anúncios) e de `tools/quiz-revisao/versoes.json`
   a versão com data e hora em que foi ao ar (horário de Brasília), commit do merge, PR, o que mudou,
   motivo e sugestão, e rodar o build. Atualizar também a sugestão da versão anterior, se mudou.

### D. Regra de pagamento (CLAUDE.md)
Preço, parcelamento, texto de oferta, order bump, upsell e links de checkout (Greenn/Hotmart):
o Claude **só mostra** o antes/depois e espera aprovação explícita do Patrik. Não faz push nem
deploy sem o Patrik pedir.

---

## 3. Onde fica cada coisa no código

| O quê | Arquivo |
|---|---|
| Textos das perguntas e opções, ordem das telas, barra de progresso | `app/efeito-lipo-quiz/_data.ts` → `STEPS` |
| Texto da Laura (T3), insight (T15), marcos do resultado (T25), antes/depois, entregáveis e bônus (T26) | `_data.ts` → `LAURA_PARAGRAFOS`, `INSIGHT`, `RESULT_MARCOS`, `SALES` |
| Fotos usadas e a pasta delas | `_data.ts` → `IMG` / `AVATARS`; arquivos em `public/images/` |
| Links de checkout, teste A/B Hotmart × Greenn | `_data.ts` → `CHECKOUT_HREF`, `CHECKOUT_HREF_GREENN`, `CHECKOUT_AB` (**regra D**) |
| Tela de abertura (T1), layout das telas especiais, preço "R$ 37" e "6x de R$ 6,92", cronômetro | `app/efeito-lipo-quiz/_quiz.tsx` (**preço = regra D**) |
| Botões, cards, avatares, barra de progresso (visual) | `app/efeito-lipo-quiz/_ui.tsx` |
| Gravação das respostas no Supabase (`/api/quiz`) | `app/efeito-lipo-quiz/_track.ts` |
| Título/descrição no Google e WhatsApp, contagem de visualização | `app/efeito-lipo-quiz/page.tsx` |
| Cores e fontes do site | `app/globals.css` |

As chaves da fila de pedidos apontam para o lugar no `_data.ts`:
`<id da tela>.headline` / `.sub` / `.title` / `.body` / `.ticks.N` / `.opt.<id da opção>.label|sub`,
`laura.pN`, `insight.*`, `result.Dia NN`, `sales.antes|depois|entrega|bonus|stack.N`,
`livre.<id da tela>` (pedido livre).

---

## 4. Para o Claude: como a página de revisão é montada

Pasta `tools/quiz-revisao/`: tem dependências próprias e não entra no build do site.

- Abas do painel: **Como estamos** (números da versão no ar × melhor versão anterior, gráfico de quem passa
  da T1 por versão, botão "Atualizar números agora", que consulta o Supabase com o conector do Patrik),
  **Versões** (um cartão por versão, com decisão salva em `aprovacoes/ver-<id>`), **Comparar** (duas
  versões quaisquer lado a lado, montadas do commit de cada uma), **Marca** (onde ainda aparece "Efeito
  Lipo", com `marca.json`; "Pedir troca" manda para a fila) e **Editar textos** (fila `pedidos`).
  Cores iguais às do Painel Volta ao Eixo (tema claro único).
- "Visitas reais" = sessões vindas do Meta sem coluna da direita (revisão do Meta), "Others", prévias
  `{{placement}}` e Audience Network. A última foto dos números fica em `metricas/ultima`.
- `bash tools/quiz-revisao/build.sh`: monta `tools/quiz-revisao/out/` a partir do código atual
  do quiz (instala as dependências na primeira vez). O cabeçalho da página mostra a branch e o
  commit usados.
- `cd tools/quiz-revisao && node check.mjs 0,3,25`: tira print das telas para conferir.
- Republicar no mesmo link: Artifact publish com `url` = link acima,
  `file_path` = `tools/quiz-revisao/out/index.html`, `root` = `tools/quiz-revisao/out`,
  `files` = conteúdo de `out/files.json` (as imagens só precisam ir quando mudarem).
  Não passe `capabilities`: a página já tem `db` + `user` + `mcp` (Supabase `execute_sql`) e isso se mantém.
- Fila: `ArtifactData list` na coleção `pedidos`. Cada doc tem `key`, `tela`, `campo`,
  `original`, `proposto`, `status` (`pendente` → `aplicado`). Depois de aplicar, use
  `update` com `{status: "aplicado"}` (passe o `if_version` lido).
- O que é diferente do site de verdade: as respostas não vão para o Supabase, não há GTM/pixel
  e o botão de compra mostra o link do checkout em vez de abrir. `?step=N` abre direto na tela N
  (começa em 0).
- O domínio laurarosapersonal.com está bloqueado na rede do ambiente de nuvem. Para comparar
  com o que está no ar, libere o domínio no acesso de rede do ambiente.

---

## 5. Diário

Uma linha por sessão: data, o que foi feito e o que ficou pendente. Mais recente em cima.

- **08/10/2026 (9), 18h32**: **v7 no ar** (PR #14, merge `dfbfcd4`): marca opção A, 17 trocas aprovadas pelo Patrik. "Efeito Lipo"/"Protocolo Efeito Lipo" viram "De Volta ao Eixo"/"roteiro De Volta ao Eixo" em T3, T6, T9, T13, T15, T16, T17, T20, T24, T25; na T26 o título "Antes e depois de voltar ao eixo", o entregável 1, a 1ª linha do quadro, a linha do botão final e o rodapé; título/descrição do Google e WhatsApp sem "até 8kg". "Efeito Lipo" ficou só como nome do método (T3 e entregável 1). Preço, valores e links iguais. Painel: cartão v7 em `DATA.versoes` + `v/v7/quiz.*`, aba Marca zerada (decisão em `aprovacoes/marca-estrategia`). Também decidido: não chamar a cliente do Pix pendente das 17h22; manter ligados os 2 conjuntos com o pixel oficial (venderam hoje). **Pendente:** T25 ainda fala "até 8kg" nos marcos e os botões dizem "protocolo"; na conta de 11/10 separar v6 (16h23–18h32) e v7.
- **08/10/2026 (8), 17h45**: a página "Ajuste do Quiz" foi juntada ao Painel de anúncios (grupo "Ajuste do quiz": Como está o quiz, Versões, Comparar versões, Marca, Editar textos, com a "Última venda pelo quiz"). Arquivos do quiz (quiz.html/js/css, images/, v/v0…v6/) copiados para o painel; v/vN/quiz.html usa `<base href="../../">` para as fotos carregarem. Decisões migradas. Para nova versão: acrescente em `DATA.versoes` no `tools/painel-anuncios/index.html`, publique `v/<id>/quiz.*` e republique o painel.
- **08/10/2026 (7), 17h40**: Painel ganhou o cartão **"Última venda pelo quiz"** (aba Como estamos): mostra a
  versão que vendeu por último e, ao clicar, o quiz inteiro que a cliente fez (resposta de cada tela, tempo
  por tela, % da versão que chegou a cada tela e % que respondeu igual) + linha do tempo até o pagamento.
  Liga venda ↔ sessão por `vendas.tracking_xcod = quiz_sessions.xcod` (sessão com checkout mais perto
  da venda e mesmo conjunto). Foto em `metricas/ultima_venda`. Última aprovada: **08/10 11h40, v4**,
  R$ 29,60 Pix, anúncio "A SEGUNDA-SEXTA · FEED"; a cliente já tinha feito o quiz 2x em agosto.
  Às 17h22 (v6) entrou uma compra **aguardando pagamento** (R$ 29,60 + bump R$ 37). Corrigido o erro do
  botão "Atualizar números" (a resposta do Supabase cita a tag de dados antes dos dados).
- **08/10/2026 (6), 17h15**: Patrik decidiu **manter a v6** (botão no topo + foto da Laura) e reavaliar em
  11/10. O painel virou **Ajuste do Quiz**, com abas, cores do Painel Volta ao Eixo, 7 versões (v0 original
  → v6) com data, hora, motivo, sugestão e números, comparador A/B, seção de Marca (17 lugares com "Efeito
  Lipo", 3 opções de estratégia, recomendação A) e números ao vivo pelo Supabase. Saiu o bloco "antes × agora".
- **08/10/2026 (5)**: Painel de revisão ganhou o bloco **"T1 antes × agora"** (dois celulares lado a lado,
  versão anterior = `be87247`, atual = `73c16ae`) com motivo, dados e botões de decisão (coleção
  `aprovacoes`, doc `t1-botao-foto`). Saiu o bloco "Para aprovar" (os 2 itens já aprovados e aplicados).
  **Achado:** a conta que motivou subir o botão (57 visitas, 84% parando na T1) incluía 27 cliques da
  **coluna da direita do Facebook** (revisão do Meta) e 6 "Others". Só com feed/stories, a T1 anterior
  passava **42%** (10 de 24), acima da régua de 32%. Depois da mudança: 5 visitas (2 coluna direita,
  1 prévia `{{placement}}`, 2 reais), 0 passaram. Pouco dado: decidir em 11/10 com ~30 visitas reais e
  tirar a coluna da direita também da campanha "08/10 · QUIZ VOLTA AO EIXO · CRIATIVOS A-D".
  Para refazer uma comparação: `COMPARAR=<commit> bash tools/quiz-revisao/build.sh` (texto em `comparar.html`).
- **08/10/2026 (4)**: Proposta aprovada no painel de anúncios (T1): botão "Quero descobrir meu perfil" subiu para logo abaixo do título e de "Descubra o porquê em 2 minutos"; o parágrafo longo saiu; a foto de antes e depois foi trocada pela foto da Laura (menor, abaixo do botão); as 3 linhas de ✓ ficaram depois da foto. Sem mudança de preço, oferta ou checkout. PR aberto, aguardando "publicar".
- **08/10/2026 (3)**: Patrik aprovou pelos botões da página de revisão (coleção `aprovacoes`): (1) regra dos perfis da T25 confirmada, e a anotação "aguardando aprovação" saiu do `_data.ts`; (2) frase abaixo do título da T26 trocada para "Com base nas suas respostas, você vai receber um roteiro de 21 dias para voltar ao eixo — treinos em casa, sem dieta maluca, sem passar fome e sem as canetinhas caras." (igual para todas, sem citar peso nem "até 8kg"). Aba Quiz do painel passou a contar só desde 08/10 08:10 (PR #9).
- **08/10/2026 (2)**: Patrik aprovou tudo ("aprovo tudo, pode publicar"): regra dos perfis da T25, título da T15 e as 7 linhas da T26 — título "Seu roteiro de 21 dias para voltar ao eixo", faixa Semana 1 Limpeza · Semana 2 Ativação Metabólica · Semana 3 Queima Total, quadro antes/depois com 3 linhas (recomeço, deslize, treino que cabe na rotina; a linha da inflamação saiu) e botão final "Quero começar meu roteiro de 21 dias". Preço, bônus, garantia, cronômetro e links iguais. Publicado via PR para a `main`.
- **08/10/2026**: Copy "Volta ao Eixo" **na página de revisão, não publicada** (seguindo o PDF "Auditoria de copy"): T1 faixa "2 minutos · gratuito · perfil na hora" (sem contador de vagas) e botão "Quero descobrir meu perfil"; T3 título "Se você já recomeçou mais vezes do que consegue contar, não precisa se culpar por isso."; T5 "Quantas vezes você já recomeçou?" (grade, id `recomecos`); T13 "Em que dia da semana fica mais difícil manter sua rotina?" (grade, 7 opções, id `dia-dificil`); T15 ciclo da semana sem "90%"; T16/T24 só texto; T25 com perfil de recomeço + "Seu primeiro passo, hoje" + "Um roteiro de 21 dias — não uma promessa de resultado."; título no Google "Descubra seu perfil de recomeço + plano em casa". **Pendente:** aprovar a regra dos perfis (T12/T6/T20/T11, em `perfilRecomeco()` no `_data.ts`), o título da T15, a história da Laura (T3), o depoimento real (T15) e as 7 linhas da T26 (painel em https://claude.ai/artifact/FmQj4sLw6aAM6oifASt1qK). T1 e T25 têm que subir juntas.
- **07/10/2026 (4)**: Publicado (PR #4, merge `ed63cfd`): logo nova **"DE VOLTA AO EIXO"** (símbolo +
  nome em 2 linhas, `Logo` em `_ui.tsx`) no cabeçalho de todas as telas e grande no topo da T26; saíram
  "Desincha Express" e "aplicativo" dos entregáveis; **garantia de 7 dias** (igual à Greenn).
  **Ainda com "Efeito Lipo":** título da T26, rodapé, perguntas e título do Google/WhatsApp
  (`page.tsx`). Botão da T1 segue "Garantir minha vaga". Hotmart ainda é o checkout de reserva.
- **07/10/2026 (3)**: **T26 atualizada** conforme a página de vendas: 7 entregáveis (novos: Áudios
  "Quebra de Sabotagem" e Planner de Progresso; treino virou "21 Treinos Hormonais"; guia virou "Sem
  Neura"), bônus "Guia do Ciclo Menstrual" (R$ 297) e "Anti-Pelanquinha" (R$ 497), quadro de valores
  com 7 itens somando R$ 4.535, parcelamento "12x de R$ 3,80" e logo do topo "DE VOLTA AO EIXO".
  Conferido no checkout Greenn (oferta QN7gci): até 12x, juros de 3,39% a.m. → 12x R$ 3,80 sobre R$ 37.
  Vendas desde 28/09 a R$ 29,60 = cupom EFEITOLIPO20 (preço cheio segue R$ 37).
  ~~Pendente: garantia de 21 dias na T26 × 7 dias na Greenn~~ → resolvido em 07/10 (4).
- **07/10/2026 (2)**: **T1 com nova promessa no ar** (PR #2, merge `bd262bd` na `main`): "Você começa
  toda segunda e na sexta já saiu do plano?" + "Descubra o porquê em 2 minutos" + texto do "Quiz Volta
  ao Eixo" + 3 itens com ✓ abaixo da foto. Cores, foto, barra de vagas e botão iguais.
  **Pendente:** o botão continua "Garantir minha vaga", a barra continua "As vagas do desafio estão
  acabando", o título/descrição do Google/WhatsApp (`page.tsx`) e as telas seguintes ainda falam de
  "secar a barriga / até 8kg em 21 dias". O nome "Quiz Volta ao Eixo" foi mantido como o Patrik mandou.
- **07/10/2026**: Criada a página de revisão (quiz + textos editáveis + fila), montada a partir de
  `main` @ `ef4667e` (17/07, parcelamento 6x de R$ 6,92). Última mudança do `_data.ts`:
  `2844a42` (13/07, checkout Greenn via `/redirect/297430`). Fila vazia.
  **Pendente (decisão do Patrik, regra D):** o `CHECKOUT_AB` segue ligado com `greennShare: 1`
  (100% Greenn), mas se o navegador bloquear o `sessionStorage` (alguns in-app ou modo privado)
  o `pickCheckoutArm()` cai para a **Hotmart**, e o link inicial vindo do servidor também é o
  da Hotmart. Avaliar se tira a Hotmart de vez.
