create sequence if not exists public.customer_member_id_seq;

alter table public.profiles add column if not exists member_id text;

create or replace function public.next_customer_member_id()
returns text
language sql
security definer
set search_path = public
as $$
  select 'NN-' || lpad(nextval('public.customer_member_id_seq')::text, 6, '0');
$$;

alter table public.profiles alter column member_id set default public.next_customer_member_id();

update public.profiles
set member_id = public.next_customer_member_id()
where member_id is null;

alter table public.profiles alter column member_id set not null;
create unique index if not exists profiles_member_id_key on public.profiles (member_id);
