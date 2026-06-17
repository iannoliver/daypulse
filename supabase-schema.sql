-- ============================================================
-- DayPulse — Schema Supabase
-- Execute este arquivo no SQL Editor do seu projeto Supabase
-- ============================================================

-- Tabela de check-ins
create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,
  mood        smallint not null check (mood between 1 and 5),
  energy      smallint not null check (energy between 1 and 5),
  sleep_hours numeric(4,1) not null check (sleep_hours >= 0),
  physical    text[] not null default '{}',
  note        text not null default '',
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

-- Tabela de insights semanais
create table if not exists public.insights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  week_start   date not null,
  content      text not null,
  generated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- Tabela de perfis (criada automaticamente via trigger)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  created_at timestamptz not null default now()
);

-- Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.checkins enable row level security;
alter table public.insights enable row level security;
alter table public.profiles enable row level security;

-- Políticas para checkins
create policy "Users can view own checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "Users can update own checkins"
  on public.checkins for update
  using (auth.uid() = user_id);

create policy "Users can delete own checkins"
  on public.checkins for delete
  using (auth.uid() = user_id);

-- Políticas para insights
create policy "Users can view own insights"
  on public.insights for select
  using (auth.uid() = user_id);

create policy "Users can insert own insights"
  on public.insights for insert
  with check (auth.uid() = user_id);

create policy "Users can update own insights"
  on public.insights for update
  using (auth.uid() = user_id);

-- Políticas para profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
