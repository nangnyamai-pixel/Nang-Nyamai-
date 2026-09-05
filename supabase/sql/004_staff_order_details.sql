-- Staff-only access needed by Order Details.
create policy "restaurant_tables_active_staff_select"
  on public.restaurant_tables for select
  to authenticated
  using (public.is_active_staff() or public.current_user_role() = 'admin');

drop policy if exists "orders_staff_admin_update_status" on public.orders;
create policy "orders_active_staff_update_status"
  on public.orders for update
  to authenticated
  using (public.is_active_staff() or public.current_user_role() = 'admin')
  with check (public.is_active_staff() or public.current_user_role() = 'admin');
