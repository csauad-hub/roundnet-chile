-- ============================================================
-- Roundnet Chile – Schema completo
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  username             text,
  full_name            text,
  nickname             text,   -- apodo opcional; se muestra en lugar del nombre real cuando está definido
  avatar_url           text,
  city                 text,
  region               text,
  instagram            text,
  phone                text,
  role                 text default 'user',
  visible_in_directory boolean default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ► MIGRACIÓN para bases de datos existentes (ejecutar una sola vez en Supabase SQL Editor):
-- alter table public.profiles add column if not exists nickname text;

alter table public.profiles enable row level security;

create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);

-- Trigger: crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── posts comments_count trigger ─────────────────────────────
-- Mantiene posts.comments_count sincronizado automáticamente.
-- ► Ejecutar en Supabase SQL Editor si la tabla posts ya existe.
create or replace function public.handle_comment_count()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_comment_inserted on public.post_comments;
create trigger on_comment_inserted
  after insert or delete on public.post_comments
  for each row execute procedure public.handle_comment_count();

-- ── helper: is_admin() ──────────────────────────────────────
-- Función SECURITY DEFINER para evitar recursión infinita en políticas RLS
-- que consultan la tabla profiles desde otras tablas con RLS activo.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── tournaments ──────────────────────────────────────────────
create table if not exists public.tournaments (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  location       text,
  city           text,
  date           text,
  status         text default 'upcoming',
  category       text,
  max_teams      integer,
  price_per_team numeric,
  fwango_url     text,
  description    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table public.tournaments enable row level security;

create policy "tournaments_select_all" on public.tournaments for select using (true);
create policy "tournaments_admin_all"  on public.tournaments for all
  using (public.is_admin()) with check (public.is_admin());

-- ── news ─────────────────────────────────────────────────────
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  image_url    text,
  link         text,
  published_at timestamptz,
  category     text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ► MIGRACIÓN para bases de datos existentes (ejecutar una sola vez en Supabase SQL Editor):
-- alter table public.news alter column published_at type timestamptz using published_at::timestamptz;

alter table public.news enable row level security;

create policy "news_select_all" on public.news for select using (true);
create policy "news_admin_all"  on public.news for all
  using (public.is_admin()) with check (public.is_admin());

-- ── ranking ──────────────────────────────────────────────────
create table if not exists public.ranking (
  id       uuid primary key default gen_random_uuid(),
  position integer,
  name     text not null,
  points   numeric,
  season   integer default 2025,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ranking enable row level security;

create policy "ranking_select_all" on public.ranking for select using (true);
create policy "ranking_admin_all"  on public.ranking for all
  using (public.is_admin()) with check (public.is_admin());
