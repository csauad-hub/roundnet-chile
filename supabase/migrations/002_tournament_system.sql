-- ============================================================
-- Roundnet Chile – Sistema de inscripciones, resultados y ranking
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── tournament_registrations ────────────────────────────────
create table if not exists public.tournament_registrations (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player1_id    uuid not null references public.profiles(id),
  player2_id    uuid not null references public.profiles(id),
  category      text not null default 'Varones',
  status        text not null default 'pending',  -- pending / confirmed / cancelled
  payment_proof text,                              -- ruta en storage bucket 'comprobantes'
  notes         text,
  registered_at timestamptz default now(),
  reviewed_at   timestamptz,
  constraint different_players check (player1_id <> player2_id)
);

alter table public.tournament_registrations enable row level security;

-- Jugadores ven sus propias inscripciones; admins ven todas
create policy "registrations_select" on public.tournament_registrations
  for select to authenticated
  using (player1_id = auth.uid() or player2_id = auth.uid() or public.is_admin());

-- Inscripciones confirmadas son visibles para todos (lista pública del torneo)
create policy "registrations_confirmed_public" on public.tournament_registrations
  for select using (status = 'confirmed');

create policy "registrations_insert" on public.tournament_registrations
  for insert to authenticated
  with check (player1_id = auth.uid());

create policy "registrations_update_admin" on public.tournament_registrations
  for update using (public.is_admin()) with check (public.is_admin());

create policy "registrations_delete_admin" on public.tournament_registrations
  for delete using (public.is_admin());

-- ── tournament_results ──────────────────────────────────────
create table if not exists public.tournament_results (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player1_id    uuid not null references public.profiles(id),
  player2_id    uuid not null references public.profiles(id),
  category      text not null default 'Varones',
  position      integer not null,
  season        integer not null default 2025,
  created_at    timestamptz default now(),
  unique (tournament_id, player1_id, player2_id, category)
);

alter table public.tournament_results enable row level security;

create policy "results_select_all" on public.tournament_results for select using (true);
create policy "results_admin_all"  on public.tournament_results for all
  using (public.is_admin()) with check (public.is_admin());

-- ── tournament_point_scale ──────────────────────────────────
create table if not exists public.tournament_point_scale (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  position      integer not null,
  points        numeric not null default 0,
  unique (tournament_id, position)
);

alter table public.tournament_point_scale enable row level security;

create policy "scale_select_all" on public.tournament_point_scale for select using (true);
create policy "scale_admin_all"  on public.tournament_point_scale for all
  using (public.is_admin()) with check (public.is_admin());

-- ── Storage: comprobantes de pago ───────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes', 'comprobantes', false,
  5242880,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do nothing;

create policy "comprobantes_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'comprobantes');

create policy "comprobantes_admin_view" on storage.objects
  for select to authenticated
  using (bucket_id = 'comprobantes' and public.is_admin());

create policy "comprobantes_owner_view" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprobantes' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Función: recalculate_ranking(season) ────────────────────
-- Lee tournament_results + tournament_point_scale
-- Suma puntos individuales (ambos jugadores de cada pareja)
-- Sobreescribe las entradas de ranking con profile_id en esa temporada/categoría
create or replace function public.recalculate_ranking(p_season integer default 2025)
returns void language plpgsql security definer as $$
declare
  cat text;
begin
  for cat in (
    select distinct category
    from public.tournament_results
    where season = p_season
  ) loop
    -- Eliminar entradas anteriores auto-calculadas (las que tienen profile_id)
    delete from public.ranking
    where season = p_season and category = cat and profile_id is not null;

    -- Calcular e insertar nuevas entradas
    with all_pts as (
      select tr.player1_id as player_id, tr.tournament_id, tr.position
      from public.tournament_results tr
      where tr.season = p_season and tr.category = cat
      union all
      select tr.player2_id, tr.tournament_id, tr.position
      from public.tournament_results tr
      where tr.season = p_season and tr.category = cat
    ),
    totals as (
      select
        ap.player_id,
        sum(coalesce(ps.points, 0)) as total_points
      from all_pts ap
      left join public.tournament_point_scale ps
        on ps.tournament_id = ap.tournament_id
        and ps.position = ap.position
      group by ap.player_id
    ),
    ranked as (
      select
        player_id,
        total_points,
        row_number() over (order by total_points desc) as pos
      from totals
      where total_points > 0
    )
    insert into public.ranking (profile_id, name, points, season, category, position)
    select
      r.player_id,
      coalesce(p.full_name, 'Jugador'),
      r.total_points,
      p_season,
      cat,
      r.pos::integer
    from ranked r
    join public.profiles p on p.id = r.player_id;

  end loop;
end;
$$;

-- ── Escala de puntos por defecto ────────────────────────────
create or replace function public.create_default_point_scale(p_tournament_id uuid)
returns void language sql security definer as $$
  insert into public.tournament_point_scale (tournament_id, position, points) values
    (p_tournament_id,  1, 100),
    (p_tournament_id,  2,  80),
    (p_tournament_id,  3,  65),
    (p_tournament_id,  4,  50),
    (p_tournament_id,  5,  35),
    (p_tournament_id,  6,  35),
    (p_tournament_id,  7,  20),
    (p_tournament_id,  8,  20),
    (p_tournament_id,  9,  10),
    (p_tournament_id, 10,  10),
    (p_tournament_id, 11,  10),
    (p_tournament_id, 12,  10)
  on conflict (tournament_id, position) do nothing;
$$;
