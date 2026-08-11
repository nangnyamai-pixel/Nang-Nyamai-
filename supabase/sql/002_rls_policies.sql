-- ============================================================
-- NangNyamai — Proposed Row Level Security Policies (Sprint 0)
-- ============================================================
-- STATUS: PROPOSED / FOR REVIEW. Not applied automatically.
-- Apply only after 001_schema.sql and only after review.
--
-- Design summary:
--   customer: can read active menu/category/table data, create their own
--             orders + order_items, read/update only their own orders
--             (and only fields they're allowed to touch), submit feedback
--             for their own completed orders.
--   staff:    can read all orders/order_items, update order status &
--             payment status, update menu item availability.
--   admin:    full management of menu, categories, staff accounts, and
--             read access to orders/feedback/analytics.
--   guests:   guest orders are matched by guest_session_id (a token the
--             client holds, e.g. in a cookie), not by auth — so guest
--             read/update access is handled at the application layer via
--             a scoped server action, not directly via anon RLS policies.
-- ============================================================

-- Helper: fetch the role of the currently authenticated user.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.current_user_role() in ('staff', 'admin')
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
  -- customers cannot change their own role via this policy

create policy "profiles_admin_manage_staff"
  on public.profiles for update
  using (public.current_user_role() = 'admin');

-- ============================================================
-- RESTAURANT TABLES
-- ============================================================
alter table public.restaurant_tables enable row level security;

create policy "restaurant_tables_public_read_active"
  on public.restaurant_tables for select
  using (is_active = true);

create policy "restaurant_tables_staff_admin_manage"
  on public.restaurant_tables for all
  using (public.current_user_role() in ('staff', 'admin'))
  with check (public.current_user_role() in ('staff', 'admin'));

-- ============================================================
-- CATEGORIES
-- ============================================================
alter table public.categories enable row level security;

create policy "categories_public_read_active"
  on public.categories for select
  using (is_active = true or public.current_user_role() in ('staff', 'admin'));

create policy "categories_admin_manage"
  on public.categories for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ============================================================
-- MENU ITEMS
-- ============================================================
alter table public.menu_items enable row level security;

create policy "menu_items_public_read"
  on public.menu_items for select
  using (true); -- unavailable items still readable so UI can show "Sold Out"

create policy "menu_items_admin_manage"
  on public.menu_items for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "menu_items_staff_update_availability"
  on public.menu_items for update
  using (public.current_user_role() = 'staff')
  with check (public.current_user_role() = 'staff');
  -- NOTE: restrict which columns staff can change to is_available at the
  -- application layer (server action), since RLS cannot limit to specific
  -- columns on its own.

-- ============================================================
-- ORDERS
-- ============================================================
alter table public.orders enable row level security;

create policy "orders_customer_select_own"
  on public.orders for select
  using (
    auth.uid() = customer_id
    or public.current_user_role() in ('staff', 'admin')
  );

create policy "orders_customer_insert_own"
  on public.orders for insert
  with check (
    customer_id = auth.uid()
    or (customer_id is null and guest_session_id is not null)
  );
  -- Guest inserts (customer_id null) are expected to go through a
  -- server-side action, not a direct anon-key insert from the browser,
  -- so the server can validate table_token / pricing first.

create policy "orders_staff_admin_update_status"
  on public.orders for update
  using (public.current_user_role() in ('staff', 'admin'))
  with check (public.current_user_role() in ('staff', 'admin'));
  -- Customers must NOT be able to update status/payment_status directly —
  -- no customer UPDATE policy is defined on orders for that reason.

-- ============================================================
-- ORDER ITEMS
-- ============================================================
alter table public.order_items enable row level security;

create policy "order_items_select_via_order"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or public.current_user_role() in ('staff', 'admin'))
    )
  );

create policy "order_items_insert_via_own_order"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.customer_id = auth.uid() or o.customer_id is null)
    )
  );

-- ============================================================
-- FEEDBACK
-- ============================================================
alter table public.feedback enable row level security;

create policy "feedback_select_own_or_staff"
  on public.feedback for select
  using (
    auth.uid() = customer_id
    or public.current_user_role() in ('staff', 'admin')
  );

create policy "feedback_insert_for_own_completed_order"
  on public.feedback for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.status = 'completed'
        and (o.customer_id = auth.uid() or o.customer_id is null)
    )
  );
