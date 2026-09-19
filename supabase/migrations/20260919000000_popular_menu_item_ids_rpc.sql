-- Return only the menu item IDs needed for the customer Popular badge.
-- This avoids granting customers access to other customers' orders/order_items.
create or replace function public.get_popular_menu_item_ids()
returns table (menu_item_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select oi.menu_item_id
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  join public.menu_items mi on mi.id = oi.menu_item_id
  where o.status = 'completed'
    and o.payment_status = 'paid'
    and mi.is_available = true
  group by oi.menu_item_id
  order by sum(oi.quantity) desc, oi.menu_item_id asc
  limit 5;
$$;

revoke all on function public.get_popular_menu_item_ids() from public;
grant execute on function public.get_popular_menu_item_ids() to anon, authenticated;
