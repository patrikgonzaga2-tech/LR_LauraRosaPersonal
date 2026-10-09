# Teste A: quais ofertas existem (inventário de 09/10/2026)

Recomeço da fila da oferta Efeito Lipo (no-brainer + assinatura). Nada foi criado, alterado ou ao ar.
Fonte: vendas aprovadas dos últimos 90 dias (Supabase `fjlbvoephhextnxemygf`, só leitura) + `docs/RETOMAR_OFERTA_EL.md`.

## 1. Ofertas que vendem hoje

| Oferta | Gateway · código | Preço | Vendas 90 dias | Última venda | Situação |
|---|---|---|---|---|---|
| Efeito Lipo 21D | Greenn · QN7gci | R$ 37 (12x R$ 3,80) | 2.205 | 09/10 | No ar. É o checkout do quiz hoje |
| Efeito Lipo Vitalício | Greenn · EtpQXF | R$ 37 | 193 | 01/10 | Sem venda há 8 dias |
| Efeito Lipo 21D | Hotmart · 1oxcxm40 | R$ 37 | 72 | 08/10 | Checkout de reserva |
| Desafio Efeito Lipo | Hotmart · wp53y95s | R$ 47 | 3 | 06/10 | Pouco uso |
| Comunidade mensal | Greenn · O6NiB7 | R$ 97/mês | 23 | 05/10 | No ar |
| Comunidade mensal (antiga) | Greenn · L2pLRb | R$ 67/mês | 7 | 16/09 | Provável antiga |
| Comunidade trimestral | Greenn · YaHnMW | R$ 210 | 46 | 06/10 | Dá para ver no ar |
| Comunidade trimestral | Greenn · O8j7nc | R$ 97 | 23 | 21/09 | Upsell 6152 |
| Comunidade trimestral | Greenn · TCRlbK | R$ 210 | 18 | 01/10 | Provável antiga |
| Comunidade anual | Greenn · M3DUOL / ij3kFo / mhl4tN / omiNl7 / 6JtnDu | R$ 297 (com cupom e parcelas, varia de R$ 24 a R$ 297) | 75 + 92 + 28 + 17 + 94 | 09/10 | Vários códigos para o mesmo produto |
| Comunidade anual sem juros | Hotmart · s97oneau | ≈ R$ 386–447 | 33 | 09/10 | No ar |
| Bump Cinturinha | Greenn · TkxWcG | R$ 19,90 | 159 | 13/09 | Pouco uso recente |
| Bump Dieta Metabólica | Greenn · ILG9bw | R$ 19,90 | 150 | 04/09 | Pouco uso recente |
| Bump Receitas que Secam | Greenn · riJmPB | R$ 19,90 | 91 | 09/10 | No ar |

## 2. O que falta criar (não existe hoje)

- **Efeito Lipo a R$ 47** na Greenn: a fila pede, mas não existe. Hoje o Efeito Lipo vende a R$ 37 (só o Desafio na Hotmart está a R$ 47).
- **Comunidade mensal a R$ 37 e a R$ 27** na Greenn: não existem. A mensal que vende é a R$ 97.
- Esses itens só são criados por você na Greenn. Eu só confiro depois que o link chegar.

## 3. Achados

1. Há ofertas demais da mesma Comunidade (4 códigos de anual, 4 de trimestral, 3 de mensal). O teste fica difícil de ler com tantos braços.
2. O Efeito Lipo é o que mais vende (2.205 em 90 dias). A Comunidade mensal vende pouco a R$ 97 (23 em 90 dias).
3. Com 5 braços e ~8 visitas por dia por braço, o teste leva 6 a 8 semanas. Não cabe na meta de outubro (R$ 10 mil de lucro).

## 4. Todos os testes, nomeados (para aprovar um a um)

Status: só o **Teste A** está feito. Os outros esperam sua aprovação e os links.

- **Teste A: Inventário das ofertas.** FEITO (este arquivo).
- **Teste B: Preço do Efeito Lipo.** R$ 37 × R$ 47, com a assinatura mensal fixa em R$ 37.
  - Precisa criar na Greenn: Efeito Lipo R$ 47 (a de R$ 37 já existe, QN7gci).
- **Teste C: Preço da assinatura mensal.** R$ 37 × R$ 27, com o Efeito Lipo fixo em R$ 37.
  - Precisa criar na Greenn: mensal R$ 37 e mensal R$ 27.
- **Teste D: Formato da assinatura.** Mensal R$ 37 × trimestral R$ 97 (O8j7nc, já existe).
- **Teste E: Com ou sem Efeito Lipo.** Efeito Lipo + assinatura × só assinatura.
- **Teste F: Upsell pós-compra** (`/acompanhamento-up`). Assinatura R$ 37/mês × trimestral R$ 97.
- **Teste G: Primeira tela do quiz (T1).** Atual (recomeço) × "efeito imediato / sinta na 1ª semana".
- **Substituído:** o desenho de 5 braços A a E do esboço da T26 some. Ele vira os Testes B, C e D.
- **Teste G (T1), decidido em 09/10:** braço A = T1 atual; braço B = mesma foto da Laura, título "Descubra seu perfil de recomeço em 2 minutos e o primeiro passo para sentir o corpo menos inchado" (sem prazo de resultado, por risco de reprovação no Meta). Botão igual nos dois braços ("Quero descobrir meu perfil"). Falta só o esboço antes × depois (a troca é o título em `app/efeito-lipo-quiz/_quiz.tsx`, `IntroB`, linhas 728 e 731).
- **T1 B aprovada no esboço (09/10), com o subtítulo "Descubra o porquê em 2 minutos." tirado.** A (no ar) = v7 + fbclid (main `56b52b9`). Imagem: `tools/quiz-revisao/esbocos/img/cmp-T1-antes-depois.jpg`.
- **No ar em 09/10:** teste G (PR #16/#17), teste B (PR #18, R$ 37 × R$ 47, link 795991 com 3 bumps) e T25/T26 novas (PR #19): topo igual ao modelo anterior (título, 3 semanas, botão, antes e depois, alunas), cartão do Efeito Lipo com o preço do teste B e cartão da Comunidade R$ 37/mês (oferta WOqOSI, clique grava `assinatura-37`).
- **Aprovado (09/10): popup de 20% (EFEITOLIPO20) vale em todos os braços dos testes.**
- **Medida em todos:** receita por visita na T26 (inclui a 1ª mensalidade).

Nada disso muda preço, checkout ou link até você aprovar e criar as ofertas na Greenn (CLAUDE.md).
