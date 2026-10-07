# Contexto do comercial (Laura Rosa / Comunidade Corpo Feliz)

Resumo para novas conversas. Leia isto antes de mexer em qualquer coisa.
Segredos (tokens de webhook e da planilha) NÃO ficam aqui: estão no banco/config.

## Como funciona hoje
- Leads chegam pelo Instagram → CRM UMCLIQUE → vendedora Aline atende no WhatsApp → pagamento na Greenn.
- **23:59** (rotina "Painel de Leads 23:59", trig_01RbMXryDXAy1eLzpCmAtuj6): lê o CRM (só leitura),
  classifica as conversas, grava no Supabase CRM, escreve o relatório do dia e republica o painel.
  Instruções: `select texto from public.rotina_instrucoes where id='rotina_diaria_crm_v3'`.
- **08:00** (rotina "Relatório no grupo Vendas Aline 8h", trig_01SnXnKNsNaQVc9j16iWhBiT): manda 1 mensagem
  no grupo WhatsApp "Vendas Aline" com o dia anterior + total do mês + conferência da planilha da Aline.
  Instruções: `select texto from public.rotina_instrucoes where id='envio_grupo_vendas_v3'`.
- As duas rotinas precisam dos conectores UMCLIQUE e Supabase; a das 8h também do Google Drive.

## Onde estão as coisas
| O quê | Onde |
|---|---|
| Banco do CRM (leitura de leads) | Supabase `ysgsyhmkixvlxpgbyqkl` ("CRM Corpo Feliz") – tabelas leads, conversas_lidas, nao_leads_diario, relatorios_diarios, rotina_instrucoes; views aba_* |
| Banco de vendas (Greenn/Hotmart) | Supabase `fjlbvoephhextnxemygf` – tabelas vendas, assinaturas. **Só leitura** |
| Webhook Greenn | função `greenn-webhook` (este repo). Mesma URL em todos os produtos |
| Planilha que atualiza sozinha | https://docs.google.com/spreadsheets/d/1OSPiYkXZGpnac7CPlX3-r_agwZX2Otomq8n1PBxjJd8/edit (função `planilha` no projeto CRM) |
| Painel de Leads | https://claude.ai/artifact/8Ys79EhBMSiRkDqm3n6QbG |
| Planilha da Aline (só leitura) | https://docs.google.com/spreadsheets/d/11eG71MZo0lms74PwOfrbEVN-FGyPk8Di1g8Y6pI6JhY/edit – aba "VENDAS <MÊS> <ANO>" |
| Grupo WhatsApp do relatório | "Vendas Aline" 120363422010636612@g.us, canal UMCLIQUE b78de616-4c24-4392-8738-67c1701199d2 (82 98721-3606) |

## Regras
- Pagamento/checkout/ofertas/webhooks de venda: ver CLAUDE.md (precisa aprovação do Patrik).
- CRM UMCLIQUE: só leitura, exceto o envio diário no grupo Vendas Aline.
- Mensagens no grupo: sem nomes, telefones ou dados de saúde.
- Nunca escrever no projeto `fjlbvoephhextnxemygf`.

## Situação em 07/10/2026
- Webhooks Greenn: Trimestral e Mensal ok; **Anual corrigido e testado em 07/10**. Faltam conferir/testar:
  Semestral (148319), #Efeito Lipo 21D (181143), Vitalício (181150), Pix Simbólico (148346),
  Dieta Metabólica, Receitas que Secam, Cinturinha Express (se ainda vendem).
  Teste: gerar Pix sem pagar e checar `vendas` por product_id.
- Planilha da Aline: aba VENDAS OUTUBRO 2026 vazia (precisa preencher 01–06/10).
- Compras do mês na mensagem = vendas da Aline até 06/10 + Greenn (Comunidade) a partir de 07/10.
- Releitura dos leads antigos "em andamento": 40 por noite (limite de requisições do UMCLIQUE).
- Pendente do Patrik: exportação de vendas de outubro da Greenn; reconectar Instagram no UMCLIQUE.
