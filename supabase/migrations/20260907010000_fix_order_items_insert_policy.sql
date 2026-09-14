-- Allow the server-validated checkout route to append items to the order it
-- has just created.  The policy previously queried public.orders through RLS;
-- guest orders are intentionally not selectable, so that EXISTS check could
-- never see the newly-created row and item insertion was rejected.

create or replace function public.can_insert_order_item(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and (o.customer_id = auth.uid() or o.customer_id is null)
  );
$$;

revoke all on function public.can_insert_order_item(uuid) from public;
grant execute on function public.can_insert_order_item(uuid) to anon, authenticated;

drop policy if exists "order_items_insert_via_own_order" on public.order_items;
create policy "order_items_insert_via_own_order"
  on public.order_items for insert
  with check (public.can_insert_order_item(order_id));
