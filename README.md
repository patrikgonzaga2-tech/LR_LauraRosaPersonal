# laurarosapersonal.com

> **Manual de operação** — como usar, publicar e ler o painel, explicado do zero:
> https://claude.ai/code/artifact/325faca1-d6e4-42ce-9ebe-de225b822722

Funil do Efeito Lipo 21 **e** painel de métricas da marca — Laüra Rosa.

Publicado automaticamente pela Vercel (projeto `efeito-lipo-21`) a cada envio
na branch `main`.

## Rodar no seu computador

```bash
npm install
npm run dev
```

Abre em http://localhost:3000.

> **Atenção:** este projeto usa **npm**, não pnpm. O outro site da operação
> (`LR_TeamCorpoFeliz`) usa pnpm. Misturar os dois bagunça as dependências.

As páginas de venda rodam sem configuração nenhuma. O painel precisa de um
arquivo `.env.local` na raiz com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e
`QUIZ_DASHBOARD_PASSWORD` — os valores estão nas variáveis de ambiente da
Vercel. Esse arquivo nunca vai para o GitHub (já está no `.gitignore`).

## Rotas

| Endereço | O que é |
| --- | --- |
| `/` | Redireciona para `/efeito-lipo` |
| `/efeito-lipo` | Sorteia 50/50 entre A e B e grava a escolha num cookie de 30 dias |
| `/efeito-lipo-a` | Página de venda **com** VSL |
| `/efeito-lipo-b` | Página de venda **sem** VSL |
| `/efeito-lipo-quiz` | O quiz — funil gamificado de 26 telas |
| `/acompanhamento-up` | Upsell pós-compra, com cobrança em 1 clique |
| `/up-cf-whats` | Mesma oferta de upsell, versão enviada por WhatsApp |
| `/obg-gp-efeito-lipo` | Obrigado pós-compra: leva a cliente para o grupo |
| `/presente-casamento` | Campanha do convite de casamento |
| `/painel` | **Painel da marca** — protegido por senha |
| `/efeito-lipo-quiz/dashboard` | **Dashboard do funil** — mesma senha |

## Editar o quiz

Toda a copy das 26 telas está em **um arquivo só**:
`app/efeito-lipo-quiz/_data.ts`. Para ver uma tela específica sem responder o
quiz inteiro, use `?step=N` — por exemplo
`localhost:3000/efeito-lipo-quiz?step=18`.

⚠️ O link de checkout do quiz é montado **no momento do clique**, para carregar
as etiquetas de rastreio (`sck`, `src`, `xcod`). Já perdemos atribuição de
vendas por causa de uma corrida entre o React e o script de rastreio nesse
link. Se precisar mexer no botão de compra, entenda essa parte antes.

## Banco de dados

Todo o SQL está versionado em `supabase/` — tabelas, visões e as mais de vinte
funções que alimentam o painel. As três Edge Functions ficam em
`supabase/functions/`:

| Função | O que faz |
| --- | --- |
| `hotmart-webhook` | Recebe o aviso de venda da Hotmart e grava na tabela `vendas` |
| `greenn-webhook` | O mesmo para a Greenn, na mesma tabela (coluna `gateway`) |
| `meta-insights` | Busca o gasto por conjunto no Meta, de hora em hora |

Ao alterar o painel, **rode o SQL antes de publicar o front** — na ordem
contrária, a aba aparece vazia sem dar erro.

## Observações

- O build ignora erros de tipo (`ignoreBuildErrors: true` no `next.config.mjs`).
  Build verde significa "monta", não significa "está certo".
- O playbook completo de rastreamento e dashboard está em
  `docs/PLAYBOOK-RASTREAMENTO-E-DASHBOARD.md`.
