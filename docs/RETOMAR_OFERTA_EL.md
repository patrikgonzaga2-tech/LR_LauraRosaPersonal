# Retomar a OFERTA EFEITO LIPO (no-brainer) numa conversa nova

Cole o bloco abaixo como primeira mensagem de uma sessão nova do Claude Code (mesmo ambiente,
repositório LR_LauraRosaPersonal, branch `claude/relaxed-cray-r4bnc9`).

```
Vamos continuar a NOVA OFERTA do quiz "De Volta ao Eixo" (Efeito Lipo como produto de entrada
no-brainer + assinatura da Comunidade). Responda SEMPRE em português do Brasil, curto e claro.

1. Branch claude/relaxed-cray-r4bnc9 (git fetch origin claude/relaxed-cray-r4bnc9 && git checkout
   claude/relaxed-cray-r4bnc9 && git pull). Outra sessão também faz push nela: sempre pull antes.
2. Leia: CLAUDE.md, docs/RETOMAR_OFERTA_EL.md (este arquivo, estado atual e fila), docs/QUIZ_REVISAO.md
   (seções 2 e 5), docs/CONTEXTO_COMERCIAL.md e docs/ANALISE_CAMPANHAS_QUIZ.md.
3. Monte o esboço: bash tools/quiz-revisao/esbocos/montar.sh (abre em esbocos/out/quiz.html?step=25&oferta=A).
4. Me diga em até 5 linhas onde paramos e qual é o PRÓXIMO item da fila, e já me peça o que precisa dele.

Como trabalhamos: UM item por vez. Para cada item: esboço com imagem antes × depois e motivo da troca,
perguntas em formato "questão de vestibular" (opções clicáveis, recomendada primeiro), e você me pede
links/arquivos 1 a 1. Só passa para o próximo item quando eu fechar o atual.
Sempre se questione e lembre da meta: R$ 10 mil de lucro em outubro (low ticket + Comunidade).

Regras: preço, oferta, checkout, upsell, garantia e links de pagamento só mudam com meu ok explícito
(CLAUDE.md). Nada vai ao ar sem eu dizer "publicar"; nada de push na main nem deploy sem eu pedir.
Supabase fjlbvoephhextnxemygf: só leitura. UMCLIQUE: só leitura. Meta: nada muda sem aprovação.
Apagar artefato: só com minha confirmação, um por um.
```

## A ideia (decidida pelo Patrik em 09/10)

- **Efeito Lipo 21D = produto de entrada "no-brainer"**: compra por impulso, R$ 37–47, "resolve de imediato".
  "No-brainer" (ele escreve "no braning") = oferta tão óbvia que seria bobagem não comprar.
- **Assinatura da Comunidade = âncora** "dá para entrar com valor menor por mês" (R$ 27–37/mês).
- O papel do EL na meta: pagar o anúncio e **levar a compradora para a assinatura** (T26 + upsell pós-compra).
  Outubro até 09/10: low ticket R$ 277 líquido × Comunidade R$ 6.349; Meta R$ 425; outros custos R$ 6.300.
- Promessa central (aprovada): **"Em 7 dias você sente o corpo menos inchado — e quando o resultado aparece
  rápido, você não larga na sexta."** Garantia amarrada à promessa (aprovada): "se em 7 dias você não sentir
  o corpo menos inchado, devolvemos seus R$ X". Sem quilos (protege Meta e reembolso).
- Maior medo no quiz: "gastar e não ter resultado" (10 de 22) → a garantia de 7 dias responde a ele.

## Decisões já tomadas (09/10)

| Tema | Decisão |
|---|---|
| Teste de preço na T26 | **5 ofertas ao mesmo tempo**: A EL 37 + assin. 37/mês · B EL 47 + assin. 37/mês · C EL 37 + assin. 27/mês · D EL 37 + trimestral R$ 97 (O8j7nc, já existe) · E só assinatura R$ 37/mês. ~8 visitas/dia por oferta → 6–8 semanas; cortar cedo a claramente pior. Métrica: **receita por visita na T26** (inclui 1ª mensalidade). |
| Popup de saída da Greenn | Cupom 20% (EFEITOLIPO20) aparece como popup quando a cliente tenta sair do checkout (tema da Greenn) → por isso vendas a R$ 29,60. **Manter 20% em todas as ofertas novas.** |
| T26 | **Aprovada (esboço revisado)**: EL em destaque no topo, "R$ 37 uma vez só · sem mensalidade · R$ 1,76 por dia", garantia colada no botão, link "Prefere com a Laura do lado? Assinatura a partir de R$ X/mês ↓", bloco "Por que começar pelo efeito rápido", semanas pelo que ela sente, cartão verde da Comunidade (R$ 97/mês riscado), FAQ curto. Sem a âncora R$ 4.535. |
| T25 | Aprovada ("gostei das T25"): marcos sem quilos, quadro "O que mais ajuda o seu perfil", botão "Ver como começar". |
| T1 | Teste A/B: atual (recomeço) × B "efeito imediato / sinta na 1ª semana". **Esboço ainda não feito.** |
| Página de vendas MAXXIMA | No site, em Next.js (substitui a /efeito-lipo antiga). Estrutura em `tools/quiz-revisao/esbocos/maxxima-estrutura.txt` (15 blocos). Imagens: usar o que já existe + Drive "Corpo Feliz". Teste quiz × página. |
| Upsell pós-compra | Reaproveitar **/acompanhamento-up** (já tem 1 clique da Greenn, `upsell_views`, aba Upsell do dashboard). **Testar 2 ofertas**: assinatura R$ 37/mês (upsell novo) × trimestral R$ 97 (upsell 6152). Patrik configura a Greenn com passo a passo. |
| Painel único | Tudo num painel só (FkDqzBBekcELvdVp4EWgEN): Hoje/meta, Vendas, Meta Ads, Leads, Links, Referência, Criativos, Chat, Ideias, Ajuste do quiz, **Testes A/B**. **Migrar o Painel de Leads** (8Ys79EhBMSiRkDqm3n6QbG): mudar a rotina 23:59 (trig_01RbMXryDXAy1eLzpCmAtuj6) para escrever no painel novo e, após 2 noites ok, apagar o antigo. **Apagar todos os antigos** (confirmando 1 a 1): Ajuste do Quiz 1CpgLoG6JcvucRM21TPfiQ, Revisão FmQj4sLw6aAM6oifASt1qK, Quiz Telas 768H14r7dhDznP3LeZLZFx, Quiz Efeito Lipo 21 N8Mm5s4D65sZJcy5bzDBu1, Roteiros Br7unX3TmXKevyrEoZD1EY, Desafio 7D 45Bam4SZbAhr2L9gf6kXhg / EQWEKVakN8DMmBgCp9pbAf / J56RSR2jXzvFqbAoLSZgwa / 3o4NwprVbjb1F3DWBjSMfh. |

