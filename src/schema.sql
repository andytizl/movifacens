-- MoviFacens: esquema do banco (Supabase / PostgreSQL)

-- Perfis dos usuários
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  curso text
);

-- Ofertas de carona
create table public.ofertas (
  id bigint generated always as identity primary key,
  motorista_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  origem_lat double precision not null,
  origem_lng double precision not null,
  origem_desc text not null,
  destino_lat double precision not null,
  destino_lng double precision not null,
  destino_desc text not null,
  sentido text not null check (sentido in ('IDA', 'VOLTA')),
  dias_semana int[] not null,
  horario time not null,
  vagas int not null check (vagas >= 0),
  criado_em timestamptz not null default now()
);

-- Solicitações de vaga
create table public.solicitacoes (
  id bigint generated always as identity primary key,
  oferta_id bigint not null references public.ofertas(id) on delete cascade,
  passageiro_id uuid not null references public.profiles(id) on delete cascade default auth.uid(),
  status text not null default 'PENDENTE' check (status in ('PENDENTE', 'ACEITA', 'RECUSADA')),
  criado_em timestamptz not null default now(),
  unique (oferta_id, passageiro_id)
);

-- Só emails da Facens podem se cadastrar (confirme os domínios reais)
create or replace function public.bloquear_email_nao_facens()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if split_part(lower(new.email), '@', 2) not in ('facens.br', 'alunos.facens.br') then
    raise exception 'Use seu email institucional da Facens.';
  end if;
  return new;
end;
$$;

create trigger so_facens
  before insert on auth.users
  for each row execute function public.bloquear_email_nao_facens();

-- Cria o perfil automaticamente no cadastro
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- Segurança (Row Level Security)
alter table public.profiles enable row level security;
alter table public.ofertas enable row level security;
alter table public.solicitacoes enable row level security;

create policy "perfis visíveis a logados" on public.profiles
  for select to authenticated using (true);
create policy "editar próprio perfil" on public.profiles
  for update to authenticated using (id = auth.uid());

create policy "ofertas visíveis a logados" on public.ofertas
  for select to authenticated using (true);
create policy "criar própria oferta" on public.ofertas
  for insert to authenticated with check (motorista_id = auth.uid());
create policy "editar própria oferta" on public.ofertas
  for update to authenticated using (motorista_id = auth.uid());
create policy "apagar própria oferta" on public.ofertas
  for delete to authenticated using (motorista_id = auth.uid());

create policy "ver minhas solicitações ou das minhas ofertas" on public.solicitacoes
  for select to authenticated using (
    passageiro_id = auth.uid()
    or exists (select 1 from public.ofertas o where o.id = oferta_id and o.motorista_id = auth.uid())
  );
create policy "solicitar vaga" on public.solicitacoes
  for insert to authenticated with check (passageiro_id = auth.uid());
create policy "motorista responde solicitação" on public.solicitacoes
  for update to authenticated using (
    exists (select 1 from public.ofertas o where o.id = oferta_id and o.motorista_id = auth.uid())
  );