# Painel de anúncios (Meta) — como funciona

Painel: **https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN** (privado do Patrik; abre no claude.ai).
Rotina: **"Painel de anúncios — análise diária e pedidos"** (`trig_01S5UnDtDd9VnVbm5fPXU6Vm`), todo dia às 7h (Brasília), uma sessão nova por execução.

Decisões do Patrik (08/10/2026): o painel fica só no claude.ai; análise 1x ao dia; **nada muda no Meta sem aprovação**;
o Claude pode produzir imagens, vídeos com avatar da Laura (só depois de aprovar o roteiro) e textos de post.

## O que a página faz
- **Meta do painel** (primeira aba, e faixa no topo do Resumo): o Patrik grava a meta em `config/meta`
  (lucro, faturamento ou vendas; valor; prazo em dias; início; escopo "negócio todo" ou "só Efeito Lipo").
  A página mostra % da meta × % do prazo, faturamento, lucro, gasto, vendas, projeção no fim do prazo e "a conta de
  hoje" (ritmo, lucro por venda, margem). Mesma conta dos painéis do site: lucro = líquido − gasto no Meta
  (`marca_resumo` + `funil_resumo`, ou `funil_resumo(..., 'efeito-lipo-quiz')`). Plano do Claude em `meta_plano/atual`;
  chat na conversa `objetivo`.
- **Clicou e não comprou**: sessões do quiz com `checkout_clicked` desde 08/10 08:10 ligadas a `vendas` por xcod.
  Separa comprou, Pix/boleto sem pagar (tem nome e WhatsApp) e saiu do checkout (só remarketing). Compara as respostas
  do quiz de quem comprou × quem não comprou (perfil, medo, canetinha, recomeços, anúncio, checkout). Botão WhatsApp
  abre uma mensagem pronta para o Patrik revisar e enviar (nada é enviado sozinho). Plano do Claude em
  `recuperacao/atual` (remarketing, anúncio, mudança, campanha, automação); chat na conversa `recuperar`. Nome e
  telefone só aparecem na tela (lidos ao vivo do Supabase), nunca gravados no banco do painel.
- **Meta ao vivo**: campanhas, conjuntos e anúncios (Hoje, Ontem, 3 dias, 7 dias; 3 e 7 dias **incluem hoje**), pelo
  conector do Meta, atualizando de hora em hora enquanto a página está aberta. Filtros Ativas / Pausadas / Todas,
  busca por palavra e uma lista para cada nível (Campanha, Conjunto, Anúncio). "Ativas" = o próprio item e tudo acima
  dele ligado (anúncio "Com problema" dentro de campanha pausada não conta como ativo). Colunas: verba/dia, gasto,
  cliques, view page, quiz, última etapa, clicou comprar e Otimiza. Cruza com o quiz (Supabase `quiz_sessions`, por
  `utm_term` = conjunto e `utm_content` = nome do anúncio) e com as vendas da oferta QN7gci.
- **Análise do dia**: escrita pela rotina em `analise/atual`.
- **Aviso**: no fim de cada execução a rotina manda um resumo (push no celular; e-mail se ligado nas notificações da rotina) com os números de ontem, propostas, links de criativos novos e o link do painel.
- **Status da rotina**: `status/rotina` mostra a última execução e se deu certo.
- **Aprovar e conversar**: propostas em `propostas/<id>` com comentário e botões (aprovar dispara `PEDIDO: executar`),
  e o chat com 3 assuntos (Campanha, Criativo novo, Quiz). Cada mensagem tem `conversa`; a conversa atual de cada
  assunto fica em `config/chat`. "Nova conversa" troca o id; as anteriores ficam em "Conversas antigas".
- **Criativos**: análise diária de cada anúncio em `criativos_analise/<id>` (ontem, 7, 15, 30 e 90 dias), com
  veredito, ação (manter, escalar, ajustar, trocar, pausar, ativar), motivo, onde e como, e a proposta para aprovar.
- **Sugestão quiz**: funil tela a tela, respostas, perfil de recomeço, trajetória dos últimos leads (ao vivo, Supabase)
  e propostas tipo `quiz`. Fluxo: aprovar → o Claude prepara uma branch + PR com prévia (status `pronto`) →
  "Publicar no site" (status `publicar`) → merge.
