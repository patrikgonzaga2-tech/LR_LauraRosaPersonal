# Retomar a OFERTA EFEITO LIPO numa conversa nova (estado em 09/10/2026, noite)

Cole o bloco abaixo como primeira mensagem de uma sessão nova do Claude Code (mesmo ambiente,
repositório LR_LauraRosaPersonal, branch `claude/relaxed-cray-r4bnc9`).

```
Vamos continuar a NOVA OFERTA do quiz "De Volta ao Eixo". Responda SEMPRE em português do Brasil, curto.

1. Branch claude/relaxed-cray-r4bnc9 (git fetch origin claude/relaxed-cray-r4bnc9 && git checkout
   claude/relaxed-cray-r4bnc9 && git pull). Outra sessão também faz push nela: sempre pull antes.
2. Leia: CLAUDE.md, docs/RETOMAR_OFERTA_EL.md (estado, decisões e fila) e docs/TESTE_A_OFERTAS.md.
3. Me diga em até 5 linhas onde paramos e já comece o ITEM 4 (teste C: assinatura mensal R$ 37 × R$ 27):
   me peça o link da assinatura de R$ 27 na Greenn.

Como trabalhamos, item a item: você mostra o item, manda o esboço (imagem antes × depois enviada aqui no
chat), eu aprovo, você pede os links 1 a 1, deixa pronto, coloca no painel (aba Testes, mesmo padrão do
T1/T2/T3) e me avisa; eu digo "publicar"; você publica, confere o deploy na Vercel e no ar, e seguimos.
Perguntas em formato de múltipla escolha, recomendada primeiro. Meta: R$ 10 mil de lucro em outubro.

Regras: preço, oferta, checkout, upsell, garantia e links de pagamento só mudam com meu ok explícito
(CLAUDE.md). Nada vai ao ar sem eu dizer "publicar". Supabase fjlbvoephhextnxemygf e UMCLIQUE: só leitura.
Meta Ads: nada muda sem aprovação. Apagar artefato: só com minha confirmação, um por um.
```

## No ar (09/10)

| O quê | Como | PR |
|---|---|---|
| Teste G (T1) | 50/50 em `quiz_sessions.intro_ab`: `G-A` (tela atual) × `G-B` ("Descubra seu perfil de recomeço em 2 minutos e o primeiro passo para sentir o corpo menos inchado", sem subtítulo). O braço é sorteado na hora de desenhar a T1 (`armaIntro` em `_quiz.tsx`). | #16, #17 |
| Teste B (preço do EL) | 50/50 em `sessionStorage el_oferta_ab` (`pickOfertaArm` em `_data.ts`). A = R$ 37 → `redirect/297430` (QN7gci). B = R$ 47 → `redirect/795991` (gLO7Gm, 3 bumps: Cinturinha, Receitas, Vitalício). `checkout_ab` = `greenn` (A) / `greenn-B` (B). | #18 |
| T25 + T26 novas | T26: topo igual ao modelo anterior (título "Seu roteiro de 21 dias para voltar ao eixo", 3 semanas, botão, "Antes e depois de voltar ao eixo", alunas) → cartão do EL com o preço do teste B → "Por que começar pelo efeito rápido" → semanas → cartão da Comunidade R$ 37/mês (oferta `WOqOSI`, link em `CHECKOUT_HREF_SUB`, clique grava `checkout_ab = assinatura-37`). As 3 semanas e o antes e depois NUNCA saem em nenhum braço (pedido do Patrik). T25 sem quilos + "O que mais ajuda o seu perfil". | #19 |
| Lista do cartão do EL | + Guia "Sem Neura", Áudios "Quebra de Sabotagem", Planner de Progresso (aprovado). | ver abaixo |

## Painel (https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN, versão 45)

- Aba **Números → Testes**: T1, T2, T3. Cada um mostra a chance de cada versão ser a melhor (teste de duas
  proporções), números absolutos e %, botão laranja "Recarregar números" e botões laranja para conferir A e B.
  Decide com ≥ 100 no braço menor e chance ≥ 95%. Sessões com `utm_source=qa-painel` ficam de fora.
- T1 abre as versões num celular dentro do card (`v/v8/t1-a.html`, `v/v8/t1-b.html`; o claude.ai bloqueia abrir
  arquivos do painel em aba nova). T2/T3 abrem os checkouts da Greenn.
- **Para acrescentar um teste:** um objeto em `TESTES` (`tools/painel-anuncios/index.html`) com `arms`, `base`,
  `pos`, `cols`, `sql`, `links`. O painel publicado tem a aba Vídeos (de outra sessão): sempre partir do arquivo
  do repositório (que já está igual ao publicado) e publicar o mesmo arquivo.
- Proposta da T1 B registrada em `propostas/p-2026-10-09-t1-b-recomeco`.

## Fila (próximo = item 4)

4. **Teste C (assinatura R$ 37 × R$ 27)**: Patrik cria na Greenn a assinatura R$ 27/mês (recorrente, só cartão,
   mesmo produto da WOqOSI) e manda o link. Implementar: braço de assinatura (50/50) no cartão da Comunidade,
   `checkout_ab = assinatura-27` no B, T3 do painel já espera esse valor (só trocar o status e pôr o botão B).
   Atenção: R$ 27/mês fica perto da anual (R$ 297 = R$ 24,75/mês), que é a que mais vende (~320 em 90 dias).
5. Teste D (mensal × trimestral R$ 97, O8j7nc) e Teste E (com ou sem EL).
6. Teste F: upsell pós-compra na `/acompanhamento-up` (assinatura 37/mês × trimestral 97) com botão "não,
   obrigada → grupo" (`/obg-gp-efeito-lipo`) + redirect pós-compra na Greenn.
7. Página de vendas MAXXIMA em Next.js e painel único (migração do Painel de Leads e da rotina 23:59).

## Pendências do Patrik (fora do código)

- Checkout da assinatura WOqOSI mostra "Ative o EFEITO LIPO ainda hoje" e cronômetro "Últimas vagas": trocar o
  tema/cabeçalho dessa oferta na Greenn (aprovado, mas é feito na Greenn).
- GTM do pixel da LP (avisa com "GTM feito"); reavaliação de 11/10 (T1 v6/v7, criativo H, remarketing).

## Decisões que valem para todos os testes

- Popup de 20% (EFEITOLIPO20) vale em todos os braços. Mesmos bumps nos braços.
- Garantia de 7 dias amarrada a "corpo menos inchado" (sem quilos). Promessa de prazo não vai na T1 (Meta).
- Checkout pela Vercel (projeto `efeito-lipo-21`, team `team_C3LRVi53HvIqxVuWfnyiSf4B`); conferir o deploy de
  produção (READY) e o site no ar depois de cada merge. O conector da Vercel está ligado.

## Achados úteis

- Quiz (14 dias até 09/10): 181 pageviews → 52 começaram (29%) → 28 terminaram → 20 clicaram comprar.
  O gargalo é a T1. Outubro até 09/10: low ticket R$ 277 líquido, Comunidade R$ 6.349, Meta R$ 425,
  outros custos R$ 6.300 (≈ zero de lucro).
- Ofertas: ver `docs/TESTE_A_OFERTAS.md` e `docs/ANALISE_OFERTAS_QUIZ_MERCADO.md`.
- A página da Greenn abre em dólar quando o país é Estados Unidos ($ 9,99 ≈ R$ 47; $ 7,86 ≈ R$ 37).
