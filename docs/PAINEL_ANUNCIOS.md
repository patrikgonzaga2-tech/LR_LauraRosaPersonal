# Painel de anúncios (Meta) — como funciona

Painel: **https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN** (privado do Patrik; abre no claude.ai).
Rotina: **"Painel de anúncios — análise diária e pedidos"** (`trig_01S5UnDtDd9VnVbm5fPXU6Vm`), todo dia às 7h (Brasília), uma sessão nova por execução.

Decisões do Patrik (08/10/2026): o painel fica só no claude.ai; análise 1x ao dia; **nada muda no Meta sem aprovação**;
o Claude pode produzir imagens, vídeos com avatar da Laura (só depois de aprovar o roteiro) e textos de post.

## O que a página faz
- **Ajuste do quiz** (grupo do menu): Sugestão quiz, Como está o quiz, Versões, Comparar versões, Marca e Editar
  textos (antes era a página 1CpgLoG6JcvucRM21TPfiQ). Estilos escopados em `.qz`; dados em `aprovacoes`, `pedidos`,
  `metricas`. Fonte: `tools/painel-anuncios/index.html`.
- **Clicou e não comprou**: botão "Já chamei ✓" grava só o id da sessão em `recuperacao_feitos/<id>`; o número no
  menu conta quem gerou Pix/boleto e ainda não foi chamado. O número de "Otimizar" conta só conversas de
  campanha/conjunto/anúncio sem resposta.
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
- **Referência**: botão BUSCAR REFERÊNCIAS (grava `config/referencias.pedido_em` e chama a rotina com `PEDIDO: referencias`).
  Mostra "O que fazer com isso", os posts da Laura que mais engajaram (com "Por que funcionou" e "Como vira anúncio"),
  anúncios concorrentes da Biblioteca (dias no ar, versões ativas, link do vídeo), peças prontas com Baixar (capacidade
  `downloads`; arquivos nos assets do painel) / Quero subir / Pedir ajuste (vão pelo chat "criativo"), e o que falta
  conectar (docs/GUIA_CONEXOES.md). A tabela antiga de fotos e pendências fica recolhida no fim.
- **Roteiros da Laura**: roteiros em `roteiros/<id>` com por que gravar, cena a cena (tempo, o que fazer, fala, texto na
  tela), texto completo, legenda, onde, roupa e cuidado. Botões Copiar texto, Mandar no WhatsApp, Já gravei (status
  `gravado`) e Pedir ajuste (status `ajuste` + chat "criativo"). Número no menu = roteiros para gravar.

## Banco do painel (ArtifactData, url acima)
| Coleção | Campos |
|---|---|
| `analise/atual`, `analises/<AAAA-MM-DD>` | data, gerado_em, resumo, pontos[], proxima_conferencia |
| `propostas/<id>` | tipo (ajuste, criativo, video, post, quiz), titulo, dado, antes, depois, alvo {nivel, ids[], nomes[]}, otimizar_id, imagens [{url, legenda}], imagem_hashes {feed, stories}, midia_publica {feed, stories}, prints_antes/prints_depois [{url, legenda}], copy, status (pendente, aprovado, ajuste, recusado, preparando, executado, erro), previa, nota, criado_em, decidido_em, executado_em, conferir_em, resultado |
| `chat/<id>` | canal (campanha, criativo, quiz), conversa, alvo_id, alvo_nivel (campanha, conjunto, anúncio), alvo_nome, papel (patrik, claude), texto, em, respondido, proposta_id |
| `config/chat` | id da conversa atual por assunto |
| `criativos_analise/<id do anúncio>` | nome, conjunto, campanha, status_meta, thumb, periodos {ontem,d7,d15,d30,d90}, veredito, acao, motivo, como, proposta_id |
| `config/meta` | tipo (lucro, faturamento, vendas), valor, dias, inicio (AAAA-MM-DD), escopo (lowticket, marca, efeito), texto, custos [{nome, valor}] (outros custos da empresa no período, já acumulados até hoje), custos_em (quando o Patrik atualizou os custos) |
| `meta_plano/atual` | em, resumo, pct_meta, pct_prazo, falta_por_dia, acoes [{titulo, porque, como, impacto, proposta_id}] |
| `recuperacao/atual` | em, resumo, numeros, motivos [{motivo, dado}], acoes [{tipo (anuncio, mudanca, rmkt, campanha, automacao), titulo, porque, como, proposta_id}] |
| `referencias/atual` | em, resumo, fazer[], instagram {sub, padrao[], obs, posts [{data, tipo, dur, curtidas, coment, legenda, link, porque, ideia}]}, mercado_lead, mercado [{pagina, titulo, dias, ativos, tag (antigo, quiz, escala, mesmo, gancho, whats), link, video, leitura}], conexoes [{st (ok, falta, no), t}] |
| `config/referencias` | pedido_em, por (botão BUSCAR REFERÊNCIAS) |
| `referencias_pecas/<id>` | ordem, tipo (foto, video), formato, titulo, status (pronta, subir, ajuste, editar, descartada), precisa, vazio, thumb, porque, texto, nota, arquivos [{rotulo, nome, url}] (url = `/_blob/<id do asset>`), criado_em |
| `roteiros/<id>` | ordem, titulo, dur, porque, onde, roupa, cenas [{t, faz, fala, tela}], texto, legenda, cuidado, precisa_ok, como_gravar, status (gravar, gravado, ajuste), gravado_em, nota, criado_em |
| `criativos`, `sugestoes` | aprovações antigas (antes de 08/10) |