- **Histórico**: propostas executadas (com data para conferir e resultado) e recusadas.
- **Aprovados**: o que foi aprovado passa por Aprovado → Preparando → Feito e some 24 h depois de feito.
- **Otimizar**: aberto pelo botão "Otimizar →" de qualquer linha. Mostra os números e o funil do item, os conjuntos e
  anúncios dentro dele (mesmas colunas, clicáveis para descer de nível, com caminho de volta), as propostas com
  `otimizar_id` ou `alvo.ids` daquele item e um chat (mensagens com `alvo_id`, `alvo_nivel`, `alvo_nome`, conversa
  `ot-<id>`). Item "Com problema"/"Reprovado": o selo é clicável e abre o cartão Problema (motivo lido do Meta com
  `ads_get_errors`, explicado em Motivo / Sugestão / Como) e o botão "Pedir para o Claude resolver".

## Banco do painel (ArtifactData, url acima)
| Coleção | Campos |
|---|---|
| `analise/atual`, `analises/<AAAA-MM-DD>` | data, gerado_em, resumo, pontos[], proxima_conferencia |
| `propostas/<id>` | tipo (ajuste, criativo, video, post, quiz), titulo, dado, antes, depois, alvo {nivel, ids[], nomes[]}, otimizar_id, imagens [{url, legenda}], imagem_hashes {feed, stories}, midia_publica {feed, stories}, prints_antes/prints_depois [{url, legenda}], copy, status (pendente, aprovado, ajuste, recusado, preparando, executado, erro), previa, nota, criado_em, decidido_em, executado_em, conferir_em, resultado |
| `chat/<id>` | canal (campanha, criativo, quiz), conversa, alvo_id, alvo_nivel (campanha, conjunto, anúncio), alvo_nome, papel (patrik, claude), texto, em, respondido, proposta_id |
| `config/chat` | id da conversa atual por assunto |
| `criativos_analise/<id do anúncio>` | nome, conjunto, campanha, status_meta, thumb, periodos {ontem,d7,d15,d30,d90}, veredito, acao, motivo, como, proposta_id |
| `config/meta` | tipo (lucro, faturamento, vendas), valor, dias, inicio (AAAA-MM-DD), escopo (marca, efeito), texto |
| `meta_plano/atual` | em, resumo, pct_meta, pct_prazo, falta_por_dia, acoes [{titulo, porque, como, impacto, proposta_id}] |
| `recuperacao/atual` | em, resumo, numeros, motivos [{motivo, dado}], acoes [{tipo (anuncio, mudanca, rmkt, campanha, automacao), titulo, porque, como, proposta_id}] |
| `criativos`, `sugestoes` | aprovações antigas (antes de 08/10) |

## Regras
- Só executar no Meta o que estiver com status `aprovado`, exatamente como descrito na proposta.
- Checkout, preço, oferta, links de pagamento e webhooks: regra do CLAUDE.md (não mexer).
- Criativos: sem antes e depois, sem corpo em foco, sem nome de remédio, sem promessa de quilos.
- Supabase `fjlbvoephhextnxemygf`: só leitura.
- Conta Meta 1094091162588572. Régua: custo por venda até R$ 37; T1 32%; clicar comprar 18,7% das sessões.

## Diário
- **08/10/2026 (3)**: abas **Meta do painel** e **Clicou e não comprou**; a rotina das 7h passou a escrever o plano da
  meta e o plano de recuperação. Hoje (desde o quiz novo): 4 clicaram em comprar, 1 comprou, 3 saíram do checkout sem
  preencher.
- **08/10/2026 (2)**: criativo H "Recomeçar não é voltar do zero" (feed e stories) no ar no conjunto E-F-G
  (anúncios 120252045444650200 e 120252045446350200). A rotina não conseguiu criar o anúncio (a sessão dela bloqueia
  ações que gastam dinheiro), então ele subiu pela sessão principal; a rotina agora grava "Bloqueado na rotina" quando
  isso acontecer. Imagens para o Meta vão por link público (raw.githubusercontent.com). Painel: filtros nos 3 níveis,
  3/7 dias com hoje, aba Otimizar com conjuntos/anúncios e cartão de problema.
- **08/10/2026**: painel refeito (Meta ao vivo, análise, propostas, 2 chats) e rotina criada. Primeira proposta:
  pausar os 2 conjuntos antigos ainda ligados (FEED do pixel oficial e STORIES E REELS · Cópia), verba de R$ 120 para R$ 80/dia.
  A rotina foi criada sem conectores: precisam ser ligados nela pelo claude.ai (Meta, Supabase, Google Drive) e o repositório adicionado.
