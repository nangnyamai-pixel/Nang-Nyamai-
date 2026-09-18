-- Atomically move an eligible order into the kitchen workflow.
create or replace function public.send_order_to_kitchen(p_order_id uuid)
returns table (id uuid, status text)
language sql
volatile
security definer
set search_path = public
as $$
  update public.orders as o
  set status = 'preparing'
  where o.id = p_order_id
    and o.status in ('received', 'verified')
    and public.is_active_staff()
  returning o.id, o.status;
$$;

revoke all on function public.send_order_to_kitchen(uuid) from public;
grant execute on function public.send_order_to_kitchen(uuid) to authenticated;
