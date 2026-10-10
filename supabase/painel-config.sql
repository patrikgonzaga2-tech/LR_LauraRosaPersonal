-- Painel Corpo Feliz: meta do mês e custos fixos editáveis no Cockpit (/painel).
-- Aplicada em 10/10/2026 (aprovada pelo Patrik). Única tabela em que o painel escreve.
-- Só o servidor (service_role) lê e grava; RLS ligado sem políticas fecha para anon/authenticated.
create table if not exists public.painel_config (
  id text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.painel_config enable row level security;
revoke all on public.painel_config from anon, authenticated;

insert into public.painel_config (id, valor) values ('meta', jsonb_build_object(
  'texto', 'Bater R$ 10 mil de lucro (low ticket + Comunidade)',
  'lucro', 10000,
  'inicio', '2026-10-01',
  'dias', 31,
  'custos', jsonb_build_array(
    jsonb_build_object('nome', 'Mentoria', 'valor', 3500),
    jsonb_build_object('nome', 'Social mídia', 'valor', 1500),
    jsonb_build_object('nome', 'IA', 'valor', 600),
    jsonb_build_object('nome', 'Comercial', 'valor', 500),
    jsonb_build_object('nome', 'WhatsApp', 'valor', 200)
  )
)) on conflict (id) do nothing;
