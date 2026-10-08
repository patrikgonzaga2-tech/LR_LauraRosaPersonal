# Retomar o Painel de anúncios numa conversa nova

Cole o bloco abaixo como primeira mensagem de uma sessão nova do Claude Code (mesmo ambiente, repositório
LR_LauraRosaPersonal, branch `claude/relaxed-cray-r4bnc9`).

```
Vamos continuar o PAINEL DE ANÚNCIOS do quiz "De Volta ao Eixo" (Efeito Lipo 21D, Laura Rosa).
Responda SEMPRE em português do Brasil, curto e claro.

1. Trabalhe na branch claude/relaxed-cray-r4bnc9 (git fetch origin claude/relaxed-cray-r4bnc9 && git checkout claude/relaxed-cray-r4bnc9 && git pull).
2. Leia, nesta ordem: CLAUDE.md, docs/RETOMAR_PAINEL.md (estado atual), docs/PAINEL_ANUNCIOS.md,
   docs/QUIZ_REVISAO.md, docs/CONTEXTO_COMERCIAL.md, docs/ANALISE_CAMPANHAS_QUIZ.md e docs/IA_RECUPERACAO_FAQ.md.
3. Leia o painel com a ferramenta Artifact (action "read", url https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN)
   e confira que a fonte tools/painel-anuncios/index.html é a mesma versão; se o publicado for mais novo, parta dele.
4. Me diga em até 6 linhas: o que está no ar, o que a rotina das 7h fez hoje (coleção status/rotina e
   analise/atual do painel), propostas pendentes, mensagens sem resposta no chat e o que está marcado para conferir.

Regras: nada muda no Meta sem proposta "aprovado" no painel (aprovado = pode subir). Checkout, preço, oferta,
order bump, upsell e links de pagamento: só mostrar antes/depois e esperar meu ok (CLAUDE.md). Supabase
fjlbvoephhextnxemygf é só leitura. Nunca fazer merge nem deploy na main sem eu pedir.
Depois espere eu dizer o que fazer.
```

## Estado em 08/10/2026, 17h50 (Brasília)

**Links**
- Painel de anúncios (único painel; privado do Patrik): https://claude.ai/artifact/FkDqzBBekcELvdVp4EWgEN
- Antiga página "Ajuste do Quiz" (só mostra aviso de que mudou): https://claude.ai/artifact/1CpgLoG6JcvucRM21TPfiQ
- Quiz no ar: https://www.laurarosapersonal.com/efeito-lipo-quiz

**Abas do painel**: Meta do painel · Resumo · Aprovar e conversar · Aprovados · Meta ao vivo (filtros por
período/status/busca e Campanha → Conjunto → Anúncio) · Otimizar (mesmos filtros, conjuntos e anúncios dentro,
cartão "Com problema" com motivo do Meta) · Clicou e não comprou (por que não compraram, WhatsApp pronto,
"Já chamei ✓") · Ajuste do quiz (Sugestão quiz, Como está o quiz + última venda, Versões, Comparar, Marca,
Editar textos) · Histórico · Criativos · Referência.

**Como publicar o painel**: editar `tools/painel-anuncios/index.html` e publicar com a ferramenta Artifact
(`url` = link do painel, `file_path` = esse arquivo). Não passar `capabilities` (já tem Supabase execute_sql,
META ADS / META-ADS ads_get_ad_entities + ads_get_errors, Claude Code Remote fire_trigger, db, user, assets).
Os arquivos do quiz (quiz.html/js/css, images/, v/v0…v6/) já estão publicados e se mantêm.
Teste antes: Playwright com Chromium em /opt/pw-browsers/chromium (`require('<repo>/tools/quiz-revisao/node_modules/playwright-core')`),
copiando o HTML com dados de exemplo injetados.

**Rotina** "Painel de anúncios — análise diária e pedidos" (`trig_01S5UnDtDd9VnVbm5fPXU6Vm`), todo dia às
7h (Brasília), sessão nova a cada vez, aviso por push e e-mail. O painel a chama com `PEDIDO: chat|executar|analise|teste`.
A sessão da rotina é bloqueada para criar anúncio/campanha no Meta (gasta dinheiro): quando isso acontece a
proposta fica "erro" com "Bloqueado na rotina" e a sessão principal sobe.

**Meta Ads**: conta 1094091162588572 · página Corpo Feliz 103726576029315 · IG 17841402314302518 · pixel da LP
28090278990632923 (venda = evento personalizado "Compra Realizada"; checkout = "Início do Checkout") ·
`client_conversation_id` = Lr8PainelAds2026Ok7Q · link dos anúncios:
`https://www.laurarosapersonal.com/efeito-lipo-quiz?utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`.
Imagens para o Meta só por link público (raw.githubusercontent.com da branch).

**Regras fixas para subir no Meta** (Patrik, 08/10; detalhes em docs/ANALISE_CAMPANHAS_QUIZ.md 3.2):
1. Anunciante: beneficiário e pagador **CORPO FELIZ LTDA** em todo conjunto (`dsa_beneficiary`/`dsa_payor`).
2. Localização: `geo_locations {"countries":["BR"],"location_types":["home","recent"]}` (sem isso dá o erro #1870194).
3. UTMs exatamente: `utm_source=FB&utm_medium={{placement}}&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.id}}`.
4. Complemento do navegador do WhatsApp, número final 0948, em todo anúncio. A API não tem esse campo:
   ligar no Gerenciador (Anúncio → Destino → Destinos personalizados → Editar → Complementos do navegador → WhatsApp).
5. Editar conjunto ativo faz o Meta pausar o conjunto: reativar logo depois e conferir.

**Subiu hoje (08/10)**
- Criativo H "Recomeçar não é voltar do zero": anúncios 120252045444650200 (feed) e 120252045446350200
  (stories) no conjunto E-F-G 120252039551500200. Conferir em 11/10.
- Remarketing: público 120252045785010200 ("Início do Checkout" 7 dias, sem "Compra Realizada"), campanha
  120252045833580200, conjunto 120252045836310200 (R$ 15/dia, otimiza Compra Realizada), anúncios I RESULTADO
  ESPERANDO 120252045847310200 (feed) e 120252045847720200 (stories). Público pequeno; conferir em 11/10.

**Meta do painel** (`config/meta`): lucro R$ 10.000, low ticket (Efeito Lipo + order bumps, Greenn + Hotmart,
todas as origens, sem a Comunidade), 01/10 a 31/10. Em 08/10: 10 itens vendidos, R$ 260 bruto, R$ 232 líquido,
6 de anúncio, gasto no Meta R$ 350 → lucro −R$ 118.

**Pendências**
- Conjunto "STORIES E REELS · MULHERES 25-55 · IG + FB — Cópia" (120252039206240200) ficou pausado em 08/10 à
  noite (o Meta pausou ao gravar CORPO FELIZ LTDA e a reativação foi barrada): reativar com o ok do Patrik.
- Ligar o complemento do WhatsApp (0948) nos anúncios ativos, no Gerenciador.
- 11/10: conferir T1 v6 (manter ou voltar), criativo H e remarketing.
- IA de recuperação (`docs/IA_RECUPERACAO_FAQ.md`): confirmar acesso de 60 dias, faixa de idade e se a área de
  membros tem Guia Alimentar, Áudios e Planner (a oferta promete).
- A sessão "AJUSTE DO QUIZ - EDITAVEL COM PAINEL" publicava na página antiga; novas versões do quiz agora vão
  para o painel (ver docs/QUIZ_REVISAO.md, diário 08/10 (8)).
