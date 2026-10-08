# Painel de anúncios (Meta) — como funciona

Painel: **https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN** (privado do Patrik; abre no claude.ai).
Rotina: **"Painel de anúncios — análise diária e pedidos"** (`trig_01S5UnDtDd9VnVbm5fPXU6Vm`), todo dia às 7h (Brasília), uma sessão nova por execução.

Decisões do Patrik (08/10/2026): o painel fica só no claude.ai; análise 1x ao dia; **nada muda no Meta sem aprovação**;
o Claude pode produzir imagens, vídeos com avatar da Laura (só depois de aprovar o roteiro) e textos de post.

## O que a página faz
- **Meta ao vivo**: conjuntos ativos e anúncios que gastaram (Hoje, Ontem, 3 dias, 7 dias), pelo conector do Meta,
  atualizando de hora em hora enquanto a página está aberta. Cruza com o quiz (Supabase `quiz_sessions`, por
  `utm_term` = conjunto e `utm_content` = nome do anúncio) e com as vendas da oferta QN7gci.
- **Análise do dia**: escrita pela rotina em `analise/atual`.
- **Aviso**: no fim de cada execução a rotina manda um resumo (push no celular; e-mail se ligado nas notificações da rotina) com os números de ontem, propostas, links de criativos novos e o link do painel.
- **Status da rotina**: `status/rotina` mostra a última execução e se deu certo.
- **Para aprovar**: propostas em `propostas/<id>`. Aprovar dispara a rotina com `PEDIDO: executar`.
- **Chats** "Ajustar campanha" e "Criativo novo": mensagens em `chat/<id>`. Enviar dispara a rotina com `PEDIDO: chat`.
- **Histórico**: propostas executadas (com data para conferir e resultado) e recusadas.

## Banco do painel (ArtifactData, url acima)
| Coleção | Campos |
|---|---|
| `analise/atual`, `analises/<AAAA-MM-DD>` | data, gerado_em, resumo, pontos[], proxima_conferencia |
| `propostas/<id>` | tipo (ajuste, criativo, video, post), titulo, dado, antes, depois, alvo {nivel, ids[], nomes[]}, imagens [{url, legenda}], copy, status (pendente, aprovado, ajuste, recusado, executado, erro), nota, criado_em, decidido_em, executado_em, conferir_em, resultado |
| `chat/<id>` | canal (campanha, criativo), papel (patrik, claude), texto, em, respondido, proposta_id |
| `criativos`, `sugestoes` | aprovações antigas (antes de 08/10) |

## Regras
- Só executar no Meta o que estiver com status `aprovado`, exatamente como descrito na proposta.
- Checkout, preço, oferta, links de pagamento e webhooks: regra do CLAUDE.md (não mexer).
- Criativos: sem antes e depois, sem corpo em foco, sem nome de remédio, sem promessa de quilos.
- Supabase `fjlbvoephhextnxemygf`: só leitura.
- Conta Meta 1094091162588572. Régua: custo por venda até R$ 37; T1 32%; clicar comprar 18,7% das sessões.

## Diário
- **08/10/2026**: painel refeito (Meta ao vivo, análise, propostas, 2 chats) e rotina criada. Primeira proposta:
  pausar os 2 conjuntos antigos ainda ligados (FEED do pixel oficial e STORIES E REELS · Cópia), verba de R$ 120 para R$ 80/dia.
  A rotina foi criada sem conectores: precisam ser ligados nela pelo claude.ai (Meta, Supabase, Google Drive) e o repositório adicionado.
