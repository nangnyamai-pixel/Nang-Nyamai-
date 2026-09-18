-- Restrict Staff receipt access to the three profile fields required by the receipt.
-- The function resolves the profile through a specific order and never exposes a
-- generic Customer directory.

create or replace function public.get_receipt_customer_profile(p_order_id uuid)
returns table (full_name text, phone text, member_id text)
language sql
stable
security definer
set search_path = public
as $$
  select p.full_name, p.phone, p.member_id
  from public.orders as o
  join public.profiles as p on p.id = o.customer_id
  where o.id = p_order_id
    and (public.is_active_staff() or public.current_user_role() = 'admin')
  limit 1;
$$;

revoke all on function public.get_receipt_customer_profile(uuid) from public;
grant execute on function public.get_receipt_customer_profile(uuid) to authenticated;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.current_user_role() = 'admin');
