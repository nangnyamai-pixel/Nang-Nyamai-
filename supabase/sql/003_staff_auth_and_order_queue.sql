-- NangNyamai STAFF phase 1: staff identity, active-staff RLS, and Realtime.
-- Apply after 001_schema.sql and 002_rls_policies.sql.

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  staff_id text not null unique check (staff_id = upper(staff_id)),
  name text not null,
  role text not null default 'staff' check (role in ('cashier', 'waitress', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_profiles_auth_user_id_idx
  on public.staff_profiles (auth_user_id);

drop trigger if exists set_updated_at on public.staff_profiles;
create trigger set_updated_at before update on public.staff_profiles
  for each row execute function public.set_updated_at();

alter table public.staff_profiles enable row level security;

create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff_profiles
    where auth_user_id = auth.uid() and is_active = true
  );
$$;

revoke all on function public.is_active_staff() from public;
grant execute on function public.is_active_staff() to authenticated;

create policy "staff_profiles_select_own"
  on public.staff_profiles for select
  to authenticated
  using (auth_user_id = auth.uid());

-- Replace the broader Sprint 0 policies with active-staff-aware equivalents.
drop policy if exists "orders_customer_select_own" on public.orders;
create policy "orders_customer_or_active_staff_select"
  on public.orders for select
  using (
    auth.uid() = customer_id
    or public.is_active_staff()
    or public.current_user_role() = 'admin'
  );

drop policy if exists "order_items_select_via_order" on public.order_items;
create policy "order_items_select_via_accessible_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.customer_id = auth.uid()
          or public.is_active_staff()
          or public.current_user_role() = 'admin'
        )
    )
  );

-- The queue subscribes to order changes. RLS still filters delivered rows.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

-- Optional development setup (run manually; never seed production):
-- 1. Create an Auth user with email stf001@staff.nangnyamai.invalid.
-- 2. Copy its UUID and run:
-- insert into public.staff_profiles (auth_user_id, staff_id, name, role)
-- values ('AUTH_USER_UUID', 'STF001', 'Abu', 'cashier');
-- 3. Keep public.profiles in sync for existing role-based code:
-- insert into public.profiles (id, full_name, role)
-- values ('AUTH_USER_UUID', 'Abu', 'staff') on conflict (id) do update set role = 'staff';
