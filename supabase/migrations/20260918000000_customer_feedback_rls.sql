alter table public.feedback enable row level security;

grant select, insert on table public.feedback to authenticated;
drop policy if exists "feedback_select_own_or_staff" on public.feedback;
create policy "feedback_select_own_or_staff" on public.feedback for select using (auth.uid() = customer_id or public.current_user_role() in ('staff','admin'));
drop policy if exists "feedback_insert_for_own_completed_order" on public.feedback;
create policy "feedback_insert_for_own_completed_order" on public.feedback for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid() and o.status = 'completed' and o.payment_status = 'paid'));
