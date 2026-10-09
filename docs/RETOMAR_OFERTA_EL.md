# Retomar a OFERTA EFEITO LIPO numa conversa nova (estado em 09/10/2026, noite)

Cole o bloco abaixo como primeira mensagem de uma sessão nova do Claude Code (mesmo ambiente,
repositório LR_LauraRosaPersonal, branch `claude/relaxed-cray-r4bnc9`).

```
Vamos continuar o quiz "De Volta ao Eixo" e o painel. Responda SEMPRE em português do Brasil, curto.

1. Branch claude/relaxed-cray-r4bnc9 (git fetch origin claude/relaxed-cray-r4bnc9 && git checkout
   claude/relaxed-cray-r4bnc9 && git pull). Outra sessão também faz push nela: sempre pull antes.
2. Leia: CLAUDE.md, docs/RETOMAR_OFERTA_EL.md (seção "Estado em 09/10, fim da noite") e
   docs/CONTEXTO_COMERCIAL.md.
3. Me diga em até 5 linhas onde paramos e me pergunte (múltipla escolha) as 4 aprovações pendentes do CRM
   da Aline listadas no doc. Depois, os números dos testes T1/T2/T4 desde 09/10 16h30.

Painel: https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN (fonte tools/painel-anuncios/index.html; leia a
versão publicada antes de republicar). Painel da Aline: https://claude.ai/artifact/8Ys79EhBMSiRkDqm3n6QbG
(a rotina trig_01RbMXryDXAy1eLzpCmAtuj6 republica às 11:59 e 23:59; não apague).

Como trabalhamos, item a item: você mostra o item, manda o esboço, eu aprovo, você pede os links 1 a 1,
deixa pronto no painel e me avisa; eu digo "publicar"; você publica e confere no ar.
Versões no painel: só a anterior e a publicada; as antigas ficam no banco. Perguntas em múltipla escolha,
recomendada primeiro. Meta: R$ 10 mil de lucro em outubro.

Regras: preço, oferta, checkout, upsell, garantia e links de pagamento só mudam com meu ok explícito
(CLAUDE.md). Nada vai ao ar sem eu dizer "publicar". Supabase fjlbvoephhextnxemygf e UMCLIQUE: só leitura.
CRM ysgsyhmkixvlxpgbyqkl: só leitura até eu aprovar. Meta Ads: nada muda sem aprovação.
Apagar artefato: só com minha confirmação, um por um.
```

## Estado em 09/10, fim da noite

**No ar no site (v9, desde 15h46; números contam desde 16h30):** T1 (1ª tela G-A × G-B, 100% das visitas),
T4/teste E (oferta com Efeito Lipo × só Comunidade, 50/50), T2/teste B (Efeito Lipo R$ 37 × R$ 47, só dentro do E-A).

**Painel (v55):**
- Quiz e testes: Marca saiu do menu (tudo decidido). Versões mostra só v8 (anterior) e v9 (no ar), sem decisões.
- Editar textos abre a v9 e mostra o aviso "teste acontecendo, versão em fase de testes" na T1 e na T26.
- Funil do quiz: "Sugestões" saiu; tem o botão "Atualizar números".
  - Corrigido: "só anúncios" contava 46 visitas de robôs/revisão do Meta (de 151). Com a correção, quem começa o quiz é 45% e não 31%.
  - Corrigido: "comprou" só via a oferta QN7gci (R$ 37); agora conta qualquer venda aprovada com o mesmo xcod.
- Perfil de recomeço: a regra do painel é igual à do código (_data.ts perfilRecomeco).

**Painel de Leads da Aline (v8):**
- O KPI "em andamento" contava também os sem classificação; agora eles têm um card próprio.
- "Confirmadas no pagamento" no lugar de "na Greenn". Atualiza às 11:59 e às 23:59 (trigger trig_01RbMXryDXAy1eLzpCmAtuj6).

**Por que os números da Aline não batem (outubro até 09/10: 25 vendas da Comunidade):**
- 5 são renovações.
- 8 são novas pela Greenn: 6 marcadas "comprou" no CRM, 2 marcadas errado como em_andamento.
- 12 são novas pela Hotmart (oferta s97oneau). Essas não existem no UMCLIQUE, então vieram fora do WhatsApp da Aline.
- A rotina só reconhece links payfast.greenn e só confere pagamento na Greenn.
- 43 leads em_andamento deviam estar fechados pela regra (11 com mais de 14 dias, 32 com preço há mais de 7 dias).

**Pendente de aprovação do Patrik (escrita no CRM ysgsyhmkixvlxpgbyqkl):**
1. Fechar os 43 leads parados.
2. Marcar as 2 compradoras Greenn como comprou.
3. Rotina: reconhecer links da Hotmart e cruzar vendas aprovadas (Greenn + Hotmart) pelo telefone.
4. Texto "Todo dia às 23:59" nas instruções da rotina → "11:59 e 23:59".

**Fila:**
- 2 notificações no painel: recuperar Pix e passar R$ 20/dia de verba.
- Teste C precisa do link da assinatura de R$ 27.
- T5 e T6 (upsell) são ideias.

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
- T1, T2 e T4 abrem o início de cada braço num celular dentro do card (`v/v9/t1-a.html?step=0`, `t2-a/b` e `t4-a/b` com `?step=25`; prévias em `tools/painel-anuncios/v/v9/`, o `quiz.js` da v9 é montado do código de hoje com `tools/quiz-revisao`; o claude.ai bloqueia abrir
  arquivos do painel em aba nova). T2/T3 abrem os checkouts da Greenn.
- **Para acrescentar um teste:** um objeto em `TESTES` (`tools/painel-anuncios/index.html`) com `arms`, `base`,
  `pos`, `cols`, `sql`, `links`. O painel publicado tem a aba Vídeos (de outra sessão): sempre partir do arquivo
  do repositório (que já está igual ao publicado) e publicar o mesmo arquivo.
- Proposta da T1 B registrada em `propostas/p-2026-10-09-t1-b-recomeco`.

## Teste E (T4 no painel): NO AR desde 09/10 16h15 (PR #21, merge a82fb3e, deploy READY)

- E-A = página de hoje (EL + Comunidade, com o teste B dentro). E-B = só a Comunidade Corpo Feliz R$ 37/mês
  (WOqOSI), com os entregáveis que a Aline apresenta no WhatsApp e o EL como "Incluso". Botão do topo no E-B abre
  a assinatura. Sorteio em `pickComElArm` (`_data.ts`, sessionStorage `el_com_ab`). A T26 grava
  `quiz_events.event='oferta'` com `answer` = E-A:A / E-A:B (preço do teste B visto) / E-B (desde PR #22, 09/10 ~16h40) (API `action: 'oferta'`, sem mudar o banco). Clique na
  assinatura no E-B grava `checkout_ab = E-B-assinatura` (não mistura com o T3).
- O cartão da Comunidade no E-A também passou a usar a lista da Aline (aprovado).
- Esboço: `tools/quiz-revisao/esbocos/img/cmp-T26-testeE.jpg` e `T26-testeE-cartao-comunidade.jpg`.

## Painel: aba Testes (versão 50)

Quadro "Quem está entrando desde 09/10 16h30" (`CONTA_DESDE`): os testes são em camadas, T1 100% · T4 quem chega à oferta · T2 só no A do T4. Cards T1/T2/T4 contam a partir de 16h30.

### Grupos

No ar (T1, T2) · Prontos esperando publicar (T4) · Ideias para criar (T3 R$ 27, T5 trimestral, T6 upsell).
Campo `grupo` em cada objeto de `TESTES`.

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