## Regras
- Só executar no Meta o que estiver com status `aprovado`, exatamente como descrito na proposta.
- Checkout, preço, oferta, links de pagamento e webhooks: regra do CLAUDE.md (não mexer).
- Criativos: sem antes e depois, sem corpo em foco, sem nome de remédio, sem promessa de quilos.
- Supabase `fjlbvoephhextnxemygf`: só leitura.
- Conta Meta 1094091162588572. Régua: custo por venda até R$ 37; T1 32%; clicar comprar 18,7% das sessões.

## Diário
- **09/10/2026 (3)**: aba **Referência** refeita com dados reais e botão BUSCAR REFERÊNCIAS; nova aba **Roteiros da Laura**
  (5 roteiros: só cardio, se matar de treinar, recomeços, medo de gastar [espera OK: garantia], depois dos 40). Peças
  I "Pare de fazer só cardio" (feed/stories) e J "Só esteira e nada muda?" (vídeo 10s) nos assets do painel. Baixar usa a
  capacidade `downloads`. Instagram: os reels de 8–18s engajam até 10× mais que as versões longas do mesmo texto. Biblioteca
  (BR): anúncio mais antigo do nicho com 90 dias; a ferramenta não traz vídeo nem texto. Rede bloqueia Instagram, Facebook,
  Drive, HeyGen e ElevenLabs; mLabs não tem conector nem API → Metricool (grátis). Passo a passo em `docs/GUIA_CONEXOES.md`.
- **09/10/2026 (2), 08h50**: **Resumo** ganhou "O que fazer hoje" (Pix a chamar, conjunto com R$ 40+ sem clique em comprar,
  anúncio reprovado em campanha ligada, propostas esperando, resultado a conferir, custos desatualizados, meta abaixo do ritmo,
  conjunto pronto para escalar). **Meta ao vivo**: colunas Gasto · Começaram o quiz · Clicaram comprar · Vendas · Custo por
  venda · Sinal (Escalar / Vendendo / Caro / Pausar? / Pouco dado / Acompanhar; régua R$ 37 e corte R$ 40 sem clique);
  verba/dia e CTR embaixo do nome; vendas por conjunto (tracking_src) e por anúncio (utm_content da sessão ligada pelo xcod).
  **Sugestão quiz**: % ao lado dos números do funil; Respostas mostram todas as telas T2–T25 (T3/T9/T16/T24/T25 sem pergunta
  com quantas passaram, T15 "Faz sentido/É novidade", T22 altura e T23 peso em faixas); a aba agora carrega ao abrir o painel
  (antes só depois de trocar o período). **Escolher datas** (de/até) na Sugestão quiz e no Clicou e não comprou.
- **09/10/2026, 08h40**: aba **Clicou e não comprou** refeita para decidir rápido: (1) uma frase + barra (comprou / Pix sem pagar /
  saiu do checkout); (2) **O que fazer agora**, numerado por prioridade (chamar Pix no WhatsApp, remarketing para quem saiu,
  medo mais comum de quem não comprou com a dica de mensagem, aviso de "ainda é cedo" com menos de 5 compras); (3) **Pessoas**
  com filtros que mostram a contagem, Pix primeiro, e no celular cada pessoa vira um cartão; (4) **Por que não compram?**
  recolhido, com "Como ler", colunas "Não compraram (n)" / "Compraram (n)" e valores "4 de 8" no lugar de "Não/Sim" e %.
  Some o cartão que só tem uma resposta (ex.: checkout Greenn 100%). Sessões de teste do Google Tag Assistant ficam fora da conta.
- **08/10/2026 (4), 18h05**: **menu ☰ no celular** (até 860 px as abas abrem numa gaveta à esquerda; nada de faixa rolando de lado)
  e **outros custos da empresa** na Meta do painel: em "Editar meta" / "Atualizar custos" o Patrik digita quanto já gastou no
  período com comercial, planilha, IA, WhatsApp etc. (`config/meta.custos`). Lucro final = líquido − Meta − outros custos; a
  meta de lucro, o "se continuar assim" e o quadro "A conta do lucro" usam o lucro final. Custos com mais de 7 dias (`custos_em`)
  mostram aviso amarelo. Lembrete toda segunda 8h54 (push + e-mail): rotina "Lembrete semanal: custos da Meta do painel"
  (`trig_01TYKiqQTyPK34dP1UgKVmeH`). Obs.: `config/meta.escopo` estava "marca" (negócio todo) com o texto "apenas low ticket".
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
