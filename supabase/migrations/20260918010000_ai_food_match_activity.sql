create table if not exists public.ai_food_matches (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles (id) on delete set null,
  session_id text,
  preferences jsonb not null default '{}'::jsonb,
  top_match_food_id text,
  match_percentage smallint not null check (match_percentage between 0 and 100),
  created_at timestamptz not null default now(),
  constraint ai_food_matches_identity_check check (customer_id is not null or session_id is not null)
);

create index if not exists ai_food_matches_customer_id_idx on public.ai_food_matches (customer_id);
create index if not exists ai_food_matches_session_id_idx on public.ai_food_matches (session_id);

alter table public.ai_food_matches enable row level security;
grant insert on table public.ai_food_matches to anon, authenticated;
grant select on table public.ai_food_matches to authenticated;

drop policy if exists "ai_food_matches_insert_own" on public.ai_food_matches;
create policy "ai_food_matches_insert_own"
  on public.ai_food_matches for insert
  with check (
    (auth.uid() is not null and customer_id = auth.uid() and session_id is null)
    or (auth.uid() is null and customer_id is null and session_id is not null)
  );

drop policy if exists "ai_food_matches_select_own_or_staff" on public.ai_food_matches;
create policy "ai_food_matches_select_own_or_staff"
  on public.ai_food_matches for select
  to authenticated
  using (
    customer_id = auth.uid()
    or public.current_user_role() in ('staff', 'admin')
  );
