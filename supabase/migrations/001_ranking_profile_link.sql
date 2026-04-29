-- Vincula cada entrada del ranking con un perfil de usuario de la app (opcional)
alter table public.ranking
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;
