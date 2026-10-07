# Quiz Efeito Lipo — revisão e alterações

Página pública: https://www.laurarosapersonal.com/efeito-lipo-quiz
Página de revisão (quiz funcionando + textos editáveis + fila de pedidos):
**https://claude.ai/artifact/1CpgLoG6JcvucRM21TPfiQ** (privada do Patrik; compartilhar pelo menu Share)

---

## 1. Prompt para começar uma sessão nova

Copie e cole isto no começo de qualquer sessão nova do Claude Code:

```
Vamos continuar o trabalho no quiz Efeito Lipo (laurarosapersonal.com/efeito-lipo-quiz).

1. Leia o CLAUDE.md e o docs/QUIZ_REVISAO.md. Se o doc não estiver na main, rode
   `git fetch origin` e leia de outra branch: `git log --all --oneline -- docs/QUIZ_REVISAO.md`
   mostra onde ele está.
2. Pelo "Diário" no fim do doc, me diga em até 5 linhas onde paramos e o que ficou pendente.
3. Veja no git o que mudou em app/efeito-lipo-quiz/ desde a última entrada do Diário
   (commit e autor de cada mudança).
4. Leia a fila de pedidos da página de revisão
   (https://claude.ai/artifact/1CpgLoG6JcvucRM21TPfiQ, coleção "pedidos") e me liste os
   que estão com status "pendente", agrupados por tela.

Não altere nada ainda. Espere eu dizer o que fazer.
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
4. Roda `bash tools/quiz-revisao/build.sh` e republica a página de revisão **no mesmo link**.
5. Você confere no celular da esquerda.
6. Com o seu ok: commit + push na branch e Pull Request para a `main`.
7. Depois do merge na `main` o site é atualizado. Confira o link público.
8. O Claude marca os pedidos como `aplicado` na fila e escreve uma linha no Diário (seção 5).

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

- `bash tools/quiz-revisao/build.sh`: monta `tools/quiz-revisao/out/` a partir do código atual
  do quiz (instala as dependências na primeira vez). O cabeçalho da página mostra a branch e o
  commit usados.
- `cd tools/quiz-revisao && node check.mjs 0,3,25`: tira print das telas para conferir.
- Republicar no mesmo link: Artifact publish com `url` = link acima,
  `file_path` = `tools/quiz-revisao/out/index.html`, `root` = `tools/quiz-revisao/out`,
  `files` = conteúdo de `out/files.json` (as imagens só precisam ir quando mudarem).
  Não passe `capabilities`: a página já tem `db` + `user` e isso se mantém.
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

- **07/10/2026 (3)**: **T26 atualizada** conforme a página de vendas: 7 entregáveis (novos: Áudios
  "Quebra de Sabotagem" e Planner de Progresso; treino virou "21 Treinos Hormonais"; guia virou "Sem
  Neura"), bônus "Guia do Ciclo Menstrual" (R$ 297) e "Anti-Pelanquinha" (R$ 497), quadro de valores
  com 7 itens somando R$ 4.535, parcelamento "12x de R$ 3,80" e logo do topo "DE VOLTA AO EIXO".
  Conferido no checkout Greenn (oferta QN7gci): até 12x, juros de 3,39% a.m. → 12x R$ 3,80 sobre R$ 37.
  Vendas desde 28/09 a R$ 29,60 = cupom EFEITOLIPO20 (preço cheio segue R$ 37).
  **Pendente:** a T26 promete "Garantia de 21 dias", mas a oferta na Greenn está com garantia de 7 dias.
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