## Achados da base (09/10)

- **/acompanhamento-up**: julho 1.264 visitas pelo redirect da Greenn → 10 trimestrais (~0,8%). Desde **12/08**
  ninguém chega pelo redirect (a Greenn parou de mandar; Patrik diz que hoje não há página de obrigado).
  **Falha:** a página não tem "não, obrigada" → quem recusava nunca ia para o grupo. Na nova: link
  "Não, quero só o Efeito Lipo → entrar no grupo" para `/obg-gp-efeito-lipo`.
- Upsell 1 clique: botão `data-greenn-upsell="<id>"` + script `upsell.js` da Greenn, só com `?token=` na URL
  (vem do redirect pós-compra). Sem token → link normal para o checkout com `up_canal`/`up_msg`.
- Ofertas existentes: EL QN7gci (R$ 37, via `/redirect/297430`), Comunidade mensal O6NiB7 R$ 97,
  trimestral O8j7nc R$ 97 (upsell 6152), anual M3DUOL R$ 297 (12x R$ 24,75).
- **Conferir no item da T26:** a lista do cartão do EL no esboço (Roteiro 3 fases, 21 Treinos Hormonais,
  Módulo Comece por Aqui, bônus Ciclo + Anti-Pelanquinha) não cita Guia "Sem Neura", Áudios e Planner, que o
  diário de 09/10 (1) diz que existem. Perguntar ao Patrik a lista final antes de ir ao ar.

## Esboços salvos (nada disso está no ar)

- `tools/quiz-revisao/esbocos/t25-t26-efeito-lipo.patch`: diff de T25 + T26 nova (`_data.ts` e `_quiz.tsx`)
  sobre o quiz atual (v7). `montar.sh` aplica numa cópia e gera `esbocos/out/` (fora do git).
  A oferta do esboço vem de `?oferta=A..E`; no ar, o braço será sorteado e gravado na sessão.
- `t26-sales-efeito-lipo.tsx.txt`: só o componente `Sales` novo (extensão .txt para não entrar no build).
- `img/`: `cmp3-T26-topo.jpg` (antes × A × E), `cmp3-T26-ofertas.jpg` (B, C, D), `cmp4-T26-revisao.jpg`
  (esboço 1 × revisado), `comp-T25-1.jpg` (T25 antes × depois).

## Fila (um item por vez) — status em 09/10, fim da tarde

1. **Greenn, oferta 1** `Efeito Lipo 21D — Quiz R$ 47` (mesmo produto da QN7gci, R$ 47 até 12x, mesmo order
   bump, mesmo tema com popup 20%, mesmo webhook) → **aguardando o link do Patrik.**
2. Greenn, oferta 2 `Comunidade — Assinatura R$ 37/mês` (recorrente mensal, só cartão, popup 20%) + **upsell
   1 clique** dela → link + número do upsell.
3. Greenn, oferta 3 `Comunidade — Assinatura R$ 27/mês`.
4. **T1 B** "efeito imediato": esboço antes × depois (próximo item de produção).
5. Telas do meio que quebram o efeito (T3, T15/T16/T24): esboço.
6. Nova **/acompanhamento-up** (assinatura 37/mês × trimestral, botão de recusar → grupo): esboço.
7. Passo a passo do redirect pós-compra na Greenn (EL → /acompanhamento-up; upsell → /obg-gp-efeito-lipo),
   só depois da página aprovada.
8. Infra de teste no quiz: sorteio da oferta (A–E) e da T1 (A/B) gravados em `quiz_sessions` reaproveitando
   `intro_ab` / `checkout_ab` / `variante` (não dá para mudar o schema) via `/api/quiz`; links por braço.
9. Aba **Testes A/B** no painel (braços, visitas, % passou da T1, clicou comprar, vendas, receita por visita).
10. Painel único: migração do Leads + rotina 23:59, dashboards do site (`/painel`,
    `/efeito-lipo-quiz/dashboard`, `/paineloficialcorpofeliz` = consulta dos links: trazer e tirar do ar?),
    o que é a aba "Ideia", apagar os antigos 1 a 1.
11. Página de vendas MAXXIMA em Next.js.
12. Publicar (só com "publicar"): PR para a main com T25+T26+testes; Patrik testa no celular.

Pendentes do Patrik fora da fila: corrigir o GTM do pixel da LP (avisa com "GTM feito"); reavaliação de
11/10 (T1 v6/v7, criativo H, remarketing).
