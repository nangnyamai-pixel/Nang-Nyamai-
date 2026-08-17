-- ============================================================
-- NangNyamai — Proposed Initial Schema (Sprint 0)
-- ============================================================
-- STATUS: PROPOSED / FOR REVIEW. Not applied automatically.
-- Run manually in the Supabase SQL editor (or via `supabase db push`)
-- only after review, against a project you control.
-- This script is NOT destructive by itself (uses IF NOT EXISTS / no drops),
-- but always review before running against a real project.
-- ============================================================

-- Extensions -----------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  avatar_url text,
  birthday date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RESTAURANT TABLES (physical dine-in tables, identified by QR)
-- ============================================================
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number text not null unique,
  qr_token text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  is_popular boolean not null default false,
  spice_level smallint check (spice_level between 0 and 3),
  allergens text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_id_idx on public.menu_items (category_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  table_id uuid not null references public.restaurant_tables (id) on delete restrict,
  customer_id uuid references public.profiles (id) on delete set null,
  guest_session_id text,
  status text not null default 'received'
    check (status in ('received', 'verified', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  service_charge numeric(10, 2) not null default 0 check (service_charge >= 0),
  total numeric(10, 2) not null check (total >= 0),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  payment_method text check (payment_method in ('cash', 'card')),
  special_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_has_customer_or_guest check (
    customer_id is not null or guest_session_id is not null
  )
);

create index if not exists orders_table_id_idx on public.orders (table_id);
create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_status_idx on public.orders (status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete restrict,
  item_name_snapshot text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  selected_options jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ============================================================
-- FEEDBACK
-- ============================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  customer_id uuid references public.profiles (id) on delete set null,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  food_rating smallint check (food_rating between 1 and 5),
  service_rating smallint check (service_rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id) -- one feedback submission per order
);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.menu_items;
create trigger set_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
